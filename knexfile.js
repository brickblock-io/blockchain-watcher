// the knex tool wants to allow many environment migration, but we are pinning to just the one
// specified in the `.env` file
require('dotenv').config()

const config = {
  MIGRATE_NODE_ENV: {
    client: 'postgresql',
    connection: {
      database: process.env.POSTGRES_DATABASE,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
}

// eslint-disable-next-line no-console
console.log('using config', JSON.stringify(config, null, 2))

module.exports = config
