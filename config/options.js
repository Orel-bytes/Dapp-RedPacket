module.exports = {
    network: "testnet",
    mongo_url: "mongodb://127.0.0.1:27017/redPacket_mainnet",
    rp_tx_table_schema: {
        name: "rp_claim_table",
        schema: {
            rpWalletId: { type: String, index: true },
            rpClaimer: { type: String, index: true },
            rpCode: { type: String, index: true },
            rpStartTime: { type: Number, index: true },
            rpPrimeValCode: { type: String},
            rpRefCode: { type: String },
            rpStatus: { type: Number, required: true },
            rpReceiveTs: { type: Number, required: true },
            rpSendTs: { type: Number },
            rpTxNonce: { type: Number },
            rpTxHash: { type: String },
            rpGasPrice: { type: Number},
            rpCheckTs: { type: Number },
            rpSuccess: { type: Boolean }
        }
    },
    rpRevoke_tx_table_schema: {
        name: "rp_revoke_table",
        schema: {
            rpCode: { type: String, index: true },
            rpStartTime: { type: Number, index: true },
            rpStatus: { type: Number, required: true },
            rpReceiveTs: { type: Number, required: true },
            rpSendTs: { type: Number },
            rpTxNonce: { type: Number },
            rpTxHash: { type: String },
            rpGasPrice: { type: Number},
            rpCheckTs: { type: Number },
            rpSuccess: { type: Boolean }
        }
    },
    rp_claim_history_table_schema: {
        name: "rp_claim_history_table",
        schema: {
            rpWalletId: { type: String, index: true },
            rpClaimer: { type: String, index: true },
            rpCode: { type: String, index: true },
            rpStartTime: { type: Number, index: true },
            rpRefCode: { type: String },
            rpPrimeValCode: { type: String},
            rpStatus: { type: Number, required: true },
            rpReceiveTs: { type: Number, required: true },
            rpSendTs: { type: Number },
            rpTxNonce: { type: Number },
            rpTxHash: { type: String },
            rpGasPrice: { type: Number },
            rpCheckTs: { type: Number },
            rpSuccess: { type: Boolean }
        }
    },
    rp_revoke_history_table_schema: {
        name: "rp_revoke_history_table",
        schema: {
            rpCode: { type: String, index: true },
            rpStartTime: { type: Number, index: true },
            rpStatus: { type: Number, required: true },
            rpReceiveTs: { type: Number, required: true },
            rpSendTs: { type: Number },
            rpTxNonce: { type: Number },
            rpTxHash: { type: String },
            rpGasPrice: { type: Number },
            rpCheckTs: { type: Number },
            rpSuccess: { type: Boolean }
        }
    },
    invalidRpClaim_schema: {
        name: "InvalidRpClaim_table",
        schema: {
            rpWalletId: { type: String, index: true },
            rpClaimer: { type: String, index: true },
            rpCode: { type: String, index: true },
            rpStartTime: { type: Number, index: true },
            rpPrimeValCode: { type: String},
            rpRefCode: { type: String },
            rpStatus: { type: String },
            rpReceiveTs: { type: Number}
        }
    },
    rp_tx_fill_nonce_gap_schema: {
        name: "rp_fill_nonce_gap_tx_table",
        schema: {
            rpStatus: { type: Number, required: true },
            rpReceiveTs: { type: Number, required: true },
            rpSendTs: { type: Number },
            rpTxNonce: { type: Number },
            rpTxHash: { type: String, index: true},
            rpGasPrice: { type: Number },
            rpCheckTs: { type: Number },
            rpSuccess: { type: Boolean }
        }
    },
    rpClaim_schema: {
        name: "RedPacketClaimLogger",
        schema: {
            rpClaimIndex: { type: String, index: true },
            rpCode: { type: String},
            rpStartTime: { type: Number},
            rpClaimer: { type: String},
            rpBonus: { type: String},
            rpRefCode: { type: String },
            rpClaimedTime: { type: Number}
        }
    },
    rpRecord_schema: {
        name: "RedPacketCreateLogger",
        schema: { 
            rpIndex: { type: String, index: true},
            rpCode: { type: String},
            rpStartTime: { type: Number},
            rpSender: { type: String},
            rpBonus: { type: String},
            rpRefBonus: { type: String},
            rpType: { type: Number},
            rpMode: { type: Number},
            rpTokenType: { type: String},
            rpCounts: { type: Number},
            rpRestCounts: { type: Number},
            rpTxHash: { type: String},
            rpPrimeValCode: { type: String},
            rpFinished: { type: Boolean}
        }
    },
    rpRefInfo_schema: {
        name: "RedPacketReferenceBonusLogger",
        schema: { 
            rpRefIndex: { type: String, index: true},
            rpCode: { type: String},
            rpStartTime: { type: Number},
            rpClaimer: { type: String},
            rpRefCode: { type: String},
            rpRefBonus: { type: String},
            rpReferredTime: { type: Number}
        }
    },
    rpRevokedInfo_schema: {
        name: "RedPacketRevokeLogger",
        schema: { 
            rpIndex: { type: String, index: true},
            rpCode: { type: String},
            rpStartTime: { type: Number},
            rpCreater: { type: String},
            rpRevokedRpBonus: { type: String},
            rpRevokedRefBonus: { type: String},
            rpRevokedrpGasFee: { type: String},
            rpRevokedTime: { type: Number}
        }
    },
    syncedBlockNumber_schema: {
        name: "syncedBlockNumber",
        schema: { 
            chainType: { type: String, index: true},
            syncedBlockNumber:  { type: Number}
        }
    },
    regToken_schema: {
        name: "RegWRCTokenLogger",
        schema: {
            tokenIndex: { type: String, index: true},
            tokenAddress: { type: String },
            tokenSymbol: { type: String },
            tokenDecimals: { type: Number }
        }
    },
    rpGasFee_schema: {
        name: "RpGasFeeLogger",
        schema: {
            rpGasFee: { type: String, index: true},
            updateTs: { type: Number}
        }
    },
    rpMaxBonusConfig_schema: {
        name: "RpMaxBonusConfigLogger",
        schema: {
            tokenIndex: { type: String, index: true},
            tokenAddress: { type: String},
            tokenRpMaxBonus: { type: String}
        }
    },
    rpscInstAddr: "0x5eaee90e85206a7f3681160e69c85df6f8fe5b16",
    cfgDir: '.'
}
