const colors = require('colors/safe')
const solc = require('solc');
const fs = require('fs');
const path = require('path');
require('./web3Info.js')
const web3 = global.wanchainweb3;
const emptyAddr = '0x0000000000000000000000000000000000000000'
let srcDir = typeof(__dirname) == 'undefined' ? '' : __dirname;


const filter = web3.eth.filter('latest')


let RedPacketSOL,
    RedPacketABI,
    RedPacketCompiled

/**
 *
 * functions
 * 
 **/

const capitalize = function(input) {
    return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
}

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

const appendFile = function(fileName,data) {

    fs.appendFile(fileName, data, 'utf-8', function(err){
        if(err){
            console.log(err);
        }
    });
}

const writeFile = function(fileName,data) { 
    createFolder(fileName);
    fs.writeFileSync(fileName,data,{flag:'w',encoding:'utf-8',mode:'0666'})
}

const updateOwnerNonce = function(nonce) {
    writeFile('./nonceInfo/wanOwnerNonceInfo.js','global.wanOwnerNonce = 0x' + nonce.toString(16) + ';');
}

const updateDelegateNonce = function(nonce) {
    writeFile('./nonceInfo/wanDelegateNonceInfo.js','global.wanDelegateNonce = 0x' + nonce.toString(16) + ';');
}

async function waitReceipt(txHash, waitBlockNumber, isCreateSc) {
    console.log(colors.yellow(`processing Tx: ${txHash}, this may take a while...`))
    let counter, receipt
    counter = 0
    while (counter < waitBlockNumber) {
        let blockHash = await promisify(cb => filter.watch(cb))
        if (!(counter == 0)) {
            console.log(colors.yellow(`${counter} blocks passed!`))
        }
        receipt = await getReceipt(txHash)
        if (!receipt) {
            counter ++
        } else {
            if (isCreateSc) {
                if(receipt.status!=0x1) {
                    return null
                } else {
                    console.log(colors.green("Contract Address: " +  receipt.contractAddress))
                    return receipt.contractAddress
                }
            } else {
                return receipt.status == 0x1
            }
        }
    }
}

async function sendTxInSerial(fileName) {
    var serializedTx = fs.readFileSync(path.join(srcDir, fileName), 'utf8');
    console.log("\nserializedTx:0x" + serializedTx+ "\n\n");

    let hash = await sendRawTransaction('0x' + serializedTx.toString('hex'));
    console.log(colors.green('transaction hash: ' + hash))

    return hash
}

const sendRawTransaction = (encodedTx) =>
    new Promise((resolve, reject) => {
        web3.eth.sendRawTransaction(encodedTx, (err, hash) => {
            if (err) {
                console.log('sendRawTransaction error: ', err);
                reject(err)
            }
            resolve(hash)
        })
    })

const getReceipt = (txHash) =>
    new Promise((resolve, reject) => {
        web3.eth.getTransactionReceipt(txHash, (err, receipt) => {
            if (err) {
                console.log('getReceipt error: ', err)
                reject(err)
            }

            resolve(receipt)
        })
    })

const stopFilter = () => filter.stopWatching()

const promisify = (inner) =>
    new Promise((resolve, reject) =>
        inner((err, res) => {
            if (err) {
                console.log(err)
                reject(err)
            }

            resolve(res);
        })
    )

const getBlockNumber = () => web3.eth.blockNumber

const tokenToWei = (token, decimals=18) => {
    let wei = web3.toBigNumber(token).times('1e' + decimals).trunc();
    return wei.toString(10);
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
    emptyAddr,
    createFolder,
    sendTxInSerial,
    waitReceipt,
    stopFilter,
    updateOwnerNonce,
    writeFile,
    appendFile,
    capitalize,
    tokenToWei
}
