'use strict'

const up = knex =>
  knex.schema
    .createTable('contact_data', table => {
      table.text('email').primary()
      ;[table.text('ethereum_address').index(), table.text('name')].forEach(x =>
        x.notNullable()
      )
    })
    .createTable('email_receipts', table => {
      table.text('transaction_hash').primary()
      ;[
        table.text('contact_email').index(),
        table.text('event_name').index()
      ].forEach(x => x.notNullable())
    })
    .createTable('events', table => {
      table.increments('id').primary()
      ;[
        table.text('contract_address').index(),
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
