const colors = require('colors/safe')
const tokenSets = require('./configurations/tokenInfo')
const smgSets = require('./configurations/smgInfo')

;(() => {
    try 
    {
        let args = process.argv.splice(2)
        if (!args.length) throw new Error('invalid number of args')
        let symbol = args[0].trim().toLowerCase()
        let token = tokenSets[`${symbol}`]
        let targetQuota = args[1].trim()
        let deposit = targetQuota*token.ratio
        symbol = symbol.toUpperCase()
    	console.log(colors.green(`${deposit} WAN needed in order to register a storemanGroup with ${targetQuota} ${symbol} quota`))
    }
    catch (e)
    {
        console.log(colors.red('genSetTokenEconomicsData error: ', e))
    }
})()


