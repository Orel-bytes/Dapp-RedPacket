'use strict';

class BCConnectorInterface {

    constructor(option) {
        if (new.target === BCConnectorInterface) {
            throw new TypeError("Cannot construct Abstract class directly");
        }
    }

    async getBalance(chain, addr) {
        // dummy
    }

    async getMultiBalance(chain, addrArray) {
        // dummy
    }

    async getGasPrice(chain) {
        // dummy
    }

    async getBlockNumber(chain) {
        // dummy
    }

    async getBlockByNumber(chain, blockNo) {
        // dummy
    }

    async getScEvent(chainType, address, topics, option) {
        // dummy
    }

    async callScFunc(chainType, scAddr, name, args, abi) {
        // dummy
    }

    async getNonce(chain, addr) {
        // dummy
    }

    async getNonceIncludePending(chain, addr) {
        // dummy
    }

    async sendRawTransaction(chain, signedTx) {
        // dummy
    }

    async estimateGas(chain, txObject) {
        // dummy
    }

    async getTransactionReceipt(chain,txHash){
        // dummy
    }

    async callScFunc(chainType, scAddr, name, args, abi){
        // dummy
    }
};

module.exports = BCConnectorInterface;
