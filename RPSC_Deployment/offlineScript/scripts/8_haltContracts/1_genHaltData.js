require('../../configurations/contracts.js')
require('../../configurations/kernelCfg/config.js')
require('../../configurations/wanOwnerNonceInfo.js')

const utils = require('../../utils.js')
const colors = require('colors/safe')

let ownerNonce = global.wanOwnerNonce

const RedPacketInstAddress = global.RedPacketInstAddress
const RedPacketInst = utils.RedPacketSOL.at(RedPacketInstAddress)

// halt related contracts
function RedPacketInstSetHaltTrue() {
    console.log(colors.green("TASK: RedPacketInstSetHaltTrue"))
    let txData = RedPacketInst.setHalt.getData(true)
    utils.sendTxInSerial(txData, ownerNonce++, RedPacketInstAddress, 0, "../../output/haltSCData/RedPacketInstSetHaltTrue.dat", utils.ownerPriv)
}


(() => {
    RedPacketInstSetHaltTrue()
    
    utils.updateOwnerNonce(ownerNonce)
})()



