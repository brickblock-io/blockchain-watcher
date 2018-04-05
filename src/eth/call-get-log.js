// @flow

import type { EthereumRPCLogFilterT } from 'types/ethereum-filter'

// ---

const logger = require('utils/logger')('call-get-log')

type CallGetLogT = (*, EthereumRPCLogFilterT) => Promise<*>
const callGetLog: CallGetLogT = (ethQuery, filter) => {
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

module.exports = callGetLog
