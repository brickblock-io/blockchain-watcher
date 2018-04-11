// @flow

import type EventEmitter from 'events'

import type { ContractConfigT } from 'types/worker-config'

type StateT = {|
  SIGTERM: boolean,
  activeJobs: Array<number>,
  fromBlock: number,
  shutdownIntervalId: ?IntervalID,
  toBlock: number
|}

// ---

const callGetLog = require('eth/call-get-log')
const handleBuyEvent = require('jobs/custom-poa-token-buy-event')
const { buildEventMapFromAbi } = require('utils/events')
const { formatFilterParams } = require('utils/filter')

const logger = require('utils/logger')('workers')

type SetupWorkersT = (ContractConfigT, number, *, EventEmitter) => void
const setupWorkers: SetupWorkersT = (
  contractConfig,
  maxBlockDifference,
  ethQuery,
  eventChannel
) => {
  logger.info('setupWorkers->INIT')

  const contractMap = buildEventMapFromAbi(contractConfig.abi)
  const state: StateT = {
    // TODO: we are always starting with the deployed block number; we could keep track of this in
    // the database. This is not so bad since the `maxBlockDifference` can be quite large and we
    // will "catch-up" to the latest block quite quickly (ie. 100,000 maxBlockDifference and mainnet
    // has ~5760 blocks per day at 15 second block time)
    fromBlock: contractConfig.deployedAtBlock,
    // start with 0, we only call `handleBlockEvent` after receiving the latest block number
    toBlock: 0,
    // whenever a new block number arrives, if there are logs we care about from the next callGetLog
    // query, the a job is started for that block number. we track active jobs so we can handle
    // SIGTERM shutdowns
    activeJobs: [],
    // whether we should prepare to shutdown; this will stop new jobs from starting
    SIGTERM: false,
    // placeholder for when we begin to shutdown
    shutdownIntervalId: null
  }

  // NOTE: in the future if we want to watch more events, will need to have some named mapping so
  // that these config objects can be defined in this repo
  const eventToWatch = {
    contractAddress: contractConfig.address,
    processLog: log => handleBuyEvent(contractMap.BuyEvent.parseLog(log)),
    topics: [contractMap.BuyEvent.topicHash]
  }

  const handleBlockEvent = async latestBlockNumber => {
    if (state.SIGTERM === true) return

    const blockDifference = latestBlockNumber - state.fromBlock

    if (blockDifference < 0) {
      eventChannel.emit(
        'error',
        'handleBlockEvent has a negative block difference; possibly the contractConfig.deployedAtBlock is incorrect'
      )

      return
    }

    const nextToBlock =
      state.fromBlock + Math.min(blockDifference, maxBlockDifference)

    logger.trace('handleBlockEvent->BEGIN with state', state)

    const filterParams = formatFilterParams({
      address: eventToWatch.contractAddress,
      fromBlock: state.fromBlock,
      toBlock: state.toBlock,
      topics: eventToWatch.topics
    })

    // updating state first, in case processing all logs takes longer than the next block arriving
    state.toBlock = nextToBlock
    state.fromBlock = nextToBlock + 1

    try {
      const logList = await callGetLog(ethQuery, filterParams)
      if (logList.length === 0) return

      logger.info(`handleBlockEvent processing ${logList.length} logs`)
      state.activeJobs.push(nextToBlock)
      await Promise.all(logList.map(eventToWatch.processLog))
    } catch (error) {
      // we are following a "let it fail" setup here, an error should cause a process exit
      logger.error('handleBlockEvent->ERROR', error)
      eventChannel.emit(
        'error',
        'handleBlockEvent was unable to finish processing all logs'
      )
    }

    state.activeJobs = state.activeJobs.filter(x => x !== nextToBlock)

    logger.trace(
      'handleBlockEvent->SUCCESS for block number',
      latestBlockNumber
    )
  }

  const handleShutdown = () => {
    if (state.activeJobs.length !== 0) return

    if (state.shutdownIntervalId) clearInterval(state.shutdownIntervalId)

    eventChannel.emit('workers/SIGTERM/success')
  }

  eventChannel.on('latest-block-number', handleBlockEvent)
  eventChannel.on('workers/SIGTERM', () => {
    state.SIGTERM = true
    state.shutdownIntervalId = setInterval(handleShutdown, 1000)
    logger.info('setupWorkers->EVENT workers/SIGTERM', 'starting to shutdown')
  })

  logger.info('setupWorkers->DONE')
}

module.exports = setupWorkers
