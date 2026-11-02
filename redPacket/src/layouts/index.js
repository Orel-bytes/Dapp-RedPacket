import { Component } from 'react';
import { connect, withRouter } from 'umi';
import { NoticeBar } from 'antd-mobile';

import styles from './index.less';
class Layout extends Component {
  constructor(props) {
    super(props)
    if (!!window.localStorage.getItem('firstRunTime')) {
      if(window.wanExt.firstRunTime()!== window.localStorage.getItem('firstRunTime')) {
        window.localStorage.clear();
        window.localStorage.setItem('firstRunTime', window.wanExt.firstRunTime());
      }
    } else {
      window.localStorage.setItem('firstRunTime', window.wanExt.firstRunTime());
    }
  }

  async componentDidMount() {
      this.props.fetchCreatedRpListFromLocal();
      this.timer = setInterval(() => {
        this.props.fetchAllAccountsInfo();
        this.props.fetchCreatedRpHistoryQuery();
        this.props.fetchClaimedRpHistoryQuery();
        if (!this.props.rpGasFee) {
          this.props.fetchRpGasFee();
        }
        if(this.props.RPRegTokenInfo.length === 0) {
          this.props.fetchRPRegToken();
        }
        if(this.props.createdRpList.length === 0) {
          this.props.fetchCreatedRpListFromLocal()
        }
      }, 5000)
  }

  componentWillUnmount(){
    clearInterval(this.timer);
  }

  render() {
    const { noticeBarText, updateNoticeBarText } = this.props;

    return (
      <div className='layouts_con'>
        { noticeBarText !== '' && <NoticeBar mode="closable" onClick={updateNoticeBarText}>{noticeBarText}</NoticeBar> }
        {this.props.children}
      </div>
    )
  }
}

const mapStateToProps = state => {
  const { createdRpList } = state.localStorage;
  const { noticeBarText, rpGasFee, RPRegTokenInfo } = state.redPacket;
  return {
    RPRegTokenInfo,
    createdRpList,
    noticeBarText,
    rpGasFee,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    updateNoticeBarText: () => {
      const action = {
        type: `redPacket/updateNoticeBarText`,
        payload: { data: '' },
      };
      dispatch(action);
    },
    fetchAllAccountsInfo: () => {
      const action = {
        type: `redPacket/fetchAllAccountsInfo`,
        payload: { chainType: 'WAN' },
      };
      dispatch(action);
    },
    fetchRPRegToken: () => {
      const action = {
        type: `redPacket/fetchRPRegToken`,
        payload: {},
      };
      dispatch(action);
    },
    fetchCreatedRpHistoryQuery: () => {
      const action = {
        type: `redPacket/fetchCreatedRpHistoryQuery`,
        payload: {},
      };
      dispatch(action);
    },
    fetchRpGasFee: () => {
      const action = {
        type: `redPacket/fetchRpGasFee`,
        payload: {},
      };
      dispatch(action);
    },
    fetchCreatedRpListFromLocal: () => {
      const action = {
        type: `localStorage/fetchCreatedRpListFromLocal`,
        payload: {},
      };
      dispatch(action);
    },
    fetchClaimedRpHistoryQuery: () => {
      const action = {
        type: `redPacket/fetchClaimedRpHistoryQuery`,
        payload: {},
      };
      dispatch(action);
    }
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Layout));

