// @flow

import type { PrefixedHexT } from 'types/hex'
import type {
  EthereumAddressT,
  EthereumTransactionHashT
} from 'types/ethereum-general'

// latest: last mined block
// pending OR earliest: for not yet mined transactions
export type EthereumBlockNumberT =
  | PrefixedHexT
  | 'latest'
  | 'pending'
  | 'earliest'

export type EthereumRPCLogFilterT = {|
  address?: EthereumAddressT,
  fromBlock?: EthereumBlockNumberT,
  toBlock?: EthereumBlockNumberT,
  topics?: $ReadOnlyArray<?PrefixedHexT>
|}

// Unfortunately it doesn't seem you can type Array length in flow, otherwise it would make sense
// to give a type to be plugged into the topics property
export type EthereumLogT = {|
  address: EthereumAddressT,
  blockHash: PrefixedHexT,
  blockNumber: PrefixedHexT,
  data: PrefixedHexT,
  logIndex: PrefixedHexT,
  removed: boolean,
  topics: $ReadOnlyArray<PrefixedHexT>,
  transactionHash: EthereumTransactionHashT,
  transactionIndex: PrefixedHexT
|}
