import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import Crypto from 'crypto-js';

const MinPercent = 0.1;
const DIGITS = 6;
const MAXCOUNT = 200;
const web3 = new Web3();

export const rpCodePrex = 'https://www.wanchain.org/redPacket?';

export const WANADDR = '0x0000000000000000000000000000000000000000';

export const GASLIMIT = 500000;

//export const RPContract = '0xb62bfce06a55a39c3f3cf830f035c880837129c9'; // testnet
  export const RPContract = '0x5eaee90e85206a7f3681160e69c85df6f8fe5b16'; // mainnet


function formatValue(value, decimals = '18') {
  return new BigNumber(value).times(BigNumber(10).pow(decimals)).toString(10);
}

function formatValueToUnit(value, decimals = '18') {
  if(!value) {
    return '0';
  }
  return new BigNumber(value).dividedBy(BigNumber(10).pow(decimals)).toString(10);
}

export function getCreateRPTxData(rpCode, rpType, rpMode, rpCounts, rpBonus, rpRefBonus, decimals, rpTokenAddr) {
  const CreateRP = '0x2d7fe2ac';
  let rpBonusToUnit = new BigNumber(rpBonus).times(BigNumber(10).pow(decimals)).toString(10)
  let rpRefBonusToUnit = new BigNumber(rpRefBonus).times(BigNumber(10).pow(decimals)).toString(10)
  let paramsType = ['bytes32', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'address']
  let rpMinBonus = getAdaptedMinBonus(rpBonus, rpCounts, decimals);

  let paramsValue = [rpCode, Number(rpType), rpMode, rpCounts, rpBonusToUnit, rpRefBonusToUnit, rpMinBonus.toString(10), rpTokenAddr]; //getMinBonus(decimals, true) instead by rpMinBonus
  return CreateRP + web3.eth.abi.encodeParameters(paramsType, paramsValue).slice(2);
}

export function getApproveTokenData(amount, tokenInfo = {}) {
  const encodeApproveFun = '0x095ea7b3';
  amount = new BigNumber(amount).times(BigNumber(10).pow(tokenInfo.decimals || '18')).toString(10);
  return encodeApproveFun + web3.eth.abi.encodeParameters(['address', 'uint'], [RPContract, amount]).slice(2);
}

export function getAdaptedMinBonus (rpBonus, rpCounts, decimals) {
  let adaptedMinBonus = new BigNumber(rpBonus).times(BigNumber(10).pow(decimals)).dividedBy(rpCounts).times(MinPercent);
  let minBonusBasedByDecimals = getMinBonus(decimals, true);

  if(adaptedMinBonus <= minBonusBasedByDecimals){
    adaptedMinBonus = minBonusBasedByDecimals;
  }
  
  return adaptedMinBonus;
}

export function getMinBonus (decimals, isUnit = true) {
  let tmpDecimals = decimals >= DIGITS ? DIGITS : decimals;
  if (!isUnit) {
    return new BigNumber(1).dividedBy(BigNumber(10).pow(tmpDecimals));//.toString(10);
  }
  return new BigNumber(1).dividedBy(BigNumber(10).pow(tmpDecimals)).times(BigNumber(10).pow(decimals));//.toString(10);
}
//
export function formatAccountsPicker(data) {
  return data.map(item => ({ label: `${item.name} ${formatLongText(item.address)}`, value: item.name, key: item.name }))
}

export function formatePickerDate(data, a) {
  if(data.length === 0) {
    return data;
  }
  return [(data[0].split(' '))[0]];
}

export function randomNum(digits) {
  let min = 10 ** (digits - 1);
  let max = 10 ** digits - 1;
  return Math.floor(Math.random() * (max - min)) + min;
}

export function randomString(len = 32) {
  // let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  let $chars = 'abcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  let maxPos = $chars.length;
  let pwd = '';
　for (let i = 0; i < len; i++) {
　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
　}
　return pwd;
}

export function calcRPTotalAmount(value, quantity, recommendedBonus, rpMode, rpType, rpGasFee = '0.05') {
  let recommand, rp;
  let estimateRPGasFee = new BigNumber(rpGasFee).times(BigNumber(quantity).times(rpType ? '2' : '1').plus('1'));

  if (rpMode) { // rpMode for randomRP
    recommand = new BigNumber(rpType ? recommendedBonus : '0').times(quantity);
    rp = new BigNumber(value);
  } else { // For fixedRP
    recommand = new BigNumber(rpType ? recommendedBonus : '0').times(quantity);
    rp = new BigNumber(value).times(quantity);
  }

  return [
    new BigNumber(rp).plus(recommand).plus(estimateRPGasFee).toString(10),
    new BigNumber(rp).plus(recommand).toString(10),
    rp.toString(10),
    recommand.toString(10),
    estimateRPGasFee.toString(10),
  ];
}

export function checkQuantity(quantity) {
  return new BigNumber(quantity).lte(MAXCOUNT);
}

export function checkSingleValue(value, decimals) {
  decimals = decimals >= DIGITS ? DIGITS : decimals;
  return new BigNumber(value).times(BigNumber(10).pow(decimals)).isInteger();
}

export function checkTotalValue(value, decimals) {
  let tmpDecimals = decimals >= DIGITS ? DIGITS : decimals;
  let bool1 = new BigNumber(value).times(BigNumber(10).pow(tmpDecimals)).isInteger();
  return bool1;
}

export function checkOverBalance(balance, totalAmount) {
  return new BigNumber(balance).gte(totalAmount);
}

export function formatCreatedRpListData(createdRpHistory, RPRegTokenInfo) {
  if (RPRegTokenInfo.length === 0) {
    return [];
  }
  let sortByDate = createdRpHistory.sort((a, b) => {
    let aTime = a.rpStartTime === '0' ? a.createDate : a.rpStartTime;
    let bTime = b.rpStartTime === '0' ? b.createDate : b.rpStartTime;
    return bTime - aTime;
  });
  let newData = sortByDate.filter(i => !!RPRegTokenInfo.find(val => val.scAddr === i.rpTokenAddr || [i.rpTokenSymbol, i.symbol].includes(val.symbol))).map(item => {
    let status, date, val, tui, sui;
    let tokenInfo = RPRegTokenInfo.find(val => val.scAddr === item.rpTokenAddr || [item.rpTokenSymbol, item.symbol].includes(val.symbol));

    if (item.rpStartTime === '0' || item.rpInfo) {
      if (item.rpStartTime === '0') {
        status = BigNumber(Date.now()).minus(item.createDate * 1000).gte('86400000') ? 'Failed' : 'onChain';
      } else {
        status =  BigNumber(Date.now()).minus(item.rpStartTime * 1000).gte('86400000') ? 'Finished' : 'Pending';
      }
      val = item.value;
      tui = !!Number(item.rpInfo.split('_')[1]);
      sui = !!Number(item.rpInfo.split('_')[2]);
      date = item.rpStartTime === '0' ? '' : new Date(item.rpStartTime * 1000).toLocaleString();
    } else {
      tui = !!item.rpType;
      sui = !!item.rpMode;
      status = item.rpFinished ? 'Finished' : 'Pending';
      date = new Date(item.rpStartTime * 1000).toLocaleString();
      val = new BigNumber(item.rpBonus).dividedBy(BigNumber(10).pow(item.rpDecimals)).toString(10);
    }
    return {
      tui,
      sui,
      val,
      date,
      status,
      id: item.rpCode,
      addr: item.rpSender,
      code: item.code || item.rpPrimeValCode,
      rpTokenSymbol: tokenInfo.symbol
    }
  })
  newData.isUpdate = createdRpHistory.isUpdate;
  return newData;
}

export function formatClaimedRpHistory(claimedRpHistory, RPRegTokenInfo) {
  if (RPRegTokenInfo.length === 0) {
    return [];
  }
  let sortByDate = claimedRpHistory.sort((a, b) => b.rpClaimedTs - a.rpClaimedTs);
  let newData = sortByDate.filter(i => !!RPRegTokenInfo.find(val => val.scAddr === i.rpTokenAddr)).map(item => {
    let status;
    let tokenInfo = RPRegTokenInfo.find(val => val.scAddr === item.rpTokenAddr)

    if(!['Finished', 'Failed'].includes(item.rpStatus)) {
      status = 'Pending'
    } else {
      status = item.rpStatus;
    }
    return {
      status,
      id: item.rpCode,
      code: item.rpPrimeValCode,
      addr: item.rpReceiver,
      date: new Date(item.rpClaimedTs * 1000).toLocaleString(),
      val: formatAmountShowing(new BigNumber(item.rpBonus || '0').dividedBy(BigNumber(10).pow(tokenInfo.decimals)).toString(10)),
      tui: item.rpReferred,
      sui: item.rpReferred ? false : !!item.rpMode,
      rpTokenSymbol: tokenInfo.symbol,
      rpReceiver: item.rpReceiver,
      rpClaimer: item.rpClaimer,
      claimId: item.claimId,
    }
  })
  newData.isUpdate = claimedRpHistory.isUpdate;
  return newData;
}

export function formatCreatedRpDetailData(data) {
  if(!data) {
    return {};
  }
  let rpCounts, rpMode, rpType, rpBonus
  if (data.rpStartTime === '0') {
    let rpInfoArr = data.rpInfo.split('_')
    rpMode = Number(rpInfoArr[2]);
    rpType = Number(rpInfoArr[1]);
    rpCounts = rpInfoArr[0];
    rpBonus = data.value;
  } else {
    rpMode = data.rpMode;
    rpType = data.rpType;
    rpCounts = data.rpCounts;
    rpBonus = formatValueToUnit(data.rpBonus, data.rpDecimals);
  }
  return {
    rpType,
    rpMode,
    rpBonus,
    rpCounts,
    code: data.code,
    rpCode: data.rpCode,
    rpDecimals: data.rpDecimals,
    rpFinished: data.rpFinished,
    rpRestCounts: data.rpRestCounts || 0,
    rpSender: data.rpSender,
    rpTokenAddr: data.rpTokenAddr,
    rpTokenSymbol: data.rpTokenSymbol || data.symbol,
    rpPrimeValCode: data.rpPrimeValCode || data.code,
    rpSender: data.rpSender,
    rpTxHash: data.rpTxHash,
    createDate: data.createDate || '0',
    rpRefBonus: formatValueToUnit(data.rpRefBonus, data.rpDecimals),
    rpStartTime: data.rpStartTime === '0' ? '0' : new Date(data.rpStartTime * 1000).toLocaleString(),
  }
}

export function formatCreatedRpDetailQuery(data, decimals) {
  if(!data) {
    return {};
  }
  let rpRestBonus = formatValueToUnit(data.rpStatisticInfo.rpRestBonus, decimals);
  let rpRestRefBonus = formatValueToUnit(data.rpStatisticInfo.rpRestRefBonus, decimals);
  let rpRevokedRefBonus = formatValueToUnit(data.rpStatisticInfo.rpRevokedRefBonus, decimals);
  let rpRevokedRpBonus = formatValueToUnit(data.rpStatisticInfo.rpRevokedRpBonus, decimals);
  let rpRevokedTotalBonus = new BigNumber(rpRevokedRefBonus).plus(rpRevokedRpBonus).toString(10);

  data.rpStatisticInfo.rpRestBonus = rpRestBonus;
  data.rpStatisticInfo.rpRestRefBonus = rpRestRefBonus;
  data.rpStatisticInfo.rpRevokedRefBonus = rpRevokedRefBonus;
  data.rpStatisticInfo.rpRevokedRpBonus = rpRevokedRpBonus;
  data.rpStatisticInfo.rpRevokedTotalBonus = rpRevokedTotalBonus;

  return data;
}

export function formatRpDetail_RpClaimInfo(data, decimals) {
  let sortByDate = data.sort((a, b) => b.rpClaimedTime - a.rpClaimedTime);
  let newData = sortByDate.map((item, index) => {
    return {
      id: index,
      addr: item.rpClaimer,
      date: new Date(item.rpClaimedTime * 1000).toLocaleString(),
      val: formatValueToUnit(item.rpBonus, decimals),
    }
  });
  if (newData.length === 0) {
    newData.isUpdate = true;
  }
  return newData;
}

export function formatRpDetail_RpRefInfo(data, decimals) {
  let sortByDate = data.sort((a, b) => b.rpReferredTime - a.rpReferredTime);
  let newData = sortByDate.map((item, index) => {
    return {
      id: index,
      addr: item.rpRefCode,
      date: new Date(item.rpReferredTime * 1000).toLocaleString(),
      val: formatValueToUnit(item.rpRefBonus, decimals),
    }
  });
  if (newData.length === 0) {
    newData.isUpdate = true;
  }
  return newData;
}

export function formatClaimedRpDetailData(data, RPRegTokenInfo) {
  let tokenInfo = RPRegTokenInfo.find(item => item.scAddr === data.rpTokenAddr)
  return {
    rpBonus:formatValueToUnit(data.rpBonus, tokenInfo.decimals),
    rpClaimedTs: new Date(data.rpClaimedTs * 1000).toLocaleString(),
    rpTokenSymbol: tokenInfo.symbol,
    iconData: tokenInfo.iconData,
    iconType: tokenInfo.iconType,
    rpClaimer: data.rpClaimer,
    rpCode: data.rpCode,
    rpPrimeValCode: data.rpPrimeValCode,
    rpReceiver: data.rpReceiver,
    rpReferred: data.rpReferred,
    rpStatus: data.rpStatus,
    tui: data.rpReferred,
    sui: !!data.rpMode,
    rpStartTime: new Date(data.rpStartTime * 1000).toLocaleString(),
    rpSender: data.rpSender,
  };
}

export function formatRpCode(rpCode) {
  // https://www.wanchain.org/redPacket?rpCode=***&rpRefCode=****
  let rpRefCode;
  if (!rpCode) {
    return [];
  }
  try {
    if (rpCode.search(rpCodePrex) !== -1) {
      let tmp1 = rpCode.split('?')[1];
      if (!tmp1) {
        return [];
      }
      let tmp2 = tmp1.split('&');
      if (tmp2.length === 1) {
        rpCode = tmp2[0].split('=')[1]
        return [rpCode]
      } else {
        rpCode = tmp2[0].split('=')[1]
        rpRefCode = tmp2[1].split('=')[1]
        return [rpCode, rpRefCode]
      }
    } else {
      return [rpCode];
    }
  } catch(e) {
    console.log('formatRpCode:', e)
    return [];
  }
}

export function createWRPCode(rpCode) {
  return '0x' + Crypto.SHA256(rpCode.toString());
}

export function checkRequireValue(value) {
  if(['', '0', 0, undefined].includes(value)) {
    return true;
  }
  if(!new BigNumber(value).gt('0')) {
    return true;
  }
}

function formatLongText(data, len = '8') {
  if (data.length >= 10) {
    return data.substr(0, len) + '....' + data.substr(-len)
  } else {
    return data;
  }
}

function formatLongValue(data, len = '10') {
  data = data.toString();
  if (data.length > 10) {
    return data.substr(0, len) + '...';
  } else {
    return data;
  }
}

function formatAmountShowing(data) {
  let [left, right] = data.split('.');
  if(right) {
    return left + '.' + right.substr(0, 6);
  } else {
    return data;
  }
}

export function overTime(a, b = '86400000') {
  return BigNumber(Date.now()).minus(a * 1000).lte(b);
}

export function checkMinBonus(value, quantity, decimals) {
  let minBonus = getMinBonus(decimals, false).toString(10);
  return [new BigNumber(value).dividedBy(quantity).lt(minBonus), new BigNumber(minBonus).times(quantity).toString(10)];
}

export { MAXCOUNT, formatValue, formatValueToUnit, formatLongText, formatLongValue, }
