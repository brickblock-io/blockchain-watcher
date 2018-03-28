// @flow

import type {
  EthereumAddressT,
  EthereumTransactionHashT
} from 'types/ethereum-general'
import type { ParsedLogT } from 'utils/events'

export type EmailAddressT = string

type ConnectionConfigT = {
  database: string,
  host: string,
  password: string,
  user: string
}

export type ContactT = {
  email: EmailAddressT,
  firstName: string,
  lastName: string
}

type EventNameT = string

// ---

const { first, isEmpty } = require('utils/fn')

let knex

type SetupDatabaseConnectionT = ConnectionConfigT => void
const setupDatabaseConnection: SetupDatabaseConnectionT = connectionConfig => {
  knex = require('knex')({
    client: 'postgresql',
    connection: connectionConfig
  })
}

type GetContactForEthereumAddressT = EthereumAddressT => Promise<?ContactT>
const getContactForEthereumAddress: GetContactForEthereumAddressT = async ethereumAddress => {
  const result = await knex
    .select('*')
    .from('contact_data')
    .where({ ethereum_address: ethereumAddress })

  return first(result)
}

type SaveEmailReceiptT = (
  EventNameT,
  EmailAddressT,
  EthereumTransactionHashT
) => Promise<*>
const saveEmailReceipt: SaveEmailReceiptT = (eventName, email, txHash) =>
  knex
    .insert({
      contact_email: email,
      event_name: eventName,
      transaction_hash: txHash
    })
    .into('email_receipts')

type EmailReceiptExistsT = (
  EmailAddressT,
  EventNameT,
  EthereumTransactionHashT
) => Promise<boolean>
const emailReceiptExists: EmailReceiptExistsT = async (
  eventName,
  email,
  txHash
) => {
  const result = await knex
    .select('id')
    .from('email_receipts')
    .where({
      contact_email: email,
      event_name: eventName,
      transaction_hash: txHash
    })

  return !isEmpty(result)
}

type ArchiveEventT = (ParsedLogT<*>) => Promise<*>
const archiveEvent: ArchiveEventT = parsedLog =>
  knex
    .insert({
      event_name: parsedLog.eventName,
      event_data: JSON.stringify(parsedLog.data),
      transaction_hash: parsedLog.transactionHash
    })
    .into('events')

type ConnectionCheckT = () => Promise<boolean>
const connectionCheck: ConnectionCheckT = async () => {
  try {
    await knex
      .select(1)
      .from('events')
      .limit(1)

    return true
  } catch (error) {
    return false
  }
}

module.exports = {
  queries: {
    archiveEvent,
    connectionCheck,
    getContactForEthereumAddress,
    emailReceiptExists,
    saveEmailReceipt
  },
  setupDatabaseConnection
}
