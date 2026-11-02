class OnlineServiceEth {

    constructor(connector) {
        this.connector = connector;
        this.chain = 'ETH';
    }

    getConnector() {
        return this.connector;
    }

    async getBalance(addr) {
        return await this.connector.getBalance(this.chain, addr);
    }

    async getMultiBalance(addrArray) {
        return await this.connector.getMultiBalance(this.chain, addrArray);
    }

    async getGasPrice() {
        return await this.connector.getGasPrice(this.chain);
    }

    async getNonce(addr) {
        return await this.connector.getNonce(this.chain, addr);
    }

    async sendRawTransaction(signedTx) {
        return await this.connector.sendRawTransaction(this.chain, signedTx);
    }

    async estimateGas(txObject) {
        return await this.connector.estimateGas(this.chain, txObject);
    }

    async getTransactionReceipt(txHash) {
        try {
            return await this.connector.getTransactionReceipt(this.chain, txHash);
        } catch (e) {
            if(e === 'no receipt was found') return;
            else throw e;
        }

    }
};

module.exports = OnlineServiceEth;
