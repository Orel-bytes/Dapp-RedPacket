
const serviceFramework = require("../../framework/ServiceFramework");

class RpServiceExpressHandler {
    
    /**
     *Creates an instance of BCConnectorIWan.
     * @param {*} option = {apiKey:'', secretKey:, urlOption:{}}
     * @memberof BCConnectorIWan
     */
    constructor() {
    }


    async init(){
        // to scan rp db records and to get the timeout rp
        this.storageSrvIns = serviceFramework.getService("StorageServiceInterface", "StorageService");
        let configService = serviceFramework.getService("ConfigServiceInterface", "ConfigServiceJson");

        let rpRequestSchema = await configService.getGlobalConfig("rp_tx_table_schema");
        console.log(rpRequestSchema);
        this.rpRequestDbInst = await this.storageSrvIns.initDB(rpRequestSchema);
    }


    // parse rp request from wallet 
    async handleGetRP(req){
        console.log(req);
        let that = this;
        let result = {};

        console.log('\n\n ......handleGetRP......');
        result.rpQueryResult = await that.getRPInfo(req);
        console.log(result);
        
        return result;
    }

    // parse rp request from wallet 
    async handleClaimRP(req){
        console.log(req);
        let that = this;
        let result = {};

        result.rpClaimIndex = await that.claimRP(req); 
        console.log("\n rpClaimIndex:");
        console.log(result);

        return result;
    }

    // handle rp query request
    async getRPInfo(rpReq){
        console.log("\n\n .....getRPInfo: ");

        let ret = {};

        // if("rpCreateHistoryQuery" == options.queryType){
        //     // to construct the reference rp filter
        //     let filter = {
        //         "rpCode" : options.rpCode
        //     };

        //     let rpCreateDbInst = await this.storageSrvIns.getDBIns("RedPacketCreateLogger");
        //     ret = await rpCreateDbInst.findByOption(filter, {}, 0);

        // }else if("rpClaimHistoryQuery" == options.queryType){
        //     // to construct the claim rp filter          
        //     let filter = {
        //         "rpClaimer" : options.rpClaimer
        //     };

        //     let rpClaimDbInst = await this.storageSrvIns.getDBIns("RedPacketClaimLogger");
        //     ret = await rpClaimDbInst.findByOption(filter);

        // }else if("rpClaimReqStatusQuery" == options.queryType){
        //     // to construct the rp filter            
        //     let filter = {
        //         "_id" : options.rqClaimId
        //     };

        //     ret = await this.rpRequestDbInst.findByOption(filter);           
        // }else{
        //     console.log("\n Invalid query index!!");
        // }

        return ret;
    }

    // just insert new rp request into db
    async claimRP(rpReq){
        // to check if request is already existed
        console.log("\n\n .....claimRP: ");
        console.log(rpReq);

        // let option = JSON.parse(rpReq);
        // console.log(option);
        // let result = await this.rpRequestDbInst.findByOption(option);
        // if(result.length > 0){
        //     console.log("\n\n already commit the rp claim request, please check:");
        //     console.log(result);
        //     return result[0]._id;
        // }

        // // "args":[]
        // let rpClaimDoc = {
        //     rpClaimer: option.rpClaimer,
        //     rpCode: option.rpCode,
        //     rpRefCode: (option.rpRefCode == undefined) ? null:option.rpRefCode,
        //     reqStatus: 0,
        //     reqReceiveTs: new Date().getTime(),
        //     reqSendTs: null,
        //     reqTxNonce: null,
        //     rpqTxHash: null,
        //     rpqGasPrice: null,
        //     reqCheckTs: null
        // }

        // let ret = await this.rpRequestDbInst.insert(rpClaimDoc); 
        // console.log("\n\n new commit the rp claim request:");
        // console.log(ret);
        return 10011; //ret._id;
    }
    
}

module.exports = RpServiceExpressHandler;
