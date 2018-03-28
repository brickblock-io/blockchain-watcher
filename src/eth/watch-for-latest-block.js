// @flow

const EventEmitter = require('events')

const { hexToNumber } = require('utils/hex')

const logger = require('utils/logger')('watchForLatestBlock')

const maxConsecutiveErrors = 10

type WatchForLatestBlockT = (*, number) => EventEmitter
const watchForLatestBlock: WatchForLatestBlockT = (
  ethQuery,
  pollingInterval
) => {
  logger.info(
    'watchForLatestBlock->INIT using pollingInterval',
    pollingInterval,
    'and a maxConsecutiveErrors',
    maxConsecutiveErrors
  )

  const blockEmitter = new EventEmitter()
  const state = {
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
          blockEmitter.emit(
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
        logger.info('watchForLatestBlock->EMIT', blockNumber)
        state.lastBlockNumber = blockNumber
        blockEmitter.emit('block', blockNumber)
      }
    })
  }

  setInterval(fetchLatestBlockNumber, pollingInterval)
  fetchLatestBlockNumber()

  return blockEmitter
}

module.exports = watchForLatestBlock
