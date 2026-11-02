export function fetchAllAccountsInfo({ chainType = 'WAN' }) {
  return new Promise((resolve, reject) => {
    window.web3.eth.getAllAccountBalance(chainType, (err, data) => {
      if (err) {
        console.log('fetchAllAccountsInfo', err)
        reject(err)
      } else {
        resolve(data)
      }
    });
  })
}

export function fetchAllAccountTokenBalance(tokenScAddr, symbol, chainType = 'WAN') {
  return new Promise((resolve, reject) => {
    window.web3.eth.getAllAccountTokenBalance(chainType, tokenScAddr, symbol, (err, data) => {
      if (err) {
        console.log('fetchAllAccountTokenBalanceErr', err)
        reject(err)
      } else {
        console.log('fetchAllAccountTokenBalanceData', data)
        resolve(data)
      }
    });
  })
}

export function fetchRPRegToken() {
  return new Promise((resolve, reject) => {
    window.iwan.iwanService.fetchService('rponchainservice', 'getRPRegToken', 'POST', {}, (err, data) => {
      if (err) {
        console.log('fetchRPRegToken', err)
        reject(err)
      } else {
        resolve(data)
      }
    });
  })
}

export function fetchRPSCBasicInfo() {
  return new Promise((resolve, reject) => {
    window.iwan.iwanService.fetchService('rponchainservice', 'getRPSCBasicInfo', 'POST', {}, (err, data) => {
      if (err) {
        console.log('fetchRPSCBasicInfo', err)
        reject(err)
      } else {
        resolve(data)
      }
    });
  })
}

export function fetchRegistToken({ chainType = 'WAN', scAddr }) {
  return new Promise((resolve, reject) => {
    window.web3.eth.getRegisteredMultiTokenInfo(chainType, scAddr, (err, data) => {
      if (err) {
        console.log('fetchRegistTokenErr', err)
        reject(err)
      } else {
        resolve(data)
      }
    });
  })
}

export function sendTransaction(transParams) {
  return new Promise((resolve, reject) => {
    window.web3.eth.sendTransaction(transParams, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

export function fetchCreatedRpHistoryQuery(addresses) {
  return new Promise((resolve, reject) => {
    window.iwan.iwanService.fetchService('rponchainservice', 'getRPInfo', 'POST', {
      queryType: 'CreatedRpHistoryQuery',
      reqSender: addresses
    }, (err, data) => {
      if (err) {
        console.log('fetchCreatedRpHistoryQueryErr:', err)
        reject(err)
      } else {
        resolve(data)
      }
    });
  })
}

export function fetchCreatedRpDetailQuery(rpCode, rpStartTime) {
  return new Promise((resolve, reject) => {
    window.iwan.iwanService.fetchService('rponchainservice', 'getRPInfo', 'POST', {
      queryType: 'CreatedRpDetailQuery',
      rpCode,
      rpStartTime
    }, (err, data) => {
      if (err) {
        console.log('fetchCreatedRpDetailQueryErr:', err)
        reject(err)
      } else {
        resolve(data)
      }
    });
  })
}

export function localStorageAction(action, type, data) {
  let localStorage = window.localStorage
  switch (action) {
    case 'getItem':
      return JSON.parse(localStorage.getItem(type));
    case 'addItem':
      let list = JSON.parse(localStorage.getItem(type)) || [];
      list.push(data);
      localStorage.setItem(type, JSON.stringify(list));
      return list;
    case 'setItem':
      if(data.length !== 0) {
        localStorage.setItem(type, JSON.stringify(data));
      }
      break;
    case 'removeItem':
      localStorage.removeItem(type);
      break;
  }
}

export function fetchRpGasFee() {
  return new Promise((resolve, reject) => {
    window.iwan.iwanService.fetchService('rponchainservice', 'getRPGasFee', 'POST', {}, (err, data) => {
      if (err) {
        console.log('fetchRpGasFee', err)
        reject(err)
      } else {
        resolve(data)
      }
    });
  })
}

export function fetchClaimedRpHistoryQuery(reqSender) {
  return new Promise((resolve, reject) => {
    window.iwan.iwanService.fetchService('rponchainservice', 'getRPInfo', 'POST', {
      queryType: 'ClaimedRpHistoryQuery',
      reqSender
    }, (err, data) => {
      if (err) {
        console.log('fetchClaimedRpHistoryQuery', err)
        reject(err)
      } else {
        resolve(data)
      }
    });
  })
}

export function getAllowance(account, tokenAddr) {
  return new Promise((resolve, reject) => {
    window.iwan.iwanService.fetchService('rponchainservice', 'getAllowance', 'POST', { account, tokenAddr }, (err, ret) => {
      if (err || ret.error) {
        console.log('getAllowanceErr', err)
        reject(err || ret.error)
      } else {
        resolve(ret.data)
      }
    });
  })
}
