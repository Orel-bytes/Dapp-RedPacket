var crypto = require('crypto');

class EventPromisefy {
    constructor(eventMsgHandler) {
        this.eventMsgHandler = eventMsgHandler;
    }
    
    promise(reqType,reqId, args, timeout) {
        let myEventMsgHandler = this.eventMsgHandler;
        let ret = new Promise(function(resolve, reject) {
            let expTime = new Date().getTime() + timeout;
            myEventMsgHandler.requestPromiseData(reqId,{reqType:reqType,args:args}, {resolve, reject, expTime});
        });
        return ret;
    }
    static genRandomId(){
        return crypto.randomBytes(16).toString('hex');
    }
}

module.exports = EventPromisefy;