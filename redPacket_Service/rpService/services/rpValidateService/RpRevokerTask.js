
const BaseTask = require('../taskservice/BaseTask.js');
const serviceFramework = require("../../framework/ServiceFramework");


class RpRevokerTask extends BaseTask{
  constructor(chainType, rpRecordsMgr, rpRevokeTaskCfg, rpMaxActiveTime, rpRevokeTxDbInst){
    super();
    
    this.chainType = chainType;
    this.rpRecordsMgr = rpRecordsMgr;
    this.serviceID = rpRevokeTaskCfg.serviceID;
    this.retryInterval =  rpRevokeTaskCfg.retryInterval;

    this.connector = serviceFramework.getService("BCConnectorInterface", "IWanBCConnector");
    this.taskSchedule = serviceFramework.getService("TaskServiceInterface","taskSchedule");
    this.logUtilSrv = serviceFramework.getService("UtilServiceInterface", "Log4UtilService");  

    this.maxRpActiveTime = rpMaxActiveTime;
    this.rpRevokeTxDbInst = rpRevokeTxDbInst;
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
    console.log("\n\n......[RpRevokerTask] run begin....: " + this.Id); 
    this.logUtilSrv.logInfo("RpRevokerTask", "...run begin...", this.Id);

    let latestBlockNo = null;
    try{
      latestBlockNo = (await this.connector.getBlockNumber(this.chainType));

    }catch(error){
      this.logUtilSrv.logError("RpRevokerTask", "...getBlockNumber exception, try again later!...", error);
      this.taskSchedule.setFinishSuccess(this);
      this.addTaskBySelf(this.retryInterval);
      return;      
    }

    // there will be null, if chain has been rolled back
    if(null == latestBlockNo){
      this.logUtilSrv.logError("RpRevokerTask", "...getBlockNumber failed, try again later!...", latestBlockNo);
      this.taskSchedule.setFinishSuccess(this);
      this.addTaskBySelf(this.retryInterval);
      return;      
    }

    let blockInfo = null;
    try{
      blockInfo = (await this.connector.getBlockByNumber(this.chainType, latestBlockNo)); 
    }catch(error){
      this.logUtilSrv.logError("RpRevokerTask", "...getBlockByNumber exception, try again later!...", error);      
      this.taskSchedule.setFinishSuccess(this);
      this.addTaskBySelf(this.retryInterval);
      return;      
    }

    // there will be null, if chain has been rolled back
    if(null == blockInfo){
      this.logUtilSrv.logError("RpRevokerTask", "...getBlockByNumber failed, try again later!...", blockInfo);
      this.taskSchedule.setFinishSuccess(this);
      this.addTaskBySelf(this.retryInterval);
      return;      
    }

    let mapRpCodeInfo = this.rpRecordsMgr.mapRpCodeInfo;
    this.logUtilSrv.logInfo("RpRevokerTask", "...mapRpCodeInfo in Memory...", mapRpCodeInfo);
    console.log("\n\n......[RpRevokerTask] rpRecordsMgr.getMapRpCodeInfo():");
    console.log(mapRpCodeInfo);
    for(let [rpCode, rpInfo] of mapRpCodeInfo){
      console.log("\n [RpRevokerTask] rpCode:" + rpCode);
      if(null == rpInfo){
        continue;
      }

      let rpStartTime = rpInfo.rpStartTime;
      let curTimestamp = blockInfo.timestamp;

      if((curTimestamp - rpStartTime) >= this.maxRpActiveTime){

        let filter = {
          "rpCode" : rpCode,
          "rpStartTime" : rpStartTime
        };

        let records = await this.rpRevokeTxDbInst.findByOption(filter, {}, 0);
        if(0 == records.length){
          let rpRevokeReqDoc = {
            rpCode: rpCode,
            rpStartTime: rpStartTime,
            rpStatus: 0,
            rpReceiveTs: new Date().getTime(),
            rpSendTs: null,
            rpTxNonce: null,
            rpTxHash: null,
            rpGasPrice: null,
            rpCheckTs: null,
            rpSuccess: null
          }
          console.log(rpRevokeReqDoc);
          this.logUtilSrv.logInfo("RpRevokerTask", "...insert new rpRevokeReqDoc...", rpRevokeReqDoc);
          await this.rpRevokeTxDbInst.insert(rpRevokeReqDoc);
        }
      }
    }

    this.taskSchedule.setFinishSuccess(this);   
    this.addTaskBySelf(this.retryInterval);
    console.log("\n\n......[RpRevokerTask] run end....: " + this.Id); 
    this.logUtilSrv.logInfo("RpRevokerTask", "...run end...", this.Id);
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

module.exports = RpRevokerTask;