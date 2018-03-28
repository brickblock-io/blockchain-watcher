// @flow

import type { ContractAbiT } from 'types/ethereum-abi'
import type { PrefixedHexT } from 'types/hex'

type ContractConfigT = {
  abi: ContractAbiT,
  address: PrefixedHexT,
  deployedAtBlock: number
}

type EthereumProviderConfigT = {
  getBlockNumberInterval: number,
  url: string
}

type BootstrapConfigT = {
  contract: ContractConfigT,
  ethereumProvider: EthereumProviderConfigT
}

// ---

require('dotenv').config()

const EthereumQuery = require('eth-query')
const HttpProvider = require('web3-providers-http')

const watchForLatestBlock = require('eth/watch-for-latest-block')
const handleBuyEvent = require('jobs/custom-poa-token-buy-event')
const { buildEventMapFromAbi } = require('utils/events')
const { formatFilterParams } = require('utils/filter')
const { setupDatabaseConnection } = require('utils/db')

const logger = require('utils/logger')('index')

const getEnvVar = name => {
  if (!process.env[name]) throw Error(`process.env.${name} is missing`)

  return process.env[name]
}

const setupProvider = config => {
  const httpProvider = new HttpProvider(config.ethereumProvider.url)
  // doing this for eth-query interface expectations
  httpProvider.sendAsync = httpProvider.send

  return httpProvider
}

const callGetLog = (ethQuery, filter) => {
  logger.trace('callGetLog->BEGIN with filter', filter)

  return new Promise((resolve, reject) => {
    ethQuery.getLogs(filter, (error, result) => {
      if (error) {
        logger.error('callGetLog->ERROR', error)
        reject(error)
        return
      }

      logger.trace('callGetLog->SUCCESS')
      resolve(result)
    })
  })
}

type SetupWorkersT = (ContractConfigT, *, *) => void
const setupWorkers: SetupWorkersT = (
  contractConfig,
  ethQuery,
  blockEmitter
) => {
  logger.info('setupWorkers->INIT')

  const contractMap = buildEventMapFromAbi(contractConfig.abi)
  const state = {
    fromBlock: contractConfig.deployedAtBlock,
    // start with 0, we only call `handleBlockEvent` after receiving a block number
    toBlock: 0
  }

  // NOTE: in the future if we want to watch more events, will need to have some named mapping so
  // that these config objects can be defined in this repo
  const eventToWatch = {
    contractAddress: contractConfig.address,
    processLog: log => handleBuyEvent(contractMap.BuyEvent.parseLog(log)),
    topics: [contractMap.BuyEvent.topicHash]
  }

  const handleBlockEvent = async latestBlockNumber => {
    state.toBlock = latestBlockNumber
    logger.trace('handleBlockEvent->BEGIN for block number', latestBlockNumber)

    const filter = formatFilterParams({
      address: eventToWatch.contractAddress,
      fromBlock: state.fromBlock,
      toBlock: state.toBlock,
      topics: eventToWatch.topics
    })

    // updating first, in case processing all logs takes longer than the next block arriving
    state.fromBlock = state.toBlock + 1

    try {
      const logList = await callGetLog(ethQuery, filter)
      if (logList.length === 0) return

      logger.info(`handleBlockEvent processing ${logList.length} logs`)
      await Promise.all(logList.map(eventToWatch.processLog))
    } catch (error) {
      // we are following a "let it fail" setup here, an error should cause a process exit
      logger.error('handleBlockEvent->ERROR', error)
      blockEmitter.emit(
        'error',
        'handleBlockEvent was unable to finish processing all logs'
      )
    }

    logger.trace(
      'handleBlockEvent->SUCCESS for block number',
      latestBlockNumber
    )
  }

  blockEmitter.on('block', handleBlockEvent)

  logger.info('setupWorkers->DONE')
}

type BootstrapT = BootstrapConfigT => void
const bootstrap: BootstrapT = config => {
  logger.info('bootstrap->INIT')

  const currentProvider = setupProvider(config)
  const ethQuery = new EthereumQuery(currentProvider)
  const blockEmitter = watchForLatestBlock(
    ethQuery,
    config.ethereumProvider.getBlockNumberInterval
  )

  setupWorkers(config.contract, ethQuery, blockEmitter)

  blockEmitter.on('error', status => {
    logger.error('blockEmitter error event ->', status)
    logger.fatal('shutting down due to error event')
    process.exit(-1)
  })

  logger.info('bootstrap->DONE')
}

setupDatabaseConnection({
  database: getEnvVar('POSTGRES_DATABASE'),
  host: getEnvVar('POSTGRES_HOST'),
  password: getEnvVar('POSTGRES_PASSWORD'),
  user: getEnvVar('POSTGRES_USER')
})

// eslint-disable-next-line import/no-unassigned-import
require('./healthcheck')(getEnvVar('PORT'))

bootstrap({
  contract: {
    abi: require('@brickblock/smart-contracts/build/contracts/CustomPOAToken.json')
      .abi,
    address: getEnvVar('CONTRACT_ADDRESS'),
    deployedAtBlock: Number(getEnvVar('CONTRACT_DEPLOYED_AT_BLOCK'))
  },
  ethereumProvider: {
    getBlockNumberInterval: Number(getEnvVar('GET_BLOCK_NUMBER_INTERVAL')),
    url: getEnvVar('INFURA_URL')
  }
})
