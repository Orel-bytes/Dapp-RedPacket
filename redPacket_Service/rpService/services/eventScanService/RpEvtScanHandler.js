
const serviceFramework = require("../../framework/ServiceFramework");
const hash = require('object-hash');


class RpEvtScanHandler {
  constructor(mapDbNameInst, mapScAddrAbi){
    this.mapDbNameInst = mapDbNameInst;
    this.mapScAddrAbi = mapScAddrAbi;
    this.chainType = "WAN";   
  }

  // based func
  init(){
    this.connector = serviceFramework.getService("BCConnectorInterface", "IWanBCConnector");
    this.web3UtilSrv = serviceFramework.getService("UtilServiceInterface", "Web3UtilService");
    this.logUtilSrv = serviceFramework.getService("UtilServiceInterface", "Log4UtilService");  

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

    }else if("RegWRCTokenLogger" == decodedEvt.eventName){
      result = await this.handlerWrcTokenRegEvent(decodedEvt); 

    }else if("RpGasFeeLogger" == decodedEvt.eventName){
      result = await this.handlerRpGasFeeEvent(decodedEvt); 

    }else if("RpMaxBonusConfigLogger" == decodedEvt.eventName){
      result = await this.handlerRpMaxBonusConfigEvent(decodedEvt);

    }else{

    }

    return result;
  }

  async handlerRPCreateEvent(decodedEvt){
    this.logUtilSrv.logInfo("RpEvtScanHandler", "...handlerRPCreateEvent...", decodedEvt);
    console.log("\n\n[RpEvtScanHandler] handlerRPCreateEvent:");
    console.log(decodedEvt);
    let dbInst = this.mapDbNameInst.get(decodedEvt.eventName);
    if(null == dbInst){
      this.logUtilSrv.logError("handlerRPCreateEvent", "...There is no db instance  for event...", decodedEvt.eventName);
      console.log("\n\n......[RpEvtScanHandler] There is no db instance  for event: " + decodedEvt.eventName);
      return true;
    }

    let blockInfo = null;
    try{
      blockInfo = await this.connector.getBlockByNumber(this.chainType, decodedEvt.blockNumber);
      // console.log(blockInfo);
      if((null == blockInfo) || (null == blockInfo.timestamp)){
        this.logUtilSrv.logError("handlerRPClaimEvent", "handlerRPCreateEvent...blockInfo is valid, try again later...", decodedEvt.blockNumber);
        console.log("\n\n......[RpEvtScanHandler] blockInfo is invalid, try again later!"); 
        return false;      
      }
    }catch(error){
      this.logUtilSrv.logError("handlerRPCreateEvent", "... getBlockByNumber is exception, try again later...", decodedEvt.blockNumber);
      console.log("\n\n......[RpEvtScanHandler] getBlockByNumber is exception, try again later!"); 
      return false;      
    }

    let evtParams = decodedEvt.args;
    let strRpCode = this.web3UtilSrv.convertHexToAscii(evtParams["_rpCode"]);
    let args = [evtParams["_rpCode"], blockInfo.timestamp.toString()];
    let scABI = this.mapScAddrAbi.get(decodedEvt.address);

    let rpCounts = 0;
    let rpMode = 0;
    try{
      let rpStatus = await this.connector.callScFunc(this.chainType, 
                                                    decodedEvt.address,
                                                    "mapRPRecord",
                                                    args,
                                                    scABI);
      rpCounts = parseInt(rpStatus[4]);
      rpMode = parseInt(rpStatus[5]); 
      // console.log("\n\n handlerRpCreateEvt: rp counts: ", rpCounts);
    }catch(error){
      console.log(error);
      console.log("\n\n......[handlerRPCreateEvent] callScFunc is exception, try again later!"); 
      this.logUtilSrv.logError("RpEvtScanHandler", "... callScFunc is exception, try again later...", decodedEvt.address);
      return false;      
    }

    let keyObj = {
      "rpCode": strRpCode,
      "rpTime": blockInfo.timestamp, 
    }
    let hashKeyObj = hash(keyObj);
    let filter = {
      "rpIndex" : hashKeyObj
    };

    let records = await dbInst.findByOption(filter, {}, 0);
    if(0 == records.length){
      let rpCreateDoc = {
        rpIndex: hashKeyObj,
        rpCode: strRpCode,
        rpStartTime: blockInfo.timestamp,
        rpSender: evtParams["_rpSender"].toLowerCase(),
        rpBonus: evtParams["_rpBonus"],
        rpRefBonus: evtParams["_rpRefBonus"],
        rpType: evtParams["_rpType"],
        rpMode: rpMode,
        rpTokenType: evtParams["_rpTokenType"].toLowerCase(),
        rpCounts: rpCounts,
        rpRestCounts: rpCounts,
        rpTxHash: decodedEvt.transactionHash,
        rpPrimeValCode: "",
        rpFinished: false
      }
      console.log(rpCreateDoc);
      this.logUtilSrv.logInfo("handlerRPCreateEvent", "...insert new create rp doc...", rpCreateDoc);
      await dbInst.insert(rpCreateDoc);   
    }

    return true;
  }

  async handlerRPClaimEvent(decodedEvt){
    this.logUtilSrv.logInfo("RpEvtScanHandler", "...handlerRPClaimEvent...", decodedEvt);
    console.log("\n\n [RpEvtScanHandler] handlerRPClaimEvent:");
    let dbInst = this.mapDbNameInst.get(decodedEvt.eventName);
    if(null == dbInst){
      this.logUtilSrv.logError("handlerRPClaimEvent", "...no db instance  for event...", decodedEvt.eventName);
      console.log("\n\n......[RpEvtScanHandler] There is no db instance  for event: " + decodedEvt.eventName);
      return true;
    }

    let blockInfo = null;
    try{
      blockInfo = await this.connector.getBlockByNumber(this.chainType, decodedEvt.blockNumber);
      // console.log(blockInfo);
      if((null == blockInfo) || (null == blockInfo.timestamp)){
        this.logUtilSrv.logError("handlerRPClaimEvent", "handlerRPClaimEvent...blockInfo is valid, try again later...", decodedEvt.blockNumber);
        console.log("\n\n......[RpEvtScanHandler] blockInfo is valid, try again later!"); 
        return false;      
      }
    }catch(error){
      this.logUtilSrv.logError("handlerRPClaimEvent", "...getBlockByNumber is exception, try again later...", decodedEvt.blockNumber);
      console.log("\n\n......[RpEvtScanHandler] getBlockByNumber is exception, try again later!"); 
      return false;      
    }

    let evtParams = decodedEvt.args;
    let strRpCode = this.web3UtilSrv.convertHexToAscii(evtParams["_rpCode"]);
    let keyObj = {
      "rpCode": strRpCode,
      "rpTime": parseInt(evtParams["_rpStartTime"]),
      "rpClaimer": evtParams["_rpClaimerAddr"].toLowerCase()
    };
    let hashKeyObj = hash(keyObj);    
    let filter = {
      "rpClaimIndex" : hashKeyObj
    };

    let records = await dbInst.findByOption(filter, {}, 0);
    if(0 == records.length){
      let rpClaimDoc = {
        rpClaimIndex: hashKeyObj, 
        rpCode: strRpCode,
        rpStartTime: evtParams["_rpStartTime"],
        rpClaimer: evtParams["_rpClaimerAddr"].toLowerCase(),
        rpBonus: evtParams["_rpBonus"],
        rpRefCode: evtParams["_rpRefCode"].toLowerCase(),
        rpClaimedTime: blockInfo.timestamp
      }
      // console.log(rpClaimDoc);
      this.logUtilSrv.logInfo("handlerRPClaimEvent", "...insert new rp claim doc...", rpClaimDoc);
      await dbInst.insert(rpClaimDoc);
    }

    // to update rp record finish status
    let rpRecordInst = this.mapDbNameInst.get("RedPacketCreateLogger");
    if(null == rpRecordInst){
      this.logUtilSrv.logError("handlerRPClaimEvent", "...no db instance  for rp record, try again later...", "RedPacketCreateLogger");
      console.log("\n\n......[RpEvtScanHandler] There is no db instance  for rp record");
      return;
    }
    let rpKeyObj = {
      "rpCode": strRpCode,
      "rpTime": parseInt(evtParams["_rpStartTime"])
    }
    let hashRpKeyObj = hash(rpKeyObj);    
    filter = {
      "rpIndex" : hashRpKeyObj
    };
    
    let updateOption = { $set: { "rpRestCounts": evtParams["_rpRestCounts"]} }
    await rpRecordInst.updateByOption(filter, updateOption);

    return true;
  }

  async handlerRPRefInfoEvent(decodedEvt){
    this.logUtilSrv.logInfo("RpEvtScanHandler", "...handlerRPRefInfoEvent...", decodedEvt);
    console.log("\n\n[RpEvtScanHandler] handlerRPRefInfoEvent:");
    let dbInst = this.mapDbNameInst.get(decodedEvt.eventName);
    if(null == dbInst){
      console.log("\n\n......[RpEvtScanHandler] There is no db instance  for event: " + decodedEvt.eventName);
      return true;
    }

    let blockInfo = null;
    try{
      blockInfo = await this.connector.getBlockByNumber(this.chainType, decodedEvt.blockNumber);
      // console.log(blockInfo);
      if((null == blockInfo) || (null == blockInfo.timestamp)){
        this.logUtilSrv.logError("RpEvtScanHandler", "handlerRPRefInfoEvent...blockInfo is valid, try again later!...", decodedEvt.blockNumber);
        console.log("\n\n......[RpEvtScanHandler] blockInfo is valid, try again later!"); 
        return false;      
      }
    }catch(error){
      console.log("\n\n......[RpEvtScanHandler] getBlockByNumber is exception, try again later!"); 
      return false;      
    }

    let evtParams = decodedEvt.args;
    let strRpCode = this.web3UtilSrv.convertHexToAscii(evtParams["_rpCode"]);
    let keyObj = {
      "rpCode": strRpCode,
      "rpTime":  parseInt(evtParams["_rpStartTime"]),
      "rpClaimer": evtParams["_rpClaimerAddr"].toLowerCase(),
      "rpRefCode": evtParams["_rpRefCode"].toLowerCase()
    }
    let hashKeyObj = hash(keyObj);
    let filter = {
      "rpRefIndex" : hashKeyObj
    };

    let records = await dbInst.findByOption(filter, {}, 0);
    if(0 == records.length){
      let rpRefDoc = {
        rpRefIndex: hashKeyObj, 
        rpCode: strRpCode, //evtParams["_rpCode"],
        rpStartTime: evtParams["_rpStartTime"],
        rpClaimer:  evtParams["_rpClaimerAddr"].toLowerCase(),
        rpRefCode: evtParams["_rpRefCode"].toLowerCase(),
        rpRefBonus:  evtParams["_refBonus"],
        rpReferredTime: blockInfo.timestamp
      }
      // console.log(rpRefDoc);
      this.logUtilSrv.logInfo("handlerRPRefInfoEvent", "...insert rpRefDoc...", rpRefDoc);
      await dbInst.insert(rpRefDoc);
    }

    return true;
  }

  async handlerRPRevokeEvent(decodedEvt){
    this.logUtilSrv.logInfo("RpEvtScanHandler", "...handlerRPRevokeEvent...", decodedEvt);
    console.log("\n\n[RpEvtScanHandler] handlerRPRevokeEvent:");
    // console.log(decodedEvt);
    let dbInst = this.mapDbNameInst.get(decodedEvt.eventName);
    if(null == dbInst){
      console.log("\n\n......[RpEvtScanHandler] There is no db instance  for event: " + decodedEvt.eventName);
      return true;
    }

    let blockInfo = null;
    try{
      blockInfo = await this.connector.getBlockByNumber(this.chainType, decodedEvt.blockNumber);
      if((null == blockInfo) || (null == blockInfo.timestamp)){
        this.logUtilSrv.logError("RpEvtScanHandler", "handlerRPRevokeEvent...blockInfo is valid, try again later!...", decodedEvt.blockNumber);
        console.log("\n\n......[RpEvtScanHandler] blockInfo is valid, try again later!"); 
        return false;      
      }
    }catch(error){
      console.log("\n\n......[RpEvtScanHandler] getBlockByNumber is exception, try again later!"); 
      return false;      
    }

    let evtParams = decodedEvt.args;
    let strRpCode = this.web3UtilSrv.convertHexToAscii(evtParams["_rpCode"]);
    let keyObj = {
      "rpCode": strRpCode,
      "rpTime": parseInt(evtParams["_rpStartTime"]),
    };
    let hashKeyObj = hash(keyObj);
    let filter = {
      "rpIndex" : hashKeyObj
    };

    let records = await dbInst.findByOption(filter, {}, 0);
    if(0 == records.length){
      let rpRevokedDoc = {
        rpIndex: hashKeyObj, 
        rpCode: strRpCode,
        rpStartTime: evtParams["_rpStartTime"],
        rpCreater: evtParams["_rpSender"].toLowerCase(),
        rpRevokedRpBonus:  evtParams["_rpBonus"],
        rpRevokedRefBonus:  evtParams["_rpRefBonus"],
        rpRevokedrpGasFee: evtParams["_rpGasFee"],
        rpRevokedTime: blockInfo.timestamp
      }
      // console.log(rpRevokedDoc);
      this.logUtilSrv.logInfo("handlerRPRevokeEvent", "...insert rpRevokedDoc...", rpRevokedDoc);
      await dbInst.insert(rpRevokedDoc);

      // to update rp record finish status
      let rpRecordInst = this.mapDbNameInst.get("RedPacketCreateLogger");
      if(null == rpRecordInst){
        console.log("\n\n......[RpEvtScanHandler] There is no db instance  for rp record");
        return;
      }
      let updateOption = { $set: { "rpFinished": true } }
      await rpRecordInst.updateByOption(filter, updateOption);
    }

    return true;
  }

  async handlerWrcTokenRegEvent(decodedEvt){
    console.log("\n\n[RpEvtScanHandler] handlerWrcTokenRegEvent:");
    this.logUtilSrv.logInfo("RpEvtScanHandler", "...handlerWrcTokenRegEvent...", decodedEvt);
    // console.log(decodedEvt);
    let dbInst = this.mapDbNameInst.get(decodedEvt.eventName);
    if(null == dbInst){
      console.log("\n\n......[RpEvtScanHandler] There is no db instance  for event: " + decodedEvt.eventName);
      return true;
    }

    let evtParams = decodedEvt.args;
    let keyObj = {
      "wrcAddr": evtParams["_tokenAddress"].toLowerCase()
    };
    let hashKeyObj = hash(keyObj);
    let filter = {
      "tokenIndex" : hashKeyObj
    };

    let records = await dbInst.findByOption(filter, {}, 0);
    if(0 == records.length){
      let rpRegTokenDoc = {
        tokenIndex: hashKeyObj, 
        tokenAddress: evtParams["_tokenAddress"].toLowerCase(),
        tokenSymbol: evtParams["_tokenSymbol"],
        tokenDecimals: evtParams["_tokenDecimals"]
      }
      // console.log(rpRegTokenDoc);
      this.logUtilSrv.logInfo("RpEvtScanHandler", "...insert rpRegTokenDoc...", rpRegTokenDoc);
      await dbInst.insert(rpRegTokenDoc);
    }

    return true;
  }

  async handlerRpGasFeeEvent(decodedEvt){
    console.log("\n\n[RpEvtScanHandler] handlerRpGasFeeEvent:");
    this.logUtilSrv.logInfo("RpEvtScanHandler", "...handlerRpGasFeeEvent...", decodedEvt);
    // console.log(decodedEvt);
    let dbInst = this.mapDbNameInst.get(decodedEvt.eventName);
    if(null == dbInst){
      console.log("\n\n......[RpEvtScanHandler] There is no db instance  for event: " + decodedEvt.eventName);
      return true;
    }

    let evtParams = decodedEvt.args;
    let filter = {};

    let records = await dbInst.findByOption(filter, {}, 0);
    if(0 == records.length){
      let rpGasFeeDoc = {
        rpGasFee: evtParams["_rpGasFee"],
        updateTs: evtParams["_configTs"]
      }
      // console.log(rpRegTokenDoc);
      this.logUtilSrv.logInfo("RpEvtScanHandler", "...insert rpGasFeeDoc...", rpGasFeeDoc);
      await dbInst.insert(rpGasFeeDoc);
    }else{
      let updateOption = { $set: { "rpGasFee": evtParams["_rpGasFee"], "updateTs": evtParams["_configTs"]} }
      await dbInst.updateByOption(filter, updateOption);  
    }

    return true;
  }

  async handlerRpMaxBonusConfigEvent(decodedEvt){
    console.log("\n\n[RpEvtScanHandler] handlerRpMaxBonusConfigEvent:");
    this.logUtilSrv.logInfo("RpEvtScanHandler", "...handlerRpMaxBonusConfigEvent...", decodedEvt);
    // console.log(decodedEvt);
    let dbInst = this.mapDbNameInst.get(decodedEvt.eventName);
    if(null == dbInst){
      console.log("\n\n......[RpEvtScanHandler] There is no db instance  for event: " + decodedEvt.eventName);
      return true;
    }

    let evtParams = decodedEvt.args;
    let keyObj = {
      "wrcAddr": evtParams["_tokenAddress"].toLowerCase()
    };
    let hashKeyObj = hash(keyObj);
    let filter = {
      "tokenIndex" : hashKeyObj
    };

    let records = await dbInst.findByOption(filter, {}, 0);
    if(0 == records.length){
      let rpRegTokenDoc = {
        tokenIndex: hashKeyObj, 
        tokenAddress: evtParams["_tokenAddress"].toLowerCase(),
        tokenRpMaxBonus: evtParams["_rpMaxBonus"]
      }
      // console.log(rpRegTokenDoc);
      this.logUtilSrv.logInfo("RpEvtScanHandler", "...insert rpRegTokenDoc...", rpRegTokenDoc);
      await dbInst.insert(rpRegTokenDoc);
    }else{
      let updateOption = { $set: { "tokenRpMaxBonus": evtParams["_rpMaxBonus"]} }
      await dbInst.updateByOption(filter, updateOption);  
    }

    return true;
  }


};

module.exports = RpEvtScanHandler;