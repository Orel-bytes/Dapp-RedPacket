class TxGeneratorServiceInterface{
    constructor(scConfig)
    {
        if (new.target === TxGeneratorServiceInterface) {
            throw new TypeError("Cannot construct Abstract class directly");
        }
        this.scConfig = scConfig;
        this.scMap = new Map();  //mapping scInst => scAbi
    }

    async init(){
        // to upload scInst & scAbi 

    }

    async generatorTxData(smartContract,method,args){
        throw new Error("Abstract method!");
    }

}

module.exports = TxGeneratorServiceInterface;