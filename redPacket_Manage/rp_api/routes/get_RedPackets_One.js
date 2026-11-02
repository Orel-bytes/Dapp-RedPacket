'use strict';

var express = require('express');
var router = express.Router();
let URL = require('url');

let g_data = require("./test_data.js");

router.get('/RedPackets/:rpCode', async (req, res,next) => {
    try {
        let url = decodeURI(req.url);
        console.log("url:", url);
        let query_params = URL.parse(url, true).query;
        let rpCode = req.params.rpCode;
        console.log("query_params:", query_params);
        let mongo = global.mongoDB;
        let rp_create_tbl_name = global.config.rp_create_table;
        let rp_ary = await mongo.collection(rp_create_tbl_name).find({ "rpCode": rpCode}).toArray();
        let obj = {};
        if (rp_ary.length > 0) {
            obj = rp_ary[0];
        }
        res.send(obj);
        return;
    }
    catch (err) {
        console.log("err:", err);
        res.send(err);
    }
});

module.exports = router;
