
const serviceFramework = require("../../framework/ServiceFramework");


class TxRecordsManager{
    constructor() {

      // map(txHash => {blockHash, blockNumber})
      this.mapTxRecords = new Map();
    }
    
    async init(){
      // do nothing
      this.logUtilSrv = serviceFramework.getService("UtilServiceInterface", "Log4UtilService");  
    }

    updateBizRecord(recordIndex, evtRecord){
      
      if(null == evtRecord){
        this.mapTxRecords.delete(recordIndex);

      }else{
        // new rpcode
        let txRecord = {
          "blockHash" : evtRecord.blockHash,
          "blockNumber" : evtRecord.blockNumber
        }

        this.mapTxRecords.set(recordIndex, txRecord);
      }
    }


    getBizRecord(recordIndex){
      return this.mapTxRecords.get(recordIndex);
    }

    async checkBizValidity(recordIndex){

      let tmpTxInfo = this.mapTxRecords.get(recordIndex);
      if(null == tmpTxInfo){
        this.logUtilSrv.logInfo("TxRecordsManager", "...checkBizValidity invalid_tx...", recordIndex);
        return false;
      }

      this.logUtilSrv.logInfo("TxRecordsManager", "...checkBizValidity valid_tx...", recordIndex);
      return true;
    }

}

module.exports = TxRecordsManager;