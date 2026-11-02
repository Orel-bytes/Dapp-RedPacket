const OfflineServiceInterface = require('../../interfaces/OfflineServiceInterface');

const Web3 = require("web3");
const web3 = new Web3();
var keythereum = require('keythereum');
const crypto = require("crypto");
keythereum.constants.quiet = true;
var ethUtil = require('ethereumjs-util');
const ethTx = require('ethereumjs-tx');

class OfflineServiceEth extends OfflineServiceInterface {

    constructor(accountService) {
        super(accountService);
        this.chain = 'ETH';
    }

    async signTx(tx, accountId) {
        let privateKey = await this.accountService.getAccountPrivateKey(accountId);
        if (!privateKey) throw Error('account not exist');
        var signtx = new ethTx({
            nonce: web3.toDecimal(web3.toBigNumber(tx.nonce)),
            gasPrice: web3.toHex(web3.toBigNumber(tx.gasPrice)),
            gasLimit: web3.toHex(web3.toBigNumber(tx.gasLimit)),
            to: tx.to,
            value: web3.toHex(web3.toBigNumber(tx.value)),
            data: tx.data,
            chainId: web3.toDecimal(web3.toBigNumber(tx.chainId))
        });

        signtx.sign(privateKey);

        return '0x' + signtx.serialize().toString('hex');
    }

}

module.exports = OfflineServiceEth;