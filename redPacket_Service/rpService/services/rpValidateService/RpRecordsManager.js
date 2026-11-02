
const serviceFramework = require("../../framework/ServiceFramework");


class RpRecordsManager{
    constructor() {

      // map(rpCode => {startTime, active})
      this.mapRpCodeInfo = new Map();
      this.m_mapRpRestClaimInfo = new Map();// 存储红包申请剩余个数
      this.mapRpClaimerList = new Map(); // rpCode => claimerList
      this.chainType = "WAN";
    }
    
    async init(){
        // step 1: to get related service component
        this.connector = serviceFramework.getService("BCConnectorInterface", "IWanBCConnector");
        this.storageService = serviceFramework.getService("StorageServiceInterface", "StorageService");
        this.configService = serviceFramework.getService("ConfigServiceInterface", "ConfigServiceJson");
        this.logUtilSrv = serviceFramework.getService("UtilServiceInterface", "Log4UtilService");  
        this.globalConstant = serviceFramework.getService("GlobalConstantService", "GlobalConstant");

        // step 2: to get related config parameters
        this.rpScConfig =  await this.configService.getConfig("ValidateServiceInterface", "RpValidateServiceWan", "rpScConfig");
        this.maxRpActiveTime = this.rpScConfig.rpMaxActiveTime;

        // step: 2-1: to get related db instance
        let rpRecordSchema = await this.configService.getGlobalConfig("rpRecord_schema");
        this.rpRecordDbInst = await this.storageService.getDBIns(rpRecordSchema.name);

        let rpClaimSchema = await this.configService.getGlobalConfig("rpClaim_schema");
        this.rpClaimDbInst = await this.storageService.getDBIns(rpClaimSchema.name);

        let rpRequestSchema = await this.configService.getGlobalConfig("rp_tx_table_schema");
        this.rpRequestDbInst = await this.storageService.initDB(rpRequestSchema);

        // step: 2-2: to get synced block number
        let activeRpCodes = await this.rpRecordDbInst.findByOption({"rpFinished": false}, {}, 0); 
        for(let i=0; i<activeRpCodes.length; i++){
            // to build the realtime statisc info of this rp
            let rpInfo = {
              "rpStartTime" : activeRpCodes[i].rpStartTime,
              "rpRestCounts" : activeRpCodes[i].rpRestCounts,
              "rpFinished" : activeRpCodes[i].rpFinished
            }
            this.mapRpCodeInfo.set(activeRpCodes[i].rpCode, rpInfo);
            this.m_mapRpRestClaimInfo.set(activeRpCodes[i].rpCode, activeRpCodes[i].rpRestCounts); // 重启后,恢复为根据扫链数据确定剩余个数

            // to fetch claimer info for active rp, added by liaoxingxing
            let filter = {};
            filter.rpCode = activeRpCodes[i].rpCode;
            filter.rpStartTime = activeRpCodes[i].rpStartTime;
            let matchedObjs = await this.rpRequestDbInst.findByOption(filter, {}, 0);
            if(matchedObjs.length > 0){
              let claimerList = new Array();
              for(let j=0; j<matchedObjs.length; j++){
                claimerList.push(matchedObjs[j].rpWalletId);
              }
              this.mapRpClaimerList.set(activeRpCodes[i].rpCode, claimerList);
            }
        }

        console.log("\n\n[RpRecordsManager] mapRpCodeInfo during initialing:");
        console.log( this.mapRpCodeInfo);
        this.logUtilSrv.logInfo("RpRecordsManager", "...mapRpCodeInfo...", this.mapRpCodeInfo);
    }

    updateBizRecord(recordIndex, evtRecord){      
      if(null == evtRecord){
        this.mapRpCodeInfo.delete(recordIndex);
        this.m_mapRpRestClaimInfo.delete(recordIndex);
        this.mapRpClaimerList.delete(recordIndex);
        console.log("\n\n[RpRecordsManager] rp code has been revoked: ", recordIndex);
      }else{      
        this.mapRpCodeInfo.set(recordIndex, evtRecord);
      }
    }

    getBizRecord(recordIndex){
      return this.mapRpCodeInfo.get(recordIndex);
    }

    async checkBizValidity(recordIndex) {
      // let this.globalConstant = serviceFramework.getService("GlobalConstantService", "GlobalConstant");
      this.logUtilSrv.logInfo("RpRecordsManager", "...checkBizValidity...", recordIndex); 

      let rpMemInfo = this.mapRpCodeInfo.get(recordIndex);
      if(null == rpMemInfo){
        this.logUtilSrv.logInfo("RpRecordsManager", "...no existed rpRecord in Memory...", recordIndex); 
        return this.globalConstant.STATE_NO_EXIST;
      }
      this.logUtilSrv.logInfo("RpRecordsManager", "...rpRecord in Memory...", rpMemInfo); 

      let latestBlockNo = 0;
      try{
        latestBlockNo = (await this.connector.getBlockNumber(this.chainType)); 
      }catch(error){
        this.logUtilSrv.logError("RpRecordsManager", "...getBlockNumber exception, try again later!...", error); 
        return this.globalConstant.STATE_NETWORK_EXCEPTION;      
      }
      if(null == latestBlockNo){
        this.logUtilSrv.logError("RpRecordsManager", "...getBlockNumber failed, try again later!...", latestBlockNo); 
        return this.globalConstant.STATE_NETWORK_EXCEPTION;   
      }

      let blockInfo = 0;
      try{
        blockInfo = (await this.connector.getBlockByNumber(this.chainType, latestBlockNo)); 
      }catch(error){
        this.logUtilSrv.logError("RpRecordsManager", "...getBlockByNumber exception, try again later!...", error); 
        return this.globalConstant.STATE_NETWORK_EXCEPTION;      
      }
      if(null == blockInfo){
        this.logUtilSrv.logError("RpRecordsManager", "...getBlockByNumber failed, try again later!...", blockInfo); 
        return this.globalConstant.STATE_NETWORK_EXCEPTION;   
      }

      // step 1: time validity check
      let restTime = blockInfo.timestamp - rpMemInfo.rpStartTime;
      if(restTime >= this.maxRpActiveTime){
        this.logUtilSrv.logInfo("RpRecordsManager", "...checkBizValidity invalid_overtime...", recordIndex);
        return this.globalConstant.STATE_RP_INVALID_OVERTIME;
      }

      // step 2: rest bonus number check
      if(0 >= rpMemInfo.rpRestCounts){
        this.logUtilSrv.logInfo("RpRecordsManager", "...checkBizValidity invalid_nomore_bonus...", recordIndex);
        return this.globalConstant.STATE_RP_INVALID_NOMORE_BONUS;
      }

      ///维护领取map，统计领取个数,领取次数超过个数则不允许领取
      this.logUtilSrv.logInfo("RpRecordsManager", "...checkBizValidity result_pass...", recordIndex);
      return this.globalConstant.STATE_CHECK_VALID;
    }

    // 增加领取次数
    checkRpValidClaimCount(rpCode) {       
      this.logUtilSrv.logInfo("RpRecordsManager", "...checkRpValidClaimCount m_mapRpRestClaimInfo:...", this.m_mapRpRestClaimInfo);

      let restClaimCount = this.m_mapRpRestClaimInfo.get(rpCode);
      this.logUtilSrv.logInfo("RpRecordsManager", "...checkRpValidClaimCount takes rest rp counts:...", restClaimCount);

      if (restClaimCount !== undefined) {
        if (0 >= restClaimCount) {
          this.logUtilSrv.logInfo("RpRecordsManager", "...checkRpValidClaimCount m_mapRpRestClaimInfo takes no more bonus...", restClaimCount);
          return this.globalConstant.STATE_RP_INVALID_NOMORE_BONUS;
        }

        this.m_mapRpRestClaimInfo.set(rpCode, --restClaimCount);
      }

      {
        let counts = this.m_mapRpRestClaimInfo.get(rpCode)
        this.logUtilSrv.logInfo("RpRecordsManager", "...checkRpValidClaimCount takes rest rp counts:...", counts);
      }

      return this.globalConstant.STATE_CHECK_VALID;
    }

    async setCreateRpInfo(strRpCode, rpCounts) {
      // this.logUtilSrv.logInfo("RpRecordsManager", "...setCreateRpInfostrRpCode:",strRpCode);
      // this.logUtilSrv.logInfo("RpRecordsManager", "...setCreateRpInforpCounts:",rpCounts);
      this.m_mapRpRestClaimInfo.set(strRpCode, rpCounts);
    }

    async checkRpClaimValidity(rpCode, walletId){

      let rpClaimerIndex = -1;
      let rpClaimers = this.mapRpClaimerList.get(rpCode);
      if(undefined !== rpClaimers){
        rpClaimerIndex = rpClaimers.indexOf(walletId);
      }
      this.logUtilSrv.logInfo("RpRecordsManager", "...checkRpClaimValidity rpClaimers...", rpClaimers); 
      this.logUtilSrv.logInfo("RpRecordsManager", "...checkRpClaimValidity claimer walletId...", walletId); 

      if(-1 !== rpClaimerIndex){
        this.logUtilSrv.logInfo("RpRecordsManager", "...checkRpClaimValidity repeated rp claim...", rpCode); 
        return this.globalConstant.STATE_RP_REPEAT_CLAIM;
      }

      let checkRslt = await this.checkBizValidity(rpCode);
      if(this.globalConstant.STATE_CHECK_VALID === checkRslt){

        let countVerifyRslt = this.checkRpValidClaimCount(rpCode);
        if(this.globalConstant.STATE_CHECK_VALID !== countVerifyRslt){
          this.logUtilSrv.logInfo("RpRecordsManager", "...checkRpClaimValidity checkRpValidClaimCount failed...", countVerifyRslt); 
          return this.globalConstant.STATE_RP_INVALID_NOMORE_BONUS;
        }

        if(undefined === rpClaimers){
            rpClaimers = new Array();
        }  
        rpClaimers.push(walletId);

        this.mapRpClaimerList.set(rpCode, rpClaimers);
        this.logUtilSrv.logInfo("RpRecordsManager", "... updated rpClaimers...", rpClaimers); 
      }

      this.logUtilSrv.logInfo("RpRecordsManager", "... checkRpClaimValidity checkRslt...", checkRslt); 
      return checkRslt;
    }

}

module.exports = RpRecordsManager;

