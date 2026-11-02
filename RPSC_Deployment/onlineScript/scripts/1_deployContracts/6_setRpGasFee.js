require('../../web3Info.js')
require('../../configurations/contracts.js')
require('../../configurations/kernelCfg/config.js')
const colors = require('colors/safe')
const assert = require('assert')
const utils = require('../../utils.js');

const RedPacketInstAddress = global.RedPacketInstAddress
const RedPacketInst = utils.RedPacketSOL.at(RedPacketInstAddress)

async function RedPacketSetGasFee() {
    console.log(colors.green("Task: RedPacketSetGasFee"))

    let txHash = await utils.sendTxInSerial("./output/initSCData/RedPacketSetGasFee.dat")

    console.log(colors.green("Task: RedPacketSetGasFee txhash: ", txHash))
    let ret = await utils.waitReceipt(txHash, 30, false)	
    assert.equal(ret, true)
}


(async () => {
    try {      
        await RedPacketSetGasFee()

    } catch (e) {

        console.log(colors.red('init contracts error: ', e))
    }
    utils.stopFilter()
})()
