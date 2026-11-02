'use strict';

var express = require('express');
var router = express.Router();
let URL = require('url');
const Utils = require("./utils.js")

let g_data = require("./test_data.js");

router.get('/RPReference', async (req, res,next) => {
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
        //if (query_params.sort) {
        //    query_params.sort = JSON.parse(query_params.sort);
        //}
        if (query_params.filter) {
            query_params.filter = JSON.parse(query_params.filter);
        }

        let mongo = global.mongoDB;
        // 读取领取记录
        let rp_claim_reference_table = global.config.rp_claim_reference_table;
        let rp_total_count = 0;
        if (query_params.filter && query_params.filter.rpCode) {
            rp_total_count = await mongo.collection(rp_claim_reference_table).find({ "rpCode": query_params.filter.rpCode }).count();
        }
        else {
            rp_total_count = await mongo.collection(rp_claim_reference_table).find({}).count();
        }
        if (rp_total_count <= 0) {
            res.setHeader("Content-Range", "RedPackets 0-0/0");
            res.send([]);
            return;
        }
        let rp_data_ary = [];
        if (query_params.range && query_params.range.length >= 2) {
            let begin = query_params.range[0];
            let end = query_params.range[1];
            if (query_params.filter && query_params.filter.rpCode) {
                rp_data_ary = await mongo.collection(rp_claim_reference_table).find({ "rpCode": query_params.filter.rpCode }).sort({ "rpStartTime": -1 }).limit(end - begin + 1).skip(begin).toArray();
            }
            else {
                rp_data_ary = await mongo.collection(rp_claim_reference_table).find({}).sort({ "rpStartTime": -1 }).limit(end - begin + 1).skip(begin).toArray();
            }
        }
        else {
            if (query_params.filter && query_params.filter.rpCode) {
                rp_data_ary = await mongo.collection(rp_claim_reference_table).find({ "rpCode": query_params.filter.rpCode }).sort({ "rpStartTime": -1 }).toArray();
            }
            else {
                rp_data_ary = await mongo.collection(rp_claim_reference_table).find({}).sort({ "rpStartTime": -1 }).toArray();
            }
        }
        let utils = new Utils();
        let ret_data_ary = [];
        for (let idx = 0; idx < rp_data_ary.length; ++idx) {
            let obj = JSON.parse(JSON.stringify(rp_data_ary[idx]));
            obj.id = obj.rpRefIndex;
            obj.rpStartTime = utils.getDateStr(obj.rpStartTime);
            obj.rpReferredTime = utils.getDateStr(obj.rpReferredTime);
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
