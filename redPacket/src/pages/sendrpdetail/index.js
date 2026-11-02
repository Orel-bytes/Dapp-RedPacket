import { Divider } from 'antd';
import { List } from 'antd-mobile';
import React, { Component } from 'react';
import { connect, injectIntl } from 'umi';

import styles from './index.less';
import TabBars from '@/components/TabBars';
import Loading from '@/components/Loading';
import handleClipboard from '@/utils/clipboard';
import copy from '@/assets/images/icon_detail.png';
import wan_icon from '@/assets/images/wan_icon.png';
import location from '@/assets/images/location.png';

import { formatCreatedRpDetailData, formatRpDetail_RpClaimInfo, formatRpDetail_RpRefInfo, formatLongText, overTime } from '@/utils'

const Item = List.Item;

class SendRpDetail extends Component {
  constructor(props) {
    super(props);
    const { intl } = this.props;
    this.tabs = [{ title: intl.formatMessage({id: 'index.GetRp'}), sub: '1' }, { title: intl.formatMessage({id: 'index.recommandReward'}), sub: '2' }];
  }
  componentDidMount() {
    const { fetchCreatedRpDetailQuery, match } = this.props;

    this.timer = setInterval(() => {
      let rpItem = this.props.createdRpHistory.find(item => item.rpCode === match.params.id);
      fetchCreatedRpDetailQuery(rpItem.rpCode, rpItem.rpStartTime, rpItem.rpDecimals)
    }, 10000)
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  copyToClip = (text, e) => {
    const { updateNoticeBarText, intl } = this.props
    handleClipboard(`https://www.wanchain.org/redPacket?rpCode=${text}`, e)
    updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.copy'}))
  }

  render() {
    const { createdRpHistory, match, createdRpDetail, RPRegTokenInfo, intl } = this.props;
    if (!createdRpDetail.rpStatisticInfo
        || RPRegTokenInfo.length === 0
        || !(createdRpDetail.rpStatisticInfo && createdRpDetail.rpStatisticInfo.rpCode === match.params.id)
      )
    {
      return <Loading />
    }
    let rpText = '';
    let rpDetail = formatCreatedRpDetailData(createdRpHistory.find(item => item.rpCode === match.params.id));
    let rpTokenInfo = RPRegTokenInfo.find(item => item.scAddr === rpDetail.rpTokenAddr || item.symbol === rpDetail.rpTokenSymbol)
    let tokenImage = rpDetail.rpTokenSymbol === 'WAN' ? wan_icon : `data:image/${rpTokenInfo.iconType};base64,${rpTokenInfo.iconData}`
    let code = rpDetail.code || rpDetail.rpPrimeValCode;

    if(rpDetail.rpStartTime === '0') {
      rpText = overTime(rpDetail.createDate) ? intl.formatMessage({id: 'sendrpdetail.notOnChain'}) : intl.formatMessage({id: 'txStatus.Failed'})
    } else {
      if (rpDetail.rpFinished) {
        // rpText = `红包已经过期退回，已领取${rpDetail.rpCounts - rpDetail.rpRestCounts}/${rpDetail.rpCounts}, 退回 ${createdRpDetail.rpStatisticInfo.rpRevokedTotalBonus} ${rpTokenInfo.symbol}`
        rpText = intl.formatMessage({id: 'sendrpdetail.rpText1'}, { received: rpDetail.rpCounts - rpDetail.rpRestCounts, rpCounts: rpDetail.rpCounts, rpRevokedTotalBonus: createdRpDetail.rpStatisticInfo.rpRevokedTotalBonus, symbol: rpTokenInfo.symbol })

      } else {
        // rpText = `红包领取中，已领取${rpDetail.rpCounts - rpDetail.rpRestCounts}/${rpDetail.rpCounts}，剩余金额${createdRpDetail.rpStatisticInfo.rpRestBonus}，剩余推荐金额${createdRpDetail.rpStatisticInfo.rpRestRefBonus}`
        rpText = intl.formatMessage({id: 'sendrpdetail.rpText2'}, { received: rpDetail.rpCounts - rpDetail.rpRestCounts, rpCounts: rpDetail.rpCounts, rpRestBonus: createdRpDetail.rpStatisticInfo.rpRestBonus, rpRestRefBonus: createdRpDetail.rpStatisticInfo.rpRestRefBonus })
      }
    }


    return (
      <div className='send_detail'>
        <div className={styles.send_detail_header}>
          <div className={styles.rpsender_info}><img className={styles.location_icon} src={location}/>{formatLongText(rpDetail.rpSender, '8')}{intl.formatMessage({id: 'getrpdetail.rp'})}</div>
          <div className={styles.headerOne}>
            <img src={tokenImage} className={styles.img_icon}/>
            <span className={styles.value}>{rpDetail.rpBonus}</span>
            <div className={styles.info}>
              {!!rpDetail.rpType && <span className={styles.type}>{intl.formatMessage({id: 'index.tui'})}</span>}
              {!!rpDetail.rpMode && <span className={styles.type}>{intl.formatMessage({id: 'index.sui'})}</span>}
              <p className={styles.unit}>{rpTokenInfo.symbol}</p>
            </div>
          </div>
          <Divider />
          <p className={styles.getSumm}>{rpText}</p>
        </div>
        <div className={styles.content + ' send_content'}>
          <List>
            <Item extra={`${rpDetail.rpRefBonus} ${rpTokenInfo.symbol}`} className={styles.detail_text}>{intl.formatMessage({id: 'sendrpdetail.recommandRpAmount'})}</Item>
          </List>
          {
            code &&
            <List>
              <Item extra={<div>{formatLongText(code, '6')} <img className={styles.copy + ' copyTo'} onClick={e => this.copyToClip(code, e)} src={copy} /></div>} className={styles.detail_text}>{intl.formatMessage({id: 'getrpdetail.rpCode'})}</Item>
            </List>
          }
          <List>
            <Item extra={formatLongText(rpDetail.rpTxHash)} className={styles.detail_text}>{intl.formatMessage({id: 'sendrpdetail.txHash'})}</Item>
          </List>
          {
            rpDetail.rpStartTime !== "0" &&
            <List>
              <Item extra={rpDetail.rpStartTime} className={styles.detail_text}>{intl.formatMessage({id: 'getrpdetail.rpCreateDate'})}</Item>
            </List>
          }
        </div>
        <div className={styles.divider}></div>
        <TabBars name='sendDetail' tabs={this.tabs} tabFirstData={formatRpDetail_RpClaimInfo(createdRpDetail.rpClaimInfo, rpDetail.rpDecimals)} tabSecondData={formatRpDetail_RpRefInfo(createdRpDetail.rpRefInfo, rpDetail.rpDecimals)} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { createdRpHistory, createdRpDetail, RPRegTokenInfo } = state.redPacket;
  return {
    createdRpDetail,
    createdRpHistory,
    RPRegTokenInfo,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    updateNoticeBarText: text => {
      const type = `redPacket/updateNoticeBarText`;
      dispatch({ type, payload: { data: text } });
      setTimeout(() => { dispatch({ type, payload: { data: '' } }) }, 5000)
    },
    fetchCreatedRpDetailQuery: (rpCode, rpStartTime, rpDecimals) => {
      const action = {
        type: `redPacket/fetchCreatedRpDetailQuery`,
        payload: { rpCode, rpStartTime, rpDecimals },
      };
      dispatch(action);
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(SendRpDetail));
