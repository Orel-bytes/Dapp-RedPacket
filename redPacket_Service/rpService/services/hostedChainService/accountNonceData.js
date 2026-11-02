'use strict';

const _ = require('lodash');


module.exports = class AccountNonce {
    constructor() {
        this.m_checked_nonce = -1;
        this.m_pending_nonce = 0;
        this.m_account_nonce = [];
    }

    init_nonce(chain_pending_nonce) {
        this.m_pending_nonce = chain_pending_nonce;
    }

    get_nonce() {
        if (this.m_account_nonce.length > 0) {
            return this.m_account_nonce.shift();
        }
        else{
            let nonce = this.m_pending_nonce;
            ++this.m_pending_nonce;
            return nonce;
        }
    }

    peek_nonce() {
        if (this.m_account_nonce.length > 0) {
            return this.m_account_nonce[0];
        }
        else {
            return this.m_pending_nonce;
        }
    }

    release_nonce(nonce) {
        if (nonce >= this.m_pending_nonce) {
            return;
        }
        this.m_account_nonce.push(nonce);
        this.m_account_nonce = _.sortBy(this.m_account_nonce);
    }

    // 交易校验通过后,记录一个最大的已确认的nonce值
    set_checked_nonce(checked_nonce) {
        if (checked_nonce > this.m_checked_nonce) {
            this.m_checked_nonce = checked_nonce;
        }
    }

    peek_checked_nonce() {
        return this.m_checked_nonce;
    }

    exist_nonce_gap() {
        // m_account_nonce有数据存在,且和m_pending_nonce不连续
        let size = this.m_account_nonce.length;
        if (size <= 0) {
            return false;
        }

        for (let idx = 0; idx < size; ++idx) {
            let nonce = this.m_account_nonce[size - 1 - idx];
            if (nonce < (this.m_pending_nonce - 1 - idx)) {
                return true;
            }
        }
        return false;
    }
}

