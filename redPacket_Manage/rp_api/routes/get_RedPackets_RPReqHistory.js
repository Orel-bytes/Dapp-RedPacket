'use strict';

var express = require('express');
var router = express.Router();
let URL = require('url');
const Utils = require("./utils.js")

let g_data = require("./test_data.js");

router.get('/RPReqHistory', async (req, res,next) => {
    try {
        res.setHeader("Access-Control-Expose-Headers", "Content-Range");
        res.setHeader("Content-Range", "RedPackets 0-0/0");
        let url = decodeURI(req.url);
        console.log("url:", url);
        let query_params = URL.parse(url, true).query;
        //let rpCode = req.params.rpCode;
        console.log("query_params:", query_params);
        if (query_params.range) {
            query_params.range = JSON.parse(query_params.range);
        }
        let nSkip = query_params.range[0];
        let nLimit = query_params.range[1] - query_params.range[0] + 1;

        let Params_Ary = [];
        // obj.rpCode + "_" + obj.rpClaimer + "_" + obj.rpStartTime
        let query_where = {};
        if (query_params.filter) {
            query_params.filter = JSON.parse(query_params.filter);
            Params_Ary = query_params.filter.rpCode.split("_");
            console.log("Params_Ary:", Params_Ary);
            query_where = {
                "rpCode": Params_Ary[0],
                "rpClaimer": Params_Ary[1]
            };
        }

        let mongo = global.mongoDB;
        // 读取领取记录
        let rp_claim_table_name = global.config.rp_claim_history_tables;
        let rp_total_count = await mongo.collection(rp_claim_table_name).find(query_where).count();
        if (rp_total_count <= 0) {
            res.setHeader("Content-Range", "RedPackets 0-0/0");
            res.send([]);
            return;
        }
        let rp_data_ary = await mongo.collection(rp_claim_table_name).find(query_where).sort({ "rpStartTime": -1 }).limit(nLimit).skip(nSkip).toArray();
        let utils = new Utils();
        let ret_data_ary = [];
        for (let idx = 0; idx < rp_data_ary.length; ++idx) {
            let obj = JSON.parse(JSON.stringify(rp_data_ary[idx]));
            obj.id = obj.rpTxHash;
            obj.rpStartTime = utils.getDateStr(obj.rpStartTime);
            obj.rpClaimedTime = utils.getDateStr(obj.rpClaimedTime);
            ret_data_ary.push(obj);
        }
        let data_count = ret_data_ary.length;
        let str_content_range = "RedPackets 0-" + (data_count-1) + "/" + rp_total_count;
        res.setHeader("Content-Range", str_content_range);
        res.send(ret_data_ary);
        return;
    }
    catch (err) {
        console.log("err:", err);
        res.send([]);
    }
});

module.exports = router;
