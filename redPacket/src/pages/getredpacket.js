import { createForm } from 'rc-form';
import React, { Component } from 'react';
import { connect, injectIntl } from 'umi';
import { Picker, List, InputItem, ActivityIndicator } from 'antd-mobile';

import styles from './index.less';
import rp_copy from '@/assets/images/copy.png';
import handleClipboard from '@/utils/clipboard';
import { formatAccountsPicker, formatRpCode } from '@/utils'


class ExtractRedPacket extends Component {
  state = {
    rpCode: '',
    loading: false,
    rpClaimer: [],
  }

  componentDidUpdate () {
    if (this.state.rpClaimer.length === 0) {
      if (this.props.allAccountsInfo.length) {
        this.setState({
          rpClaimer: [this.props.allAccountsInfo[0].name]
        })
      }
    }
  }

  onChangeRpClaimer = rpClaimer => {
    this.setState({ rpClaimer });
  };

  onChangeRpCode = rpCode => {
    this.setState({ rpCode });
  }

  claimRP = () => {
    const { rpClaimer, rpCode } = this.state;
    const { updateNoticeBarText, intl, allAccountsInfo } = this.props;
    // 'https://www.wanchain.org/redPacket?rpCode=6329&rpRefCode=0x56664f3B65Cc5DAF4098ed10b66C4a86e58e21a4'
    let ret = formatRpCode(rpCode);
    let accounts = allAccountsInfo.find(i => i.name === rpClaimer[0]);
    if (ret.length === 0) {
      updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.inputCorrectCode'}))
      return;
    }
    if (ret[1] === accounts.address) {
      updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.diffBtwAddr'}))
      return;
    }
    this.setState({ loading: true })
    window.iwan.iwanService.fetchService('rponchainservice', 'claimRP', 'POST', {
      rpClaimer: accounts.address,
      rpCode: ret[0],
      rpRefCode: ret[1]
    }, (err, data) => {
      if (err) {
        console.log('claimRPErr:', err)
        this.setState({ loading: false })
        updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.applyFailed'}))
      } else {
        if(data.error) {
          updateNoticeBarText(intl.formatMessage({id: `noticeBarText.applyError${data.error}`}))
        } else {
          updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.applySuccess'}))
        }
        this.setState({ loading: false })
      }
    });
  }

  onChangeRpCode = rpCode => {
    this.setState({ rpCode })
  }

  copyToClip = e => {

    const { rpClaimer, rpCode } = this.state;


    const { updateNoticeBarText, intl, allAccountsInfo } = this.props
    if(rpCode.trim() === ''){
      updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.norpcode'}));
      return;
    }
    if (rpClaimer[0]) {


      let accounts = allAccountsInfo.find(i => i.name === rpClaimer[0]);
      if (rpCode.startsWith('http')) {
        let part1 = rpCode.split('rpCode=')[1];
        let part2 = part1.split('&')[0];


        if(part2.trim() === ''){
          updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.norpcode'}))
          return;
        }else{
          handleClipboard(`https://www.wanchain.org/redPacket?rpCode=${part2}&rpRefCode=${accounts.address}`, e);
          updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.copy'}))
        }

      } else {
        handleClipboard(`https://www.wanchain.org/redPacket?rpCode=${rpCode}&rpRefCode=${accounts.address}`, e);
        updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.copy'}))
      }
    }
  }

  render() {
    const { allAccountsInfo, intl } = this.props;

    return (
      <div className='extract_form'>
        <div className={styles.extract_container}>
          <h3 className={styles.extract_title}>{intl.formatMessage({id: 'getredpacket.openRp'})}</h3>

          <div className={styles.extract_content}>
            <InputItem value={this.state.rpCode} onChange={this.onChangeRpCode} onVirtualKeyboardConfirm={this.onChangeRpCode} onBlur={this.onChangeRpCode} placeholder={intl.formatMessage({id: 'getredpacket.inputRpCode'})} />
            <Picker okText={intl.formatMessage({id: 'index.ok'})} dismissText={intl.formatMessage({id: 'index.cancel'})} extra={<span>{intl.formatMessage({id: 'getredpacket.selectAddr'})}</span>} data={formatAccountsPicker(allAccountsInfo)} cols={1} value={this.state.rpClaimer} onPickerChange={this.onChangeRpClaimer} onChange={this.onChangeRpClaimer} >
              <List.Item></List.Item>
            </Picker>
          </div>
          <div className={styles.getRedPackBtn}>
            <h3 className={styles.getRedPackText} onClick={this.claimRP}>{intl.formatMessage({id: 'getredpacket.getRp'})}</h3>
          </div>

          <p className={styles.copy_text} onClick={this.copyToClip}>{intl.formatMessage({id: 'getredpacket.copyAndShare'})}</p>
          { this.state.loading && <ActivityIndicator toast text={intl.formatMessage({id: 'ActivityIndicator.loading'})} /> }
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { allAccountsInfo } = state.redPacket;
  return {
    allAccountsInfo,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateNoticeBarText: text => {
      const type = `redPacket/updateNoticeBarText`;
      dispatch({ type, payload: { data: text } });
      setTimeout(() => { dispatch({ type, payload: { data: '' } }) }, 5000)
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(createForm()(injectIntl(ExtractRedPacket)));
