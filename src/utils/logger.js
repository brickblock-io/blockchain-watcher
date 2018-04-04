// @flow

const bunyan = require('bunyan')

// making this env var optional to show that the preferred log level is 'info'
const logLevel = process.env.LOG_LEVEL || 'info'

// here we config logger for all workers
module.exports = (name: string) =>
  bunyan.createLogger({ name, level: logLevel })
