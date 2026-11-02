const APIServiceInterface = require('../../interfaces/APIServiceInterface');
const serviceFramework = require("../../framework/ServiceFramework");

//导入http模块
var http=require('http');

class ApiService extends APIServiceInterface{
    
    /**
     *Creates an instance of BCConnectorIWan.
     * @param {*} option = {apiKey:'', secretKey:, urlOption:{}}
     * @memberof BCConnectorIWan
     */
    constructor() {
        super();

    }

    async init(){

        this.rpRouterService = serviceFramework.getService("EndPointServiceInterface", "RpRouterService");
        this.configService = serviceFramework.getService("ConfigServiceInterface", "ConfigServiceJson");
        this.webPort = await this.configService.getConfig("APIServiceInterface", "APIService", "webPort");  
    }

    async startUp(){
        console.log('\n\n ......api service startUp......');

        let that = this;

        http.createServer(function(request,response){
            console.log(request.url);

            request.setEncoding('utf-8');
            console.log('\n\n ......rpRequest beginning......');
        
            let postData = "";
            // 数据块接收中
            request.on("data", function(postDataChunk){
                postData += postDataChunk;
            });
        
            request.on("end", async function(){
                let result = await that.rpRouterService.handlerRequest(request.url, postData);
                
                response.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});//设置response编码为utf-8
                console.log("\n\n response:");
                console.log(result);
                response.end(JSON.stringify(result));
            });
        
        }).listen(this.webPort);

    }

    
}

module.exports = ApiService;
