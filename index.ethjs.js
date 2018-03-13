/* eslint-disable no-console */
const network = 'kovan'

const HttpProvider = require('ethjs-provider-http')
const Eth = require('ethjs-query')
const EthFilter = require('ethjs-filter')
const eth = new Eth(new HttpProvider(`https://${network}.infura.io`))
const filters = new EthFilter(eth)

// this just horribly fails and the activity in the ethjs repos doesn't seem encouraging
const filter = new filters.Filter({ delay: 300 })
  .new({ fromBlock: 'latest' })
  .then(result => {
    // result <BigNumber ...> filterId
    console.log('FILTER NEW RESULT', result)

    console.log('FILTER', filter)
    filter.watch(event => {
      console.log('FILTER WATCH RESULT', event)
      // event [{...}, ...] (fires multiple times)
    })

    return result
  })
  .catch(error => {
    console.error('ERROR', error)
  })

// filter.uninstall(cb);
