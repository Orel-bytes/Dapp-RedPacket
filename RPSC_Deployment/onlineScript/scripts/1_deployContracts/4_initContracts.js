require('../../web3Info.js')
require('../../configurations/contracts.js')
require('../../configurations/kernelCfg/config.js')
const colors = require('colors/safe')
const assert = require('assert')
const utils = require('../../utils.js');

const RedPacketInstAddress = global.RedPacketInstAddress
const RedPacketInst = utils.RedPacketSOL.at(RedPacketInstAddress)

async function RedPacketSetWanRpMaxBonus() {
    console.log(colors.green("Task: RedPacketSetWanRpMaxBonus"))
	
    let txHash = await utils.sendTxInSerial("./output/initSCData/RedPacketSetWanRpMaxBonus.dat")

    console.log(colors.green("Task: RedPacketSetWanRpMaxBonus txhash: ", txHash))
    let ret = await utils.waitReceipt(txHash, 30, false)	
    assert.equal(ret, true)
}

(async () => {
    try {      
        await RedPacketSetWanRpMaxBonus()

    } catch (e) {

        console.log(colors.red('init contracts error: ', e))
    }
    utils.stopFilter()
})()