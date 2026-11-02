const APIServiceInterface = require('../../interfaces/APIServiceInterface');
const serviceFramework = require("../../framework/ServiceFramework");
const rpServiceHandler = require("./RpServiceExpressHandler");
//导入 express 模块
const express = require('express');
const app = express();
const router = express.Router();

class ApiServiceExpress extends APIServiceInterface{
    
    /**
     *Creates an instance of BCConnectorIWan.
     * @param {*} option = {apiKey:'', secretKey:, urlOption:{}}
     * @memberof BCConnectorIWan
     */
    constructor() {
        super();

        this.rpServiceHandler = new rpServiceHandler();

    }

    async init(){
        // to scan rp db records and to get the timeout rp
        // this.configService = serviceFramework.getService("ConfigServiceInterface", "ConfigServiceJson");
        // this.webPort = await this.configService.getConfig("APIServiceInterface", "APIService", "webPort");    

        // this.rpApiServiceRouter.startUp(app);
        // router.route("/getRPInfo").get(rpServiceHandler.getRPInfo);
        // router.route("/getRPInfo").post(rpServiceHandler.getRPInfo);
        router.get("/getRPInfo", async(req, res, next) =>{
            let postdata = res.json(req.body);
            let result = await this.rpServiceHandler.handleGetRP(postdata);

            res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});//设置response编码为utf-8
            console.log("\n\n getRPInfo get response:");
            console.log(result);
            res.end(JSON.stringify(result));

            res.send();
        });

        router.post("/getRPInfo", async(req, res, next) =>{
            let postdata = res.json(req.body);
            let result = await this.rpServiceHandler.handleGetRP(postdata);

            res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});//设置response编码为utf-8
            console.log("\n\n getRPInfo post response:");
            console.log(result);
            res.end(JSON.stringify(result));

            res.send();
        });


        app.use(router);
    }

    startUp(){

        console.log('\n\n ......api service startUp......');
        var server = app.listen(3031, function () { //this.webPort
            var host = server.address().address
            var port = server.address().port          
            console.log("应用实例，访问地址丿http://", host, ":", port)          
        });
    }

}

module.exports = ApiServiceExpress;
