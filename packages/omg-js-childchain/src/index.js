const watcherApi = require('./watcherApi')
const sign = require('./transaction/signature')
const submitTx = require('./transaction/submitRPC')
const rlp = require('rlp')
const { InvalidArgumentError } = require('omg-js-util')
global.Buffer = global.Buffer || require('buffer').Buffer

/*
 *Summary: Interact with Tesuji Plasma Childchain from JavaScript (Node.js and Browser)
 *Description: allows user to interact with Tesuji Plasma from JavaScript. look up examples for implementations in boith Client and Server
 *
 *@param {string} watcherUrl contains the url of the watcher server
 *@param {string} childChainUrl contains the url of the childchain server to communicate with
 *@param {string} web3Provider contains the url of geth node
 *@param {string} plasmaAddr contains the url of the plasma smart contract already deployed
 *
 */

class ChildChain {
  constructor (watcherUrl, childChainUrl) {
    this.watcherUrl = watcherUrl
    this.childChainUrl = childChainUrl
  }
  /**
   * Obtain UTXOs of an address
   *
   * @method getUtxos
   * @param {String} address
   * @return {array} arrays of UTXOs
   */
  async getUtxos (address) {
    validateAddress(address)
    return watcherApi.get(`${this.watcherUrl}/utxos?address=${address}`)
  }

  /**
   * Get the balance of an address
   *
   * @method getBalance
   * @param {String} address
   * @return {array} array of balances (one per currency)
   */
  async getBalance (address) {
    validateAddress(address)
    return watcherApi.get(`${this.watcherUrl}/account/${address}/balance`)
  }

  /**
   * Create an unsigned transaction
   *
   * @method createTransaction
   * @param {object} transactionBody
   * @return {object}
   */
  async createTransaction (transactionBody) {
    validateTxBody(transactionBody)
    return watcherApi.post(`${this.watcherUrl}/transaction`, transactionBody)
  }

  /**
   * Sign a transaction
   *
   * @method signTransaction
   * @param {string} unsignedTx
   * @param {array} privateKeys
   * @return {object}
   */
  signTransaction (unsignedTx, privateKeys) {
    privateKeys.forEach(key => validatePrivateKey)

    // sign transaction
    const txBytes = Buffer.from(unsignedTx, 'hex')
    const signatures = sign(txBytes, privateKeys)

    // rlp-decode the tx bytes
    const decodedTx = rlp.decode(txBytes)
    // Append the signatures
    const signedTx = [...decodedTx, ...signatures]
    // rlp-encode the transaction + signatures
    return rlp.encode(signedTx).toString('hex')
  }

  /**
   * Submit a signed transaction to the childchain
   *
   * @method submitTransaction
   * @param {string} transaction
   * @return {object}
   */
  async submitTransaction (transaction) {
    // validateTxBody(transactionBody)
    return submitTx(transaction, this.childChainUrl)
  }
}

function validateTxBody (arg) {
  validateInputs(arg.inputs)
  validateOutputs(arg.outputs)
}

function validateInputs (arg) {
  // TODO
  const valid = true
  if (!valid) {
    throw new InvalidArgumentError()
  }
}

function validateOutputs (arg) {
  // TODO
  const valid = true
  if (!valid) {
    throw new InvalidArgumentError()
  }
}

function validatePrivateKey (arg) {
  // TODO
  const valid = true
  if (!valid) {
    throw new InvalidArgumentError()
  }
}

function validateAddress (arg) {
  // TODO
  const valid = true
  if (!valid) {
    throw new InvalidArgumentError()
  }
}

module.exports = ChildChain
