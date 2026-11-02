const EndPointServiceInterface = require("../../interfaces/EndPointServiceInterface");
const serviceFramework = require("../../framework/ServiceFramework");
const RpClaimHistoryHandler = require("./RpClaimHistoryHandler");
const RpCreateHistoryHandler = require("./RpCreateHistoryHandler");
const RpClaimRequestHandler = require("./RpClaimRequestHandler");
const path = require("path");

class RpRouterService extends EndPointServiceInterface {
    
    /**
     *Creates an instance of RpRouterService.
     * @memberof RpRouterService
     */
    constructor() {
        super();
    }

    async init(){
        // to scan rp db records and to get the timeout rp
        this.web3UtilSrv = serviceFramework.getService("UtilServiceInterface", "Web3UtilService");
        this.logUtilSrv = serviceFramework.getService("UtilServiceInterface", "Log4UtilService");    
        this.connector = serviceFramework.getService("BCConnectorInterface", "IWanBCConnector");     
        this.storageSrvIns = serviceFramework.getService("StorageServiceInterface", "StorageService");
        this.configService = serviceFramework.getService("ConfigServiceInterface", "ConfigServiceJson");
        this.rpValidateServiceWan = serviceFramework.getService("ValidateServiceInterface", "RpValidateServiceWan");
        this.globalConstant = serviceFramework.getService("GlobalConstantService", "GlobalConstant");

        this.scAbiMap = new Map();
        this.scConfig = await this.configService.getConfig("TxGeneratorServiceInterface", "TxGeneratorServiceWan", "scAddrMapAbi");
        for(let i=0; i<this.scConfig.length; i++){
            let scCfg = this.scConfig[i];
            
            let abiFile = path.join(__dirname,'../../../config/abi',scCfg.scAbiFile);
            let scAbi = require(abiFile);

            this.scAbiMap.set(scCfg.scAddress, scAbi);
        }

        this.rpscInstAddr = await this.configService.getGlobalConfig("rpscInstAddr"); 

        let rpRequestSchema = await this.configService.getGlobalConfig("rp_tx_table_schema");
        // this.rpRequestDbInst = await this.storageSrvIns.initDB(rpRequestSchema);
        this.rpRequestDbInst = await this.storageSrvIns.getDBIns(rpRequestSchema.name);

        let inValidRpClaimSchema = await this.configService.getGlobalConfig("invalidRpClaim_schema");
        this.inValidRpClaimDbInst = await this.storageSrvIns.initDB(inValidRpClaimSchema);

        this.wrcTokenDbInst = await this.storageSrvIns.getDBIns("RpMaxBonusConfigLogger");
        this.rpGasFeeDbInst = await this.storageSrvIns.getDBIns("RpGasFeeLogger");
        this.rpRecordDbInst = await this.storageSrvIns.getDBIns("RedPacketCreateLogger");

        this.rpClaimHistoryHandler = new RpClaimHistoryHandler();
        await this.rpClaimHistoryHandler.init();
        this.rpCreateHistoryHandler = new RpCreateHistoryHandler();
        await this.rpCreateHistoryHandler.init();
        this.rpClaimRequestHandler = new RpClaimRequestHandler();
        await this.rpClaimRequestHandler.init();
    }

    async handlerRequest(router, postData){
        let that = this;        
        console.log("\n\n router:" + router); 
        this.logUtilSrv.logInfo("RpRouterService", "...router...", router);
        this.logUtilSrv.logInfo("RpRouterService", "...postData...", postData);
        
        if('/getRPInfo' == router){
            console.log("\n rpQueryResult:");
            let rpQueryResult = await that.handleGetRP(postData);

            this.logUtilSrv.logInfo("RpRouterService", "...rpQueryResult...", rpQueryResult);
            console.log(rpQueryResult);
            return rpQueryResult;

        }else if('/claimRP' == router){
            console.log("\n claimRP:");
            let rpClaimRslt = await that.handleClaimRP(postData);

            this.logUtilSrv.logInfo("RpRouterService", "...Rp Claim Detail...", rpClaimRslt);
            return rpClaimRslt;

        }else if('/getRPRegToken' == router){
            console.log("\n getRPRegToken:");
            let rpRegTokenInfo = await that.handleGetRegToken(postData);
            let tokenList = new Array();

            for(let i=0; i<rpRegTokenInfo.length; i++){
                let tokenInfo = {
                    wrcAddr: rpRegTokenInfo[i].tokenAddress,
                    wrcRpMaxBonus: rpRegTokenInfo[i].tokenRpMaxBonus
                }

                tokenList.push(tokenInfo);
            }

            this.logUtilSrv.logInfo("RpRouterService", "...tokenList...", tokenList);
            console.log(tokenList);
            return tokenList;

        }else if('/getRPGasFee' == router){
            console.log("\n getRPGasFee:");
            let rpGasFee = await that.handleGetRPGasFee(postData);            

            this.logUtilSrv.logInfo("RpRouterService", "...RP Gas Fee...", rpGasFee);
            console.log(rpGasFee);
            return rpGasFee[0].rpGasFee;

        }else if('/getRPSCBasicInfo' == router){
            console.log("\n getRPSCBasicInfo:");
            let rpscBasicInfo = {};
            rpscBasicInfo.rpscAddr = this.rpscInstAddr;
            rpscBasicInfo.tokenList = new Array();
            rpscBasicInfo.rpGasFee = 0;

            // to get registed token info
            let rpRegTokenInfo = await that.handleGetRegToken(postData);
            for(let i=0; i<rpRegTokenInfo.length; i++){
                let tokenInfo = {
                    "wrcAddr": rpRegTokenInfo[i].tokenAddress,
                    "wrcRpMaxBonus": rpRegTokenInfo[i].tokenRpMaxBonus
                }

                rpscBasicInfo.tokenList.push(tokenInfo);
            }

            // to get the rp gas fee
            let rpGasFee = await that.handleGetRPGasFee(postData); 
            rpscBasicInfo.rpGasFee = rpGasFee[0].rpGasFee
            console.log("\n rpscBasicInfo:");
            console.log(rpscBasicInfo);
            this.logUtilSrv.logInfo("RpRouterService", "...rpscBasicInfo...", rpscBasicInfo);
            return rpscBasicInfo;
        }else if('/getAllowance' == router){
            console.log("\n getAllowance:");
            let allowanceRslt = await that.handleGetAllowance(postData);            

            this.logUtilSrv.logInfo("RpRouterService", "...GetAllowance...", allowanceRslt);
            console.log(allowanceRslt);
            return allowanceRslt;

        }else{
            this.logUtilSrv.logError("RpRouterService", "...Invalid Request!...", router);
            return "Invalid Request!";
        }
    }

    // parse rp request from wallet 
    async handleGetRP(postData){
        console.log('\n\n ......handleGetRP......');
        let that = this;
        let rpReqOption = JSON.parse(postData);
        console.log(rpReqOption);

        let ret = null;
        if("CreatedRpHistoryQuery" == rpReqOption.queryType){
            ret = that.rpCreateHistoryHandler.getCreatedRPRecords(rpReqOption);
        }else if("CreatedRpDetailQuery" == rpReqOption.queryType){
            ret = that.rpCreateHistoryHandler.getCreatedRPRecords(rpReqOption);
        }else if("ClaimedRpHistoryQuery" == rpReqOption.queryType){
            ret = that.rpClaimHistoryHandler.getClaimedRPRecords(rpReqOption);
        }else{
            console.log("\n Invalid query index!!");
        }

        return ret;
    }

    async handleClaimRP(postData){
        let that = this;
        console.log('\n\n ......handleClaimRP......begin');
        let options = JSON.parse(postData);
        console.log(options.rpCode);

        let claimRslt = {};
        claimRslt.rpClaimId = null;
        claimRslt.result = null;
        claimRslt.error = null; 

        if(null == options.rpRefCode){
            options.rpRefCode = "0x0000000000000000000000000000000000000000";
            let isEmptyAddr = this.web3UtilSrv.isValidAddress(options.rpRefCode);
            console.log(isEmptyAddr);
        }

        let lowCase_Claimer = options.rpClaimer.toLowerCase();
        let lowCase_RefCode = options.rpRefCode.toLowerCase();
        if(lowCase_Claimer == lowCase_RefCode){
            claimRslt.result = false;
            claimRslt.error =  this.globalConstant.STATE_RP_CLAIMADDR_IS_REFCODE; //"ClaimAddr should not to be the same as RefCode";
            this.logUtilSrv.logError("RpRouterService", "...handleClaimRP...", claimRslt);
            
            return claimRslt;
        }

        if(this.web3UtilSrv.isValidAddress(lowCase_Claimer) && this.web3UtilSrv.isValidAddress(lowCase_RefCode)){
            console.log("\n .........handleClaimRP: checkBizValidity:");            
            let rpEncodedCode = this.web3UtilSrv.convertAsciiToHex(options.rpCode);
              
            // claimRslt.result = await that.rpValidateServiceWan.checkBizValidity("RpCodeRecords", rpEncodedCode);
            claimRslt.result = await that.rpValidateServiceWan.checkRpClaimValidity(rpEncodedCode, options.walletID);
            if (claimRslt.result === this.globalConstant.STATE_CHECK_VALID){

                let ret = await that.rpClaimRequestHandler.claimRP(options);
                claimRslt.rpClaimId = ret.reqId;
                claimRslt.error = ret.reqDetails;
                
                // to keep the rp primeval code
                let filter = {
                    "rpCode": rpEncodedCode,
                    "rpPrimeValCode": ""
                };                
                let updateOption = { $set: { "rpPrimeValCode": options.rpCode} }
                await this.rpRecordDbInst.updateByOption(filter, updateOption);

            }else{
                //claimRslt.error = 3; //"Invalid RpCode, Please check again!";
                claimRslt.error = claimRslt.result;
                await that.rpClaimRequestHandler.handleInvalidRpClaim(options, "InvaidRpCode");
                this.logUtilSrv.logError("RpRouterService", "...checkBizValidity failed...", claimRslt);
            }
            console.log(claimRslt);
        }else{
            claimRslt.result = false;
            claimRslt.error =  this.globalConstant.STATE_RP_INVALID_ACCOUNT; //"Invalid Account Address, Please check again!";
            await that.rpClaimRequestHandler.handleInvalidRpClaim(options, "InvalidAccountAddress");
            this.logUtilSrv.logError("RpRouterService", "...check AddressValidity failed...", claimRslt);
        }

        console.log('\n ......handleClaimRP......end'); 
        return claimRslt;
    }

    async handleGetRegToken(postData){
        let that = this;
        console.log('\n\n ......handleGetRegToken......');
        // let options = JSON.parse(postData);
        
        let result = await that.wrcTokenDbInst.findByOption({}, {}, 0);
        console.log(result);
        return result;
    }

    async handleGetRPGasFee(postData){
        let that = this;
        console.log('\n\n ......handleGetRPGasFee......');
        // let options = JSON.parse(postData);
        
        let result = await that.rpGasFeeDbInst.findByOption({}, {}, 0);
        console.log(result);
        return result;
    }

    async handleGetAllowance(postData){
        console.log('\n\n ......handleGetAllowance......begin');
        let approveRslt = {
            "error": null,
            "data": false
        }
        let that = this;

        let options = JSON.parse(postData);
        console.log(options);
        if((null == options.account) || (null == options.tokenAddr)){
            that.logUtilSrv.logError("RpRouterService", "...handleGetAllowance...", "Invalid account or tokenAddr");
            that.logUtilSrv.logError("RpRouterService", "...handleGetAllowance...", options.account);
            that.logUtilSrv.logError("RpRouterService", "...handleGetAllowance...", options.tokenAddr);

            approveRslt.error = "Account or tokenAddr is null";
            return approveRslt;
        }
        
        let restValue = 0;
        let ownerAddr = options.account.toLowerCase();
        let tokenAddr = options.tokenAddr.toLowerCase();
        if(that.web3UtilSrv.isValidAddress(ownerAddr) && that.web3UtilSrv.isValidAddress(tokenAddr)){               
            try{
                let scABI = that.scAbiMap.get(tokenAddr);
                restValue = await that.connector.callScFunc('WAN', tokenAddr, "allowance", [ownerAddr, that.rpscInstAddr], scABI);

            }catch(error){
                this.logUtilSrv.logError("RpRouterService", "... callScFunc error...", error);
                console.log(error);

                approveRslt.error = error;
                return approveRslt;
            }
            console.log("\n\n restValue: ", restValue);
        }else{
            that.logUtilSrv.logError("RpRouterService", "...handleGetAllowance...", "Invalid account or tokenAddr");
            that.logUtilSrv.logError("RpRouterService", "...handleGetAllowance...", options.account);
            that.logUtilSrv.logError("RpRouterService", "...handleGetAllowance...", options.tokenAddr);

            approveRslt.error = "Invalid account or tokenAddr";
            return approveRslt;
        }

        if(0 == restValue){
            approveRslt.data = true;
        }else{
            approveRslt.data = false;
        }

        console.log('\n ......handleGetAllowance......end'); 
        return approveRslt;
    }

}

module.exports = RpRouterService;
