class ValidateServiceInterface {
    constructor(){
        if (new.target === ValidateServiceInterface) {
            throw new TypeError("Cannot construct Abstract class directly");
        }
    }

    /**
     *
     * @param {*} option
     * @memberof ValidateServiceInterface
     */
    async init(){
        throw new Error("Abstract method!");
    }

    /**
     *
     * @memberof ValidateServiceInterface
     */
    getBizRecord(bizType, bizIndex){
        throw new Error("Abstract method!");
    }

    /**
     *
     * @memberof ValidateServiceInterface
     */
    async checkBizValidity(bizType, bizIndex){
        throw new Error("Abstract method!");
    }


}

module.exports = ValidateServiceInterface;