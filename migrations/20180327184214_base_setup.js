'use strict'

const up = knex =>
  knex.schema
    .createTable('contact_data', table => {
      table.uuid('uuid').primary()
      ;[
        table.text('email').index(),
        table.text('ethereum_address').index(),
        table.text('name')
      ].forEach(x => x.notNullable())
    })
    .createTable('email_receipts', table => {
      table.text('hash').primary()
    })
    .createTable('events', table => {
      table.increments('id').primary()
      ;[
        table.text('contract_address').index(),
        table.text('block_number').index(),
        table.json('event_data'),
        table.text('event_name').index(),
        table.text('transaction_hash').index()
      ].forEach(x => x.notNullable())
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
