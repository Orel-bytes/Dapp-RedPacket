
import Identicon from 'identicon.js';
import * as redPacketService  from '@/services';
import { formatCreatedRpDetailQuery, WANADDR, formatValueToUnit } from '@/utils'

export default {
  state: {
    rpGasFee: '',
    noticeBarText: '',
    allAccountsInfo: [],
    RPRegTokenInfo: [],
    transParams: {},
    approveTransParams: {},
    createdRpHistory: [],
    createdRpDetail: {},
    claimedRpHistory: [],
    accountsTokenBalance: {},
  },
  reducers: {
    updateNoticeBarText(state, { payload: { data: noticeBarText } }) {
      return { ...state, noticeBarText };
    },
    updateAllAccountsInfo(state, { payload: { data: allAccountsInfo } }) {
      return { ...state, allAccountsInfo };
    },
    updateRPRegTokenInfo(state, { payload: { data: RPRegTokenInfo } }) {
      return { ...state, RPRegTokenInfo };
    },
    updateTransParams(state, { payload: { data: transParams } }) {
      return { ...state, transParams };
    },
    updateApproveTransParams(state, { payload: { data: approveTransParams } }) {
      return { ...state, approveTransParams };
    },
    updateCreatedRpHistory(state, { payload: { data: createdRpHistory } }) {
      if(!createdRpHistory.isUpdate) {
        createdRpHistory.isUpdate = true;
      }
      return { ...state, createdRpHistory };
    },
    updateRpGasFee(state, { payload: { data: rpGasFee } }) {
      return { ...state, rpGasFee: formatValueToUnit(rpGasFee) };
    },
    updateCreatedRpDetail(state, { payload: { data: createdRpDetail } }) {
      return { ...state, createdRpDetail };
    },
    updateClaimedRpHistory(state, { payload: { claimedRpHistory } }) {
      if(claimedRpHistory && !claimedRpHistory.isUpdate) {
        claimedRpHistory.isUpdate = true;
      }
      return { ...state, claimedRpHistory };
    },
    updateAccountsTokenBalance(state, { payload: {  tokenScAddr, data } }) {
      state.accountsTokenBalance[tokenScAddr] = data
      return { ...state, accountsTokenBalance: state.accountsTokenBalance };
    },
  },
  effects: {
    *fetchAllAccountsInfo({ payload: { chainType } }, { put, call }) {
      const data = yield call(redPacketService.fetchAllAccountsInfo, { chainType });
      yield put({ type: 'updateAllAccountsInfo', payload: { data } });
    },
    *fetchRPRegToken({ payload: {} }, { put, call }) {
      let ret = yield call(redPacketService.fetchRPRegToken, {});
      let data = yield call(redPacketService.fetchRegistToken, { scAddr: ret.filter(item => item.wrcAddr !== WANADDR).map(item => item.wrcAddr) });
      data.forEach(item => {
        if(!item.iconData || !item.iconType) {
          item.iconData = new Identicon(item.scAddr).toString();
          item.iconType = 'png'
        }
        let retSpic = ret.find(i => i.wrcAddr === item.scAddr);
        item.wrcRpMaxBonus = formatValueToUnit(retSpic.wrcRpMaxBonus, item.decimals)
      })
      let retWAN = ret.find(i => i.wrcAddr === WANADDR)
      data.unshift({ symbol: 'WAN', decimals: 18, scAddr: WANADDR, wrcRpMaxBonus: formatValueToUnit(retWAN.wrcRpMaxBonus) })
      yield put({ type: 'updateRPRegTokenInfo', payload: { data } });
    },
    *fetchCreatedRpHistoryQuery({ payload: {} }, { put, call, select }) {
      const allAccountsInfo = yield select(state => state.redPacket.allAccountsInfo)
      if (allAccountsInfo.length === 0) {
        return;
      }

      const data = yield call(redPacketService.fetchCreatedRpHistoryQuery, allAccountsInfo.map(item => item.address));
      const createdRpList = yield select(state => state.localStorage.createdRpList)
      createdRpList.forEach(item => {
        let ret;
        if (data) {
          ret = data.find(val => val.rpCode === item.rpCode && val.rpTxHash === item.rpTxHash);
        }
        if (ret) {
          if (item.rpStartTime === '0') {
            item.rpStartTime = ret.rpStartTime;
          }
          ret.code = item.code;
        } else {
          data.push(item);
        }
      })
      yield call(redPacketService.localStorageAction, 'setItem', 'createdRpList', createdRpList);
      yield put({ type: 'updateCreatedRpHistory', payload: { data } });
    },
    *fetchCreatedRpDetailQuery({ payload: { rpCode, rpStartTime, rpDecimals } }, { put, call }) {
      const data = yield call(redPacketService.fetchCreatedRpDetailQuery, rpCode, rpStartTime);
      yield put({ type: 'updateCreatedRpDetail', payload: { data: formatCreatedRpDetailQuery(data, rpDecimals) } });
    },
    *fetchRpGasFee({ payload: {} }, { put, call }) {
      const data = yield call(redPacketService.fetchRpGasFee);
      yield put({ type: 'updateRpGasFee', payload: { data } });
    },
    *fetchClaimedRpHistoryQuery({ payload: {} }, { put, call, select }) {
      const allAccountsInfo = yield select(state => state.redPacket.allAccountsInfo)
      if (allAccountsInfo.length === 0) {
        return;
      }
      const claimedRpHistory = yield call(redPacketService.fetchClaimedRpHistoryQuery, allAccountsInfo.map(item => item.address));
      yield put({ type: 'updateClaimedRpHistory', payload: { claimedRpHistory } });
    },
    *fetchAllAccountTokenBalance({ payload: { tokenScAddr, symbol } }, { put, call }) {
      const data = yield call(redPacketService.fetchAllAccountTokenBalance, tokenScAddr, symbol);
      yield put({ type: 'updateAccountsTokenBalance', payload: { tokenScAddr, data } });
    },
  },
};
