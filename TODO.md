## setup
- [x] use bunyan for logging
- [x]setup workers
- process hooks
  * daemonize index.js
  * uncaughtException
  * term & sigkill from Kubernetes (default is 30 seconds)
- setup postgres
  * determine migrations strategy
  * document setup for local dev & production
- sendgrid API key
  * check the email templates IDs Denis sent
- kubernetes
  * dockerfile
  * k8s setup -> configmap.yml
  * gitlab CI
  * staging environment setup
  * prod environment setup

## WhitelistWorker
1. user sends KYC data {email, ethereumAddress}
2. we approve KYC data
  -> {email, ethereumAddress} goes into db
  -> ethereumAddress is sent to smart contract
    -> WhitelistedEvent(address, bool: true)
---
3. whitelistWorker listen for WhitelistedEvent
  x-> lookup email
  x-> send email (here we would like a link to platform so they can come and buy some POA tokens)
  x-> records in db that an email was sent (email, ethereumAddress, txHash)

## PurchaseWorker
1. purchaseWorker listen for BuyEvent
  -> lookup email
  -> send email
  -> records in db that an email was sent (email, ethereumAddress, txHash)

## ArchiverWorker
1. all incoming events for contracts we care about are indexed into a table for easy querying
  -> records in db like {contractAddress, eventName, eventData}
