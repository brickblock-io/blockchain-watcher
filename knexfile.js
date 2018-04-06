// the knex tool wants to allow many environment migration, but we are pinning to just the one
// specified in the `.env` file
require('dotenv').config()

const config = {
  MIGRATE_NODE_ENV: {
    client: 'postgresql',
    connection: {
      database: process.env.POSTGRES_DATABASE,
      user: process.env.POSTGRES_USER,
      host: process.env.POSTGRES_HOST,
      password: process.env.POSTGRES_PASSWORD
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
}

module.exports = config
