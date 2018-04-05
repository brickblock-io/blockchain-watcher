// @flow

import type {
  EthereumAddressT,
  EthereumTransactionHashT
} from 'types/ethereum-general'
import type { ParsedLogT } from 'utils/events'

type ConnectionConfigT = {
  database: string,
  host: string,
  password: string,
  user: string
}

export type ContactT = {
  email: string,
  name: string,
  uuid: string
}

// ---

const sha3 = require('js-sha3')

const { first, isEmpty } = require('utils/fn')

let knex

type HashEmailReceiptT = (string, string, EthereumTransactionHashT) => string
const hashEmailReceipt: HashEmailReceiptT = (contactUuid, eventName, txHash) =>
  sha3.keccak_256(
    JSON.stringify({
      contact_uuid: contactUuid,
      event_name: eventName,
      transaction_hash: txHash
    })
  )

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
    // TODO: hey, we should not do this when we are live :)
    // .where({ ethereum_address: ethereumAddress })
    .where({ ethereum_address: '0x123' })

  return first(result)
}

type SaveEmailReceiptT = (
  string,
  string,
  EthereumTransactionHashT
) => Promise<*>
const saveEmailReceipt: SaveEmailReceiptT = (contactUuid, eventName, txHash) =>
  knex
    .insert({
      hash: hashEmailReceipt(contactUuid, eventName, txHash)
    })
    .into('email_receipts')

type EmailReceiptExistsT = (
  string,
  string,
  EthereumTransactionHashT
) => Promise<boolean>
const emailReceiptExists: EmailReceiptExistsT = async (
  contactUuid,
  eventName,
  txHash
) => {
  const result = await knex
    .select(1)
    .from('email_receipts')
    .where({
      hash: hashEmailReceipt(contactUuid, eventName, txHash)
    })

  return !isEmpty(result)
}

type ArchiveEventT = (ParsedLogT<*>) => Promise<*>
const archiveEvent: ArchiveEventT = parsedLog =>
  knex
    .insert({
      contract_address: parsedLog.address,
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
