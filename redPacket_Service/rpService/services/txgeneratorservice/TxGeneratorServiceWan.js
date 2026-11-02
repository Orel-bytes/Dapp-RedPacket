
const serviceFramework = require("../../framework/ServiceFramework");
const TxGeneratorServiceInterface = require('../../interfaces/TxGeneratorServiceInterface');
const RpClaimReqHandler = require("./RpClaimTxHandler");
const RpFinishReqHandler = require("./RpFinishTxHandler");

const path = require("path");
const Web3 = require("web3");
const web3 = new Web3();

class TxGeneratorServiceWan extends TxGeneratorServiceInterface{
    constructor(scConfig){
        super(scConfig);

        this.scMap = new Map();

        this.rpClaimReqHandler = new RpClaimReqHandler();
        this.rpFinishReqHandler = new RpFinishReqHandler();

        this.mapRpRequestTxHandler = new Map();
        this.mapRpRequestTxHandler.set("ClaimRP", this.rpClaimReqHandler);
        this.mapRpRequestTxHandler.set("FinishRP", this.rpFinishReqHandler);
    }

    async init(){
        this.configService = serviceFramework.getService("ConfigServiceInterface", "ConfigServiceJson");
        this.scConfig = await this.configService.getConfig("TxGeneratorServiceInterface", "TxGeneratorServiceWan", "scAddrMapAbi");

        for(let i=0; i<this.scConfig.length; i++){
            let scCfg = this.scConfig[i];
            
            let abiFile = path.join(__dirname,'../../../config/abi',scCfg.scAbiFile);
            let scAbi = require(abiFile);
            
            let scInst = new web3.eth.Contract(scAbi, scCfg.scAddress);// 1.2.6
            this.scMap.set(scCfg.scAddress, scInst);
        }
    }

    async generatorTxData(scAddr, method, args) {
        try {
            let scInst = this.scMap.get(scAddr);
            let txData = this.mapRpRequestTxHandler.get(method).buildTxData(scInst, method, args);

            return txData; //
        } catch (err) {
            console.log("err:", err);
        }
    }
    
}
module.exports = TxGeneratorServiceWan;