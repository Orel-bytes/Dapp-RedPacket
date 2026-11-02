require('../../web3Info.js')
require('../../configurations/contracts.js')
require('../../configurations/kernelCfg/config.js')
const colors = require('colors/safe')
const assert = require('assert')
const utils = require('../../utils.js');

const RedPacketInstAddress = global.RedPacketInstAddress
const RedPacketInst = utils.RedPacketSOL.at(RedPacketInstAddress)


async function RedPacketRegistRpServiceAccounts(symbol) {
    console.log(colors.green(`Task: RedPacketRegistRpServiceAccounts${symbol}`))
	
    let txHash = await utils.sendTxInSerial(`./output/registManager/RedPacketRegistRpServiceAccounts_${symbol}.dat`)
    console.log(colors.green(`Task: RedPacketRegistRpServiceAccounts ${symbol} txhash: `, txHash))
    
    let ret = await utils.waitReceipt(txHash, 30, false)	
    assert.equal(ret, true)
}


(async () => {
    try {      
        let args = process.argv.splice(2)
        if (!args.length) throw new Error('rpMgrTask must be specified')
        for (let i in args) {
            await RedPacketRegistRpServiceAccounts(args[i].trim());
        }
		
    } catch (e) {
        console.log(colors.red('init contracts error: ', e))
    }
    utils.stopFilter()
})()