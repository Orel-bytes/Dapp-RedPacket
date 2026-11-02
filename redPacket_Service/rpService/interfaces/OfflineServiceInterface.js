class OfflineServiceInterface{

    constructor(accountService){
        if (new.target === OfflineServiceInterface) {
            throw new TypeError("Cannot construct Abstract class directly");
        }
        this.accountService = accountService;
        // throw new TypeError("Cannot construct Abstract class directly");
    }

    async signTx(tx,accountId){
        throw new Error("Abstract method!");
    }


}

module.exports = OfflineServiceInterface;