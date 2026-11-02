'use strict';

const _ = require('lodash');
const QueueBase = require("./queueBase.js");


module.exports = class PendingQueue extends QueueBase{
    constructor(sort_filed_name) {
        super(sort_filed_name);
    }
}


