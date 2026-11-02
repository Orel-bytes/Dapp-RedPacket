require('../../configurations/contracts.js')
require('../../configurations/kernelCfg/config.js')
require('../../configurations/wanOwnerNonceInfo.js')
const utils = require('../../utils.js')
const colors = require('colors/safe')
const tokenSets = require('../../configurations/tokenInfo')

const RedPacketInstAddress = global.RedPacketInstAddress
const RedPacketInst = utils.RedPacketSOL.at(RedPacketInstAddress)

let wanOwnerNonce = global.wanOwnerNonce

// make sure signing this tx with delegate secret key
function registWrcTokenToRpsc(symbol) {
    
    let token = tokenSets[`${symbol}`]
    console.log(token);
    symbol = utils.capitalize(symbol)
    console.log(colors.green(`TASK: registWrcTokenToRpsc ${symbol}\n`))

    let txData = RedPacketInst.RegWRCToken.getData(token.addr, token.rpMaxBonus)
    let fileName = `../../output/regWrcTokenData/registWrcTokenToRpsc_${symbol}.dat`
    utils.sendTxInSerial(txData, wanOwnerNonce++, RedPacketInstAddress, 0, fileName, utils.ownerPriv)
}

(() => {
    try
    {
        let args = process.argv.splice(2)
        if (!args.length) throw new Error('token symbol must be specified')
			
        for (let i in args) {
            registWrcTokenToRpsc(args[i].trim())
        }
        utils.updateOwnerNonce(wanOwnerNonce)
    }
    catch (e)
    {
        console.log(colors.red('generating registering wrctoken raw data error: ', e))
    }    
})()
