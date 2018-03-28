// @flow

const test = require('ava')

const filterUtils = require('./filter')

test('filterUtils.leftPadFilterTopicsParam always returns a PrefixedHashT that is 66 characters long', t => {
  t.true(filterUtils.leftPadFilterTopicsParam('1').length === 66)
  t.true(
    filterUtils.leftPadFilterTopicsParam(
      '0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0'
    ).length === 66
  )
})

test('filterUtils.formatFilterParams takes a FilterParamsT and returns a EthereumRPCLogFilterT', t => {
  const params = {
    address: '0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0',
    fromBlock: 5314666,
    toBlock: 5317547,
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      null,
      '0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0'
    ]
  }

  const expected = {
    address: '0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0',
    fromBlock: '0x51186a',
    toBlock: '0x5123ab',
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      null,
      '0x00000000000000000000000086fa049857e0209aa7d9e616f7eb3b3b78ecfdb0'
    ]
  }
  t.deepEqual(filterUtils.formatFilterParams(params), expected)
})

test('filterUtils.formatFilterParams takes a FilterParamsT and returns a EthereumRPCLogFilterT', t => {
  const params = {
    address: '0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0',
    fromBlock: 'latest',
    toBlock: 'pending',
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      null,
      '0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0'
    ]
  }

  const expected = {
    address: '0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0',
    fromBlock: 'latest',
    toBlock: 'pending',
    topics: [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      null,
      '0x00000000000000000000000086fa049857e0209aa7d9e616f7eb3b3b78ecfdb0'
    ]
  }
  t.deepEqual(filterUtils.formatFilterParams(params), expected)
})
