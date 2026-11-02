require('../../configurations/contracts.js')
require('../../configurations/kernelCfg/config.js')
require('../../configurations/wanOwnerNonceInfo.js')
const utils = require('../../utils.js')
const colors = require('colors/safe')

const RedPacketInstAddress = global.RedPacketInstAddress
const RedPacketInst = utils.RedPacketSOL.at(RedPacketInstAddress)

let wanOwnerNonce = global.wanOwnerNonce

function RedPacketSetGasFee() {
    console.log(colors.green("TASK: RedPacketSetGasFee"))

    let rpGasFee = 0 //50000000000000000

    let txData = RedPacketInst.SetRPGasFee.getData(rpGasFee)
    utils.sendTxInSerial(txData, wanOwnerNonce++, RedPacketInstAddress, 0, "../../output/initSCData/RedPacketSetGasFee.dat", utils.ownerPriv)
}


(() => {
    // for the part1 deploy operation
    RedPacketSetGasFee()

    utils.updateOwnerNonce(wanOwnerNonce);
})()




