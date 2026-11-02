require('../../configurations/contracts.js')
require('../../configurations/kernelCfg/config.js')

const colors = require('colors/safe')
const assert = require('assert')
const utils = require('../../utils.js')

const RedPacketInstAddress = global.RedPacketInstAddress
const RedPacketInst = utils.RedPacketSOL.at(RedPacketInstAddress)


async function registWrcTokenToRpsc(symbol) {
	
    symbol = utils.capitalize(symbol)
    
    console.log(colors.green(`TASK: registWrcTokenToRpsc${symbol}\n`))
    let fileName = `./output/regWrcTokenData/registWrcTokenToRpsc_${symbol}.dat`

    let txHash = await utils.sendTxInSerial(fileName)
    console.log(colors.green(`Task: registWrcTokenToRpsc ${symbol} txhash: `, txHash))
	
    let ret = await utils.waitReceipt(txHash, 30, false)
    assert.equal(ret, true)
}


(async () => {
    try 
    {   
        let args = process.argv.splice(2)
        if (!args.length) throw new Error('token symbol must be specified')
			
        for (let i in args) {            
            await registWrcTokenToRpsc(args[i].trim())
        }
    }
    catch (e)
    {
        console.log(colors.red('reg Wrc Token error: ', e))
    }
    utils.stopFilter()
})()