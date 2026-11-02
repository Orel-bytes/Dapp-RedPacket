require('../../configurations/contracts.js')
require('../../configurations/kernelCfg/config.js')
require('../../web3Info.js')
const utils = require('../../utils.js');
const colors = require('colors/safe')
const assert = require('assert')

const tokenSets = require('../../configurations/tokenInfo')
const rpMgrSets = require('../../configurations/rpMgrInfo')

const RedPacketInstAddress = global.RedPacketInstAddress
const RedPacketInst = utils.RedPacketSOL.at(RedPacketInstAddress)

async function RpMgrEnableStatusCheck(symbol) {
    // symbol = symbol.toLowerCase()
    console.log("\n symbol: ", symbol);
    let rpMgr = rpMgrSets[`${symbol}`]
    // console.log(rpMgr);

    let rpMgrStatus = await RedPacketInst.mapRpServiceAccount(rpMgr.mgrAddress)
    console.log(colors.green('[INFO] rpMgr Status: ', rpMgrStatus))
    assert.equal(rpMgrStatus, true)    


}

async function RpGasFeeCheck() {

    let rpGasFee = await RedPacketInst.RP_GASFEE()
    console.log(colors.green('[INFO] RP_GASFEE: ', rpGasFee))

    let halted = await RedPacketInst.halted()
    console.log(colors.green('[INFO] rpsc status: ', halted))
    //assert.equal(halted, false)
    
}

(async () => {
    try {   
        let args = process.argv.splice(2)
        if (!args.length) throw new Error('symbol must be specified')

        for (let i in args) {
            await RpMgrEnableStatusCheck(args[i].trim())
        }
        await RpGasFeeCheck();
        
    } catch (e) {
        console.log(colors.red('check rpsc status error: ', e))
    }
    
    utils.stopFilter()
})()
