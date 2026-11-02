require('../../web3Info.js')
require('../../configurations/contracts.js')
require('../../configurations/kernelCfg/config.js')

const rpTaskInfoSets = require('../../configurations/rpTaskInfo')
const colors = require('colors/safe')
const assert = require('assert')
const utils = require('../../utils.js');
const Web3 = require('web3')
const web3 = new Web3();
const crypto = require('crypto')

const RedPacketInstAddress = global.RedPacketInstAddress
const RedPacketInst = utils.RedPacketSOL.at(RedPacketInstAddress)


async function checkRpRecords(symbol) {
    console.log(colors.green(`Task: checkRpRecords_${symbol}`))
    
    let rpTask = rpTaskInfoSets[`${symbol}`]
    let hexRpCode = '0x' + crypto.createHash('sha256').update(Buffer.from(rpTask.rpCode, 'ascii')).digest('hex');

    let rpActiveTs = await RedPacketInst.mapRPCodeActiveTime(hexRpCode)
    console.log(colors.blue('\n\n [INFO] rpActiveTs: '))
    console.log(colors.blue(rpActiveTs.toNumber()))


    let rpGasFee = await RedPacketInst.RP_GASFEE()
    console.log(colors.green('[INFO] RP_GASFEE: ', rpGasFee))

    let halted = await RedPacketInst.halted()
    console.log(colors.green('[INFO] rpsc status: ', halted))
    assert.equal(halted, false)


    let RPRecord = await RedPacketInst.mapRPRecord(hexRpCode, rpActiveTs)
    console.log(colors.blue('\n\n [INFO] RPRecord: ', hexRpCode))
    console.log(colors.blue('[INFO] rpSender: ', RPRecord[0]))
    console.log(colors.blue('[INFO] rpStartTime: ', RPRecord[1].toNumber()))
    console.log(colors.blue('[INFO] rpTokenType: ', RPRecord[2]))
    console.log(colors.blue('[INFO] rpType: ', RPRecord[3].toNumber()))
    console.log(colors.blue('[INFO] rpCounts: ', RPRecord[4].toNumber()))
    console.log(colors.blue('[INFO] rpMode: ', RPRecord[5].toNumber()))
    console.log(colors.blue('[INFO] rpBonus: ', RPRecord[6].toNumber()))
    console.log(colors.blue('[INFO] rpMinBonus: ', RPRecord[7].toNumber()))
    console.log(colors.blue('[INFO] rpRefBonus: ', RPRecord[8].toNumber()))
    console.log(colors.blue('[INFO] rpAllowance: ', RPRecord[9].toNumber()))
    console.log(colors.blue('[INFO] rpGasFee: ', RPRecord[10].toNumber()))

    let RPStatus = await RedPacketInst.mapRPStatusInfo(hexRpCode, rpActiveTs)
    console.log(colors.blue('\n\n [INFO] RPStatus: ', hexRpCode))
    console.log(colors.blue('[INFO] rpRestCounts: ', RPStatus[0].toNumber()))
    console.log(colors.blue('[INFO] rpRestBonus: ', RPStatus[1].toNumber()))
    console.log(colors.blue('[INFO] rpRestRefBonus: ', RPStatus[2].toNumber()))
    console.log(colors.blue('[INFO] rpRestGasFee: ', RPStatus[3].toNumber()))
    console.log(colors.blue('[INFO] rpFinished: ', RPStatus[4]))

  
    let RPClaimData = await RedPacketInst.mapRPClaimRecord(hexRpCode, rpActiveTs, "0x57dba8ef0613d2c023e590ef958311691e3f5a3e")
    console.log(colors.blue('\n\n [INFO] RPClaimData: ', hexRpCode))
    console.log(colors.blue('[INFO] rpBonus: ', RPClaimData[0].toNumber()))

    RPClaimData = await RedPacketInst.mapRPClaimRecord(hexRpCode, rpActiveTs, "0xecec0c66388fd15dc4159851712b47f817116068")
    console.log(colors.blue('\n\n [INFO] RPClaimData: ', hexRpCode))
    console.log(colors.blue('[INFO] rpBonus: ', RPClaimData[0].toNumber()))
}


(async () => {
    try {      
        let args = process.argv.splice(2)
        if (!args.length) throw new Error('token symbol must be specified')

        for (let i in args) {
            await checkRpRecords(args[i].trim());
        }
		
    } catch (e) {
        console.log(colors.red('init contracts error: ', e))
    }
    utils.stopFilter()
})()
