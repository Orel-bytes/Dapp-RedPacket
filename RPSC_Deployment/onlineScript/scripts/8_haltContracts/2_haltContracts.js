require('../../configurations/contracts.js')
require('../../configurations/kernelCfg/config.js')
require('../../configurations/wanOwnerNonceInfo.js')

const utils = require('../../utils.js');
const colors = require('colors/safe')

const RedPacketInstAddress = global.RedPacketInstAddress
const RedPacketInst = utils.RedPacketSOL.at(RedPacketInstAddress)

let ownerNonce = global.wanOwnerNonce

async function RedPacketInstSetHaltTrue() {
    console.log(colors.green("Task: RedPacketInstSetHaltTrue"))

    let txHash = await utils.sendTxInSerial("./output/haltSCData/RedPacketInstSetHaltTrue.dat", false)    
    console.log(colors.green("\n RedPacketInstSetHaltTrue txhash: ", txHash))

    let ret = await utils.waitReceipt(txHash, 30, false)
    assert.equal(ret, true)
    
    ret = await RedPacketInst.halted()
    assert.equal(ret, true)
}

(async () => {
	try {
        await RedPacketInstSetHaltTrue()
	}
	catch (e) {
		console.log(colors.red('halting contracts error: ', e))
	}
	
	utils.stopFilter()
})()



