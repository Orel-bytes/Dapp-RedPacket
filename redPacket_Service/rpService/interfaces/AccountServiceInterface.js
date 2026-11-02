class AccountServiceInterface {
    constructor(){
        if (new.target === AccountServiceInterface) {
            throw new TypeError("Cannot construct Abstract class directly");
        }
    }

    /**
     * initialize the wallet
     *
     * @param {*} option
     * @memberof AccountServiceInterface
     */
    async init(){
        throw new Error("Abstract method!");
    }

    /**
     * get the private key of the specified account
     *
     * @param {*} rpscIns
     * @param {*} accountId
     * @memberof AccountServiceInterface
     */
    async getAccountPrivateKey(rpscIns, accountId){
        throw new Error("Abstract method!");
    }

}

module.exports = AccountServiceInterface;