'use strict';
const BCConnectorInterface = require('../../interfaces/BCConnectorInterface');
const iWanClient = require('iwan-sdk');

class IWanBCConnector extends BCConnectorInterface {
    /**
     *Creates an instance of BCConnectorIWan.
     * @param {*} option = {apiKey:'', secretKey:, urlOption:{}}
     * @memberof BCConnectorIWan
     */
    constructor(option) {
        super(option);
        // dummy
        // let option = {
        //     url: "apitest.wanchain.org",
        //     port: 8443,
        //     flag: "ws",
        //     version: "v3"
        // };
        this.apiClient = new iWanClient(option.apiKey, option.secretKey, option.option);
    }

    async getBalance(chain, addr) {
        let ret = await this.apiClient.getBalance(chain, addr);
        return ret;
    }

    async getMultiBalance(chain, addrArray) {
        let ret = await this.apiClient.getMultiBalances(chain, addrArray);
        return ret;
    }

    async getGasPrice(chain) {
        let ret = await this.apiClient.getGasPrice(chain);
        return ret;
    }

    async getBlockNumber(chain) {
        let ret = await this.apiClient.getBlockNumber(chain);
        return ret;
    }

    async getBlockByNumber(chain, blockNo) {
        let ret = await this.apiClient.getBlockByNumber(chain, blockNo);
        return ret;
    }

    async getScEvent(chainType, address, topics, option) {
        let ret = await this.apiClient.getScEvent(chainType, address, topics, option);
        return ret;
    }

    async callScFunc(chainType, scAddr, name, args, abi) {
        let ret = await this.apiClient.callScFunc(chainType, scAddr, name, args, abi);
        return ret;
    }

    async getNonce(chain, addr) {
        let ret = await this.apiClient.getNonce(chain, addr);
        return ret;
    }

    async getNonceIncludePending(chain, addr) {
        let ret = await this.apiClient.getNonceIncludePending(chain, addr);
        return ret;
    }

    async estimateGas(chain, txObject) {
        let ret = await this.apiClient.estimateGas(chain, txObject);
        return ret;
    }

    async sendRawTransaction(chain, signedTx) {
        let ret = await this.apiClient.sendRawTransaction(chain, signedTx);
        return ret;
    }

    async getTransactionReceipt(chain,txHash){
        let ret = await this.apiClient.getTransactionReceipt(chain,txHash);
        return ret;
    }

    async getTxInfo(chain, txHash) {
        let ret = await this.apiClient.getTxInfo(chain, txHash);
        return ret;
    }

    async callScFunc(chainType, scAddr, name, args, abi){
        let ret = await this.apiClient.callScFunc(chainType, scAddr, name, args, abi);
        return ret;
    }
};

module.exports = IWanBCConnector;
