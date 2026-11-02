
const _ = require('lodash');
const path = require("path");
const mongoose = require('mongoose');
let cfgDir = path.join(__dirname, '../config/options.js');
let config = require(cfgDir);
console.log("config:", config);

let g_mongoDB;

let db = mongoose.createConnection(config.mongo_url, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
db.on('connected', function (err) {
	if (err) {
		//global.syncLogger.error('Unable to connect to database(' + config.mongdbURL + ')£º' + err);
		//global.syncLogger.error('Aborting');
		process.exit();
	} else {
		console.log("config.mongdb_url:", config.mongo_url);
		//global.syncLogger.info('Connecting to database is successful!');
        global.mongoDB = db;
        g_mongoDB = db;
		test_hostedChainService();
	}
});

async function test_hostedChainService() {
    await insert_test_tx_to_mongo();
}

async function insert_test_tx_to_mongo() {
    try {
        await g_mongoDB.collection("rp_claim_tables").deleteMany({});
        await g_mongoDB.collection("rp_claim_history_tables").deleteMany({});
        for (let idx = 0; idx < 10; ++idx) {
            await g_mongoDB.collection("rp_claim_tables").insertOne({
                rpClaimer: "0x854efd6da404172aa074e4026e6963b11d21b7df",
                rpCode: (100 + idx).toString(),
                rpRefCode: "0x854efd6da404172aa074e4026e6963b11d21b7df",
                rpStartTime: _.now(),
                rpStatus: 0,
                rpReceiveTs: _.now()
            });
        }
        await g_mongoDB.collection("rp_revoke_tables").deleteMany({});
        await g_mongoDB.collection("rp_revoke_history_tables").deleteMany({});
        for (let idx = 0; idx < 10; ++idx) {
            await g_mongoDB.collection("rp_revoke_tables").insertOne({
                rpCode: (100 + idx).toString(),
                rpStartTime: _.now(),
                rpStatus: 0,
                rpReceiveTs: _.now()
            });
        }
        console.log("complete");
        process.exit(0);
    }
    catch (err) {
        console.log("err.message:", err.message);
        console.log("err.stack:", err.stack);
    }
}