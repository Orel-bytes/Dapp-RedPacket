class OnlineServiceInterface {

    constructor(connector) {
        if (new.target === OnlineServiceInterface) {
            throw new TypeError("Cannot construct Abstract class directly");
        }
        this.connector = connector;
    }

    getConnector() {
        return this.connector;
    }

    async getBalance(addr) {
        
    }

    async getMultiBalance(addrArray) {
        
    }

    async getGasPrice() {

    }

    async getNonce(addr) {

    }

    async sendRawTransaction(signedTx) {

    }

    async estimateGas(txObject) {
    }

    async getTransactionReceipt(txHash){
    }
};

module.exports = OnlineServiceInterface;
