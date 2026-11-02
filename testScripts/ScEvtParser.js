
"use strict";

const Web3 = require("web3")
const web3 = new Web3();

module.exports = class Contract {
  constructor() {
  }

  parseLogs(logs, abi) {
    if (logs === null || !Array.isArray(logs)) {
      return logs;
    }
  
    return logs.map(function (log) {
      let abiJson = abi.find(function (json) {
        return (json.type === 'event' && web3.eth.abi.encodeEventSignature(json) === log.topics[0]);
      });
  
      if (abiJson) {
        try {
          //topics without the topic[0] if its a non-anonymous event, otherwise with topic[0].
          log.topics.splice(0, 1);
          let args = web3.eth.abi.decodeLog(abiJson.inputs, log.data, log.topics);
          for (var index = 0; index < abiJson.inputs.length; index ++) {
            if (args.hasOwnProperty(index)) {
              delete args[index];
            }
          }
          log.eventName = abiJson.name;
          log.args = args;
          return log;
        } catch (err) {
          console.log(err);
          return log;
        }
      } else {
        return log;
      }
    });
  }

}