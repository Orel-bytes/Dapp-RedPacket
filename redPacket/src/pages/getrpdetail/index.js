import { Divider } from 'antd';
import { List } from 'antd-mobile';
import React, { Component } from 'react';
import { connect, injectIntl } from 'umi';

import styles from './index.less';
import Loading from '@/components/Loading';
import handleClipboard from '@/utils/clipboard';
import copy from '@/assets/images/icon_detail.png';
import wan_icon from '@/assets/images/wan_icon.png';
import location from '@/assets/images/location.png';
import { formatClaimedRpDetailData, formatLongText } from '@/utils'

const Item = List.Item;

class GetRpDetail extends Component {
  copyToClip = (text, e) => {
    const { updateNoticeBarText, intl } = this.props
    handleClipboard(`https://www.wanchain.org/redPacket?rpCode=${text}`, e)
    updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.copy'}))
  }

  render() {
    const { claimedRpHistory, match, RPRegTokenInfo, intl } = this.props;
    if (claimedRpHistory.length === 0 || RPRegTokenInfo.length === 0) {
      return <Loading />
    }
    let rpDetail = formatClaimedRpDetailData(claimedRpHistory.find(item => item.claimId === match.params.claimId), RPRegTokenInfo);
    let tokenImage = rpDetail.rpTokenSymbol === 'WAN' ? wan_icon : `data:image/${rpDetail.iconType};base64,${rpDetail.iconData}`

    return (
      <div className='get_detail'>
        <div className={styles.send_detail_header}>
          <div className={styles.rpsender_info}><img className={styles.location_icon} src={location}/>{formatLongText(rpDetail.rpSender, '8')}{intl.formatMessage({id: 'getrpdetail.rp'})}</div>
          <div className={styles.headerOne}>
            <img src={tokenImage} className={styles.img_icon}/>
            <span className={styles.value}>{rpDetail.rpBonus}</span>
            <div className={styles.info}>
              <p className={styles.unit}>{rpDetail.rpTokenSymbol}</p>
            </div>
          </div>
          <Divider />
        </div>
        <div className='get_content'>
          {
            rpDetail.rpReferred &&
            <List>
              <Item extra={`${formatLongText(rpDetail.rpClaimer)}`} className={styles.detail_text}>{intl.formatMessage({id: 'getrpdetail.recommandPerson'})}</Item>
            </List>
          }
          <List>
            <Item extra={<div>{formatLongText(rpDetail.rpPrimeValCode)} <img className={styles.copy + ' copyTo'} onClick={e => this.copyToClip(rpDetail.rpPrimeValCode, e)} src={copy} /></div>} className={styles.detail_text}>{intl.formatMessage({id: 'getrpdetail.rpCode'})}</Item>
          </List>
          <List>
            <Item extra={rpDetail.rpStartTime} className={styles.detail_text}>{intl.formatMessage({id: 'getrpdetail.rpCreateDate'})}</Item>
          </List>
          <List>
            <Item extra={rpDetail.rpClaimedTs} className={styles.detail_text}>{intl.formatMessage({id: 'getrpdetail.rpGetDate'})}</Item>
          </List>
        </div>
        <div className={styles.divider}></div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { claimedRpHistory, RPRegTokenInfo } = state.redPacket;
  return {
    claimedRpHistory,
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(GetRpDetail));
