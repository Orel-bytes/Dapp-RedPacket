const OfflineServiceEth = require('./OfflineServiceEth');

var keythereum = require('keythereum');
const crypto = require("crypto");
keythereum.constants.quiet = true;
const wanUtil = require('wanchain-util');
var ethUtil = require('ethereumjs-util');
var wanTx = wanUtil.wanchainTx;
const Web3 = require("web3");
const web3 = new Web3();

class OfflineServiceWan extends OfflineServiceEth {

    constructor(accountService) {
        super(accountService);
        this.chain = 'WAN';
    }

    async signTx(tx, accountId) {
        let privateKey = await this.accountService.getAccountPrivateKey(accountId);
        if (!privateKey) throw Error('account not exist');
        var signtx = new wanTx({
            Txtype:( tx.Txtype?tx.Txtype:'0x01'),
            nonce: web3.utils.toHex(tx.nonce),
            gasPrice: web3.utils.toHex(tx.gasPrice),
            gasLimit: web3.utils.toHex(tx.gasLimit),
            to: tx.to,
            value: web3.utils.toHex(tx.value),
            data: tx.data,
            chainId: web3.utils.toHex(tx.chainId)
        });

        signtx.sign(privateKey,'hex');

        return '0x' + signtx.serialize().toString('hex');
    }

    async signTxEx(tx, accountId) {
        let privateKey = await this.accountService.getAccountPrivateKey(accountId);
        if (!privateKey) throw Error('account not exist');
        var signtx = new wanTx({
            Txtype: (tx.Txtype ? tx.Txtype : '0x01'),
            nonce: web3.utils.toHex(tx.nonce),
            gasPrice: web3.utils.toHex(tx.gasPrice),
            gasLimit: web3.utils.toHex(tx.gasLimit),
            to: tx.to,
            value: web3.utils.toHex(tx.value),
            data: tx.data,
            chainId: web3.utils.toHex(tx.chainId)
        });

        signtx.sign(privateKey, 'hex');
        return '0x' + signtx.serialize().toString('hex');
    }

}

module.exports = OfflineServiceWan;
