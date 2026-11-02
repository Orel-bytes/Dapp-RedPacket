'use strict';

const _ = require('lodash');
const TxObjectInterface = require("./TxObjectInterface.js");
const serviceFramework = require("../../framework/ServiceFramework");

module.exports = class ClaimRPTxObject extends TxObjectInterface {
    constructor(hostedChainServiceKey) {
        super(hostedChainServiceKey);
        this.m_logUtilSrv = serviceFramework.getService("UtilServiceInterface", "Log4UtilService"); 
    }

    // 1 程序启动时初始化
    async init(pendingQueue, candidateQueue, read_unsend_tx_from_db_max_length) {
        try {
            let configService = serviceFramework.getService("ConfigServiceInterface", "ConfigServiceJson");
            let StorageService = serviceFramework.getService("StorageServiceInterface", "StorageService");
            this.m_RpValidateServiceWan = serviceFramework.getService("ValidateServiceInterface", "RpValidateServiceWan");
            this.m_txGeneratorService = serviceFramework.getService("TxGeneratorServiceInterface", "TxGeneratorServiceWan");

            let checkParam = await configService.getConfig("HostedChainServiceInterface", "HostedChainService", "check");
            this.m_check_time_after_send = checkParam.check_time_after_send;
            this.m_confirm_discart_time_after_send = checkParam.confirm_discart_time_after_send;

            // init sc
            this.m_rp_sc_address = await configService.getConfig("HostedChainServiceInterface", "HostedChainService", "rp_sc_address");

            // 红包申请表
            let txClaimTableSchema = await configService.getGlobalConfig("rp_tx_table_schema");
            this.m_dbClaimRPTableInst = await StorageService.getDBIns(txClaimTableSchema.name);
            let rp_tx_Calim_send_history_table_schema = await configService.getGlobalConfig("rp_claim_history_table_schema");
            await StorageService.initDB(rp_tx_Calim_send_history_table_schema);
            this.m_dbClaimRP_send_history_table = await StorageService.getDBIns(rp_tx_Calim_send_history_table_schema.name);

            await this.init_claimRP_pending_queue_from_db(pendingQueue);
            await this.read_unsend_tx_from_db(candidateQueue, read_unsend_tx_from_db_max_length);
        }
        catch (err) {
            this.m_logUtilSrv.logError("ClaimRPTxObject", "init", err);
        }
    }

    // claimRP:第一次启动读取所有待校验数据
    async init_claimRP_pending_queue_from_db(pendingQueue) {
        try {
            let txAry = await this.m_dbClaimRPTableInst.findAllByOption({ "rpStatus": 1 }, { "rpTxNonce": 1 });
            for (let idx = 0; idx < txAry.length; ++idx) {
                let tx = txAry[idx];
                tx.hostedChainServiceKey = this.m_hostedChainServiceKey;
                pendingQueue.push(tx);
            }
        }
        catch (err) {
            this.m_logUtilSrv.logError("ClaimRPTxObject", "init_claimRP_pending_queue_from_db", err);
        }
    }

    // 2 从数据库读取指定数量的待发送数据
    async read_unsend_tx_from_db(candidateQueue, read_unsend_tx_from_db_max_length) {
        try {
            let txAry = await this.m_dbClaimRPTableInst.findByOption({ "rpStatus": 0 }, { "rpReceiveTs": 1 }, read_unsend_tx_from_db_max_length);
            for (let idx = 0; idx < txAry.length; ++idx) {
                let tx = txAry[idx];
                tx.hostedChainServiceKey = this.m_hostedChainServiceKey;
                candidateQueue.push(tx);
            }
        }
        catch (err) {
            this.m_logUtilSrv.logError("ClaimRPTxObject", "read_unsend_tx_from_db", err);
        }
    }

    // 3 交易发送前进行本地校验:true:继续发送上链,false:无需再发送上链
    async local_check_before_send(tx) {
        // true,表示有效可以上链,false无效无需再发送上链
        return await this.m_RpValidateServiceWan.checkBizValidity("RpCodeRecords", tx.rpCode);
    }

    // 4 本地校验不通过，不需要发送的交易直接更新状态
    async update_db_no_need_send(tx) {
        await this.m_dbClaimRPTableInst.updateOneByOption({ "_id": tx._id }, { $set: { "rpStatus": 10 } });
    }

    // 5 每个交易对象自己构造自己的交易JSON对象
    async get_raw_tx_obj(tx, gasPrice, gasLimit, nonce) {
        try {
            // let txData = this.m_tokenInst["ClaimRP"].getData.apply(null, [tx.rpCode, tx.rpClaimer, tx.rpRefCode]);// 0.20.7
            // let txData = this.m_offlineServiceWan.generateTxData();
            // let txData = this.m_tokenInst.methods.ClaimRP(web3Utils.asciiToHex(tx.rpCode), tx.rpClaimer, tx.rpRefCode).encodeABI();// 1.2.7
            let txData = await this.m_txGeneratorService.generatorTxData(this.m_rp_sc_address, "ClaimRP", tx);
            let rawTx = {
                "nonce": nonce,
                "gasPrice": gasPrice,
                "gasLimit": gasLimit,
                "to": this.m_rp_sc_address,
                "value": 0,
                "data": txData
            };
            return rawTx;
        }
        catch (err) {
            this.m_logUtilSrv.logError("ClaimRPTxObject", "get_raw_tx_obj", err);
            return null;
        }
    }

    // 6 向链上发送交易后，更新状态
    async update_db_after_send_tx(tx, gasPrice, tx_nonce, txHash) {
        try {
            // let sendRet = await this.signTxAndSend(tx, gasPrice, tx_nonce);
            tx.rpTxHash = txHash;
            tx.rpSendTs = _.now();
            tx.rpStatus = 1;
            tx.rpTxNonce = tx_nonce;
            tx.rpGasPrice = gasPrice;

            // update db
            let update_info = {
                $set: {
                    "rpStatus": tx.rpStatus,
                    "rpSendTs": tx.rpSendTs,
                    "rpTxHash": tx.rpTxHash,
                    "rpGasPrice": tx.rpGasPrice,
                    "rpTxNonce": tx.rpTxNonce
                }
            };
            // 记录历史
            await this.save_to_send_history(tx);
            let ret = await this.m_dbClaimRPTableInst.updateOneByOption({ "_id": tx._id }, update_info);
        }
        catch (err) {
            this.m_logUtilSrv.logError("ClaimRPTxObject", "update_db_after_send_tx", err);
        }
    }

    async save_to_send_history(tx) {
        try {
            let ret = await this.m_dbClaimRP_send_history_table.insert({
                rpWalletId: tx.rpWalletId,
                rpClaimer: tx.rpClaimer,
                rpCode: tx.rpCode,
                rpStartTime: tx.rpStartTime,
                rpRefCode: tx.rpRefCode,
                rpStatus: tx.rpStatus,
                rpReceiveTs: tx.rpReceiveTs,
                rpSendTs: tx.rpSendTs,
                rpTxNonce: tx.rpTxNonce,
                rpTxHash: tx.rpTxHash,
                rpGasPrice: tx.rpGasPrice,
                rpCheckTs: tx.rpCheckTs,
                rpSuccess: tx.rpSuccess
            });
        }
        catch (err) {
            this.m_logUtilSrv.logError("ClaimRPTxObject", "save_to_send_history", err);
        }
    }

    async update_history_by_hash(hash, checkTs, rpStatus, rpSuccess) {
        try {
            let ret = await this.m_dbClaimRP_send_history_table.updateOneByOption({ "rpTxHash": hash }, {
                $set: { "rpCheckTs": checkTs, "rpStatus": rpStatus, "rpSuccess": rpSuccess }
            });
        }
        catch (err) {
            this.m_logUtilSrv.logError("ClaimRPTxObject", "update_history_by_hash", err);
        }
    }

    // 7 校验交易前，判断是否发送后时间太短而需延迟校验
    //   true:需要延时暂不校验,false可以校验
    async need_delay_check(tx) {
        let now = _.now();
        if (now - tx.rpSendTs <= this.m_check_time_after_send) {
            return true;
        }
        return false;
    }

    // 8 根据hash,从本地已同步的数据中查询Receipt,如果查找到,则更新状态并返回true
    //   true: 本地已有同步数据, 无需再上链校验, false: 继续上链校验
    async local_check_tx_receipt(tx) {
        // 只要从同步结果数据库中查到,就是成功
        try {
            // true,表示内存中已有,false没找到,继续校验
            let tmpRecord = await this.m_RpValidateServiceWan.checkBizValidity("TxRecords", tx.rpTxHash);
            if (tmpRecord) {
                tx.rpSuccess = true;
                tx.rpCheckTs = _.now();
                tx.rpStatus = 2;
                await this.update_history_by_hash(tx.rpTxHash, tx.rpCheckTs, tx.rpStatus, tx.rpSuccess);
                await this.m_dbClaimRPTableInst.updateOneByOption({ "_id": tx._id }, { $set: { "rpStatus": tx.rpStatus, "rpCheckTs": tx.rpCheckTs, "rpSuccess": tx.rpSuccess } });
                return true;
            }
            return false;
        }
        catch (err) {
            this.m_logUtilSrv.logError("ClaimRPTxObject", "local_check_tx_receipt", err);
            return false;
        }
    }

    // 9 返回交易的hash值，从而hostedChainService不关心hash字段的具体名称
    get_hash(tx) {
        return tx.rpTxHash;
    }

    // 10 当hostedChainService根据hash从链上取到对应Receipt后,调用此函数,
    //    各交易可以更新自己的内部状态
    async update_by_transactionReceipt(tx, txReceipt) {
        try {
            if (txReceipt) {
                let bsuccess = false;
                if (txReceipt.status == "0x1" || txReceipt.status == true) {// 旧版0x0/0x1,1.2.6版true/false
                    bsuccess = true;
                }
                tx.rpCheckTs = _.now();
                tx.rpStatus = 2;
                await this.update_history_by_hash(tx.rpTxHash, tx.rpCheckTs, tx.rpStatus, bsuccess);
                await this.m_dbClaimRPTableInst.updateOneByOption({ "_id": tx._id }, {
                    $set: {
                        "rpStatus": tx.rpStatus,
                        "rpCheckTs": tx.rpCheckTs,
                        "rpSuccess": bsuccess,
                    }
                });
            }
        }
        catch (err) {
            this.m_logUtilSrv.logError("ClaimRPTxObject", "update_by_transactionReceipt", err);
        }
    }

    // 11 交易重发后，调用此函数，从而可更新历史数据等
    async update_for_resend(tx) {
        try {
            tx.rpTxNonce = 0;
            tx.rpStatus = 0;
            await this.update_history_by_hash(tx.rpTxHash, now, 10, false);// 10 表示出错
            await this.m_dbClaimRPTableInst.updateOneByOption({ "_id": tx._id }, { $set: { "rpStatus": 0 } });
        }
        catch (err) {
            this.m_logUtilSrv.logError("ClaimRPTxObject", "update_for_resend", err);
        }
    }

    // 12 超过规定时间认为交易已经被抛弃
    //    true:已超过规定延时,false:尚未超过规定延时
    async confirm_discart_tx(tx) {
        return ((_.now() - tx.rpSendTs) >= this.m_confirm_discart_time_after_send);
    }

    // 13 返回该笔交易的nonce,从而hostedChainService不必关心具体交易的nonce字段名
    get_nonce(tx) {
        return tx.rpTxNonce;
    }
}


