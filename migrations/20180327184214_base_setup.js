'use strict'

const up = knex =>
  knex.schema
    .createTable('contact_data', table => {
      table.text('email').primary()

      table.text('ethereum_address').index()
      table.text('first_name')
      table.text('last_name')
    })
    .createTable('email_receipts', table => {
      table.increments('id').primary()

      table.text('contact_email').index()
      table.text('event_name').index()
      table.text('transaction_hash').index()
    })
    .createTable('events', table => {
      table.increments('id').primary()

      table.json('event_data')
      table.text('event_name').index()
      table.text('transaction_hash').index()
    })

const down = knex =>
  knex.schema
    .dropTable('contact_data')
    .dropTable('email_receipts')
    .dropTable('events')

module.exports = {
  up,
  down
}
