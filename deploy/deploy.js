"use strict"
const solc = require('solc');
const fs = require('fs');
const path = require('path');
const Web3 = require('web3');
var http = require("http");
let ContractKit = require("./src/contract-toolkit.js")
let keystore_util = require("./src/keystore.js")
var wanUtil = require('wanchain-util');
var wanTx = wanUtil.wanchainTx;
let keythereum = require('keythereum');
let ethTx = require('ethereumjs-tx');
const wan_config = {
    gasPrice: 180000000000,
    gasLimit: 4700000
};


let wan_address;
let wan_privateKey;
let configJson = require('./config.json');
let wan_RpcUrl = configJson.chain_url;
function load_global_config() {
    try {
        let global_config = configJson;
        if (global_config.Account.type === 'keystore') {
            let accountTmp = keystore_util.loadKeyStoreFile(path.join(__dirname, global_config.Account.keystore), global_config.Account.password);
            wan_address = accountTmp.address;
            wan_privateKey = accountTmp.privateKey;
        } else {
            wan_address = global_config.Account.address;
            wan_privateKey = Buffer.from(global_config.Account.privateKey.slice(2), 'hex')
        }
    } catch (error) {
        console.error('load global config failed:', error);
        process.exit();
    }
}

load_global_config();
console.log("wan_RpcUrl:", wan_RpcUrl);
console.log("wan_address:", wan_address);
console.log("wan_privateKey:", wan_privateKey);

let wan_Web3 = new Web3(new Web3.providers.HttpProvider(wan_RpcUrl));

async function getAddressBalance() {
    try {
        let balance = await wan_Web3.eth.getBalance(wan_address);
        //let ethVal = wan_Web3.fromWei(balance, "ether");//0.20.7
        let ethVal = wan_Web3.utils.fromWei(balance);//1.2.6
        console.log("Balance:", ethVal.toString(10));
    }
    catch (err) {
        console.log('err message:', err.message);
        console.log("err stack:", err.stack);
    }
}
getAddressBalance();
//*************************************************************************************************************************************************************

let contractKit = new ContractKit();
let RedPacketSC = {
    "name": "RedPacket",
    "fname": path.join(__dirname, configJson.sc_fname),
    "args": [configJson.rpServiceAccount]
};

// 加载,编译
async function load_compile() {
    let obj = RedPacketSC;
    console.log("obj:\n", obj);
    console.log("\n\n\n\n****************************************************************************************************************")
    console.log("compile?", contractKit.compile2(obj.fname));
    obj.abi = contractKit.getABI(obj.name);
    obj.bytecode = contractKit.getByteCode(obj.name);
    let abi_fn = path.join(__dirname, "ABI_" + obj.name + ".json");
    fs.writeFileSync(abi_fn, JSON.stringify(obj.abi), "utf8");
    //console.log("obj:\n", obj);
    //console.log("compile error:", contractKit.compileError());
    //console.log("abi:", JSON.stringify(obj.abi));
    //console.log("bytesCode:", contractKit.getByteCode(obj.name));
}

load_compile();


async function getNonce(web3, address) {
    let nonce = 0;

    try {
        nonce = await web3.eth.getTransactionCount(address, 'pending');
    } catch (error) {
        //console.error(error.message);
        //console.error(error);
    }
    console.log("nonce:", nonce);
    return nonce;
}

async function chain_sendRawTransaction(web3, txData) {
    let self = web3;
    return new Promise(function (resolve, reject) {
        try {
            self.eth.sendSignedTransaction(txData,function (err, txhash) {
                if (err) {
                    reject(err);
                } else {
                    resolve(txhash);
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}

async function deploy_contract() {
    try {
        let deploy_blockNumber;
        let map_contract_address = {};
        let hexGasPrice = wan_Web3.utils.toHex(wan_config.gasPrice);// 1.2.6
        let hexgasLimit = wan_Web3.utils.toHex(wan_config.gasLimit);// 1.2.6
        let nonce = await getNonce(wan_Web3, wan_address);
        nonce = wan_Web3.utils.toHex(nonce);// 1.2.6
        //let hexGasPrice = wan_Web3.toHex(wan_config.gasPrice);//0.20.7
        //let hexgasLimit = wan_Web3.toHex(wan_config.gasLimit);//0.20.7
        // 1 deploy 
        {
            //console.log("RedPacketSC.abi:\n", RedPacketSC.abi);
            //const instanceContract = wan_Web3.eth.contract(RedPacketSC.abi);// 0.20.7
            //let txdata = instanceContract.new.getData.apply(null, [{ data: RedPacketSC.bytecode }]);// 0.20.7
            
            const instanceContract = new wan_Web3.eth.Contract(RedPacketSC.abi);// 1.2.6
            let txdata = await instanceContract.deploy({ data: RedPacketSC.bytecode, arguments: [] }).encodeABI();
            console.log("instanceContract:\n", instanceContract);
            console.log("\n\n\n********");
            //console.log(JSON.stringify(instanceContract));
            console.log("\n\n\n********");

            let tx = {
                Txtype: 0x01,
                nonce: nonce,
                gasPrice: hexGasPrice,
                gasLimit: hexgasLimit,
                to: '',
                value: '0x0',
                data: txdata
            }
            console.log("tx:", tx);
            let tran = new wanTx(tx);
            //let tran = new ethTx(tx);
            tran.sign(wan_privateKey);
            var serializedTx = tran.serialize();
            var hexData = '0x' + serializedTx.toString('hex');
            //var tranHash = await wan_Web3.eth.sendRawTransaction(hexData);// 0.20.7
            
            // var tranHash = await wan_Web3.eth.sendSignedTransaction(hexData);//1.2.6 error
            var tranHash = await chain_sendRawTransaction(wan_Web3, hexData);
            console.log("tranHash:", tranHash);
            let receipt = await wan_Web3.eth.getTransactionReceipt(tranHash);
            while (null === receipt) {
                receipt = await wan_Web3.eth.getTransactionReceipt(tranHash);
            }
            console.log("deploy tran receipt:", receipt);
            if (receipt.status) {
                RedPacketSC.contractAddress = receipt.contractAddress;
                map_contract_address[RedPacketSC.name] = RedPacketSC.contractAddress;
                deploy_blockNumber = receipt.blockNumber;
            }
            else {
                console.log("error exit*******************");
                process.exit(0);
            }
        }
        // 2 init
        {
            // let contract = wan_Web3.eth.contract(RedPacketSC.abi);// 0.20.7
            // let contractInstance = contract.at(RedPacketSC.contractAddress);// 0.20.7
            // let txdata = contractInstance["SetRPGasFee"].getData.apply(null, [configJson.rpGasFee]);//0.20.7

            const instanceContract = new wan_Web3.eth.Contract(RedPacketSC.abi, RedPacketSC.contractAddress);// 1.2.6
            console.log("instanceContract:\n", instanceContract);
            let txdata = instanceContract.methods.SetRPGasFee(wan_Web3.utils.toHex(configJson.rpGasFee)).encodeABI();
            let tx = {
                Txtype: 0x01,
                nonce: await getNonce(wan_Web3, wan_address),
                gasPrice: hexGasPrice,
                gasLimit: hexgasLimit,
                to: RedPacketSC.contractAddress,
                value: '0x0',
                data: txdata,
            }
            console.log("init tx:", tx);
            let tran = new wanTx(tx);
            //let tran = new ethTx(tx);
            tran.sign(wan_privateKey);
            var serializedTx = tran.serialize();
            var hexData = '0x' + serializedTx.toString('hex');
            // var tranHash = await wan_Web3.eth.sendRawTransaction(hexData);//0.20.7
            // var tranHash = await wan_Web3.eth.sendSignedTransaction(hexData);//1.2.6 error
            var tranHash = await chain_sendRawTransaction(wan_Web3, hexData);
            let receipt = await wan_Web3.eth.getTransactionReceipt(tranHash);
            while (null === receipt) {
                receipt = await wan_Web3.eth.getTransactionReceipt(tranHash);
            }
            console.log("init tran receipt:", receipt);
            if (receipt.status) {
                deploy_blockNumber = receipt.blockNumber;
            }
            else {
                console.log("error exit*******************");
                process.exit(0);
            }
        }
        console.log("\n\n\n\n****************************************************************************************************************");
        console.log("deploy complete blockNumber:", deploy_blockNumber);
        map_contract_address.startBlock = deploy_blockNumber;
        console.log("map_contract_address:\n", map_contract_address);
        let deploy_result_file = path.join(__dirname, './deploy_result.json');
        fs.writeFileSync(deploy_result_file, JSON.stringify(map_contract_address));
        console.log('deploy_result_file:', deploy_result_file);
        console.log("****************************************************************************************************************\n\n\n\n")
    }
    catch (err) {
        console.log("err message:", err.message);
        console.log("err stack:", err.stack);
    }
}
deploy_contract();












