'use strict';

module.exports = class TxObjectInterface {
    constructor(hostedChainServiceKey) {
        this.m_hostedChainServiceKey = hostedChainServiceKey;
    }
    // 1 程序启动时初始化
    async init(pendingQueue, candidateQueue, read_unsend_tx_from_db_max_length) {
        throw new Error("Abstract method!");
    }

    // 2 从数据库读取指定数量的待发送数据
    async read_unsend_tx_from_db(candidateQueue, read_unsend_tx_from_db_max_length) {
        throw new Error("Abstract method!");
    }

    // 3 交易发送前进行本地校验:true:继续发送上链,false:无需再发送上链
    async local_check_before_send(tx) {
        throw new Error("Abstract method!");
    }

    // 4 本地校验不通过，不需要发送的交易直接更新状态
    async update_db_no_need_send(tx) {
        throw new Error("Abstract method!");
    }

    // 5 每个交易对象自己构造自己的交易JSON对象
    async get_raw_tx_obj(tx, gasPrice, gasLimit, nonce) {
        throw new Error("Abstract method!");
    }

    // 6 向链上发送交易后，更新状态
    async update_db_after_send_tx(tx, gasPrice, tx_nonce, txHash) {
        throw new Error("Abstract method!");
    }

    // 7 校验交易前，判断是否发送后时间太短而需延迟校验
    //   true:需要延时暂不校验,false可以校验
    async need_delay_check(tx) {
        throw new Error("Abstract method!");
    }

    // 8 根据hash,从本地已同步的数据中查询Receipt,如果查找到,则更新状态并返回true
    //   true:本地已有同步数据,无需再上链校验,false:继续上链校验
    async local_check_tx_receipt(tx) {
        throw new Error("Abstract method!");
    }

    // 9 返回交易的hash值，从而hostedChainService不关心hash字段的具体名称
    get_hash(tx) {
        throw new Error("Abstract method!");
    }

    // 10 当hostedChainService根据hash从链上取到对应Receipt后,调用此函数,
    //    各交易可以更新自己的内部状态
    async update_by_transactionReceipt(tx, txReceipt) {
        throw new Error("Abstract method!");
    }

    // 11 交易重发后，调用此函数，从而可更新历史数据等
    async update_for_resend(tx) {
        throw new Error("Abstract method!");
    }

    // 12 超过规定时间认为交易已经被抛弃
    //    true:已超过规定延时,false:尚未超过规定延时
    async confirm_discart_tx(tx) {
        throw new Error("Abstract method!");
    }

    // 13 返回该笔交易的nonce,从而hostedChainService不必关心具体交易的nonce字段名
    get_nonce(tx) {
        throw new Error("Abstract method!");
    }
}


