require('../../configurations/contracts.js')
require('../../configurations/kernelCfg/config.js')
require('../../configurations/wanOwnerNonceInfo.js')

const utils = require('../../utils.js');
const colors = require('colors/safe');


const RedPacketInstAddress = global.RedPacketInstAddress
const RedPacketInst = utils.RedPacketSOL.at(RedPacketInstAddress)

let ownerNonce = global.wanOwnerNonce

// halt related contracts
function RedPacketInstSetHaltFalse() {
    console.log(colors.green("TASK: RedPacketInstSetHaltFalse"))
    let txData = RedPacketInst.setHalt.getData(false)
    utils.sendTxInSerial(txData, ownerNonce++, RedPacketInstAddress, 0, "../../output/unhaltSCData/RedPacketInstSetHaltFalse.dat", utils.ownerPriv)
}


(() => {
    RedPacketInstSetHaltFalse()
    
    utils.updateOwnerNonce(ownerNonce)
})()




