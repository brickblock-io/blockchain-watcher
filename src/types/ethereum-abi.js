// @flow

// There are more types in the EVM, but typing all the uint<M> int<M> seems silly unless needed
// https://solidity.readthedocs.io/en/develop/abi-spec.html#types
export type AbiTypeT = 'address' | 'bool' | 'int256' | 'uint256'

export type ContractAbiT = $ReadOnlyArray<AbiT | FallbackAbiT | ConstructorAbiT>

// Keeping the FallbackAbiT and ConstructorAbiT out of the AbiT so that it can be used for event and
// function call processing
export type AbiT = FunctionAbiT | EventAbiT

type FunctionAbiT = {
  constant: boolean,
  inputs: FunctionAbiInputOutputT,
  name: string,
  outputs: FunctionAbiInputOutputT,
  payable: boolean,
  stateMutability: 'nonpayable' | 'payable' | 'view',
  type: 'function'
}

type FunctionAbiInputOutputT = $ReadOnlyArray<{
  name: string,
  type: AbiTypeT
}>

type EventAbiT = {
  anonymous: boolean,
  inputs: EventAbiInputsT,
  name: string,
  type: 'event'
}

export type EventAbiInputsT = $ReadOnlyArray<{
  indexed: boolean,
  name: string,
  type: AbiTypeT
}>

type FallbackAbiT = {
  payable: true,
  stateMutability: 'payable',
  type: 'fallback'
}

type ConstructorAbiT = {
  inputs: FunctionAbiInputOutputT,
  payable: false,
  type: 'constructor'
}
