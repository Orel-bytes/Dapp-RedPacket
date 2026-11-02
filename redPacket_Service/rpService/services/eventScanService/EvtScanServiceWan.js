const EventScanServiceInterface = require('../../interfaces/EventScanServiceInterface');
const serviceFramework = require("../../framework/ServiceFramework");
const EvtScanTask = require("./EvtScanTask");
const path = require("path");

class EvtScanServiceWan extends EventScanServiceInterface {
    constructor() {
        super();
        
        this.chainType = "WAN";
        this.evtScanerTask = null;
        this.mapScEvts = new Map();
        this.mapScAddrAbi = new Map();
        this.mapDbNameInst = new Map();
    }
    
    async init(){
        // step 1: to get related service component
        this.taskSchedule = serviceFramework.getService("TaskServiceInterface","taskSchedule");
        this.storageService = serviceFramework.getService("StorageServiceInterface", "StorageService"); 
        this.configService = serviceFramework.getService("ConfigServiceInterface", "ConfigServiceJson");
    
        this.evtScanTaskCfg =  await this.configService.getConfig("EventScanServiceInterface", "EventScanServiceWan", "evtScanTaskConfig");

        // step 2: to get related config parameters
        // step: 2-1: to get related db instance
        let rpRecordSchema = await this.configService.getGlobalConfig("rpRecord_schema");
        this.rpRecordDbInst = await this.storageService.initDB(rpRecordSchema);
        this.mapDbNameInst.set(rpRecordSchema.name, this.rpRecordDbInst);

        let rpClaimSchema = await this.configService.getGlobalConfig("rpClaim_schema");
        this.rpClaimDbInst = await this.storageService.initDB(rpClaimSchema);
        this.mapDbNameInst.set(rpClaimSchema.name, this.rpClaimDbInst);
    
        let rpRefInfoSchema = await this.configService.getGlobalConfig("rpRefInfo_schema");
        this.rpRefDbInst  = await this.storageService.initDB(rpRefInfoSchema);
        this.mapDbNameInst.set(rpRefInfoSchema.name, this.rpRefDbInst);
    
        let rpRevokeSchema = await this.configService.getGlobalConfig("rpRevokedInfo_schema");
        this.rpRevokeDbInst  = await this.storageService.initDB(rpRevokeSchema);
        this.mapDbNameInst.set(rpRevokeSchema.name, this.rpRevokeDbInst);
    
        let rpTokenSchema = await this.configService.getGlobalConfig("regToken_schema");
        this.rpTokenDbInst  = await this.storageService.initDB(rpTokenSchema);
        this.mapDbNameInst.set(rpTokenSchema.name, this.rpTokenDbInst);
    
        let rpGasFeeSchema = await this.configService.getGlobalConfig("rpGasFee_schema");
        this.rpGasFeeDbInst  = await this.storageService.initDB(rpGasFeeSchema);
        this.mapDbNameInst.set(rpGasFeeSchema.name, this.rpGasFeeDbInst);
    
        let rpMaxBonusConfSchema = await this.configService.getGlobalConfig("rpMaxBonusConfig_schema");
        this.rpMaxBonusConfDbInst  = await this.storageService.initDB(rpMaxBonusConfSchema);
        this.mapDbNameInst.set(rpMaxBonusConfSchema.name, this.rpMaxBonusConfDbInst);
    
        let syncedDataSchema = await this.configService.getGlobalConfig("syncedBlockNumber_schema");
        this.syncedDbInst = await this.storageService.initDB(syncedDataSchema);
        this.mapDbNameInst.set(syncedDataSchema.name, this.syncedDbInst);
    
        // step: 2-2: to get synced block number
        let syncedRecord = await this.syncedDbInst.findByOption({"chainType": this.chainType}, {}, 0);  
        if(0 == syncedRecord.length){
          this.syncedBlockNumber = this.evtScanTaskCfg.initialSyncedBlockNumber;
          console.log("\n\n this.syncedBlockNumber: " + this.syncedBlockNumber);
          let syncedData = { 
            chainType: "WAN",
            syncedBlockNumber:  this.syncedBlockNumber
          }
          let ret = await this.syncedDbInst.insert(syncedData);
        }else{
          this.syncedBlockNumber = syncedRecord[0].syncedBlockNumber;
        }    
    
        // step: 2-3: to register the sc events needed to be monitor
        let scEvtConfig = await this.configService.getConfig("EventScanServiceInterface", "EventScanServiceWan", "scEvtConfig");
        for(let i=0; i<scEvtConfig.length; i++){
            let evtConf = scEvtConfig[i];   
            let evtInfo = {
                "evtDbName": evtConf["scEvtName"],
                "evtTopics": evtConf["evtTopics"]
            }
            this.registerScEvent(evtConf["scAddress"], evtInfo);
        }

        let scAbiConfig = await this.configService.getConfig("EventScanServiceInterface", "EventScanServiceWan", "scAddrMapAbi");
        for(let j=0; j<scAbiConfig.length; j++){
            let abiConfig = scAbiConfig[j];

            let abiFile = path.join(__dirname, "../../../config/abi/", abiConfig["scAbiFile"]);
            let scAbiJson = require(abiFile);
            this.mapScAddrAbi.set(abiConfig["scAddress"], scAbiJson);
        }
    }

    registerScEvent(scIns, evtInfo){
  
      let evts = this.mapScEvts.get(scIns);
      if(null == evts){
          evts = new Map();
      }  

      evts.set(evtInfo.evtDbName, evtInfo.evtTopics);      
      this.mapScEvts.set(scIns, evts);
    }

    async startUp(){
        console.log("\n\n EvtScanServiceWan startUp: ");
        this.evtScanerTask = new EvtScanTask(this.chainType, 
                                            this.mapScEvts,  
                                            this.mapDbNameInst, 
                                            this.mapScAddrAbi,
                                            this.evtScanTaskCfg,
                                            this.syncedBlockNumber);
        this.evtScanerTask.startTask();
    }

}

module.exports = EvtScanServiceWan;