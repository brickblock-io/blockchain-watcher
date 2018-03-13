/* eslint-disable no-console */

/*
 * Issues found during experimentation:
 * • "Does Infura support the Web3.js 1.0 API?" ⬅️  the original infure ticket on adding websocket support
 *    https://github.com/INFURA/infura/issues/29
 * • "web3.eth.Contract.allEvents does not work in Web3 1.0.0-beta16 using WebSockets" ⬅️  it does but i'm getting a weird response
 *    https://github.com/ethereum/web3.js/issues/989
 * • "Watching contract events with Infura"
 *    https://github.com/INFURA/infura/issues/73
 */
const Web3 = require('web3')

// Kovan unfortunately doesn't support websockets at the moment: https://github.com/INFURA/infura/issues/29#issuecomment-365223048
const network = 'ropsten'

// WebsocketProvider
const web3 = new Web3(
  new Web3.providers.WebsocketProvider(`wss://${network}.infura.io/ws`)
)

// HttpProvider
// const web3 = new Web3(`https://${network}.infura.io`)

// Hardcoded for testing purposes: https://platform.brickblock.io/invest/0x8d77adab8bb3b7f27048b4be4b0a8afea562db67/purchase
const CustomPoaTokenAddress = '0x8d77adab8bb3b7f27048b4be4b0a8afea562db67'
const CustomPoaTokenABI = require('@brickblock/smart-contracts/build/contracts/CustomPOAToken.json')
  .abi
const CustomPoaTokenContract = new web3.eth.Contract(
  CustomPoaTokenABI,
  CustomPoaTokenAddress
)

// This doesn't produce any output at all!?
CustomPoaTokenContract.events
  .BuyEvent({ fromBlock: 'latest' }, (error, event) => {
    if (error) {
      console.error('BuyEvent ERROR', error)
      return false
    }

    console.log('BuyEvent EVENT', event)
  })
  .on('data', event => {
    // should return same result as the callback above
    console.log('BuyEvent onData', event)
  })
  .on('changed', event => {
    // remove event from local database
    console.log('BuyEvent onChanged', event)
  })
  .on('error', console.error)

/*
 * This produces the following output after buying a CustomPOA token
 * EVENT { address: '0x8d77ADaB8BB3b7F27048B4BE4B0A8aFeA562DB67',
 *   blockNumber: 2828554,
 *   transactionHash: '0x9ddac27a159cdef54e29818da486c66f62eca00d44c3eeb114ba096841829bb1',
 *   transactionIndex: 3,
 *   blockHash: '0x5dfed9c3cf1515ea11095da62235b5905a5aea21ca45b2416987befaa3527085',
 *   logIndex: 1,
 *   removed: false,
 *   id: 'log_8cabbe53',
 *   returnValues: Result {},
 *   event: undefined,
 *   signature: null,
 *   raw:
 *    { data: '0x00000000000000000000000012da83af9ce858d26ee94866a3b2f92493dbea9300000000000000000000000000000000000000000000000002c68af0bb140000',
 *      topics:
 *       [ '0xe3d4187f6ca4248660cc0ac8b8056515bac4a8132be2eca31d6d0cc170722a7e' ] } }

 *   }
 * )
 */
CustomPoaTokenContract.events.allEvents(
  { fromBlock: 'latest' },
  (error, event) => {
    if (error) {
      console.error('allEvents ERROR', error)
      return false
    }

    console.log('allEvents callback', event)
  }
)
