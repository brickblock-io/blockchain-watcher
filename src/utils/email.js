// @flow

import type { ContactT } from 'utils/db'

type EmailTemplatesT = $Keys<typeof emailTemplates>

// ---

const logger = require('utils/logger')('email')

// TODO: for each eventName we should have a email template
// and have a active sendGrid connection
const emailTemplates = {
  BuyEvent: 'ec711ca7-304c-48ec-afd9-7ba48c070a05'
}

type SendEmailT = (EmailTemplatesT, ContactT) => Promise<*>
const sendEmail: SendEmailT = (eventName, contact) =>
  Promise.resolve(() => {
    logger.info('sendEmail', eventName, contact)
  })

module.exports = sendEmail
