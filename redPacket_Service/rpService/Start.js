const serviceFramework = require( "./framework/ServiceFramework");
const TaskService = require('./services/taskservice/TaskSchedule');
// const TxService = require("./services/txService/txService");
const ApiService = require("./services/apiService/ApiService");
const StorageService = require( "./services/storageservice/StorageService");
const StorageMongoDB = require( "./services/storageservice/StorageMongoDB");
const IWanBCConnector = require('./services/onlineservice/IWanBCConnector');
const OnlineServiceWan = require('./services/onlineservice/OnlineServiceWan');
const OfflineServiceWan = require('./services/offlineservice/OfflineServiceWan');
const HostedChainService = require("./services/hostedChainService/HostedChainService");
const ConfigServiceJson = require('./services/configservice/ConfigServiceJson');
const AccountService = require("./services/accountservice/AccountService");
const EvtScanServiceWan = require("./services/eventScanService/EvtScanServiceWan");
const RpValidateServiceWan = require('./services/rpValidateService/RpValidateServiceWan');
const RpRouterService = require('./services/endPointService/RpRouterService');
const TxGeneratorServiceWan = require('./services/txgeneratorservice/TxGeneratorServiceWan');
const Web3UtilService = require('./services/utilService/Web3UtilService');
const Log4UtilService = require('./services/utilService/Log4UtilService');


const GlobalConstant = require("./services/globalConstantService/globalConstant");

const path = require('path');
const fs = require('fs');

/**
 * 判读路径是否存在,如不存在则递归创建文件夹
 * @param pathStr 参数要用path.join()拼接,项目下的相对路径
 * @return projectPath 返回绝对路径,可要可不要
 */
function mkdirPathInProject(pathStr) {
    var projectPath=global.appDataPath;
    var tempDirArray=pathStr.split('\\');
    for (var i = 0; i < tempDirArray.length; i++) {
        projectPath = path.join(projectPath,tempDirArray[i]);
        if (fs.existsSync(projectPath)) {
            var tempstats = fs.statSync(projectPath);
            if (!(tempstats.isDirectory())) {
                fs.unlinkSync(projectPath);
                fs.mkdirSync(projectPath);
            }
        }
        else{
            fs.mkdirSync(projectPath);
        }
    }
    return projectPath;
}

class Start {
    constructor(options) {
    }
    //启动流程：
    //1 加载配置文件
    //2 加载AccountService: 账户keystore信息
    //3 根据配置文件连接数据库
    //4 初始化iwan连接
    //5 离线签名服务
    //6 初始化hostedChainService
    async start() {
        try {
            console.log("Start.start()****************************")
            serviceFramework.registerService("GlobalConstantService", "GlobalConstant", GlobalConstant);
            
            // Config Service
            let cfgDir = path.join(__dirname,'../config');
            let configServiceJson = new ConfigServiceJson(cfgDir);
            await configServiceJson.init();
            serviceFramework.registerService("ConfigServiceInterface", "ConfigServiceJson", configServiceJson);

            let accountService = new AccountService();
            serviceFramework.registerService("AccountServiceInterface", "AccountService", accountService);
            accountService.init();

            // Web3UtilService Service
            let web3UtilService = new Web3UtilService();
            serviceFramework.registerService("UtilServiceInterface", "Web3UtilService", web3UtilService);

            // Log4UtilService Service
            let log4UtilService = new Log4UtilService();
            log4UtilService.init();
            serviceFramework.registerService("UtilServiceInterface", "Log4UtilService", log4UtilService);

            // Storage Service
            let mongoUrl = await configServiceJson.getGlobalConfig("mongo_url");
            let storageService = new StorageService(mongoUrl, StorageMongoDB);
            storageService.init();
            serviceFramework.registerService("StorageServiceInterface", "StorageService", storageService);

            // Connect Service
            let connectConfig = await configServiceJson.getConfig('OnlineServiceInterface', 'OnlineServiceWan', 'connector');
            console.log("connectConfig.option.option:", connectConfig.option.option);
            let connector;
            switch (connectConfig.type) {
                case 'iwan': {
                    connector = new IWanBCConnector(connectConfig.option);
                    break;
                }
                case 'web3': {
                    break;
                }
                default:
                    throw Error('unsupported block chain connector type: ' + connectType);
            }
            serviceFramework.registerService("BCConnectorInterface", "IWanBCConnector", connector);

            // Task Service
            let taskService = new TaskService();
            serviceFramework.registerService("TaskServiceInterface","taskSchedule", taskService);

            // Offline Service
            let offlineServiceWan = new OfflineServiceWan(accountService);
            serviceFramework.registerService("OfflineServiceInterface", "OfflineServiceWan", offlineServiceWan);

            // Onchain Service
            let onlineServiceWan = new OnlineServiceWan(connector);
            serviceFramework.registerService("OnlineServiceInterface", "OnlineServiceWan", onlineServiceWan);

            // txGeneratorService
            let txGeneratorServiceWan = new TxGeneratorServiceWan();
            serviceFramework.registerService("TxGeneratorServiceInterface", "TxGeneratorServiceWan", txGeneratorServiceWan);
            await txGeneratorServiceWan.init();
            
            // EvtScanServiceWan Service
            let evtScanService = new EvtScanServiceWan();
            serviceFramework.registerService("EventScanServiceInterface", "EvtScanServiceWan", evtScanService);
            await evtScanService.init();

            // biz synced data manager service
            let rpValidationServiceWan = new RpValidateServiceWan();
            serviceFramework.registerService("ValidateServiceInterface", "RpValidateServiceWan", rpValidationServiceWan);
            await rpValidationServiceWan.init();
            await evtScanService.startUp();
            await rpValidationServiceWan.startUp();

            // RpRouterService
            let rpRouterService = new RpRouterService();
            serviceFramework.registerService("EndPointServiceInterface", "RpRouterService", rpRouterService);
            await rpRouterService.init();
            
            // ApiService Service
            let apiService = new ApiService(connector);
            serviceFramework.registerService("APIServiceInterface", "RPApiService", apiService);
            await apiService.init();
            await apiService.startUp();

            let hostedChainService = new HostedChainService();
            await hostedChainService.init();
            serviceFramework.registerService("HostedChainServiceInterface", "HostedChainService", hostedChainService);


            //// Context Service
            //let contextService = new ContextService(storageService);
            //await contextService.init();
            //serviceFramework.registerService("ContextServiceInterface", "ContextService", contextService);


            // Account Service
            //let wanKeyStoreWalletService = new WanKeyStoreWalletService(storageService,contextService);
            //let keyStoreDir = await configServiceJson.getConfig('WalletServiceInterface','WanKeyStoreWalletService','keyStoreDir');//'keystore';
            //keyStoreDir = mkdirPathInProject(keyStoreDir);
            //await wanKeyStoreWalletService.initWallet(keyStoreDir);
            //serviceFramework.registerService("WalletServiceInterface", "WanKeyStoreWalletService", wanKeyStoreWalletService);

            //// txGenerator Service
            //let txGeneratorConfig =  await configServiceJson.getConfig('TxGeneratorServiceInterface','TxGeneratorServiceWan');
            //let txGeneratorServiceWan = new TxGeneratorServiceWan(txGeneratorConfig);
            //serviceFramework.registerService("TxGeneratorServiceInterface", "TxGeneratorServiceWan", txGeneratorServiceWan);

            //// tx Service
            //let txService = new TxService();
            //await txService.init();
            //serviceFramework.registerService("txServiceInterface", "txService", txService);


        }
        catch (err) {
            console.log("err message:", err.message);
            console.log("err stack:", err.stack);
        }
    }
}

let start = new Start();
start.start();
console.log("running...");

module.exports = start;
