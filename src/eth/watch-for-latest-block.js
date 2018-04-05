// @flow

import type EventEmitter from 'events'

type StateT = {|
  errorCount: number,
  lastBlockNumber: number
|}

// ---

const { hexToNumber } = require('utils/hex')

const logger = require('utils/logger')('watch-for-latest-block')

const maxConsecutiveErrors = 10

type WatchForLatestBlockT = (number, *, EventEmitter) => void
const watchForLatestBlock: WatchForLatestBlockT = (
  pollingInterval,
  ethQuery,
  eventChannel
) => {
  logger.info(
    'watchForLatestBlock->INIT using pollingInterval',
    pollingInterval,
    'and a maxConsecutiveErrors',
    maxConsecutiveErrors
  )

  const state: StateT = {
    lastBlockNumber: 0,
    errorCount: 0
  }

  const fetchLatestBlockNumber = () => {
    logger.trace('fetchLatestBlockNumber->BEGIN')

    ethQuery.blockNumber(null, (error, rawBlockNumber) => {
      // there can be network interrupts from time to time, and will just report on the
      // consecutive error count
      if (error) {
        logger.error('fetchLatestBlockNumber->ERROR', error)
        state.errorCount += 1

        if (state.errorCount > maxConsecutiveErrors) {
          eventChannel.emit(
            'error',
            `fetchLatestBlockNumber errorCount exceeded maximum of ${maxConsecutiveErrors} consecutive errors`
          )
        }

        return
      }

      const blockNumber = hexToNumber(rawBlockNumber)
      logger.trace('fetchLatestBlockNumber->SUCCESS', blockNumber)
      // when we succeeded, reset error count
      state.errorCount = 0

      if (blockNumber !== state.lastBlockNumber) {
        logger.info('fetchLatestBlockNumber->EMIT', blockNumber)
        state.lastBlockNumber = blockNumber
        eventChannel.emit('latest-block-number', blockNumber)
      }
    })
  }

  setInterval(fetchLatestBlockNumber, pollingInterval)
  fetchLatestBlockNumber()
}

module.exports = watchForLatestBlock
