import { connect, injectIntl } from 'umi';
import { Row, Col } from 'antd';
import React, { Component } from 'react';
import { WhiteSpace } from 'antd-mobile';

import styles from './index.less';
import Loading from '@/components/Loading';
import TabBars from '@/components/TabBars';
import CardAction from '@/components/CardAction'
import send from '@/assets/images/send.png';
import extract from '@/assets/images/extract.png';
import { formatCreatedRpListData, formatClaimedRpHistory } from '@/utils'

const mapStateToProps = state => {
  const { createdRpList } = state.localStorage;
  const { createdRpHistory, claimedRpHistory, RPRegTokenInfo } = state.redPacket;
  return {
    createdRpList,
    RPRegTokenInfo,
    createdRpHistory,
    claimedRpHistory,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    fetchAllAccountsInfo: () => {
      const action = {
        type: `redPacket/fetchAllAccountsInfo`,
        payload: { chainType: 'WAN' },
      };
      dispatch(action);
    },
  };
};

class IndexPage extends Component {
  render() {
    const { createdRpHistory, claimedRpHistory, RPRegTokenInfo, createdRpList, intl  } = this.props
    // if (RPRegTokenInfo.length === 0) {
    //   return <Loading />
    // }
    createdRpList.isUpdate = !createdRpList.length;

    const tabs = [ { title: intl.formatMessage({id: 'index.receivedrp'}), sub: '1' }, { title: intl.formatMessage({id: 'index.sendrp'}), sub: '2' }, ];
    let createRPData = createdRpHistory.length === 0 ? createdRpList : createdRpHistory
    let tabFirstData = formatClaimedRpHistory(claimedRpHistory, RPRegTokenInfo);
    let tabSecondData = formatCreatedRpListData(createRPData, RPRegTokenInfo);
    tabFirstData.forEach(item => item.status = intl.formatMessage({id: `txStatus.${item.status}`}) );
    tabSecondData.forEach(item => item.status = intl.formatMessage({id: `txStatus.${item.status}`}) );

    return (
      <div className='indexpage_content'>
        <WhiteSpace size="xl" />
        <Row justify="space-around">
          <Col span={10} className={styles.card_style}>
            <CardAction link={'/getredpacket'} imgSrc={extract} cardText={intl.formatMessage({ id: 'index.extract' })} />
          </Col>
          <Col span={10} className={styles.card_style}>
            <CardAction link={'/sendredpacket'} imgSrc={send} cardText={intl.formatMessage({ id: 'index.send' })} />
          </Col>
        </Row>
        <TabBars name='index' tabs={tabs} tabFirstData={tabFirstData} tabSecondData={tabSecondData} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(IndexPage));
