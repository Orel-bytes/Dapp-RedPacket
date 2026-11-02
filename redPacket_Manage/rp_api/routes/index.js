'use strict';
var express = require('express');
var router = express.Router();



const RedPackets = require("./RedPackets.js");
const get_RedPackets_One = require("./get_RedPackets_One.js");
const get_RedPackets_Claim_all = require("./get_RedPackets_Claim_all.js");
const get_RedPackets_Reference = require("./get_RedPackets_Reference.js");

const get_RedPackets_User_Claim = require("./get_RedPackets_User_Claim.js");
const get_RedPackets_User_Claim_One = require("./get_RedPackets_User_Claim_One.js");
const get_RedPackets_FillNonceTx = require("./get_RedPackets_FillNonceTx.js");
const get_Balances = require("./get_RedPackets_Balance.js");

const get_RPReqHistory = require("./get_RedPackets_RPReqHistory.js");

// 查询所有红包
router.get('/RedPackets', RedPackets);
// 查询单个红包详情
router.get('/RedPackets/:rpCode', get_RedPackets_One);

// 查询所有红包的领取记录,并可指定rpCode,查询单个红包的领取记录
router.get('/RPClaim', get_RedPackets_Claim_all);

// 查询所有红包的推荐记录,并可指定rpCode,查询单个红包的推荐记录
router.get('/RPReference', get_RedPackets_Reference);

//************************************************************************************************************
// 用户申领红包记录
router.get('/RPReqClaim', get_RedPackets_User_Claim);
// 用户申领红包记录
router.get('/RPReqClaim/:rpCode_rpClainAddr_rpStartTime', get_RedPackets_User_Claim_One);
// 查询为了避免nonce空洞添加的交易
router.get('/RPFillNonceTx', get_RedPackets_FillNonceTx);

// 取账户信息及余额:
router.get('/Balance', get_Balances);

router.get('/RPReqHistory', get_RPReqHistory);


/* GET home page. */
router.get('/', function (req, res) {
    res.send("RedPackets management!");
});

module.exports = router;
