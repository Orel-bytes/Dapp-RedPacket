require('./configurations/keystore/keystoreInfo.js')

const colors = require('colors/safe');
const fs = require('fs');
const path = require('path');
const solc = require('solc');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:51001"));
const wanUtil = require('wanchain-util');
const Tx = wanUtil.wanchainTx;
const keythereum = require('keythereum');
const BigNumber = require('bignumber.js')

const wanOwnerKs = global.wanOwnerKs;
const wanOwnerKsPWD = global.wanOwnerKsPWD
const keystore = JSON.parse(wanOwnerKs);
const ownerPriv = keythereum.recover(wanOwnerKsPWD, keystore);

const srcDir = typeof(__dirname) == 'undefined' ? '' : __dirname;
const GAS_PAYED = 4700000;
const GAS_LIMIT = 4700000;
const GAS_PRICE = 180000000000;
const FUNC_GAS_PAYED = 1000000;


let RedPacketSOL,
    RedPacketABI,
    RedPacketCompiled

const createFolder = function(to) { 
    var sep = path.sep
    var folders = path.dirname(to).split(sep);
    var p = '';
    while (folders.length) {
        p += folders.shift() + sep;
        if (!fs.existsSync(p)) {
            fs.mkdirSync(p);
        }
    }
}

const capitalize = function(input) {
    return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
}

const writeFile = function(fileName,data) { 
    createFolder(fileName);
    fs.writeFileSync(fileName,data,{flag:'w',encoding:'utf-8',mode:'0666'});
}

const updateOwnerNonce = function(nonce) {
    writeFile('../../configurations/wanOwnerNonceInfo.js','global.wanOwnerNonce = 0x' + nonce.toString(16) + ';');
}

const updateDelegateNonce = function(nonce) {
    writeFile('../../configurations/wanDelegateNonceInfo.js','global.wanDelegateNonce = 0x' + nonce.toString(16) + ';');
}

const sendTxInSerial = function (txData, serial, contractAddr, value, filename, priv) {
    console.log("txdata=" + txData);
    if(0 != txData.indexOf('0x')){
        txData = '0x' + txData;
    }

    var amount = web3.toWei(value, 'ether');
    var bn = new web3.BigNumber(amount);
    var hexValue = '0x' + bn.toString(16);

    var hexSerial = '0x' + serial.toString(16);

    var fromAddr = keythereum.privateKeyToAddress(priv);
    rawTx = {
        Txtype: 0x01,
        nonce: hexSerial,
        gasPrice: GAS_PRICE,
        gas: GAS_PAYED,
        gasLimit: GAS_LIMIT,
        to: contractAddr,
        value: hexValue,
        from: fromAddr,
        data: txData
    };

    tx = new Tx(rawTx);
    tx.sign(priv);

    var serializedTx = tx.serialize();
    console.log("\nserializedTx: 0x" + serializedTx.toString('hex') + "\n\n");

    writeFile(filename,serializedTx.toString('hex'));
}

// added by liaoxingxing for RedPacket.sol
console.log(colors.yellow("--------compiling RedPacket.sol------------------"))
content = fs.readFileSync(path.join(srcDir, "./mergedSol/RedPacket.sol"), 'utf8');
RedPacketCompiled = solc.compile(content, 1);
RedPacketSOL = web3.eth.contract(JSON.parse(RedPacketCompiled.contracts[':RedPacket'].interface));
RedPacketABI = RedPacketCompiled.contracts[':RedPacket'].interface;

module.exports = {
    RedPacketSOL,
    RedPacketABI,
    RedPacketCompiled,
    ownerPriv,
    sendTxInSerial,
    updateOwnerNonce,
    writeFile,
    createFolder,
    capitalize
}
