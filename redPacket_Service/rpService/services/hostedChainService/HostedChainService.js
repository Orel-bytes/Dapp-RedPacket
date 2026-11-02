'use strict';

const _ = require('lodash');
const HostedChainServiceInterface = require('../../interfaces/HostedChainServiceInterface');
const serviceFramework = require("../../framework/ServiceFramework");
const AccountNonceData = require("./accountNonceData.js");
const CandidateQueue = require("./candidateQueue.js")
const PendingQueue = require("./pendingQueue.js");
const ClaimRPTxObject = require("./ClaimRPTxObject.js");
const RevokeRPTxObject = require("./RevokeRPTxObject.js");
const FillNonceGapTxObject = require("./FillNonceGapTxObject.js");

//transaction underpriced
//replacement transaction underpriced
//insufficient funds for gas * price + value
//known transaction

module.exports = class HostedChainService extends HostedChainServiceInterface {
    constructor() {
        super();
        this.m_account_nonce_data = new AccountNonceData();
        this.m_candidate_queue = new CandidateQueue("rpReceiveTs");
        this.m_pending_queue = new PendingQueue("rpTxNonce");

        this.m_map_tx_object = new Map();

        this.m_pending_queue_max_length = 10;// pending_queue最大长度,大于等于该长度则不再发送
        this.m_read_unsend_tx_from_db_max_length = 100;// 每次从数据库读取多少待发数据
        this.m_loop_interval = 1000;// 无数据需要处理时,每次循环间隔时间
        this.m_loop_max_check_count = 10;

        this.m_chain_name = "WAN";
        this.m_gasPrice = 180000000000;
        this.m_gasLimit = 4700000;

        this.m_sign_account = "";
        this.m_log_prefix = "HostedChainService:";
        this.m_logUtilSrv = serviceFramework.getService("UtilServiceInterface", "Log4UtilService"); 
    }

    async init() {
        try {
            await this.inner_init();
            this.loop();
        }
        catch (err) {
            this.m_logUtilSrv.logError("HostedChainService", "init", err);
        }
    }

    async loop() {
        try {
            this.m_logUtilSrv.logDebug("hostedChainService","loop","");
            let binit_nonce = await this.init_account_nonce_data();
            if (binit_nonce) {
                this._inner_loop();
            }
            else {
                setTimeout(() => { this.loop(); }, this.m_loop_interval);
            }
        }
        catch (err) {
            this.m_logUtilSrv.logError("HostedChainService", "loop", err);
            setTimeout(() => { this.loop(); }, this.m_loop_interval);
        }
    }

    async _inner_loop() {
        try {
            this.m_logUtilSrv.logDebug("hostedChainService", "_inner_loop", "");
            // 1 启动check_task
            await this.check_pending_queue();

            // 2 启动send_task
            await this.send_candidate_queue();

            // 3 检测是否有nonce gap,如果存在,则构造简单交易补洞
            await this.check_nonce_gap();

            if (this.m_candidate_queue.size() <= 0 && this.m_pending_queue.size() <= 0) {
                setTimeout(() => { this._inner_loop(); }, this.m_loop_interval);
            }
            else {
                setTimeout(() => { this._inner_loop(); }, this.m_loop_interval / 2);
            }
        }
        catch (err) {
            this.m_logUtilSrv.logError("HostedChainService", "_inner_loop", err);
            setTimeout(() => { this._inner_loop(); }, this.m_loop_interval);
        }
    }

    async init_TxObjectMap() {
        let hostedChainServiceKey = "ClaimRP";
        let claimRPTxObject = new ClaimRPTxObject(hostedChainServiceKey);
        this.m_map_tx_object.set(hostedChainServiceKey, claimRPTxObject);

        hostedChainServiceKey = "RevokeRP";
        let revokeRPTxObject = new RevokeRPTxObject(hostedChainServiceKey);
        this.m_map_tx_object.set(hostedChainServiceKey, revokeRPTxObject);

        hostedChainServiceKey = "FillNonceGapTxObject";
        let fillNonceGapTxObject = new FillNonceGapTxObject(hostedChainServiceKey);
        this.m_map_tx_object.set(hostedChainServiceKey, fillNonceGapTxObject);

        this.m_logUtilSrv.logDebug("hostedChainService","m_map_tx_object:", this.m_map_tx_object);

        for (let [hostedChainServiceKey, txObject] of this.m_map_tx_object) {
            await txObject.init(this.m_pending_queue, this.m_candidate_queue, this.m_read_unsend_tx_from_db_max_length);
        }
    }

    async inner_init() {
        try {
            // config info
            let configService = serviceFramework.getService("ConfigServiceInterface", "ConfigServiceJson");
            let checkParam = await configService.getConfig("HostedChainServiceInterface", "HostedChainService", "check");
            this.m_pending_queue_max_length = checkParam.pending_queue_max_length;
            this.m_read_unsend_tx_from_db_max_length = checkParam.read_unsend_tx_from_db_max_length;
            this.m_loop_max_check_count = checkParam.loop_max_check_count;
            this.m_loop_interval = checkParam.loop_interval;

            this.m_chain_name = await configService.getConfig("HostedChainServiceInterface", "HostedChainService", "chain_name");
            this.m_gasPrice = await configService.getConfig("HostedChainServiceInterface", "HostedChainService", "gasPrice");
            this.m_gasLimit = await configService.getConfig("HostedChainServiceInterface", "HostedChainService", "gasLimit");

            this.m_sign_account = await configService.getConfig("HostedChainServiceInterface", "HostedChainService", "sign_account");

            this.m_iwanService = serviceFramework.getService("BCConnectorInterface", "IWanBCConnector");
            this.m_offlineServiceWan = serviceFramework.getService("OfflineServiceInterface", "OfflineServiceWan");

            await this.init_TxObjectMap();
        }
        catch (err) {
            this.m_logUtilSrv.logError("HostedChainService", "init", err);
        }
    }

    async init_account_nonce_data() {
        try {
            let chain_nonce = await this.m_iwanService.getNonce(this.m_chain_name, this.m_sign_account);
            chain_nonce = parseInt(chain_nonce);
            this.m_account_nonce_data.set_checked_nonce(chain_nonce);
            let chain_pending_nonce = chain_nonce;

            // 从pending_queue中取最大的nonce+1
            if (this.m_pending_queue.size() > 0) {
                let tx = this.m_pending_queue.tail();
                let txObj = this.m_map_tx_object.get(tx.hostedChainServiceKey);
                let tx_nonce = txObj.get_nonce(tx);
                if ((tx_nonce + 1) > chain_nonce) {
                    chain_pending_nonce = tx_nonce + 1;
                }
            }

            this.m_account_nonce_data.init_nonce(chain_pending_nonce);
            return true;
        }
        catch (err) {
            this.m_logUtilSrv.logError("HostedChainService", "init_account_nonce_data", err);
            if (err == "Websocket closed") {
                return false;
            }
            else if (err == 'Invalid JSON RPC response: ""'){
                return false;
            }
        }
    }

    async check_pending_queue() {
        try {
            let loop_check_count = this.m_pending_queue.size();
            if (loop_check_count > this.m_loop_max_check_count) {
                loop_check_count = this.m_loop_max_check_count;
            }

            for (let idx = 0; idx < loop_check_count; ++idx) {
                let tx = this.m_pending_queue.front();
                let txObj = this.m_map_tx_object.get(tx.hostedChainServiceKey);

                // 1 判断是否刚刚发送，需要延迟检测
                let need_delay_check = await txObj.need_delay_check(tx);
                if (need_delay_check) {
                    return;// 需要延时,直接返回
                }

                // 2 从本地已同步的数据中查询,从内存查询,根据hash查询
                //   本地找到返回true,否则false
                let blocal_check_result = await txObj.local_check_tx_receipt(tx);
                if (blocal_check_result) {
                    this.m_pending_queue.pop();
                    this.m_account_nonce_data.set_checked_nonce(txObj.get_nonce(tx));
                    continue;
                }

                // 3 从链上取transactionReceipt
                let txReceipt = await this.m_iwanService.getTransactionReceipt(this.m_chain_name, txObj.get_hash(tx));
                if (txReceipt) {
                    this.m_account_nonce_data.set_checked_nonce(txObj.get_nonce(tx));
                    this.m_pending_queue.pop();
                    await txObj.update_by_transactionReceipt(tx, txReceipt);
                    continue;
                }

                // 4 通过hash查询transaction,如果有,还在队列中
                let txTran = await this.m_iwanService.getTxInfo(this.m_chain_name, txObj.get_hash(tx));
                if (txTran) {
                    let bDiscard = txObj.confirm_discart_tx(tx);
                    if (bDiscard) {
                        // 超时一定时间,仍不上链,transaction还存在,只能是因为gasPrice低
                        this.m_account_nonce_data.release_nonce(txObj.get_nonce(tx));
                        await txObj.update_for_resend(tx);
                        this.m_pending_queue.pop();
                        this.m_candidate_queue.push(tx);
                        break;// 之后的交易肯定没有上链,不再继续校验
                    }
                    break;// 暂未超时,之后的交易肯定没有上链,不再继续校验
                }
                else {
                    // 5 没读取到TxInfo,认为交易已经被丢弃,实际情况下也可能不是在该节点提交的,只是没有同步过来
                    //   但是因为经过了延时,仍没同步过来,且之前的交易都已校验通过,所以即使重发也没问题,最多是
                    //   合约执行失败.
                    this.m_account_nonce_data.release_nonce(txObj.get_nonce(tx));
                    await txObj.update_for_resend(tx);
                    this.m_pending_queue.pop();
                    this.m_candidate_queue.push(tx);
                    break;// 之后的数据肯定没有上链,不再继续校验
                }
                break; // 之后的数据肯定没有上链, 不再继续校验
            }
        }
        catch (err) {
            this.m_logUtilSrv.logError("HostedChainService", "check_pending_queue", err);
            return;
        }
    }

    async send_candidate_queue() {
        try {
            let pending_length = this.m_pending_queue.size();
            let can_send_count = (this.m_pending_queue_max_length - pending_length);
            let candidate_length = this.m_candidate_queue.size();
            if (can_send_count > candidate_length) {
                let bret = await this.send_tx_loop(candidate_length);
                if (bret) {
                    await this.read_unsend_tx_from_db();
                    can_send_count = (can_send_count - candidate_length);
                    candidate_length = this.m_candidate_queue.size();
                    if (can_send_count > candidate_length) {
                        let bret = await this.send_tx_loop(candidate_length);
                    }
                    else {
                        let bret = await this.send_tx_loop(can_send_count);
                    }
                }
            }
            else {
                let bret = await this.send_tx_loop(can_send_count);
            }
        }
        catch (err) {
            this.m_logUtilSrv.logError("HostedChainService", "send_candidate_queue", err);
        }
    }

    async send_tx_loop(can_send_count) {
        try {
            for (let idx = 0; idx < can_send_count; ++idx) {
                let tx = this.m_candidate_queue.front();
                let txObj = this.m_map_tx_object.get(tx.hostedChainServiceKey);

                // 本地校验
                let local_check = await txObj.local_check_before_send(tx);
                if (!local_check) {
                    this.m_candidate_queue.pop();
                    await txObj.update_db_no_need_send(tx);
                    continue;
                }

                let ret = await this.send_tx_to_chain(tx, txObj);
                if (!ret.ret) {
                    return false;
                }

                await txObj.update_db_after_send_tx(tx, ret.gasPrice, ret.tx_nonce, ret.tx_hash);
                this.m_candidate_queue.pop();
                this.m_pending_queue.push(tx);
            }
            return true;
        }
        catch (err) {
            this.m_logUtilSrv.logError("HostedChainService", "send_tx_loop", err);
            return false;
        }
    }

    async send_tx_to_chain(tx, txObj) {
        try {
            let gasPrice = await this.get_gasPrice();
            let flag = 0;
            let gasPrice_times = 0;
            while (true) {
                let tx_nonce = this.m_account_nonce_data.get_nonce();
                switch (flag) {
                    case 1:
                        if (gasPrice_times >= 2) {
                            // 不能无限制提高gasPrice,最多提高两次,否则退出,稍后再发
                            this.m_account_nonce_data.release_nonce(tx_nonce);
                            return { "ret": false };
                        }
                        gasPrice = Math.ceil(gasPrice * 1.1);
                        ++gasPrice_times;
                        break;
                    default:
                        break;
                }

                let rawTx = await txObj.get_raw_tx_obj(tx, gasPrice, this.m_gasLimit, tx_nonce);
                let hexData = await this.m_offlineServiceWan.signTxEx(rawTx, this.m_sign_account);
                try {
                    let txHash = await this.m_iwanService.sendRawTransaction(this.m_chain_name, hexData);
                    return { "ret": true, "tx_hash": txHash, "tx_nonce": tx_nonce, "gasPrice": gasPrice };
                }
                catch (err) {
                    err = err.toLowerCase();
                    if (err == "nonce too low") {
                        // nonce 太低,增加nonce重发,当出现该错误,说明该nonce肯定已经上链
                        flag = 0;
                        continue;
                    }
                    else if (err == "websocket closed") {
                        // 网络断开,释放nonce
                        this.m_account_nonce_data.release_nonce(tx_nonce);
                        return { "ret": false };
                    }
                    else if (err == "transaction underpriced") {
                        this.m_account_nonce_data.release_nonce(tx_nonce);
                        flag = 1;
                        continue;
                    }
                    else if (err == "replacement transaction underpriced") {
                        this.m_account_nonce_data.release_nonce(tx_nonce);
                        flag = 1;
                        continue;
                    }
                    else if (err == "insufficient funds for gas * price + value") {
                        this.m_account_nonce_data.release_nonce(tx_nonce);
                        return { "ret": false };
                    }
                    else if (err == "known transaction") {
                        // 增加gasPrice替换原交易,增加gasPrice后,txHash肯定不再一样,替换原交易
                        this.m_account_nonce_data.release_nonce(tx_nonce);
                        flag = 1;
                        continue;
                    }
                    else if (err == 'Invalid JSON RPC response: ""') {
                        this.m_account_nonce_data.release_nonce(tx_nonce);
                        return { "ret": false };
                    }
                    else {
                        // 未知错误:释放nonce
                        this.m_logUtilSrv.logError("HostedChainService", "send_tx_to_chain", err);
                        this.m_account_nonce_data.release_nonce(tx_nonce);
                        return { "ret": false };
                    }
                }
            }
        }
        catch (err) {
            this.m_logUtilSrv.logError("HostedChainService", "send_tx_to_chain", err);
            return { "ret": false };
        }
    }

    async get_gasPrice() {
        return this.m_gasPrice;
    }

    async read_unsend_tx_from_db() {
        try {
            for (let [hostedChainServiceKey, txObject] of this.m_map_tx_object) {
                await txObject.read_unsend_tx_from_db(this.m_candidate_queue, this.m_read_unsend_tx_from_db_max_length);
            }
        }
        catch (err) {
            this.m_logUtilSrv.logError("HostedChainService", "read_unsend_tx_from_db", err);
        }
    }

    // 2 检测是否有nonce gap,如果存在,则构造简单交易补洞
    async check_nonce_gap() {
        if (this.m_account_nonce_data.exist_nonce_gap() && this.m_candidate_queue.size() == 0) {
            // 存在nonce_gap且待发送队列为空,则补充一条交易填补,
            // 当前逻辑下,使用一条交易即可避免出现空洞
            let tx = {
                rpReceiveTs: _.now(),
                rpStatus: 0,
                hostedChainServiceKey: "FillNonceGapTxObject" // TxObjectKey
            };
            this.m_candidate_queue.push(tx);
            let txObj = this.m_map_tx_object.get(tx.hostedChainServiceKey);
            await this.send_tx_loop(1, txObj);
        }
    }
}



