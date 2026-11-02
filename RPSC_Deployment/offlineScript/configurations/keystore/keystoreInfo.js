const fs = require('fs');
const path = require('path');

/**
 * !!! CAUTION !!!
 * following variables need to be config accordingly
 *
 **/

// wanchain relavant addresses

const ownerKeyFilePath = path.join(__dirname, 'owner/keystore', 'UTC--2018-07-19T07-39-03.462860004Z--52f1045671f56F572F7743232b558DdcA0627E10')

global.wanOwnerKs = fs.readFileSync(ownerKeyFilePath,"utf8");
global.wanOwnerKsPWD = '123456';
