require('../../web3Info.js')
require('../../configurations/contracts.js')
require('../../configurations/kernelCfg/config.js')

const wrcInfoSets = require('../../configurations/tokenInfo')
const colors = require('colors/safe')
const assert = require('assert')
const utils = require('../../utils.js');
const Web3 = require('web3')
const web3 = new Web3();
const crypto = require('crypto')

const RedPacketInstAddress = global.RedPacketInstAddress
const RedPacketInst = utils.RedPacketSOL.at(RedPacketInstAddress)


async function checkRpWrcTokens(symbol) {
    console.log(colors.green(`Task: checkRpRecords_${symbol}`))
    
    let wrc = wrcInfoSets[`${symbol}`]

    let maxBonus = await RedPacketInst.mapMaxBonusConfig(wrc.addr)
    console.log(colors.blue('\n\n [INFO] maxBonus: ', maxBonus))
}


(async () => {
    try {      
        let args = process.argv.splice(2)
        if (!args.length) throw new Error('token symbol must be specified')

        for (let i in args) {
            await checkRpWrcTokens(args[i].trim());
        }
		
    } catch (e) {
        console.log(colors.red('init contracts error: ', e))
    }
    utils.stopFilter()
})()
