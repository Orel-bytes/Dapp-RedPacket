'use strict';

var express = require('express');
var router = express.Router();
let URL = require('url');
let g_data = require("./test_data.js");

const Utils = require("./utils.js")


router.get('/RedPackets', async (req, res,next) => {
    try {
        res.setHeader("Access-Control-Expose-Headers", "Content-Range");
        res.setHeader("Content-Range", "RedPackets 0-0/0");
        console.log("req.params:", req.params);
        let url = decodeURI(req.url);
        console.log("url:", url);
        let query_params = URL.parse(url, true).query;
        console.log("query_params:", query_params);
        //if (query_params.filter) {
        //    query_params.filter = JSON.parse(query_params.filter);
        //}
        if (query_params.range) {
            query_params.range = JSON.parse(query_params.range);
        }
        if (query_params.sort) {
            query_params.sort = JSON.parse(query_params.sort);
        }
        let mongo = global.mongoDB;
        let rp_create_tbl_name = global.config["rp_create_table"];
        let rp_total_count = await mongo.collection(rp_create_tbl_name).find({}).count();
        if (rp_total_count <= 0) {
            res.setHeader("Content-Range", "RedPackets 0-0/0");
            res.send([]);
            return;
        }
        let rp_data_ary = [];
        // rp_data_ary = await mongo.collection(rp_create_tbl_name).find().toArray();
        if (query_params.range && query_params.range.length >= 2) {
            let begin = query_params.range[0];
            let end = query_params.range[1];
            rp_data_ary = await mongo.collection(rp_create_tbl_name).find({}).sort({ "rpStartTime": -1 }).limit(end - begin + 1).skip(begin).toArray();
        }
        else {
            rp_data_ary = await mongo.collection(rp_create_tbl_name).find({}).sort({ "rpStartTime": -1 }).toArray();
        }
        let ret_data_ary = [];
        let utils = new Utils();
        for (let idx = 0; idx < rp_data_ary.length; ++idx) {
            let obj = JSON.parse(JSON.stringify(rp_data_ary[idx]));
            obj.id = obj.rpCode;
            obj.rpStartTime = utils.getDateStr(obj.rpStartTime);
            ret_data_ary.push(obj);
        }
        console.log("rp_data_ary[0]:", ret_data_ary[0]);
        let str_content_range = "RedPackets 0-9/" + rp_total_count;
        res.setHeader("Content-Range", str_content_range);
        res.send(ret_data_ary);
    }
    catch (err) {
        console.log("err:", err);
        res.send(err);
    }
});

module.exports = router;
