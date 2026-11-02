const serviceFramework = require("../../framework/ServiceFramework");


class RpFinishTxHandler{
    constructor() {

      this.web3UtilSrv = serviceFramework.getService("UtilServiceInterface", "Web3UtilService");
    }

    buildTxData(scInst, method, args){

      if("FinishRP" != method){
        return null;
      }

      // let rpCode = this.web3UtilSrv.convertAsciiToHex(args.rpCode); 

      return scInst.methods.FinishRP(args.rpCode).encodeABI();
    }

}

module.exports = RpFinishTxHandler;
