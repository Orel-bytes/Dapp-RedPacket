'use strict';

const _ = require('lodash');

module.exports = class QueueBase {
    constructor(sort_filed_name) {
        this.m_queue = [];// 数据存储结构待优化
        this.m_sort_field_name = sort_filed_name;// 数组中对象必须包含属性sort_field_name,且为排序字段,外部调用添加前需把排序字段值赋给该属性,以便用于排序
    }

    push_by_ary(txAry) {
        try {
            this.m_queue = this.m_queue.concat(txAry);
            this.m_queue = _.sortBy(this.m_queue, [this.m_sort_field_name]);
        }
        catch (err) {
            console.log("err :", err);
        }
    }

    push(tx) {
        try {
            this.m_queue.push(tx);
            this.m_queue = _.sortBy(this.m_queue, [this.m_sort_field_name]);
        }
        catch (err) {
            console.log("err :", err);
        }
    }

    size() {
        return this.m_queue.length;
    }

    front() {
        if (this.m_queue.length > 0) {
            return this.m_queue[0];
        }
        return null;
    }

    pop() {
        if (this.m_queue.length > 0) {
            return this.m_queue.shift();
        }
        return null;
    }

    push(tx) {
        try {
            this.m_queue.push(tx);
            this.m_queue = _.sortBy(this.m_queue, [this.m_sort_field_name]);
        }
        catch (err) {
            console.log("err:", err);
        }
    }

    clear() {
        this.m_queue = [];
    }

    tail() {
        if (this.m_queue.length > 0) {
            return this.m_queue[this.m_queue.length - 1];
        }
        else {
            return null;
        }
    }
}


