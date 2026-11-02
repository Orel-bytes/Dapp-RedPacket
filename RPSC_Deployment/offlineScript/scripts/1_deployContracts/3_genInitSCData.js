require('../../configurations/contracts.js')
require('../../configurations/kernelCfg/config.js')
require('../../configurations/wanOwnerNonceInfo.js')

const utils = require('../../utils.js')
const colors = require('colors/safe')

const wanAddress = '0x0000000000000000000000000000000000000000';

const RedPacketInstAddress = global.RedPacketInstAddress
const RedPacketInst = utils.RedPacketSOL.at(RedPacketInstAddress)

let wanOwnerNonce = global.wanOwnerNonce


function RedPacketSetWanRpMaxBonus() {
    console.log(colors.green("TASK: RedPacketSetWanRpMaxBonus"))

    let rpMaxBonus = 10000000000000000000000

    let txData = RedPacketInst.SetWrcMaxRpBonus.getData(wanAddress, rpMaxBonus)
    utils.sendTxInSerial(txData, wanOwnerNonce++, RedPacketInstAddress, 0, "../../output/initSCData/RedPacketSetWanRpMaxBonus.dat", utils.ownerPriv)
}


(() => {
    // for the part1 deploy operation
    RedPacketSetWanRpMaxBonus() 

    utils.updateOwnerNonce(wanOwnerNonce);
})()




