require('./web3Info.js')
const wanweb3 = global.wanchainweb3
const utils = require('./utils.js')
const colors = require('colors/safe')

require('./configurations/kernelCfg/config.js')

let wanOwnerNonce = '0x' + wanweb3.eth.getTransactionCount(global.wanOwnerAddr).toString(16)
console.log(colors.green('wanOwnerNonce\'s nonce: ', wanOwnerNonce))

utils.writeFile('./configurations/wanOwnerNonceInfo.js','global.wanOwnerNonce = ' + wanOwnerNonce)
