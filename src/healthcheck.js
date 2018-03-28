// @flow

const http = require('http')

const { queries } = require('utils/db')

const logger = require('utils/logger')('healthcheck')

type StartHealthcheckServerT = string => void
const startHealthcheckServer: StartHealthcheckServerT = port => {
  http
    // $FlowIgnore : you can have an async function for requestListener
    .createServer(async (req, res) => {
      const healthy = await queries.connectionCheck()
      if (!healthy) logger.error('failed healthcheck')

      res.writeHead(healthy ? 200 : 500, { 'Content-Type': 'text/plain' })
      res.end('')
    })
    .listen(port, () => {
      logger.info('healthcheck is listening on', port)
    })
}

module.exports = startHealthcheckServer
