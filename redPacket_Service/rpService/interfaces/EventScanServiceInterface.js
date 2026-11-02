class EventScanServiceInterface {
    constructor(){
        if (new.target === EventScanServiceInterface) {
            throw new TypeError("Cannot construct Abstract class directly");
        }
    }

    /**
     * initialize the wallet
     *
     * @param {*} option
     * @memberof EventScanServiceInterface
     */
    async init(){
        throw new Error("Abstract method!");
    }

    /**
     * get the private key of the specified account
     *
     * @param {*} scIns
     * @param {*} evtTopics
     * @memberof EventScanServiceInterface
     */
    registerScEvent(scIns, evtTopics){
        throw new Error("Abstract method!");
    }


    /**
     * get the private key of the specified account
     *
     * @memberof EventScanServiceInterface
     */
    async startUp(){
        throw new Error("Abstract method!");
    }

}

module.exports = EventScanServiceInterface;