const serviceFramework = require("../../framework/ServiceFramework");

class RpClaimRequestHandler{

    async init(){
        // to scan rp db records and to get the timeout rp
        this.rpValidateServiceWan = serviceFramework.getService("ValidateServiceInterface", "RpValidateServiceWan");
        this.storageSrvIns = serviceFramework.getService("StorageServiceInterface", "StorageService");
        this.logUtilSrv = serviceFramework.getService("UtilServiceInterface", "Log4UtilService"); 
        this.web3UtilSrv = serviceFramework.getService("UtilServiceInterface", "Web3UtilService"); 
        
        this.rpRequestDbInst = await this.storageSrvIns.getDBIns("rp_claim_table");
        this.inValidRpClaimDbInst = await this.storageSrvIns.getDBIns("InvalidRpClaim_table");
    }
    
    // just insert new rp request into db
    async claimRP(rpReqOption){
        let globalConstant = serviceFramework.getService("GlobalConstantService", "GlobalConstant");
        // to check if request is already existed
        console.log("\n\n .....claimRP: ");
        console.log(rpReqOption);
        let that = this;
        let reqRslt = {
            reqId: null,
            reqDetails: null
        }

        let rpEncodedCode = this.web3UtilSrv.convertAsciiToHex(rpReqOption.rpCode);
        let rpInfo = that.rpValidateServiceWan.getBizRecord("RpCodeRecords", rpEncodedCode);
        if(null == rpInfo){
            reqRslt.reqDetails = globalConstant.STATE_NO_EXIST; //"Invalid RpCode, please check and try again!";
            return reqRslt;
        }

        let filter = {};
        filter.rpWalletId = rpReqOption.walletID;
        filter.rpCode = rpEncodedCode;
        filter.rpStartTime = rpInfo.rpStartTime;

        let result = await that.rpRequestDbInst.findByOption(filter, {}, 0);
        if(result.length > 0){
            console.log("\n\n already commit the rp claim request, please check:");
            this.logUtilSrv.logInfo("claimRP", "...repeated rp claim record...", result);  
            console.log(result);

            reqRslt.reqId = result[0]._id;
            reqRslt.reqDetails = globalConstant.STATE_RP_REPEAT_CLAIM; //"Repeated rp claim!";
            return reqRslt;
        }

        let rpClaimDoc = {
            rpWalletId: rpReqOption.walletID,
            rpClaimer: rpReqOption.rpClaimer.toLowerCase(),
            rpCode: rpEncodedCode,
            rpPrimeValCode: rpReqOption.rpCode,
            rpStartTime: rpInfo.rpStartTime,
            rpRefCode: rpReqOption.rpRefCode.toLowerCase(),
            rpStatus: 0,
            rpReceiveTs: new Date().getTime(),
            rpSendTs: null,
            rpTxNonce: null,
            rpTxHash: null,
            rpGasPrice: null,
            rpCheckTs: null,
            rpSuccess: null
        }

        let ret = await that.rpRequestDbInst.insert(rpClaimDoc); 
        console.log("\n\n new commit the rp claim request:");
        console.log(ret);
        
        reqRslt.reqId = ret._id;
        reqRslt.reqDetails = null; //"Rp claim successfully!"; 
        this.logUtilSrv.logInfo("claimRP", "...valid rp claim record...", ret);
        
        return reqRslt;
    }

    async handleInvalidRpClaim(rpReqOption, rpStatus){
        console.log("\n\n .....invalidRpClaimHandler: ");
        console.log(rpReqOption);
        let that = this;

        let rpEncodedCode = this.web3UtilSrv.convertAsciiToHex(rpReqOption.rpCode);

        let filter = {};
        filter.rpWalletId = rpReqOption.walletID;
        filter.rpCode = rpEncodedCode;
        filter.rpStartTime = 0;

        let rpInfo = that.rpValidateServiceWan.getBizRecord("RpCodeRecords", rpEncodedCode);
        if(null != rpInfo){
            filter.rpStartTime = rpInfo.rpStartTime;
        }

        let result = await that.inValidRpClaimDbInst.findByOption(filter, {}, 0);
        if(result.length > 0){
            console.log("\n\n [inValidRpClaimDbInst]: repeated invalid rp claim, please check:");
            return result[0]._id;
        }

        let invalidRpClaimDoc = {
            rpWalletId: rpReqOption.walletID,
            rpClaimer: rpReqOption.rpClaimer.toLowerCase(),
            rpCode: rpEncodedCode,// rpCode after encode
            rpPrimeValCode: rpReqOption.rpCode,// rpCode before encode
            rpStartTime: filter.rpStartTime,
            rpPrimeValCode: rpReqOption.rpCode,
            rpRefCode: rpReqOption.rpRefCode.toLowerCase(),
            rpStatus: rpStatus,
            rpReceiveTs: new Date().getTime()
        }

        let ret = await that.inValidRpClaimDbInst.insert(invalidRpClaimDoc);  
        console.log("\n\n [invalidRpClaimHandler]:  add new invalid rp claim record:");
        console.log(ret);
        this.logUtilSrv.logInfo("handleInvalidRpClaim", "...invalid rp claim record...", ret);  
    }
    
}

module.exports = RpClaimRequestHandler;
