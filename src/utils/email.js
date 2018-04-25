// @flow

type SendGridMessageT<A> = {
  from: string,
  html: string,
  subject: string,
  substitutions: A,
  templateId: string,
  text: string,
  to: string
}

type SendGridBuyEventSubstitutionsT = {|
  amount: string,
  name: string,
  transactionHash: string
|}

// ---

const sendgrid = require('@sendgrid/mail')

const getEnvVar = require('utils/get-env-var')

// setup config first, if env vars are missing we want this to error
const emailConfig = {
  apiKey: getEnvVar('SENDGRID_API_KEY'),
  fromAddress: getEnvVar('EMAIL_FROM_ADDRESS'),
  templates: {
    BuyEvent: getEnvVar('SENDGRID_TEMPLATE_ID_BUY_EVENT')
  }
}

// initialize sendgrid library
sendgrid.setApiKey(emailConfig.apiKey)
sendgrid.setSubstitutionWrappers('{{', '}}')

type SendBuyEventEmailT = (*, *) => Promise<*>
const sendBuyEventEmail: SendBuyEventEmailT = (contactData, log) => {
  const msg: SendGridMessageT<SendGridBuyEventSubstitutionsT> = {
    to: contactData.email,
    from: emailConfig.fromAddress,
    // subject, text, and html will be provided by the template we are using
    // this library demands that there is a string with at least one character..
    subject: 'null',
    text: 'null',
    html: 'null',
    templateId: emailConfig.templates.BuyEvent,
    substitutions: {
      amount_of_poa: log.data.amount,
      name: contactData.name,
      transaction_hash: log.transactionHash
    }
  }

  return sendgrid.send(msg)
}

module.exports = {
  sendBuyEventEmail
}
