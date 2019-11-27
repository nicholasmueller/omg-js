/*
Copyright 2019 OmiseGO Pte Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

const promiseRetry = require('promise-retry')
const { transaction } = require('../packages/omg-js-util/src')
const numberToBN = require('number-to-bn')

function waitForBalance (childChain, address, currency, callback) {
  return promiseRetry(async (retry, number) => {
    console.log(`Waiting for childchain balance...  (${number})`)
    const resp = await childChain.getBalance(address)
    if (resp.length === 0) retry()
    const currencyExists = resp.find(item => item.currency.toLowerCase() === currency.toLowerCase())
    if (!currencyExists) retry()

    if (callback) {
      const callbackPassed = callback(currencyExists)
      if (!callbackPassed) retry()
    }

    return resp
  }, {
    minTimeout: 6000,
    factor: 1,
    retries: 50
  })
}

function waitForBalanceEq (childChain, address, expectedAmount, currency) {
  currency = currency || transaction.ETH_CURRENCY
  const expectedBn = numberToBN(expectedAmount)
  return waitForBalance(childChain, address, currency, balance => numberToBN(balance.amount).eq(expectedBn))
}

function wait (ms) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms))
}

async function waitForChallengePeriodToEnd (rootChain) {
  const minExitPeriod = await rootChain.plasmaContract.methods.minExitPeriod().call() * 1000
  const waitMs = (Number(minExitPeriod) * 2)

  console.log(`Waiting for ${waitMs * 0.00001667} min for the challenge period to end...`)
  await wait(waitMs)
  console.log('Challenge period finished')
}

module.exports = {
  wait,
  waitForChallengePeriodToEnd,
  waitForBalanceEq
}
