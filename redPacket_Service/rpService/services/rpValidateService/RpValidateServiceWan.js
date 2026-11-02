const ValidateServiceInterface = require('../../interfaces/ValidateServiceInterface');
const serviceFramework = require("../../framework/ServiceFramework");
const RpRecordsMgr = require("./RpRecordsManager");
const TxRecordsMgr = require("./TxRecordsManager");
const RpEvtScanTask = require("./RpEvtScanTask");
const RpRevokerTask = require("./RpRevokerTask");
const path = require("path");


class RpValidateServiceWan extends ValidateServiceInterface {
    constructor() {
      super();
      
      this.chainType = "WAN";
      this.mapScEvts = new Map();
      this.mapScAddrAbi = new Map();
      this.mapBizRecordMgr = new Map();
    }
    
    async init(){
      // step 1: to new related record manager
      this.rpRecordsMgr = new RpRecordsMgr();
      this.txRecordsMgr = new TxRecordsMgr();

      // step 2: get related service config
      this.logUtilSrv = serviceFramework.getService("UtilServiceInterface", "Log4UtilService");  
      this.configService = serviceFramework.getService("ConfigServiceInterface", "ConfigServiceJson");  
      this.rpScConfig =  await this.configService.getConfig("ValidateServiceInterface", "RpValidateServiceWan", "rpScConfig");
      this.rpSyncedTaskConfig = await this.configService.getConfig("ValidateServiceInterface", "RpValidateServiceWan", "rpSyncedTaskConfig");
      this.rpRevokeTaskCfg = await this.configService.getConfig("ValidateServiceInterface", "RpValidateServiceWan", "rpRevokeTaskCfg");

      let rpScEvtConfig = await this.configService.getConfig("ValidateServiceInterface", "RpValidateServiceWan", "rpScEvtConfig");
      for(let i=0; i<rpScEvtConfig.length; i++){
          let evtConf = rpScEvtConfig[i];     
          let evtInfo = {
              "evtName": evtConf["scEvtName"],
              "evtTopics": evtConf["evtTopics"]
          }

          this.registerScEvent(evtConf["scAddress"], evtInfo);
      }

      let rpScAbiConfig = await this.configService.getConfig("ValidateServiceInterface", "RpValidateServiceWan", "rpScAddrMapAbi");
      for(let j=0; j<rpScAbiConfig.length; j++){
          let abiConfig = rpScAbiConfig[j];
          let abiFile = path.join(__dirname, "../../../config/abi/", abiConfig["scAbiFile"]);
          let scAbiJson = require(abiFile);

          this.mapScAddrAbi.set(abiConfig["scAddress"], scAbiJson);
      }

      let bizDataTypeConfigs = await this.configService.getConfig("ValidateServiceInterface", "RpValidateServiceWan", "rpBizDataType");      
      await this.initialBizData(bizDataTypeConfigs);

      // step: 3: to get synced block number
      let syncedRecord = [];
      this.storageService = serviceFramework.getService("StorageServiceInterface", "StorageService");
      this.syncedDbInst = await this.storageService.getDBIns("syncedBlockNumber");
      if(null != this.syncedDbInst){
        syncedRecord = await this.syncedDbInst.findByOption({ "chainType": this.chainType }); 
      } 
      if(0 == syncedRecord.length){
        let evtScanTaskCfg =  await this.configService.getConfig("EventScanServiceInterface", "EventScanServiceWan", "evtScanTaskConfig");
        this.syncedBlockNumber = evtScanTaskCfg.initialSyncedBlockNumber;
      }else{
        this.syncedBlockNumber = syncedRecord[0].syncedBlockNumber;
      }
  
      let rpRevokeTxSchema = await this.configService.getGlobalConfig("rpRevoke_tx_table_schema");
      this.rpRevokeTxDbInst = await this.storageService.initDB(rpRevokeTxSchema);
      
    }

    registerScEvent(scIns, evtInfo){ 
      this.logUtilSrv.logInfo("RpValidateServiceWan", "...registerScEvent begin...", scIns);

      let evts = this.mapScEvts.get(scIns);
      if(null == evts){
          evts = new Map();
      }
      evts.set(evtInfo.evtName, evtInfo.evtTopics);      
      this.mapScEvts.set(scIns, evts);

      this.logUtilSrv.logInfo("RpValidateServiceWan", "...registerScEvent end...", this.mapScEvts);
    }

    async initialBizData(bizTypeConfigs){
      this.logUtilSrv.logInfo("RpValidateServiceWan", "...initialBizData begin...", bizTypeConfigs);

      for(let i=0; i<bizTypeConfigs.length; i++){
        
        let bizType = bizTypeConfigs[i].bizType;
        if("RpCodeRecords" == bizType){
          console.log("\n\n [RpValidateServiceWan]initialing  RpCodeRecords:");
          // for rp code data type, it's needed to initial to get active rp code from db
          await this.rpRecordsMgr.init();
          this.mapBizRecordMgr.set("RpCodeRecords", this.rpRecordsMgr);

        }else if("TxRecords" == bizType){
          // for this data type, there is no need to initial data from db by now
          await this.txRecordsMgr.init();
          this.mapBizRecordMgr.set("TxRecords", this.txRecordsMgr);

        }else{
          // do nothing
        }
      }

      this.logUtilSrv.logInfo("RpValidateServiceWan", "...initialBizData end...", this.mapBizRecordMgr);
    }

    async startUp(){
      console.log("\n\n [RpValidateServiceWan] startUp: ");
      // to trigger the rp event scan task
      this.evtScanerTask = new RpEvtScanTask(this.chainType, 
                                            this.mapScEvts,
                                            this.mapScAddrAbi,
                                            this.mapBizRecordMgr,
                                            this.rpSyncedTaskConfig,
                                            this.syncedBlockNumber);
      this.evtScanerTask.startTask();

      // to trigger the rp revoke task
      this.rpRevokerTask = new RpRevokerTask(this.chainType,
                                            this.rpRecordsMgr,
                                            this.rpRevokeTaskCfg,
                                            this.rpScConfig.rpMaxActiveTime,
                                            this.rpRevokeTxDbInst);
      this.rpRevokerTask.startTask();
    }

    getBizRecord(bizType, bizIndex){
      this.logUtilSrv.logDebug("RpValidateServiceWan", "...getBizRecord...", bizIndex);

      let bizRecord = this.mapBizRecordMgr.get(bizType).getBizRecord(bizIndex);

      this.logUtilSrv.logDebug("RpValidateServiceWan", "...getBizRecord...", bizRecord);
      return bizRecord;
    }

    async checkBizValidity(bizType, bizIndex){
      this.logUtilSrv.logDebug("RpValidateServiceWan", "...checkBizValidity...", bizIndex);

      let checkRlst =  await this.mapBizRecordMgr.get(bizType).checkBizValidity(bizIndex);

      this.logUtilSrv.logDebug("RpValidateServiceWan", "...checkBizValidity...", checkRlst);      
      return checkRlst;
    }  

    async checkRpClaimValidity(rpEncodedCode, walletId) {
      let rpCodeRecordMgr = this.mapBizRecordMgr.get("RpCodeRecords");
      if (rpCodeRecordMgr) {
        let checkRlst =  await rpCodeRecordMgr.checkRpClaimValidity(rpEncodedCode, walletId);

        this.logUtilSrv.logDebug("RpValidateServiceWan", "...checkRpClaimValidity...", checkRlst);    
        return checkRlst;
      }
    }

}

module.exports = RpValidateServiceWan;