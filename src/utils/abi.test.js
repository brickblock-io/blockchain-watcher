// @flow

const test = require('ava')

const abiUtils = require('./abi')

test('abiUtils.abiToSignatureHash takes a function abi spec and returns the hash for the abiSignature', t => {
  const abi = {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'transfer',
    outputs: [
      {
        name: '',
        type: 'bool'
      }
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  }

  const expected = '0xa9059cbb'
  t.true(abiUtils.abiToSignatureHash(abi) === expected)
})

test('abiUtils.abiToSignatureHash takes a event abi spec and returns the hash for the abiSignature', t => {
  const abi = {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address'
      },
      {
        indexed: true,
        name: 'to',
        type: 'address'
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256'
      }
    ],
    name: 'Transfer',
    type: 'event'
  }

  const expected =
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  t.true(abiUtils.abiToSignatureHash(abi) === expected)
})
