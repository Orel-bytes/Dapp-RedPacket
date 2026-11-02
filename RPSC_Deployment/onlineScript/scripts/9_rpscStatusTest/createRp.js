require('../../web3Info.js')
require('../../configurations/contracts.js')
require('../../configurations/kernelCfg/config.js')

const rpTaskInfoSets = require('../../configurations/rpTaskInfo')
const colors = require('colors/safe')
const assert = require('assert')
const utils = require('../../utils.js');
const CryptoJS = require("crypto-js");
const Web3 = require('web3')
const web3 = new Web3();

const RedPacketInstAddress = global.RedPacketInstAddress
const RedPacketInst = utils.RedPacketSOL.at(RedPacketInstAddress)


async function createRp(symbol) {
    console.log(colors.green(`Task: createRp_${symbol}`))    
	
    let txHash = await utils.sendTxInSerial(`./output/testData/createRp_${symbol}.dat`)
    let ret = await utils.waitReceipt(txHash, 30, false)
	
    assert.equal(ret, true)
}


async function checkRpRecords(symbol) {
    console.log(colors.green(`Task: checkRpRecords_${symbol}`))
    
    let rpTask = rpTaskInfoSets[`${symbol}`]

    let hexRpCode =  '0x' + CryptoJS.SHA256(rpTask.rpCode);
    console.log(colors.green(hexRpCode))

    let rpActiveTs = await RedPacketInst.mapRPCodeActiveTime(hexRpCode)
    console.log(colors.blue('\n\n [INFO] rpActiveTs: '))
    console.log(colors.blue(rpActiveTs.toNumber()))

    let RPRecord = await RedPacketInst.mapRPRecord(hexRpCode, rpActiveTs)
    console.log(colors.blue('\n\n [INFO] RPRecord: ', hexRpCode))
    // console.log(RPRecord);
    console.log(colors.blue('[INFO] rpSender: ', RPRecord[0]))
    console.log(colors.blue('[INFO] rpStartTime: ', RPRecord[1].toNumber()))
    console.log(colors.blue('[INFO] rpTokenType: ', RPRecord[2]))
    console.log(colors.blue('[INFO] rpType: ', RPRecord[3].toNumber()))
    console.log(colors.blue('[INFO] rpCounts: ', RPRecord[4].toNumber()))
    console.log(colors.blue('[INFO] rpMode: ', RPRecord[5].toNumber()))
    console.log(colors.blue('[INFO] rpBonus: ', RPRecord[6].toNumber()))
    console.log(colors.blue('[INFO] rpMinBonus: ', RPRecord[7].toNumber()))
    console.log(colors.blue('[INFO] rpRefBonus: ', RPRecord[8].toNumber()))
    console.log(colors.blue('[INFO] rpGasFee: ', RPRecord[9].toNumber()))


    let RPStatus = await RedPacketInst.mapRPStatusInfo(hexRpCode, rpActiveTs)
    console.log(colors.blue('\n\n [INFO] RPStatus: ', hexRpCode))
    // console.log(RPStatus);
    console.log(colors.blue('[INFO] rpRestCounts: ', RPStatus[0].toNumber()))
    console.log(colors.blue('[INFO] rpRestBonus: ', RPStatus[1].toNumber()))
    console.log(colors.blue('[INFO] rpRestRefBonus: ', RPStatus[2].toNumber()))
    console.log(colors.blue('[INFO] rpRestGasFee: ', RPStatus[3].toNumber()))
    console.log(colors.blue('[INFO] rpFinished: ', RPStatus[4]))
}


(async () => {
    try {      
        let args = process.argv.splice(2)
        if (!args.length) throw new Error('token symbol must be specified')
        for (let i in args) {
            await createRp(args[i].trim());
        }


        for (let i in args) {
            await checkRpRecords(args[i].trim());
        }
		
    } catch (e) {
        console.log(colors.red('init contracts error: ', e))
    }
    utils.stopFilter()
})()
