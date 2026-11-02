
const iWanClient = require('iwan-sdk');
const scABI = require('../config/abi/RedPacket_abi.json');
const eventParser = require("./ScEvtParser");
const Web3 = require("web3");
const web3 = new Web3();
const crypto = require('crypto')

const CryptoJS = require("crypto-js");

/*
let option = {
  url:"192.168.1.179",
  port:8443,
  flag:"ws",
  version:"v3"
};
let apiKey = "91a8670f630b36ef4585655979d0bde25370155b0a5cef7d62a5b371f6b6d993";
let secretKey = "1a891a522f250d1f1bd4fa5467f973537487db40c86b06f07d1f23f27a1b9076";
*/

/**/
let option = {
  url:"apitest.wanchain.org",
  port:8443,
  flag:"ws",
  version:"v3",
  timeout:300000,
};

let apiKey = "47f0102e75a41dccd836c849b0d16291e33522358ab8ba146cb17709161614b1";
let secretKey = "b803eed271c927719a72e9e729bb016c8de2770896abbc84278549a2385c0572";



let apiClient = new iWanClient(apiKey, secretKey, option);
console.log("\n\n\n\n new api instance......");

let evtParser = new eventParser();


async function main() {

  try {

    if(0){
    
    let hexRpCode = '0x' + crypto.createHash('sha256').update(Buffer.from("aaaaa", 'ascii')).digest('hex');
    console.log("crypto.createHash:",hexRpCode)
    
      
      /*
      let keyHash = web3.utils.asciiToHex("1008601").replace(/\u0000/g, "");
      console.log("\n keyHash: ", keyHash);
           
      let activeStartTime = await apiClient.getScMap('WAN', 
                                                    "0x620d5e083ecc80a3c66dc8445d0332fec8e0a568",
                                                    "mapRPCodeActiveTime",
                                                    keyHash,
                                                    scABI);
      console.log("activeStartTime is ", activeStartTime);
      console.log(typeof(activeStartTime));


      let rpStatus = await apiClient.callScFunc('WAN', 
                                                "0x620d5e083ecc80a3c66dc8445d0332fec8e0a568",
                                                "mapRPStatusInfo",
                                                ["0x3130303836303100000000000000000000000000000000000000000000000000", "1588820327"],
                                                scABI);
      console.log("rpStatus is: ");
      console.log(parseInt(rpStatus[0]));*/

      
      // let events = await apiClient.getScEvent(
      //   'WAN', 
      //   "0x620d5e083ecc80a3c66dc8445d0332fec8e0a568", 
      //   [], 
      //   {
      //     "fromBlock":3550,
      //     "toBlock":3600
      //   });
      // console.log("events is: ");
      // console.log(events);
      // console.log(scABI);

      // let decodedEvts = evtParser.parseLogs(events, scABI);
      // console.log("decodedEvts is: ");
      // console.log(decodedEvts);
      // for(let i=0; i<decodedEvts.length; i++){
      //   let decodedEvt = decodedEvts[i];
      //   let evtParams = decodedEvt.args;         
      //   console.log(evtParams['__length__']);      
      //   console.log(typeof(evtParams));
      // }

    }else{
       /*  
      let createdRpInfoRslt = await apiClient.fetchService('rponchainservice', 
                                                "getRPInfo",  
                                                "POST", 
                                                {"queryType": "CreatedRpHistoryQuery",
                                                "reqSender":["0xb25f3ad042e84928046abde93d51d554670a33e3"]});
      console.log("\n ....createdRpInfoRslt:");
      console.log(createdRpInfoRslt);
      for(let i=0; i<createdRpInfoRslt.length; i++){
        let rpBasicData = createdRpInfoRslt[i];
        console.log("\n ....rpBasicData:");
        console.log(rpBasicData);
        let rpDetailData = await apiClient.fetchService('rponchainservice', 
                                            "getRPInfo",  
                                            "POST", 
                                            {"queryType": "CreatedRpDetailQuery",
                                             "rpCode": rpBasicData.rpCode,
                                             "rpStartTime": rpBasicData.rpStartTime});
        console.log("\n\n ....rpDetailData about ", rpBasicData.rpCode);      
        console.log(rpDetailData);
      } */ 
                                    
                          /**/
      let createdRpInfoRslt = await apiClient.fetchSpecialService('http://34.210.227.55:3031/getRPInfo', 
                                                "POST", 
                                                {"queryType": "CreatedRpHistoryQuery",
                                                "reqSender":["0x52f1045671f56f572f7743232b558ddca0627e10"]});
      // let result = await apiClient.fetchService('bp', "get_account",  "GET", {"account_name":"eosio.token"});
      console.log("\n ....createdRpInfoRslt:");
      console.log(createdRpInfoRslt); 
      for(let i=0; i<createdRpInfoRslt.length; i++){
        let rpBasicData = createdRpInfoRslt[i];
        console.log("\n ....rpBasicData:");
        console.log(rpBasicData);
        let rpDetailData = await apiClient.fetchSpecialService('http://34.210.227.55:3031/getRPInfo',  
                                            "POST", 
                                            {"queryType": "CreatedRpDetailQuery",
                                             "rpCode": rpBasicData.rpCode,
                                             "rpStartTime": rpBasicData.rpStartTime});
        console.log("\n\n ....rpDetailData about ", rpBasicData.rpCode);      
        console.log(rpDetailData);
      } 
     
      
      let wrp1 =  '0x' + CryptoJS.SHA256("0001");
      console.log("CryptoJS aaaaa:",wrp1)
      
        
      //let hexRpCode = '0x' + crypto.createHash('sha256').update(Buffer.from("da003602", 'ascii')).digest('hex');
      //console.log("crypto.createHash:",hexRpCode)
    
      /*
      let claimRPRslt = await apiClient.fetchService('rponchainservice', 
                                            "claimRP",  
                                            "POST", 
                                            {"rpClaimer": "0x57dbA8Ef0613D2C023E590Ef958311691E3f5a3E",
                                            "rpCode":"wl100080",
                                            "walletID": "0xeCec0C66388FD15DC4159851712B47F817116068"});
      console.log("\n\n\nfetchService claimRP result: ");
      console.log(claimRPRslt);*/
      
    /*
      let claimRPRslt = await apiClient.fetchSpecialService('http://34.210.227.55:3031/claimRP',  
                                            "POST", 
                                            {"rpClaimer": "0xb25f3aD042e84928046ABDE93d51d554670a33E3",
                                            "rpCode": "0001",
                                            "walletID": "0x2234A8Ef0613D2C023E590Ef958311691E3f5a3F"});
      console.log("\n\n\nfetchService claimRP result: ");
      console.log(claimRPRslt);          
    
       
      let claimedRpInfoRslt = await apiClient.fetchService('rponchainservice', 
                                                "getRPInfo",  
                                                "POST", 
                                                {"queryType": "ClaimedRpHistoryQuery",
                                                "reqSender":["0xeCec0C66388FD15DC4159851712B47F817116068",
                                                            "0x57dbA8Ef0613D2C023E590Ef958311691E3f5a3E"]});
      console.log("\n\n......fetchService claimedRpInfoRslt result: ");
      console.log(claimedRpInfoRslt); */  
      
      /**/
      let claimedRpInfoRslt = await apiClient.fetchSpecialService('http://34.210.227.55:3031/getRPInfo',
                                                "POST", 
                                                {"queryType": "ClaimedRpHistoryQuery",
                                                "reqSender":["0xb25f3ad042e84928046abde93d51d554670a33e3"]});
      console.log("\n\n......fetchService claimedRpInfoRslt result: ");
      console.log(claimedRpInfoRslt);
      
     /*
      let RpTokenInfo = await apiClient.fetchService('rponchainservice', 
                                            "getRPRegToken",  
                                            "POST", 
                                            {});
      console.log("\n\n\n getRPRegToken result: ");      
      console.log(RpTokenInfo);
      
    
      let RpGasFee = await apiClient.fetchService('rponchainservice', 
                                            "getRPGasFee",  
                                            "POST", 
                                            {});
      console.log("\n\n\n RpGasFee result: ");      
      console.log(RpGasFee);
      */
      
      /**/
      let RpGasFee = await apiClient.fetchSpecialService('http://34.210.227.55:3031/getRPGasFee',  
                                            "POST",
                                            {});
      console.log("\n\n\n RpGasFee result: ");      
      console.log(RpGasFee);
     
     
      let RpTokenInfo = await apiClient.fetchSpecialService('http://34.210.227.55:3031/getRPRegToken', 
                                                "POST", 
                                                {});
      console.log("\n\n\n getRPRegToken result: ");      
      console.log(RpTokenInfo);
      
      
     
    }
   
  } catch (err) {
    console.log("request is failed");
    console.log(err);
  }

  // apiClient.close();
  
}

main();




// let result = await apiClient.fetchService('bp', "get_info",  "GET");
// let result = await apiClient.fetchService('bp', "get_account",  "GET", {"account_name":"eosio.token"});
// console.log("fetchService result: "+result);
