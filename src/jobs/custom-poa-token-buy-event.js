// @flow

import type { EthereumAddressT } from 'types/ethereum-general'
import type { ParsedLogT } from 'utils/events'

export type BuyEventDataT = {
  amount: string,
  buyer: EthereumAddressT
}

// ---

const { sendBuyEventEmail } = require('utils/email')
const { queries } = require('utils/db')

const logger = require('utils/logger')('jobs/poa-token')

const eventName = 'BuyEvent'

type HandleBuyEventT = (ParsedLogT<BuyEventDataT>) => Promise<*>
const handleBuyEvent: HandleBuyEventT = async log => {
  logger.trace(
    'handleBuyEvent->BEGIN for transaction hash',
    log.transactionHash
  )

  const contactData = await queries.getContactForEthereumAddress(log.data.buyer)

  if (!contactData) {
    throw new Error(`no contact data for ethereum address ${log.data.buyer}`)
  }

  const haveReceipt = await queries.emailReceiptExists(
    eventName,
    contactData.email,
    log.transactionHash
  )

  if (haveReceipt) {
    logger.trace(
      'handleBuyEvent->NOWORK for transaction hash',
      log.transactionHash
    )
    return
  }

  await sendBuyEventEmail(contactData, log)
  await queries.saveEmailReceipt(
    eventName,
    contactData.email,
    log.transactionHash
  )

  await queries.archiveEvent(log)

  logger.trace('handleBuyEvent->DONE for transaction hash', log.transactionHash)
}

module.exports = handleBuyEvent
