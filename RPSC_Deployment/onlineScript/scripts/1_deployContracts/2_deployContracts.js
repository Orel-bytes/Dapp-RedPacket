require('../../configurations/kernelCfg/config.js')
const assert = require('assert')
const colors = require('colors/safe')
const utils = require('../../utils.js')

const wanOwnerAddr = (global.wanOwnerAddr).toLowerCase()

let RedPacketInstAddress,
    RedPacketInst

// functions for deploying rpsc sc
async function taskDeployRPSC() {
    console.log(colors.green("Task: taskDeployRPSC"))

    let txHash = await utils.sendTxInSerial("./output/deploySCData/taskDeployRPSC.dat")
    console.log(colors.green("Task: taskDeployRPSC: txhash: ", txHash))

    RedPacketInstAddress = await utils.waitReceipt(txHash, 30, true)
    console.log(colors.green("Task: taskDeployRPSC: sc addr: ", RedPacketInstAddress))

    RedPacketInst = utils.RedPacketSOL.at(RedPacketInstAddress)	
    assert.equal((await RedPacketInst.owner()).toString(), wanOwnerAddr)
    assert.equal(await RedPacketInst.halted(), true)
}

function printAddress() {
    // console.log(colors.green("\nwanchain rpsc address= " + RedPacketInstAddress))
    // console.log('\n')

    let content = 'global.RedPacketInstAddress = "' + RedPacketInstAddress + '";\n'

    utils.writeFile('../../configurations/contracts.js',content)
}


(async () => {
    try {
        await taskDeployRPSC()
        
        printAddress()
    } catch (e) {
        console.log(colors.red('deploying contracts error: ', e))
    }
    utils.stopFilter()
})() 