// @flow

import type { ContractAbiT, EventAbiInputsT } from 'types/ethereum-abi'
import type { EthereumLogT } from 'types/ethereum-filter'
import type { EthereumAddressT } from 'types/ethereum-general'
import type { PrefixedHexT } from 'types/hex'

type ContractEventMapT = {
  [eventName: string]: EventMapWithParseLogT
}

type EventMapWithParseLogT = EventMapT & {
  parseLog: *
}

type EventMapT = {
  eventName: string,
  inputs: {
    data: EventAbiInputsT,
    indexed: EventAbiInputsT
  },
  topicHash: PrefixedHexT
}

export type ParsedLogT<A> = {
  address: EthereumAddressT,
  blockHash: PrefixedHexT,
  blockNumber: number,
  data: A,
  eventName: string,
  logIndex: number,
  removed: boolean,
  transactionHash: PrefixedHexT,
  transactionIndex: number
}

// ---

const { abiToSignatureHash, decodeDataForAbiTypes } = require('utils/abi')
const { hexToNumber } = require('utils/hex')

type BuildEventMapFromAbiT = ContractAbiT => ContractEventMapT
const buildEventMapFromAbi: BuildEventMapFromAbiT = contractAbi =>
  contractAbi.reduce((contractAbiAcc, abi) => {
    if (abi.type !== 'event') return contractAbiAcc

    const inputs = abi.inputs.reduce(
      (abitInputsAcc, input) => {
        input.indexed
          ? abitInputsAcc['indexed'].push(input)
          : abitInputsAcc['data'].push(input)
        return abitInputsAcc
      },
      { indexed: [], data: [] }
    )

    const eventMap = {
      eventName: abi.name,
      topicHash: abiToSignatureHash(abi),
      inputs
    }
    contractAbiAcc[abi.name] = {
      ...eventMap,
      parseLog: log => parseLogWithEventMap(eventMap, log)
    }

    return contractAbiAcc
  }, {})

type ParseLogWithEventMapT = (EventMapT, EthereumLogT) => ParsedLogT<*>
const parseLogWithEventMap: ParseLogWithEventMapT = (eventMap, log) => {
  if (log.topics[0] !== eventMap.topicHash)
    throw Error(
      `parseLogWithEventMap: given a (eventMap, log) pair that does not match (${
        eventMap.topicHash
      }, ${log.topics[0]})`
    )

  const decodedData = {}

  // each indexed input is decoded alone
  eventMap.inputs.indexed.forEach((indexedInput, i) => {
    const type = indexedInput.type
    // log.topic[0] is the eventName hash, so we must offset by one to read indexed inputs
    const logData = log.topics[i + 1]

    decodedData[indexedInput.name] = decodeDataForAbiTypes([type], logData)[0]
  })

  // all data input is decoded together
  decodeDataForAbiTypes(
    eventMap.inputs.data.map(x => x.type),
    log.data
  ).forEach((value, i) => {
    decodedData[eventMap.inputs.data[i].name] = value
  })

  return {
    address: log.address,
    blockHash: log.blockHash,
    blockNumber: hexToNumber(log.blockNumber),
    data: decodedData,
    eventName: eventMap.eventName,
    logIndex: hexToNumber(log.logIndex),
    removed: log.removed,
    transactionHash: log.transactionHash,
    transactionIndex: hexToNumber(log.transactionIndex)
  }
}

module.exports = {
  buildEventMapFromAbi,
  parseLogWithEventMap
}
