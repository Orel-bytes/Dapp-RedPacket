
const BaseTask = require('../taskservice/BaseTask.js');
const serviceFramework = require("../../framework/ServiceFramework");
const RpEvtHandler = require("./RpEvtScanHandler");

class EvtScanTask extends BaseTask{
  constructor(chainType, mapScEvts, mapDbNameInst, mapScAddrAbi, evtScanTaskCfg, syncedBlockNumber){
    super();

    this.chainType = chainType;
    this.mapScEvts = mapScEvts;
    this.mapScAddrAbi = mapScAddrAbi;
    this.mapDbNameInst = mapDbNameInst;
    this.serviceID = evtScanTaskCfg.serviceID;
    this.safeBlockNumber =  evtScanTaskCfg.safeBlockNumber;
    this.syncStep =  evtScanTaskCfg.syncStep;
    this.retryInterval =  evtScanTaskCfg.retryInterval;
    this.syncedBlockNumber = syncedBlockNumber;
    
    this.rpEvtHandler = new RpEvtHandler(mapDbNameInst, mapScAddrAbi);
    this.rpEvtHandler.init();

    this.mapEvtHandler = new Map();
    this.mapEvtHandler.set("RedPacketCreateLogger", this.rpEvtHandler);
    this.mapEvtHandler.set("RedPacketClaimLogger", this.rpEvtHandler);
    this.mapEvtHandler.set("RedPacketReferenceBonusLogger", this.rpEvtHandler);
    this.mapEvtHandler.set("RedPacketRevokeLogger", this.rpEvtHandler);
    this.mapEvtHandler.set("RegWRCTokenLogger", this.rpEvtHandler);
    this.mapEvtHandler.set("RpGasFeeLogger", this.rpEvtHandler);
    this.mapEvtHandler.set("RpMaxBonusConfigLogger", this.rpEvtHandler);

    this.connector = serviceFramework.getService("BCConnectorInterface", "IWanBCConnector");
    this.taskSchedule = serviceFramework.getService("TaskServiceInterface","taskSchedule");
    this.web3UtilSrv = serviceFramework.getService("UtilServiceInterface", "Web3UtilService"); 
    this.logUtilSrv = serviceFramework.getService("UtilServiceInterface", "Log4UtilService");    
  }

  // based func
  init(){
    this.setId();

    return true;
  }

  setId(){
    this.Id = this.serviceID;
  }

  getId(){
    return this.Id;
  }

  isRepeated(){
    return false; // wait to check 
  }

  setNextStartTime(time){
  }

  static askTask(){
  }

  async run(){ 
    console.log("\n\n......[EvtScanTask] run begin....: " + this.Id); 
    this.logUtilSrv.logDebug("EvtScanTask", "...run begin...", this.Id);

    let latestBlockNo = 0;
    try{
      latestBlockNo = (await this.connector.getBlockNumber(this.chainType))-this.safeBlockNumber; // safte
    }catch(error){
      console.log("\n\n......[EvtScanTask] getBlockNumber by connector is exception, try again later!"); 
      console.log(error);

      this.logUtilSrv.logError("EvtScanTask", "...getBlockNumber by connector is exception, try again later!...", error);
      this.taskSchedule.setFinishSuccess(this);    
      this.addTaskBySelf(this.retryInterval);      
      return;      
    }
    // there will be null, if chain has been rolled back
    if(null == latestBlockNo){
      this.logUtilSrv.logError("EvtScanTask", "...getBlockNumber failed, try again later!...");
      this.taskSchedule.setFinishSuccess(this);
      this.addTaskBySelf(this.retryInterval);
      return;      
    }

    let targetBlockNo = this.syncedBlockNumber + this.syncStep;//stepLength;

    if(latestBlockNo <= this.syncedBlockNumber){   
      console.log("\n\n......[EvtScanTask] run end with no more block ...: " + latestBlockNo); 
      this.logUtilSrv.logDebug("EvtScanTask", "...run end with no more block...", latestBlockNo); 

      this.taskSchedule.setFinishSuccess(this);    
      this.addTaskBySelf(this.retryInterval);      
      return;
    }else if (latestBlockNo < targetBlockNo){
      targetBlockNo = latestBlockNo;
    }else{
    }
    console.log("\n\n......[EvtScanTask] syncedBlockNumber....: " + this.syncedBlockNumber);
    console.log("......[EvtScanTask] confirm targetBlockNo....: " + targetBlockNo); 

    for(let [scInst, evts] of this.mapScEvts){
      // to get sc event needed from chain
      let abiEvts = [];
      try{
        abiEvts = await this.connector.getScEvent(this.chainType, 
                                                  scInst, 
                                                  [],  
                                                  {
                                                    "fromBlock": this.syncedBlockNumber,
                                                    "toBlock": targetBlockNo
                                                  });
      }catch(error){
        console.log(error);
        console.log("\n\n......[EvtScanTask] getScEvent by connector is exception, try again later!"); 
        this.logUtilSrv.logError("EvtScanTask", "...getScEvent by connector is exception, try again later!...", error);

        this.taskSchedule.setFinishSuccess(this);    
        this.addTaskBySelf(this.retryInterval);      
        return;      
      }
      // there will be null, if chain has been rolled back
      if(null == abiEvts){
        this.logUtilSrv.logError("EvtScanTask", "...getScEvent failed, try again later!...");
        this.taskSchedule.setFinishSuccess(this);
        this.addTaskBySelf(this.retryInterval);
        return;      
      }

      // to decode the abiEvts
      let scABI = this.mapScAddrAbi.get(scInst);
      let decodedEvts = this.web3UtilSrv.parseLogs(abiEvts, scABI);
      for(let i=0; i<decodedEvts.length; i++){
        let decodedEvt = decodedEvts[i];
        this.logUtilSrv.logInfo("EvtScanTask", "...decodedEvt...", decodedEvt);

        let result = true;
        let evtHandlerObj = this.mapEvtHandler.get(decodedEvt.eventName);
        if(null != evtHandlerObj){
          result = await evtHandlerObj.handlerEvent(decodedEvt);
        }else{
          // console.log("\n\n No existed evtHandler for this event: " + decodedEvt.eventName);
        }

        if(!result){
          console.log("\n\n [RpEvtScanTask]evtHandlerObj.handlerEvent failed");
          this.logUtilSrv.logError("EvtScanTask", "...evtHandlerObj.handlerEvent failed!...");

          this.taskSchedule.setFinishSuccess(this);    
          this.addTaskBySelf(0); 
          return;
        }
      }
    }

    // update the syncedBlockRecords of memory & db
    this.syncedBlockNumber = targetBlockNo;

    let dbInst = this.mapDbNameInst.get("syncedBlockNumber"); //memory data info
    if(null != dbInst){
      let queryOption = {'chainType': this.chainType};
      let updateOption = {$set: {'syncedBlockNumber': this.syncedBlockNumber}};
      await dbInst.updateByOption(queryOption, updateOption);
    }

    this.taskSchedule.setFinishSuccess(this);
    this.addTaskBySelf(0);    
    console.log("\n\n......[EvtScanTask] run end....: " + this.Id); 
    this.logUtilSrv.logDebug("EvtScanTask", "...run end...", this.Id);
    return;
  }
  
  /**
   *  extended functions
   */
  startTask(){
    this.init();
    this.setPriority('tg');
    this.setNextStartTime(0);
    this.taskSchedule.addTask(this);
  }

  /**
   *  extended functions
   */ 
  addTaskBySelf(retryInterval){
    let that = this;

    // to reset task property
    that.init();
    that.setPriority('tg');
    this.setNextStartTime(retryInterval);
    // to add task into schedule
    this.taskSchedule.addTask(that);
  }

};

module.exports = EvtScanTask;