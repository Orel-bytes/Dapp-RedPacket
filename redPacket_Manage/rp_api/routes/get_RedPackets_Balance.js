'use strict';

var express = require('express');
var router = express.Router();
let URL = require('url');
const Utils = require("./utils.js")
const iWanClient = require('iwan-sdk');

router.get('/Balance', async (req, res,next) => {
    try {
        res.setHeader("Access-Control-Expose-Headers", "Content-Range");
        let connector = global.config.connector;
        let apiClient = new iWanClient(connector.option.apiKey, connector.option.secretKey, connector.option.option);

        let ret_data_ary = [];
        for (let idx = 0; idx < global.config.accounts.length; ++idx) {
            let addr = global.config.accounts[idx];
            let balance = await apiClient.getBalance("WAN", addr);
            balance = balance / 1e18;
            ret_data_ary.push({ "id":addr,"address": addr, "balance": balance });
        }

        let rp_total_count = ret_data_ary.length;
        // let str_content_range = "RedPackets 0-1" + (rp_total_count) + "/" + rp_total_count;
        let str_content_range = "RedPackets 0-1/2";
        res.setHeader("Content-Range", str_content_range);
        res.send(ret_data_ary);
        return;
    }
    catch (err) {
        console.log("err:", err);
        res.setHeader("Content-Range", "RedPackets 0-0/0");
        res.send([]);
    }
});

module.exports = router;
