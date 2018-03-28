# blockchain-watcher
A node.js service that will follow an ethereum blockchain, and perform jobs based on log (aka event) data

Currently we expect to only track one Smart Contract, the first CustomPOAToken we have deployed

## Development Setup

### Local postgresql database
There needs to be a database and user setup for this service to run. A
- `brew install postgres` => install postgres
- `mkdir /usr/local/var/postgres && cd $_ && initdb .`  => initialize a directory for postgres to store data in
- `pg_ctl start -D /usr/local/var/postgres -l /usr/local/var/log/postgres/postgres.log` => starts a postgres server and outputs logs to a known dir (nice to make this an alias if you will use it often)
- `psql postgres -c "create user blockchain_watcher_user PASSWORD '{password}'"` => create a user
- `psql postgres -c "create database blockchain_watcher with owner blockchain_watcher_user"` => create a database with the user as owner

If you want to open a psql session run `psql -U blockchain_watcher_user blockchain_watcher`

### Local environment file
To run the service, you must have a `.env` file in the repo root. Copy the `.env.example` file to `.env` and make sure it matches your local postgresql setup.

### Local postgresql migrations
Run `yarn db:migrate` to get the latest

To create a new migration run `yarn db:migrate:make {migration_name}`

## Development
Run `yarn start`

## Testing
Run `yarn test`
