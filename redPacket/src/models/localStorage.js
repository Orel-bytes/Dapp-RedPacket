
import * as redPacketService  from '@/services';

export default {
  state: {
    createdRpList: []
  },
  reducers: {
    updateCreatedRpList(state, { payload: { createdRpList } }) {
      return { ...state, createdRpList: createdRpList || [] };
    }
  },
  effects: {
    *fetchCreatedRpListFromLocal({ payload: {} }, { put, call }) {
      let createdRpList = yield call(redPacketService.localStorageAction, 'getItem', 'createdRpList');
      yield put({ type: 'updateCreatedRpList', payload: { createdRpList } });
    },
    *addCreatedRp({ payload: { newRp } }, { put, call, select }) {
      const createdRpList = yield select(state => state.localStorage.createdRpList)
      yield call(redPacketService.localStorageAction, 'addItem', 'createdRpList', newRp);
      createdRpList.push(newRp)
      yield put({ type: 'updateCreatedRpList', payload: { createdRpList } });
    },
    *updateCreateRp({ payload: { rpList } }, { put, call }) {
      let createdRpList = yield call(redPacketService.localStorageAction, 'setItem', 'createdRpList', rpList);
      yield put({ type: 'updateCreatedRpList', payload: { createdRpList } });
    },
  },
};
