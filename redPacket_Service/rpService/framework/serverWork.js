let path = require('path');
let basePath = path.parse(__filename).dir;
console.log('serverWork.basePath', basePath);
console.log('serverWork.__dirname', __dirname);
// const OfflineServiceEth = require.resolve(path.join(basePath,'../services/offlineservice/OfflineServiceEth'));
// const OfflineServiceWan = require.resolve(path.join(basePath,'../services/offlineservice/OfflineServiceWan'));
// Note it is hard coded for tiny-worker environment about path.
const OfflineServiceEth = require(path.join(basePath, "../../../src/backend/services/offlineservice/OfflineServiceEth.js"));
const OfflineServiceWan = require(path.join(basePath, "../../../src/backend/services/offlineservice/OfflineServiceWan.js"));

let serverWork = {
    "generateWanKeyStore": OfflineServiceWan.generateKeyStore,
    "generateEthKeyStore": OfflineServiceEth.generateKeyStore,
    "loadEthKeyStore": OfflineServiceEth.loadKeyStore,
    "loadWanKeyStore": OfflineServiceWan.loadKeyStore,
    "test": () => {let a =10.; for(let i = 0; i< 10000000000;i++){ a+=i*0.20/0.440;}return 'fdsfdsfsdfsffd' }
};

onmessage = function (ev) {
    // const data = dataFormatter(ev.data);
    // postMessage(data);
    let rspData = { rspType: ev.data.reqData.reqType, reqId: ev.data.reqId };
    try {
        rspData.result = serverWork[ev.data.reqData.reqType].apply(null, ev.data.reqData.args);
    } catch (error) {
        rspData.error = error.message;
    }

    postMessage(rspData);
};