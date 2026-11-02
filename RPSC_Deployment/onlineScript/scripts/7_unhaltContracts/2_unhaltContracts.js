require('../../web3Info.js')
require('../../configurations/contracts.js')
require('../../configurations/kernelCfg/config.js')

const colors = require('colors/safe')
const assert = require('assert')
const utils = require('../../utils.js');
//const web3 = global.wanchainweb3;

const RedPacketInstAddress = global.RedPacketInstAddress
const RedPacketInst = utils.RedPacketSOL.at(RedPacketInstAddress)

async function RedPacketInstSetHaltFalse() {
    console.log(colors.green("Task: RedPacketInstSetHaltFalse"))

    let txHash = await utils.sendTxInSerial("./output/unhaltSCData/RedPacketInstSetHaltFalse.dat", false)
    console.log(colors.green("\n RedPacketInstSetHaltFalse txhash: ", txHash))

    let ret = await utils.waitReceipt(txHash, 30, false)
    assert.equal(ret, true)
    
    ret = await RedPacketInst.halted()
    assert.equal(ret, false)
}

(async () => {
	try {
        await RedPacketInstSetHaltFalse()
	}
	catch (e) {
		console.log(colors.red('unhalting contracts error: ', e))
	}
	
	utils.stopFilter()
})()