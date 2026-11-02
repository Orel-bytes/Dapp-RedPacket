
const serviceFramework = require("../../framework/ServiceFramework");

class RpBizEvtHandler {
  
  constructor(mapBizRecordMgr, mapScAddrAbi){
    this.mapBizRecordMgr = mapBizRecordMgr;
    this.mapScAddrAbi = mapScAddrAbi;
    this.chainType = "WAN";
  }

  // based func
  init(){
    this.connector = serviceFramework.getService("BCConnectorInterface", "IWanBCConnector");
    this.web3UtilSrv = serviceFramework.getService("UtilServiceInterface", "Web3UtilService");
    this.logUtilSrv = serviceFramework.getService("UtilServiceInterface", "Log4UtilService");  

    this.mapBlockNoTxHash = new Map();
    this.minBlockNo = 0;
    this.maxBlockNo = 0;
    this.maxTxsSavedBlocks = 50; // to confirm there are txHash records are blong to the latest 50 block

    return true;
  }

  async handlerEvent(decodedEvt){
    let result = true;

    if("RedPacketCreateLogger" == decodedEvt.eventName){
      result = await this.handlerRPCreateEvent(decodedEvt);

    }else if("RedPacketClaimLogger" == decodedEvt.eventName){
      result = await this.handlerRPClaimEvent(decodedEvt);

    }else if("RedPacketReferenceBonusLogger" == decodedEvt.eventName){
      result = await this.handlerRPRefInfoEvent(decodedEvt);

    }else if("RedPacketRevokeLogger" == decodedEvt.eventName){
      result = await this.handlerRPRevokeEvent(decodedEvt);
      
    }else{

    }

    return result;
  }

  async handlerRPCreateEvent(decodedEvt){
    this.logUtilSrv.logInfo("RpBizEvtHandler", "...handlerRPCreateEvent...", decodedEvt);

    let evtParams = decodedEvt.args;
    let strRpCode = this.web3UtilSrv.convertHexToAscii(evtParams["_rpCode"]);
    let blockInfo = null;

    try{
      blockInfo = await this.connector.getBlockByNumber(this.chainType, decodedEvt.blockNumber);
    }catch(error){
      this.logUtilSrv.logError("RpBizEvtHandler", "...getBlockNumber exception, try again later!...", error);      
      return false;      
    }
    if((null == blockInfo) || (null == blockInfo.timestamp)){
      this.logUtilSrv.logError("RpBizEvtHandler", "...blockInfo is valid, try again later!...", blockInfo);
      return false;      
    }

    let args = [evtParams["_rpCode"], blockInfo.timestamp.toString()];    
    let scABI =  this.mapScAddrAbi.get(decodedEvt.address);

    let rpCounts = 0;
    try{
      let rpStatus = await this.connector.callScFunc(this.chainType, 
                                                    decodedEvt.address,
                                                    "mapRPRecord",
                                                    args,
                                                    scABI);
      rpCounts = parseInt(rpStatus[4]);
    }catch(error){
      this.logUtilSrv.logError("RpBizEvtHandler", "...callScFunc exception, try again later!...", error);            
      return false;      
    }
    
    let rpRecordObj = {
      "rpStartTime": blockInfo.timestamp,
      "rpRestCounts": rpCounts,
      "rpFinished" : false      
    }

    // to update the rpCode records in memory
    this.mapBizRecordMgr.get("RpCodeRecords").updateBizRecord(strRpCode, rpRecordObj);
    await this.mapBizRecordMgr.get("RpCodeRecords").setCreateRpInfo(strRpCode, rpCounts);
    
    this.logUtilSrv.logInfo("RpBizEvtHandler", "...new rpRecord into memory...", rpRecordObj); 
    return true;
  }

  async handlerRPClaimEvent(decodedEvt){
    this.logUtilSrv.logInfo("RpBizEvtHandler", "...handlerRPClaimEvent...", decodedEvt);
    
    let evtParams = decodedEvt.args;
    let strRpCode = this.web3UtilSrv.convertHexToAscii(evtParams["_rpCode"]);
    console.log("rpCode: " + strRpCode);
    this.logUtilSrv.logInfo("handlerRPClaimEvent", "...rpCode...", strRpCode);

    let rpRecordObj = this.mapBizRecordMgr.get("RpCodeRecords").getBizRecord(strRpCode);
    if(null == rpRecordObj){
      console.log("there is on record based on this rp code: " + strRpCode);
      this.logUtilSrv.logInfo("handlerRPClaimEvent", "...no existed valid rpRecord...", strRpCode);
    }else{
      console.log("rpInfo(before claim): ");
      console.log(this.mapBizRecordMgr.get("RpCodeRecords").getBizRecord(strRpCode));
      this.logUtilSrv.logInfo("handlerRPClaimEvent", 
                              "...rpInfo(before claim)...", 
                              this.mapBizRecordMgr.get("RpCodeRecords").getBizRecord(strRpCode));

      rpRecordObj.rpRestCounts = parseInt(evtParams["_rpRestCounts"]); 
      this.mapBizRecordMgr.get("RpCodeRecords").updateBizRecord(strRpCode, rpRecordObj); 

      console.log("rpInfo(after claim): ");  
      console.log(this.mapBizRecordMgr.get("RpCodeRecords").getBizRecord(strRpCode));
      this.logUtilSrv.logInfo("handlerRPClaimEvent", 
                              "...rpInfo(before claim)...", 
                              this.mapBizRecordMgr.get("RpCodeRecords").getBizRecord(strRpCode));
    }

    // to add the rpClaimReq txData into memory
    let txRecord = {
      "blockHash" : decodedEvt.blockHash,
      "blockNumber" : decodedEvt.blockNumber
    }
    this.mapBizRecordMgr.get("TxRecords").updateBizRecord(decodedEvt.transactionHash, txRecord);
    this.logUtilSrv.logInfo("handlerRPClaimEvent", "...new rpClaim txHash...",decodedEvt.transactionHash);

    // to record the txHash data of this blockNo 
    let txList = this.mapBlockNoTxHash.get(decodedEvt.blockNumber);
    if(null == txList){
      txList = new Array();
    }
    txList.push(decodedEvt.transactionHash);
    this.mapBlockNoTxHash.set(decodedEvt.blockNumber, txList);

    // to update the txRecords in memory
    if(0 == this.minBlockNo){
      this.minBlockNo = decodedEvt.blockNumber;
    }
    this.maxBlockNo = decodedEvt.blockNumber;
    
    let savedBlocks = this.maxBlockNo - this.minBlockNo;
    if(this.maxTxsSavedBlocks < savedBlocks){
      let restBlocks = savedBlocks - this.maxTxsSavedBlocks;

      for(let i=0; i<restBlocks; i++){
        this.minBlockNo = this.minBlockNo + i;

        let txHashList = this.mapBlockNoTxHash.get(this.minBlockNo);
        if(null == txHashList){
          console.log("\n\n there is no txHash records in ", this.minBlockNo);
          continue;
        }

        for(let k=0; k<txHashList.length; k++){
          console.log("\n\n...removed txHash records:", txHashList[k]);
          this.mapBizRecordMgr.get("TxRecords").updateBizRecord(txHashList[k], null);
        }
        this.logUtilSrv.logInfo("handlerRPClaimEvent", "...txHashList removed from memory...", txHashList);

        this.mapBlockNoTxHash.delete(this.minBlockNo);
      }
    }

    return true;
  }

  async handlerRPRefInfoEvent(decodedEvt){
    this.logUtilSrv.logInfo("RpBizEvtHandler", "...handlerRPRefInfoEvent...", decodedEvt);
    
    // do nothing for current

    return true;
  }

  async handlerRPRevokeEvent(decodedEvt){
    this.logUtilSrv.logInfo("RpBizEvtHandler", "...handlerRPRevokeEvent...", decodedEvt);
    
    let evtParams = decodedEvt.args;
    let strRpCode = this.web3UtilSrv.convertHexToAscii(evtParams["_rpCode"]);
    // to update memory rp record status
    this.mapBizRecordMgr.get("RpCodeRecords").updateBizRecord(strRpCode, null);

    this.logUtilSrv.logInfo("handlerRPRevokeEvent", "...revoked rpRecord...", strRpCode);
    return true;
  }

};

module.exports = RpBizEvtHandler;