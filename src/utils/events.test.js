// @flow

const test = require('ava')
// const test = require('tape')

const ERC20 = require('test/ERC20-abi.json')

const ethereumEvents = require('./events')

test('ethereumEvents.buildEventMapFromAbi takes an ContractAbiT and returns a ContractEventMapT', t => {
  const expected = {
    Approval: {
      eventName: 'Approval',
      topicHash:
        '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
      inputs: {
        indexed: [
          {
            indexed: true,
            name: 'owner',
            type: 'address'
          },
          {
            indexed: true,
            name: 'spender',
            type: 'address'
          }
        ],
        data: [
          {
            indexed: false,
            name: 'value',
            type: 'uint256'
          }
        ]
      }
    },
    Transfer: {
      eventName: 'Transfer',
      topicHash:
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      inputs: {
        indexed: [
          {
            indexed: true,
            name: 'from',
            type: 'address'
          },
          {
            indexed: true,
            name: 'to',
            type: 'address'
          }
        ],
        data: [
          {
            indexed: false,
            name: 'value',
            type: 'uint256'
          }
        ]
      }
    }
  }

  const actual = ethereumEvents.buildEventMapFromAbi(ERC20)
  t.deepEqual(Object.keys(actual), ['Approval', 'Transfer'])

  // the interface became nicer, but now there is an anonymous function here
  // "best practice" would be a prototype function no doubt, but i like closures more
  // makes the testing a bit awkward
  t.true(typeof actual.Approval.parseLog === 'function')
  t.true(typeof actual.Transfer.parseLog === 'function')
  delete actual.Approval.parseLog
  delete actual.Transfer.parseLog

  t.deepEqual(actual, expected)
})

test('ethereumEvents.parseLogWithEventMap takes an (EventMapT, EthereumLogsT) and returns ParsedLogT<*>', t => {
  // this log is from mainnet
  const log = {
    address: '0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0',
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      '0x00000000000000000000000005ee546c1a62f90d7acbffd6d846c9c54c7cf94c',
      '0x00000000000000000000000086fa049857e0209aa7d9e616f7eb3b3b78ecfdb0'
    ],
    data: '0x000000000000000000000000000000000000000000000000c93a592cfb2a0000',
    blockNumber: '0x51186a',
    transactionHash:
      '0xe6cacab6243e87a89e8a9060bfe8e07581ca38cdf6d7ad3c4aed62905209165d',
    transactionIndex: '0x6b',
    blockHash:
      '0x07548960edd9266d40d8f52ec0346372ae9bed4069e28086fee6abc8553a2d6a',
    logIndex: '0xc7',
    removed: false
  }
  const eventMap = ethereumEvents.buildEventMapFromAbi(ERC20)

  const expected = {
    eventName: 'Transfer',
    data: {
      from: '0x05ee546c1a62f90d7acbffd6d846c9c54c7cf94c',
      to: '0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0',
      value: '14500000000000000000'
    },
    address: log.address,
    blockNumber: 5314666,
    transactionHash: log.transactionHash,
    transactionIndex: 107,
    blockHash: log.blockHash,
    logIndex: 199,
    removed: false
  }

  t.deepEqual(
    ethereumEvents.parseLogWithEventMap(eventMap.Transfer, log),
    expected
  )
  // made the interface nicer, and the eventMap will do the same as the above
  t.deepEqual(eventMap.Transfer.parseLog(log), expected)
})

test('ethereumEvents.parseLogWithEventMap will error when the EventMapT.topicHash does not match EthereumLogT.topics[0]', t => {
  const log = {
    address: '0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0',
    topics: [
      '0xnope',
      '0x00000000000000000000000005ee546c1a62f90d7acbffd6d846c9c54c7cf94c',
      '0x00000000000000000000000086fa049857e0209aa7d9e616f7eb3b3b78ecfdb0'
    ],
    data: '0x000000000000000000000000000000000000000000000000c93a592cfb2a0000',
    blockNumber: '0x51186a',
    transactionHash:
      '0xe6cacab6243e87a89e8a9060bfe8e07581ca38cdf6d7ad3c4aed62905209165d',
    transactionIndex: '0x6b',
    blockHash:
      '0x07548960edd9266d40d8f52ec0346372ae9bed4069e28086fee6abc8553a2d6a',
    logIndex: '0xc7',
    removed: false
  }
  const eventMap = ethereumEvents.buildEventMapFromAbi(ERC20).Transfer
  t.throws(
    () => ethereumEvents.parseLogWithEventMap(eventMap, log),
    'parseLogWithEventMap: given a (eventMap, log) pair that does not match (0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef, 0xnope)'
  )
})
