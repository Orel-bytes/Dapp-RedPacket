//JamesZhu. Support as backend execution to avoid UI freeze.
var Worker = require('tiny-worker');
// Worker.setRange(2, 20);

let path = require('path');
let basePath = path.parse(__filename).dir;
let serverWork = path.join(basePath,'./serverWork.js');

//const OfflineServiceEth = require("../services/offlineservice/OfflineServiceEth.js");
//const OfflineServiceWan = require("../services/offlineservice/OfflineServiceWan.js");
class EventMsgHandler {
    constructor() {
        this.msgMap = new Map();
        this.worker = new Worker(serverWork);
        let self = this;
        this.worker.onmessage = function (ev) {
            self.handleMsg(ev.data);
        }
    }

    requestPromiseData(reqId, reqData, promiseData) {
        // if(reqData.reqType == 'generateWanKeyStore'){
        //     let p = OfflineServiceWan.generateKeyStore.apply(null,reqData.args);
        // }
        this.msgMap.set(reqId, { reqData: reqData, promiseData: promiseData });
        this.worker.postMessage({ reqId: reqId, reqData: reqData });
    }

    resolvePromiseData(reqId, result) {
        this.msgMap.get(reqId).promiseData.resolve(result);
        this.msgMap.delete(reqId);
    }

    rejectPromiseData(reqId, error) {
        this.msgMap.get(reqId).promiseData.reject(error);
        this.msgMap.delete(reqId);
    }

    handleMsg(rspData) {
        if (rspData.error) {
            this.rejectPromiseData(rspData.reqId, rspData.error);
        } else {
            this.resolvePromiseData(rspData.reqId, rspData.result);
        }
    }

}

module.exports = EventMsgHandler;