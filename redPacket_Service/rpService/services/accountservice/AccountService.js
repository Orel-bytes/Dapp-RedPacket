const fs = require('fs');
const path = require('path');
const keythereum = require('keythereum');
const RpscAccountConf = require('./AccountConfig');
const AccountServiceInterface = require('../../interfaces/AccountServiceInterface');

class AccountService extends AccountServiceInterface {
    constructor() {
        super();

        this.mapRPSCInsAccount = new Map();
    }
    
    init(){

        let rpscAccountArray = RpscAccountConf.RegRPSCAccountArray;
        for(let i=0; i<rpscAccountArray.length; i++){
            let rpscAccount = rpscAccountArray[i];

            this.registerRPAccount(rpscAccount);
        }
    }

    registerRPAccount(account){

        let accountAddr = account["ksID"]; 
        let accountPwd =  account["ksPWD"];

        let keyFilePath = path.join(__dirname, 'keystores', accountAddr);
        let keyFile = fs.readFileSync(keyFilePath,"utf8");

        let keystore = JSON.parse(keyFile);
        let privateKey = keythereum.recover(accountPwd, keystore);

        this.mapRPSCInsAccount.set(accountAddr.toLowerCase(), privateKey);
    }

    getAccountPrivateKey(accountAddr){
        
        return this.mapRPSCInsAccount.get(accountAddr.toLowerCase());
    }
    
}

module.exports = AccountService;
