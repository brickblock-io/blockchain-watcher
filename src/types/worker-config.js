// @flow

import type { ContractAbiT } from 'types/ethereum-abi'
import type { PrefixedHexT } from 'types/hex'

export type ContractConfigT = {|
  abi: ContractAbiT,
  address: PrefixedHexT,
  deployedAtBlock: number
|}

export type EthereumProviderConfigT = {|
  getBlockNumberInterval: number,
  url: string
|}

export type BootstrapConfigT = {|
  contract: ContractConfigT,
  ethereumProvider: EthereumProviderConfigT,
  maxBlockDifference: number
|}
