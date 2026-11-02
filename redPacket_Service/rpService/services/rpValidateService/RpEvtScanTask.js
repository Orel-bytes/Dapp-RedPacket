
const BaseTask = require('../taskservice/BaseTask.js');
const serviceFramework = require("../../framework/ServiceFramework");
const RpEventHandler = require("./RpBizEvtHandler");


class RpEvtScanTask extends BaseTask{
  constructor(chainType, mapScEvts, mapScAddrAbi, mapBizRecordMgr, evtScanTaskCfg, syncedBlockNumber){
    super();

    this.chainType = chainType;
    this.mapScEvts = mapScEvts;
    this.mapScAddrAbi = mapScAddrAbi;
    this.mapBizRecordMgr = mapBizRecordMgr;
    
    this.serviceID = evtScanTaskCfg.serviceID;
    this.retryInterval =  evtScanTaskCfg.retryInterval;
    this.syncStep =  evtScanTaskCfg.syncStep;
    this.syncedBlockNumber = syncedBlockNumber;

    this.rpEventHandler = new RpEventHandler(this.mapBizRecordMgr, this.mapScAddrAbi);
    this.rpEventHandler.init();

    this.mapEvtHandler = new Map();
    this.mapEvtHandler.set("RedPacketCreateLogger", this.rpEventHandler);
    this.mapEvtHandler.set("RedPacketClaimLogger", this.rpEventHandler);
    this.mapEvtHandler.set("RedPacketReferenceBonusLogger", this.rpEventHandler);
    this.mapEvtHandler.set("RedPacketRevokeLogger", this.rpEventHandler);

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
    this.logUtilSrv.logInfo("RpEvtScanTask", "...run begin...", this.Id);
    console.log("\n\n......[RpEvtScanTask] run begin....: " + this.Id); 

    let latestBlockNo = null;
    try{
      latestBlockNo = (await this.connector.getBlockNumber(this.chainType)); 
    }catch(error){
      this.logUtilSrv.logError("RpEvtScanTask", "...getBlockNumber exception, try again later!...", error); 
      this.taskSchedule.setFinishSuccess(this);
      this.addTaskBySelf(this.retryInterval);
      return;      
    }
    // there will be null, if chain has been rolled back
    if(null == latestBlockNo){
      this.logUtilSrv.logError("RpEvtScanTask", "...getBlockNumber failed, try again later!...", latestBlockNo);
      this.taskSchedule.setFinishSuccess(this);
      this.addTaskBySelf(this.retryInterval);
      return;      
    }

    let targetBlockNo = this.syncedBlockNumber + this.syncStep;
    if(latestBlockNo <= this.syncedBlockNumber){   
      this.logUtilSrv.logInfo("RpEvtScanTask", "...run end with no more block...", this.syncedBlockNumber);
      console.log("\n\n......[RpEvtScanTask] run end with no more block ....: " + this.Id);

      this.taskSchedule.setFinishSuccess(this); 
      this.addTaskBySelf(this.retryInterval);
      return;

    }else if (latestBlockNo < targetBlockNo){
      targetBlockNo = latestBlockNo;

    }else{
    }
    console.log("\n\n......[RpEvtScanTask] syncedBlockNumber....: " + this.syncedBlockNumber);
    console.log("......[RpEvtScanTask] confirm targetBlockNo....: " + targetBlockNo);
    this.logUtilSrv.logInfo("RpEvtScanTask", "...syncedBlockNumber...", this.syncedBlockNumber);
    this.logUtilSrv.logInfo("RpEvtScanTask", "...targetBlockNo...", targetBlockNo);

    for(let [scInst, evts] of this.mapScEvts){
      console.log("\n\n abiEvts scInst:" + scInst);
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
        this.logUtilSrv.logError("RpEvtScanTask", "...getScEvent exception, try again later!...", error);         
        this.taskSchedule.setFinishSuccess(this);    
        this.addTaskBySelf(this.retryInterval);      
        return;      
      }
      // there will be null, if chain has been rolled back
      if(null == abiEvts){
        this.logUtilSrv.logError("RpEvtScanTask", "...getScEvent failed, try again later!...", abiEvts);
        this.taskSchedule.setFinishSuccess(this);
        this.addTaskBySelf(this.retryInterval);
        return;      
      }
      // console.log("\n\n [RpEvtScanTask]abiEvts numbers:" + abiEvts.length);

      // to decode the abiEvts
      let scABI = this.mapScAddrAbi.get(scInst);
      let decodedEvts = this.web3UtilSrv.parseLogs(abiEvts, scABI);
      if(decodedEvts.length > 0){
        console.log("\n\n\n [RpEvtScanTask]decodedEvts length: " + decodedEvts.length);
      }

      for(let i=0; i<decodedEvts.length; i++){
        let decodedEvt = decodedEvts[i];
        // console.log("\n\n [RpEvtScanTask]decodedEvt: ");
        // console.log(decodedEvt);
        let result = true;
        let evtHandlerObj = this.mapEvtHandler.get(decodedEvt.eventName);
        if(null != evtHandlerObj){
          result = await evtHandlerObj.handlerEvent(decodedEvt);
        }else{
          this.logUtilSrv.logError("RpEvtScanTask", "...No existed evtHandler for this event!...", decodedEvt.eventName);
        }
        
        if(!result){
          this.logUtilSrv.logError("RpEvtScanTask", "...evtHandlerObj.handlerEvent failed!...", decodedEvt.eventName);
          this.taskSchedule.setFinishSuccess(this);    
          this.addTaskBySelf(0); 
          return;
        }
      }      
    }

    this.syncedBlockNumber = targetBlockNo;

    this.taskSchedule.setFinishSuccess(this);   
    this.addTaskBySelf(0);    

    this.logUtilSrv.logInfo("RpEvtScanTask", "...run end...", this.Id);
    console.log("\n\n......[RpEvtScanTask] run end....: " + this.Id); 
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

module.exports = RpEvtScanTask;