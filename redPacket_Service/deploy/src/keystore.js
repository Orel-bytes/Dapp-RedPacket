var keythereum = require('keythereum');
let fs = require("fs");
var ethUtil = require('ethereumjs-util');

module.exports.loadKeyStoreFile = function (keyStoreFile, password) {
    let keyStoreContent = fs.readFileSync(keyStoreFile);
    var keyStore = JSON.parse(keyStoreContent);
    let keyObj = { version: keyStore.version, crypto: keyStore.crypto };
    let privateKey = keythereum.recover(password, keyObj);
    let address = ethUtil.bufferToHex(ethUtil.privateToAddress(privateKey));
    
    return {privateKey:privateKey,address:address};
}
