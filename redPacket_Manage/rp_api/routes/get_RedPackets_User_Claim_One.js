'use strict';

var express = require('express');
var router = express.Router();
let URL = require('url');


router.get('/RPReqClaim/:rpCode_rpClainAddr_rpStartTime', async (req, res,next) => {
    try {
        let url = decodeURI(req.url);
        console.log("url:", url);
        let query_params = URL.parse(url, true).query;
        let rpCode_rpClainAddr_rpStartTime = req.params.rpCode_rpClainAddr_rpStartTime;
        let Params_Ary = [];
        // obj.rpCode + "_" + obj.rpClaimer + "_" + obj.rpStartTime
        Params_Ary = rpCode_rpClainAddr_rpStartTime.split("_");
        console.log("Params_Ary:", Params_Ary);

        let mongo = global.mongoDB;
        // 读取领取记录
        let rp_user_claim_table = global.config.rp_user_claim_table;
        let query_where = { "rpCode": Params_Ary[0], "rpClaimer": Params_Ary[1], "rpStartTime": Number(Params_Ary[2]) };
        let rp_ary = await mongo.collection(rp_user_claim_table).find(query_where).toArray();
        let obj = {};
        if (rp_ary.length > 0) {
            obj.id = rp_ary[0].rpCode;
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
