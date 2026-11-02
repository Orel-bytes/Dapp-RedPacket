'use strict';

const _ = require('lodash');
const TxObjectInterface = require("./TxObjectInterface.js");
const serviceFramework = require("../../framework/ServiceFramework");

module.exports = class FillNonceGapTxObject extends TxObjectInterface {
    constructor(hostedChainServiceKey) {
        super(hostedChainServiceKey);
        this.m_logUtilSrv = serviceFramework.getService("UtilServiceInterface", "Log4UtilService");
    }

    // 1 程序启动时初始化
    async init(pendingQueue, candidateQueue, read_unsend_tx_from_db_max_length) {
        try {
            let configService = serviceFramework.getService("ConfigServiceInterface", "ConfigServiceJson");
            this.m_sign_account = await configService.getConfig("HostedChainServiceInterface", "HostedChainService", "sign_account");

            let rp_tx_fill_nonce_gap_schema = await configService.getGlobalConfig("rp_tx_fill_nonce_gap_schema");

            let StorageService = serviceFramework.getService("StorageServiceInterface", "StorageService");
            await StorageService.initDB(rp_tx_fill_nonce_gap_schema);
            this.m_db_fill_nonce_gap_table = await StorageService.getDBIns(rp_tx_fill_nonce_gap_schema.name);

            let checkParam = await configService.getConfig("HostedChainServiceInterface", "HostedChainService", "check");
            this.m_check_time_after_send = checkParam.check_time_after_send;
            this.m_confirm_discart_time_after_send = checkParam.confirm_discart_time_after_send;

            await this.init_pending_queue_from_db(pendingQueue);
        }
        catch (err) {
            this.m_logUtilSrv.logError("FillNonceGapTxObject", "init", err);
        }
    }

    // 启动时读取所有待校验数据
    async init_pending_queue_from_db(pendingQueue) {
        try {
            let txAry = await this.m_db_fill_nonce_gap_table.findAllByOption({ "rpStatus": 1 }, { "rpTxNonce": 1 });
            for (let idx = 0; idx < txAry.length; ++idx) {
                let tx = txAry[idx];
                tx.hostedChainServiceKey = this.m_hostedChainServiceKey;
                pendingQueue.push(tx);
            }
        }
        catch (err) {
            this.m_logUtilSrv.logError("FillNonceGapTxObject", "init_pending_queue_from_db", err);
        }
    }

    // 2 从数据库读取指定数量的待发送数据
    //   此处不需要
    async read_unsend_tx_from_db(candidateQueue, read_unsend_tx_from_db_max_length) {

    }

    // 3 交易发送前进行本地校验:true:继续发送上链,false:无需再发送上链
    //   此处不需要校验,必须上链
    async local_check_before_send(tx) {
        return true;
    }

    // 4 本地校验不通过，不需要发送的交易直接更新状态
    ///  本处不需要处理
    async update_db_no_need_send(tx) {
    }

    // 5 每个交易对象自己构造自己的交易JSON对象
    //   构造简单转账交易,给自己转账1wei
    async get_raw_tx_obj(tx, gasPrice, gasLimit, nonce) {
        let rawTx = {
            "nonce": nonce,
            "gasPrice": gasPrice,
            "gasLimit": gasLimit,
            "to": this.m_sign_account,
            "value": 1,
            "data": ""
        };
        return rawTx;
    }

    // 6 向链上发送交易后，更新状态
    async update_db_after_send_tx(tx, gasPrice, tx_nonce, txHash) {
        try {
            tx.rpTxNonce = tx_nonce;
            tx.rpTxHash = txHash;
            tx.rpSendTs = _.now();
            tx.rpGasPrice = gasPrice;
            tx.rpStatus = 1;

            // 记录历史
            let ret = await this.m_db_fill_nonce_gap_table.insert(tx);
        }
        catch (err) {
            this.m_logUtilSrv.logError("FillNonceGapTxObject", "update_db_after_send_tx", err);
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
    //   true:本地已有同步数据,无需再上链校验,false:继续上链校验
    //   此处只能上链校验
    async local_check_tx_receipt(tx) {
        return false;
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
                await this.m_db_fill_nonce_gap_table.updateOneByOption({ "rpTxHash": tx.rpTxHash }, {
                    $set: {
                        "rpStatus": tx.rpStatus,
                        "rpCheckTs": tx.rpCheckTs,
                        "rpSuccess": bsuccess,
                    }
                });
            }
        }
        catch (err) {
            this.m_logUtilSrv.logError("FillNonceGapTxObject", "update_by_transactionReceipt", err);
        }
    }

    // 11 交易重发后，调用此函数，从而可更新历史数据等
    //    此处无需处理
    async update_for_resend(tx) {
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


