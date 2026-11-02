const serviceFramework = require("../../framework/ServiceFramework");

class RpCreateHistoryHandler{


    async init(){
        // to scan rp db records and to get the timeout rp
        this.storageSrvIns = serviceFramework.getService("StorageServiceInterface", "StorageService");
        this.configService = serviceFramework.getService("ConfigServiceInterface", "ConfigServiceJson");
        this.logUtilSrv = serviceFramework.getService("UtilServiceInterface", "Log4UtilService");  

        this.rpCreateDbInst = await this.storageSrvIns.getDBIns("RedPacketCreateLogger");
        this.rpClaimDbInst = await this.storageSrvIns.getDBIns("RedPacketClaimLogger");
        this.rpRefDbInst = await this.storageSrvIns.getDBIns("RedPacketReferenceBonusLogger");
        this.rpRevokedDbInst = await this.storageSrvIns.getDBIns("RedPacketRevokeLogger");

        this.mapWrcToken = new Map(); 
        let wanInfo = {
            decimals: 18,
            symbol: "WAN"
        }
        this.mapWrcToken.set("0x0000000000000000000000000000000000000000", wanInfo);

        this.rpWrcTokenDbInst = await this.storageSrvIns.getDBIns("RegWRCTokenLogger");
        if(null != this.rpWrcTokenDbInst){
            let records = await this.rpWrcTokenDbInst.findByOption({}, {}, 0);
            for(let i=0; i<records.length; i++){
                let tokenAddr = records[0].tokenAddress;
                let tokenInfo = {
                    decimals: records[0].tokenDecimals,
                    symbol: records[0].tokenSymbol
                }
                this.mapWrcToken.set(tokenAddr, tokenInfo);
            }
        }
        
    }

    // handle rp query request
    async getCreatedRPRecords(rpReqOptions){
        console.log("\n\n .....getCreatedRPRecords: ");
        this.logUtilSrv.logInfo("RpCreateHistoryHandler", "...rpReqOptions...", rpReqOptions);
        // let that = this;
        let queryRslt = {};
        let filter = null;

        // to construct the reference rp filter
        if("CreatedRpHistoryQuery" == rpReqOptions.queryType){
            if(null != rpReqOptions.reqSender){
                let lowCaseReqSender = new Array();
                for(let i=0; i<rpReqOptions.reqSender.length; i++){
                    let reqAddr = rpReqOptions.reqSender[i].toLowerCase();
                    lowCaseReqSender.push(reqAddr);
                }

                filter = {
                    "rpSender":{"$in":lowCaseReqSender}
                }
            }else{
                return queryRslt;
            }
            queryRslt = this.buildRpBasicData(filter);

        }else if("CreatedRpDetailQuery" == rpReqOptions.queryType){
            if((null != rpReqOptions.rpCode) && (null != rpReqOptions.rpStartTime)){
                filter = {
                    "rpCode": rpReqOptions.rpCode, 
                    "rpStartTime":rpReqOptions.rpStartTime
                }
            }else{
                return queryRslt;
            }

            queryRslt = {};
            // to get the claimed list for this rp
            let rpClaimObj = await this.buildClaimData(filter);
            queryRslt.rpClaimInfo = rpClaimObj.claimRecords;

            // to get the referred info for this rp
            let rpRefObj = await this.buildRefData(filter);
            queryRslt.rpRefInfo = rpRefObj.refRecords;

            // to get the revoke info for this rp
            queryRslt.rpStatisticInfo = await this.buildRpStatisticData(filter, rpClaimObj, rpRefObj);
        }

        this.logUtilSrv.logInfo("RpCreateHistoryHandler", "...queryRslt...", queryRslt);
        return queryRslt;
    }

    async buildRpBasicData(filter){
        console.log("\n ......buildClaimData:");
        let rpBasicInfo = new Array();

        let ret = await this.rpCreateDbInst.findByOption(filter, {}, 0);
        if(ret.length > 0){ 
            for(let i=0; i<ret.length; i++){
                let rpTokenAddr = ret[i].rpTokenType.toLowerCase();
                let wrcTokenInfo = this.mapWrcToken.get(rpTokenAddr);
                if(null == wrcTokenInfo){
                    let filter = {
                        "tokenAddress" : rpTokenAddr
                    }
                    if(null != this.rpWrcTokenDbInst){
                        let records = await this.rpWrcTokenDbInst.findByOption(filter, {}, 1);
                        if(records.length > 0){
                            wrcTokenInfo = {
                                decimals: records[0].tokenDecimals,
                                symbol: records[0].tokenSymbol
                            }
                            this.mapWrcToken.set(rpTokenAddr, wrcTokenInfo);
                        }
                    }
                }

                let baiscInfo = {
                    "rpCode": ret[i].rpCode,
                    "rpStartTime": ret[i].rpStartTime,
                    "rpSender": ret[i].rpSender.toLowerCase(),
                    "rpBonus": ret[i].rpBonus,
                    "rpRefBonus": ret[i].rpRefBonus,
                    "rpType": ret[i].rpType,
                    "rpMode": ret[i].rpMode,
                    "rpTokenAddr": rpTokenAddr,
                    "rpCounts": ret[i].rpCounts,
                    "rpRestCounts": ret[i].rpRestCounts,
                    "rpTxHash": ret[i].rpTxHash,
                    "rpPrimeValCode": ret[i].rpPrimeValCode,
                    "rpFinished": ret[i].rpFinished,
                    "rpDecimals": wrcTokenInfo.decimals,
                    "rpTokenSymbol": wrcTokenInfo.symbol
                }
                rpBasicInfo.push(baiscInfo);
            }
        }


        this.logUtilSrv.logInfo("RpCreateHistoryHandler", "...buildRpBasicData...", rpBasicInfo);
        return rpBasicInfo;
    }

    async buildClaimData(filter){
        console.log("\n ......buildClaimData:");
        let rpClaimInfo = {};
        rpClaimInfo.claimRecords = new Array();
        rpClaimInfo.claimedCount = 0;
        rpClaimInfo.claimedBonus = parseFloat(0);

        let claimRrdList = await this.rpClaimDbInst.findByOption(filter, {}, 0);
        if(claimRrdList.length > 0){

            for(let j=0; j<claimRrdList.length; j++){
                let claimInfo = {
                    "rpClaimer": claimRrdList[j].rpClaimer.toLowerCase(),
                    "rpBonus": claimRrdList[j].rpBonus,
                    "rpRefCode": claimRrdList[j].rpRefCode.toLowerCase(),
                    "rpClaimedTime": claimRrdList[j].rpClaimedTime
                }
                rpClaimInfo.claimRecords.push(claimInfo);
                rpClaimInfo.claimedBonus = rpClaimInfo.claimedBonus + parseFloat(claimRrdList[j].rpBonus);
                rpClaimInfo.claimedCount = rpClaimInfo.claimedCount + 1;
            }
        }

        this.logUtilSrv.logInfo("RpCreateHistoryHandler", "...buildClaimData...", rpClaimInfo);
        return rpClaimInfo;
    }

    async buildRefData(filter){
        console.log("\n ......buildRefData:");
        let rpRefInfo = {};
        rpRefInfo.refRecords = new Array();
        rpRefInfo.refCount = 0;
        rpRefInfo.refBonus = parseFloat(0);

        let refRecordList = await this.rpRefDbInst.findByOption(filter, {}, 0);
        if(refRecordList.length > 0){
            
            for(let j=0; j<refRecordList.length; j++){
                let refInfo = {
                    "rpRefCode": refRecordList[j].rpRefCode.toLowerCase(),
                    "rpRefBonus": refRecordList[j].rpRefBonus,
                    "rpClaimer": refRecordList[j].rpClaimer.toLowerCase(),
                    "rpReferredTime": refRecordList[j].rpReferredTime
                }
                rpRefInfo.refRecords.push(refInfo);
                rpRefInfo.refBonus = rpRefInfo.refBonus + parseFloat(refRecordList[j].rpRefBonus);
                rpRefInfo.refCount = rpRefInfo.refCount + 1;
            }
        }

        this.logUtilSrv.logInfo("RpCreateHistoryHandler", "...buildRefData...", rpRefInfo);     
        return rpRefInfo;
    }

    async buildRpStatisticData(filter, rpClaimObj, rpRefObj){
        console.log("\n ......buildRpStatisticData:");
        let rpStatisticInfo = {};

        let ret = await this.rpCreateDbInst.findByOption(filter, {}, 1);
        if(ret.length > 0){ 
            rpStatisticInfo = {
                "rpCode": ret[0].rpCode,
                "rpRestBonus": parseFloat(ret[0].rpBonus),
                "rpRestRefBonus": parseFloat(ret[0].rpRefBonus),
                "rpRestCounts": ret[0].rpCounts,
                "rpFinished": ret[0].rpFinished,
                "rpRevokedRpBonus": 0,
                "rpRevokedRefBonus": 0,
                "rpRevokedrpGasFee": 0
            }

            rpStatisticInfo.rpRestCounts = rpStatisticInfo.rpRestCounts - rpClaimObj.claimedCount;
            rpStatisticInfo.rpRestBonus = rpStatisticInfo.rpRestBonus - parseFloat(rpClaimObj.claimedBonus);
            rpStatisticInfo.rpRestRefBonus = rpStatisticInfo.rpRestRefBonus - parseFloat(rpRefObj.refBonus);

            let rpRevokedInfo = await this.buildRevokedData(filter);
            if(null != rpRevokedInfo){
                rpStatisticInfo.rpRevokedRpBonus = parseFloat(rpRevokedInfo.rpRevokedRpBonus);
                rpStatisticInfo.rpRevokedRefBonus = parseFloat(rpRevokedInfo.rpRevokedRefBonus);
                rpStatisticInfo.rpRevokedrpGasFee = parseFloat(rpRevokedInfo.rpRevokedrpGasFee);
            }
        }

        this.logUtilSrv.logInfo("RpCreateHistoryHandler", "...buildRpStatisticData...", rpStatisticInfo);
        return rpStatisticInfo;
    }

    async buildRevokedData(filter){
        console.log("\n ......buildRevokedData:");
        let rpRevokedInfo = null;

        let revokedRecord = await this.rpRevokedDbInst.findByOption(filter, {}, 1);
        if(revokedRecord.length > 0){      
            rpRevokedInfo = {
                "rpSender": revokedRecord[0].rpCreater.toLowerCase(),
                "rpRevokedRpBonus": revokedRecord[0].rpRevokedRpBonus,
                "rpRevokedRefBonus": revokedRecord[0].rpRevokedRefBonus,
                "rpRevokedrpGasFee": revokedRecord[0].rpRevokedrpGasFee
            }
        }  

        this.logUtilSrv.logInfo("RpCreateHistoryHandler", "...buildRevokedData...", rpRevokedInfo);     
        return rpRevokedInfo;
    }
    
}

module.exports = RpCreateHistoryHandler;
