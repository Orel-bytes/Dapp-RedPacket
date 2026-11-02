require('../../configurations/wanOwnerNonceInfo.js')

const utils = require('../../utils.js')
const colors = require('colors/safe')
let wanOwnerNonce = global.wanOwnerNonce


function taskDeployRPSC() {
    console.log(colors.green("TASK: taskDeployRPSC" ));
    let constructorInputs = [];
    constructorInputs.push({data: utils.RedPacketCompiled.contracts[':RedPacket'].bytecode});

    let txData = utils.RedPacketSOL.new.getData.apply(null, constructorInputs);

    utils.sendTxInSerial(txData, wanOwnerNonce++, '', 0, "../../output/deploySCData/taskDeployRPSC.dat",utils.ownerPriv);
}

(() => {
    taskDeployRPSC();

    utils.updateOwnerNonce(wanOwnerNonce);
})()

