const serviceFramework = require("../../framework/ServiceFramework");
const hash = require('object-hash');

const RPCLAIM_STATUS_INVALIDRPCODE = 10;
const RPCLAIM_STATUS_TXCOMMITTED = 2;
const RPCLAIM_STATUS_REQCHECKING = 1;
const RPCLAIM_STATUS_INITIAL = 0;

class RpClaimHistoryHandler{


    async init(){
        // to scan rp db records and to get the timeout rp
        this.storageSrvIns = serviceFramework.getService("StorageServiceInterface", "StorageService");
        this.configService = serviceFramework.getService("ConfigServiceInterface", "ConfigServiceJson");
        this.logUtilSrv = serviceFramework.getService("UtilServiceInterface", "Log4UtilService");  
        
        this.rpCreateDbInst = await this.storageSrvIns.getDBIns("RedPacketCreateLogger");
        this.rpRefDbInst = await this.storageSrvIns.getDBIns("RedPacketReferenceBonusLogger");
        this.rpClaimEvtDbInst = await this.storageSrvIns.getDBIns("RedPacketClaimLogger");
        this.rpClaimReqDbInst = await this.storageSrvIns.getDBIns("rp_claim_table");
        this.inValidRpClaimDbInst = await this.storageSrvIns.getDBIns("InvalidRpClaim_table");

        this.maxCheckingTime = 5*60*1000; // unit is ms
    }

    // handle rp query request
    async getClaimedRPRecords(rpReqOptions){
        console.log("\n\n .....getClaimedRPRecords: ");
        this.logUtilSrv.logInfo("RpClaimHistoryHandler", "...getClaimedRPRecords...", rpReqOptions); 
        let queryRslt = new Array();

        // to construct the reference rp filter
        if(null != rpReqOptions.reqSender){
            let lowCaseReqSender = new Array();
            for(let i=0; i<rpReqOptions.reqSender.length; i++){
                let reqAddr = rpReqOptions.reqSender[i].toLowerCase();
                lowCaseReqSender.push(reqAddr);
            }

            let claimFilter = {"rpClaimer":{"$in":lowCaseReqSender}}
            // to get the claimed list for this rp
            let claimRps = await this.getClaimRps(claimFilter);
            if(null != claimRps){
                queryRslt = queryRslt.concat(claimRps);
            }

            // to get the referred info for this rp
            let refFilter = {"rpRefCode":{"$in":lowCaseReqSender}}
            let refRps = await this.getRefRps(refFilter);
            if(null != refRps){
                queryRslt = queryRslt.concat(refRps);
            }

            /*
            // to get the invalid rp claim request
                let invalidFilter = {"rpClaimer":{"$in":lowCaseReqSender}}
                let invalidClaimRps = await this.getInvalidClaimRps(invalidFilter);
                if(null != invalidClaimRps){
                    queryRslt = queryRslt.concat(invalidClaimRps);
                }
            */

            if(null != queryRslt){
                queryRslt.sort(this.rpInfoSortBy("rpClaimedTs"));
            }
        }

        this.logUtilSrv.logInfo("RpClaimHistoryHandler", "...queryRslt...", queryRslt); 
        return queryRslt;
    }

    async getClaimRps(filter){
        console.log("\n ......getClaimRps:");
        this.logUtilSrv.logInfo("RpClaimHistoryHandler", "...getClaimRps...", filter); 
        let rpClaimReqInfo = null;

        let claimReqs = await this.rpClaimReqDbInst.findByOption(filter, {}, 0);
        if(claimReqs.length > 0){
            let mapClaimIndexEvt = new Map();
            let rpClaimEvts = await this.rpClaimEvtDbInst.findByOption(filter, {}, 0);
            for(let i=0; i<rpClaimEvts.length; i++){
                let rpClaimEvt = rpClaimEvts[i];
                mapClaimIndexEvt.set(rpClaimEvt["rpClaimIndex"], rpClaimEvt);
            }

            rpClaimReqInfo = new Array();
            for(let j=0; j<claimReqs.length; j++){
                // modify for temp testwork ...begin
                let rpFilter = {
                    "rpCode": claimReqs[j].rpCode, 
                    "rpStartTime": claimReqs[j].rpStartTime
                }

                let rpMode = 0;
                let rpTokenAddr = "";
                let rpSender = "";
                let ret = await this.rpCreateDbInst.findByOption(rpFilter, {}, 1);
                if(ret.length > 0){
                    rpTokenAddr = ret[0].rpTokenType.toLowerCase();
                    rpMode =  ret[0].rpMode;
                    rpSender = ret[0].rpSender;
                }
                // modify for temp testwork ...end
                let keyData = {
                            "rpCode": claimReqs[j].rpCode,
                            "rpStartTime": claimReqs[j].rpStartTime,
                            "rpReferred": true,
                            "rpReceiver": claimReqs[j].rpClaimer.toLowerCase(),
                            "rpClaimer": claimReqs[j].rpClaimer.toLowerCase(),
                }
                let keyHash = hash(keyData);

                let reqData = {
                    "claimId": keyHash,
                    "rpCode": claimReqs[j].rpCode,
                    "rpStartTime": claimReqs[j].rpStartTime,
                    "rpSender": rpSender,
                    "rpReceiver": claimReqs[j].rpClaimer.toLowerCase(),
                    "rpStatus": claimReqs[j].rpStatus,
                    "rpBonus": null,
                    "rpReferred" : false,
                    "rpClaimer": claimReqs[j].rpClaimer.toLowerCase(),
                    "rpClaimedTs": parseInt(claimReqs[j].rpReceiveTs/1000),
                    "rpPrimeValCode" : claimReqs[j].rpPrimeValCode,
                    "rpMode" : rpMode,
                    "rpTokenAddr" : rpTokenAddr
                };

                let keyObj = {
                    "rpCode": claimReqs[j].rpCode,
                    "rpTime": claimReqs[j].rpStartTime,
                    "rpClaimer": claimReqs[j].rpClaimer.toLowerCase()
                };
                let hashKeyObj = hash(keyObj); 

                let rpClaimEvt = mapClaimIndexEvt.get(hashKeyObj); 
                if(null != rpClaimEvt){       
                    reqData.rpStatus = "Finished";
                    reqData.rpBonus = rpClaimEvt.rpBonus;
                    // reqData.rpRefCode = rpClaimEvt[0].rpRefCode;
                    reqData.rpClaimedTs = rpClaimEvt.rpClaimedTime;
                }else{
                    if(RPCLAIM_STATUS_INVALIDRPCODE == claimReqs[j].rpStatus){
                        reqData.rpStatus = "InvalidRpCode";
                    }else if((RPCLAIM_STATUS_INITIAL == claimReqs[j].rpStatus) 
                        || (RPCLAIM_STATUS_REQCHECKING == claimReqs[j].rpStatus)){
                        reqData.rpStatus = "Checking";
                    }else if(RPCLAIM_STATUS_TXCOMMITTED == claimReqs[j].rpStatus){
                        reqData.rpStatus = "Committed";
                    }else{
                        let curTs = new Date().getTime();
                        if(this.maxCheckingTime < (curTs - claimReqs[j].rpReceiveTs)){
                            reqData.rpStatus = "Failed";
                        }
                    }
                }

                rpClaimReqInfo.push(reqData);
            }
        }

        return rpClaimReqInfo;
    }

    async getRefRps(filter){
        console.log("\n ......getRefRps:");
        this.logUtilSrv.logInfo("RpClaimHistoryHandler", "...getRefRps...", filter);
        let rpRefInfo = null;

        let refRecords = await this.rpRefDbInst.findByOption(filter, {}, 0);
        if(refRecords.length > 0){
            rpRefInfo = new Array();
            for(let j=0; j<refRecords.length; j++){
                // modify for temp testwork ...begin
                let rpFilter = {
                    "rpCode": refRecords[j].rpCode, 
                    "rpStartTime": refRecords[j].rpStartTime
                }

                let rpMode = 0;
                let rpTokenAddr = "";
                let rpPrimeValCode = "";
                let rpSender = "";
                let ret = await this.rpCreateDbInst.findByOption(rpFilter, {}, 1);
                if(ret.length > 0){
                    rpTokenAddr = ret[0].rpTokenType.toLowerCase();
                    rpMode =  ret[0].rpMode;
                    rpPrimeValCode = ret[0].rpPrimeValCode;
                    rpSender = ret[0].rpSender;
                }
                // modify for temp testwork ...end
                let keyData = {
                            "rpCode": refRecords[j].rpCode,
                            "rpStartTime": refRecords[j].rpStartTime,
                            "rpReferred": true,
                            "rpReceiver": refRecords[j].rpRefCode.toLowerCase(),
                            "rpClaimer": refRecords[j].rpClaimer.toLowerCase()
                }
                let keyHash = hash(keyData);

                let refInfo = {
                    "claimId": keyHash,
                    "rpCode": refRecords[j].rpCode,
                    "rpStartTime": refRecords[j].rpStartTime,
                    "rpSender": rpSender,
                    "rpReceiver": refRecords[j].rpRefCode.toLowerCase(),
                    "rpStatus": "Finished",
                    "rpBonus": refRecords[j].rpRefBonus,
                    "rpReferred": true,
                    "rpClaimer": refRecords[j].rpClaimer.toLowerCase(),
                    "rpClaimedTs": refRecords[j].rpReferredTime,
                    "rpPrimeValCode" : rpPrimeValCode,
                    "rpMode" : rpMode,
                    "rpTokenAddr" : rpTokenAddr
                }
                rpRefInfo.push(refInfo);
            }
        }

        console.log(rpRefInfo);        
        return rpRefInfo;
    }

    async getInvalidClaimRps(filter){
        console.log("\n ......getInvalidClaimRps:");
        this.logUtilSrv.logInfo("RpClaimHistoryHandler", "...getInvalidClaimRps...", filter);
        let invalidReqInfo = null;

        let reqRecords = await this.inValidRpClaimDbInst.findByOption(filter, {}, 0);
        if(reqRecords.length > 0){
            invalidReqInfo = new Array();
            for(let j=0; j<reqRecords.length; j++){
                let refInfo = {
                    "rpCode": reqRecords[j].rpCode,
                    "rpStartTime": reqRecords[j].rpStartTime,
                    "rpReceiver": reqRecords[j].rpClaimer.toLowerCase(),
                    "rpStatus": reqRecords[j].rpStatus,
                    "rpBonus": null,
                    "rpReferred": null,
                    "rpClaimer": null,
                    "rpClaimedTs": parseInt(reqRecords[j].rpReceiveTs/1000),
                    "rpPrimeValCode" : reqRecords[j].rpPrimeValCode,
                    "rpMode" : null,
                    "rpTokenAddr" : null
                }
                invalidReqInfo.push(refInfo);
            }
        }

        console.log(invalidReqInfo);        
        return invalidReqInfo;
    }

    rpInfoSortBy(props) {
        return function(a,b) {
            return a[props] - b[props];
        }
    }
    
}

module.exports = RpClaimHistoryHandler;
