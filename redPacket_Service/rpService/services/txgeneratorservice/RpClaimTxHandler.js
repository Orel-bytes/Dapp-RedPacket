const serviceFramework = require("../../framework/ServiceFramework");

class RpClaimTxHandler{
    constructor() {

        this.web3UtilSrv = serviceFramework.getService("UtilServiceInterface", "Web3UtilService");
    }

    buildTxData(scInst, method, args){
        if ("ClaimRP" != method) {
            return null;
        }

        // let rpCode = this.web3UtilSrv.convertAsciiToHex(args.rpCode);
        let rpClaimer = args.rpClaimer;
        let referenceCode = args.rpRefCode;
        rpClaimer = rpClaimer.toLowerCase();
        referenceCode = referenceCode.toLowerCase();

        return scInst.methods.ClaimRP(args.rpCode, rpClaimer, referenceCode).encodeABI();// 1.2.7
    }

}

module.exports = RpClaimTxHandler;
