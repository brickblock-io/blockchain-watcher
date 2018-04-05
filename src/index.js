// @flow

import type { BootstrapConfigT } from 'types/worker-config'

// ---

require('dotenv').config()

const EthereumQuery = require('eth-query')
const EventEmitter = require('events')
const HttpProvider = require('web3-providers-http')

const getEnvVar = require('utils/get-env-var')
const setupWorkers = require('./setup-workers')
const watchForLatestBlock = require('eth/watch-for-latest-block')
const { setupDatabaseConnection } = require('utils/db')

const logger = require('utils/logger')('index')

const shutdown = () => {
  logger.fatal('shutting down')
  process.exit(-1)
}

const setupWeb3Provider = config => {
  const httpProvider = new HttpProvider(config.ethereumProvider.url)
  // doing this for eth-query interface expectations
  httpProvider.sendAsync = httpProvider.send

  return httpProvider
}

type BootstrapT = BootstrapConfigT => void
const bootstrap: BootstrapT = config => {
  logger.info('bootstrap->INIT')

  const eventChannel = new EventEmitter()
  const currentProvider = setupWeb3Provider(config)
  const ethQuery = new EthereumQuery(currentProvider)

  watchForLatestBlock(
    config.ethereumProvider.getBlockNumberInterval,
    ethQuery,
    eventChannel
  )
  setupWorkers(
    config.contract,
    config.maxBlockDifference,
    ethQuery,
    eventChannel
  )

  eventChannel.on('error', status => {
    logger.error('eventChannel error event ->', status)
    shutdown()
  })

  // kubernetes will send a SIGTERM before it kills the pod, with a 30 second delay before SIGKILL
  // we should finish processing any active jobs, and then exit
  process.on('SIGTERM', () => {
    logger.info('process received SIGTERM')
    eventChannel.emit('workers/SIGTERM')
    eventChannel.on('workers/SIGTERM/success', () => {
      logger.info('eventChannel received workers/SIGTERM/success')
      shutdown()
    })
  })

  logger.info('bootstrap->DONE')
}

setupDatabaseConnection({
  database: getEnvVar('POSTGRES_DATABASE'),
  host: getEnvVar('POSTGRES_HOST'),
  password: getEnvVar('POSTGRES_PASSWORD'),
  user: getEnvVar('POSTGRES_USER')
})

// eslint-disable-next-line import/no-unassigned-import
require('./healthcheck')(getEnvVar('PORT'))

bootstrap({
  contract: {
    abi: require('@brickblock/smart-contracts/build/contracts/CustomPOAToken.json')
      .abi,
    address: getEnvVar('CONTRACT_ADDRESS'),
    deployedAtBlock: Number(getEnvVar('CONTRACT_DEPLOYED_AT_BLOCK'))
  },
  ethereumProvider: {
    getBlockNumberInterval: Number(getEnvVar('GET_BLOCK_NUMBER_INTERVAL')),
    url: getEnvVar('INFURA_URL')
  },
  maxBlockDifference: Number(getEnvVar('MAX_BLOCK_DIFFERENCE'))
})
