// @flow

const bunyan = require('bunyan')

// here we config logger for all workers
module.exports = (name: string) => bunyan.createLogger({ name })
