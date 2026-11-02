require('../../configurations/contracts.js')
require('../../configurations/kernelCfg/config.js')
require('../../configurations/wanOwnerNonceInfo.js')
const rpMgrSets = require('../../configurations/rpMgrInfo')
const utils = require('../../utils.js')
const colors = require('colors/safe')

const RedPacketInstAddress = global.RedPacketInstAddress
const RedPacketInst = utils.RedPacketSOL.at(RedPacketInstAddress)

let wanOwnerNonce = global.wanOwnerNonce

function RedPacketRegistRpServiceAccounts(symbol) {
    console.log(colors.green("TASK: RedPacketRegistRpServiceAccounts"))
    let rpMgr = rpMgrSets[`${symbol}`] 

    console.log(colors.green(`TASK: RedPacketRegistRpServiceAccounts${symbol}`))
    let txData = RedPacketInst.RegistRpServiceAccounts.getData(rpMgr.mgrAddress, rpMgr.mgrEnable)
    let fileName = `../../output/registManager/RedPacketRegistRpServiceAccounts_${symbol}.dat`
    utils.sendTxInSerial(txData, wanOwnerNonce++, RedPacketInstAddress, 0, fileName, utils.ownerPriv)
}

(() => {
	let args = process.argv.splice(2)
	if (!args.length) throw new Error('rpMgrTask must be specified')
		
	for (let i in args) {
		console.log(colors.green(`TASK: RedPacketRegistRpServiceAccounts rpMgrTask: `, args[i].trim()))
		RedPacketRegistRpServiceAccounts(args[i].trim())
	}
	
    utils.updateOwnerNonce(wanOwnerNonce);
})()




