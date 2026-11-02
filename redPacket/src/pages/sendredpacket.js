import { createForm } from 'rc-form';
import React, { Component } from 'react';
import { connect, injectIntl } from 'umi';
import { Picker, List, WhiteSpace, Button } from 'antd-mobile';

import styles from './index.less';
import handleClipboard from '@/utils/clipboard';
import handleClipboardElement from '@/utils/clipboardElement';
import { getAllowance, sendTransaction } from '@/services';
import Loading from '@/components/Loading';
import InputItemNum from '@/components/InputItemNum'
import SendRPConfirm from '@/components/SendRPConfirm'
import wan_icon from '@/assets/images/wan_icon.png';
import wallet_icon from '@/assets/images/wallet_icon.png';
import redpack_icon from '@/assets/images/redpack_icon.png';
import { formatePickerDate, checkMinBonus, checkRequireValue, MAXCOUNT, GASLIMIT, RPContract, formatAccountsPicker, calcRPTotalAmount, checkSingleValue, checkTotalValue, checkQuantity, checkOverBalance, getCreateRPTxData, getApproveTokenData, randomString, formatValue, createWRPCode } from '@/utils';

const DIGITS = 6;
const redPacketType = ['fixedRp', 'luckyRp'];
const InputItemTitle = ['perRpAmount', 'totalRpAmount'];
const btnType = ['warning', 'ghost'];
const ICONTYPE = { width: '30px', height: '30px', borderRadius: '50%' }

class SendRedPacket extends Component {
  state = {
    currType: 0,
    currRules: [ true, false ],
    recommendedBonus: 0,
    selectedAddr: [],
    selectedChain: [ 'WAN' ],
    quantity: 0,
    value: 0,
    showModal: false,
    amountArray: []
  }

  componentWillUnmount () {
    this.setState = (state, callback) => {
      return false;
    };
  }

  componentDidUpdate () {
    if (this.state.selectedAddr.length === 0) {
      if (this.props.allAccountsInfo.length) {
        this.setState({
          selectedAddr: [this.props.allAccountsInfo[0].name]
        })
      }
    }
  }

  changeType = () => {
    this.setState(state => ({
      currType: state.currType ^ 1,
    }));
  }

  selectRules = btnType => {
    const { setFieldsValue } = this.props.form;

    this.setState({
      currRules: [!btnType, !!btnType],
      recommendedBonus: 0,
    })
    if (!btnType) {
      setFieldsValue({
        recommendedBonus: 0
      });
    }
  }

  onChangeAddr = selectedAddr => {
    this.setState({ selectedAddr });
  };

  onChangeToken = selectedChain => {
    const { RPRegTokenInfo } = this.props;
    this.setState({ selectedChain });
    if(selectedChain[0] !== 'WAN') {
      let tokenInfo = RPRegTokenInfo.find(item => item.symbol === selectedChain[0])
      if(tokenInfo) {
        this.props.fetchAllAccountTokenBalance(tokenInfo.scAddr, selectedChain[0])
      }
    }
  }

  onChangeValue = value => {
    this.setState({ value });
    this.props.form.setFieldsValue({ value })
  }

  onChangeQuantity = quantity => {
    this.setState({ quantity });
    this.props.form.setFieldsValue({ quantity })
  }

  onChangeRecommendedBonus = recommendedBonus => {
    this.setState({ recommendedBonus });
    this.props.form.setFieldsValue({ recommendedBonus })
  }

  showComfirmModal = e => {
    e.preventDefault(); // 修复 Android 上点击穿透

    const { value, quantity, recommendedBonus, currRules, currType, selectedChain, selectedAddr } = this.state;
    const { form, updateNoticeBarText, RPRegTokenInfo, updateTransParams, rpGasFee, updateApproveTransParams, allAccountsInfo, intl } = this.props;
    const { validateFields, getFieldValue } = form;

    validateFields(err => {
      if (err) {
        console.log('showComfirmModal:', err);
        updateNoticeBarText(Object.values(err)[0].errors[0].message)
        return;
      };
      let balance = getFieldValue('balance');
      let accounts = allAccountsInfo.find(i => i.name === selectedAddr[0]);
      let selectedChainInfo = RPRegTokenInfo.find(item => item.symbol === selectedChain[0]);
      let amountArray = calcRPTotalAmount(value, quantity, recommendedBonus, currType, currRules[1], rpGasFee);

      if(!checkOverBalance(selectedChainInfo.wrcRpMaxBonus, amountArray[1])) {
        updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.overMaxValue'}))
        return;
      }
      if(!checkOverBalance(accounts.balance, amountArray[4])) {
        updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.overGasFee'}))
        return;
      }
      if (currType === 1) {
        let ret = checkMinBonus(value, quantity, selectedChainInfo.decimals);
        if(ret[0]) {
          updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.gteMinBonus'}, { minBonus: ret[1] }))
          return;
        }
      }
      if (checkOverBalance(balance, selectedChain[0] !== 'WAN' ? amountArray[1] : amountArray[0])) {
        let code = randomString();
        let rpCode = createWRPCode(code);
        let value = selectedChain[0] === 'WAN' ? formatValue(amountArray[0]) : formatValue(amountArray[4], selectedChainInfo.decimals)
        let data = getCreateRPTxData(rpCode, this.state.currRules[1], this.state.currType, quantity, amountArray[2], amountArray[3], selectedChainInfo.decimals, selectedChainInfo.scAddr)
        if(selectedChain[0] !== 'WAN') {
          let approveData = getApproveTokenData(amountArray[1], selectedChainInfo.decimals)
          updateApproveTransParams({
            value: '0',
            data: approveData,
            gasLimit: GASLIMIT,
            from: accounts.address,
            to: selectedChainInfo.scAddr,
          });
        }
        updateTransParams({
          data,
          code,
          value,
          rpCode,
          to: RPContract,
          gasLimit: GASLIMIT,
          from: accounts.address,
        });
        this.setState({ showModal: true, amountArray })
      } else {
        updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.overBalance'}))
      }

    })
  }

  closeComfirmModal = () => {
    this.setState({ showModal: false, amountArray: [] })
  }

  sendTrans = cb => {
    const { approveTransParams, updateNoticeBarText, RPRegTokenInfo, intl, allAccountsInfo } = this.props;
    let accounts = allAccountsInfo.find(i => i.name === this.state.selectedAddr[0]);
    let selectedChainInfo = RPRegTokenInfo.find(item => item.symbol === this.state.selectedChain[0]);

    if(this.state.selectedChain[0] === 'WAN') {
      this.sendCreateRpTrans(cb)
    } else {
      getAllowance(accounts.address, selectedChainInfo.scAddr).then(data => {
        console.log('getAllowanceData', data)
        if(data) {
          sendTransaction(approveTransParams).then(approveTxHash => {
            console.log('approveTxHash:', approveTxHash)
            this.sendCreateRpTrans(cb);
          }).catch(err => {
            console.log('sendApproveTransErr', err);
            updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.sendTxFailed'}))
            this.setState({ showModal: false, amountArray: [] });
            cb()
          })
        } else {
          let approve0Params = Object.assign({}, approveTransParams, { data: getApproveTokenData('0', selectedChainInfo.decimals) })
          sendTransaction(approve0Params).then(approve0TX => {
            console.log('approve0TX', approve0TX)
            return sendTransaction(approveTransParams)
          }).then(approveTxHash => {
            console.log('approveTxHash:', approveTxHash)
            this.sendCreateRpTrans(cb);
          }).catch(err => {
            console.log('sendApproveTransErr', err);
            updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.sendTxFailed'}))
            this.setState({ showModal: false, amountArray: [] });
            cb();
          })
        }
      })
    }
  }

  sendCreateRpTrans = cb => {
    const { quantity, recommendedBonus, currRules, currType, selectedChain, amountArray } = this.state;
    const { transParams, updateNoticeBarText, addCreatedRp, intl } = this.props;
    let { code, rpCode, ...tx } = transParams;

    let sendConfirm = document.querySelector('.send_form')
    handleClipboardElement(`https://www.wanchain.org/redPacket?rpCode=${code}`, sendConfirm);

    window.web3.eth.sendTransaction(tx, (err, rpTxHash) => {
      if (err) {
        console.log('sendTransaction', err);
        updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.sendTxFailed'}))
        this.setState({ showModal: false, amountArray: [] });
        cb();
      } else {
        console.log('txHash:', rpTxHash)
        addCreatedRp({
          code,
          rpCode,
          rpTxHash,
          rpStartTime: '0',
          recommendedBonus,
          value: amountArray[2],
          symbol: selectedChain[0],
          createDate: Date.now() / 1000,
          rpSender: transParams.from.toLowerCase(),
          rpInfo: `${quantity}_${Number(currRules[1])}_${currType}` // count_tui_sui
        })

        this.setState({ showModal: false, amountArray: [] });
        updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.sendSuccess'}));
        cb();
      }
    })
  }

  checkValue = (rule, value, callback) => {
    const { selectedChain, currType } = this.state;
    const { RPRegTokenInfo, updateNoticeBarText, intl } = this.props;

    if (checkRequireValue(value)) {
      return callback(intl.formatMessage({id: 'noticeBarText.inputValue'}))
    }
    let selectedChainInfo = RPRegTokenInfo.find(item => item.symbol === selectedChain[0]);
    let digits = selectedChainInfo.decimals >= DIGITS ? DIGITS : decimals;
    let callbackText = intl.formatMessage({id: 'noticeBarText.digitsLimited'}, { digits });

    if (currType === 0) {
      if (checkSingleValue(value, selectedChainInfo.decimals)) {
        callback();
      } else {
        updateNoticeBarText(callbackText)
        callback(callbackText);
      }
    } else {
      if (checkTotalValue(value, selectedChainInfo.decimals)) {
        callback();
      } else {
        updateNoticeBarText(callbackText)
        callback(callbackText);
      }
    }
  }

  checkQuantity = (rule, value, callback) => {
    const { intl } = this.props;
    if (checkRequireValue(value)) {
      this.props.updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.inputQuantity'}))
      callback(intl.formatMessage({id: 'noticeBarText.inputQuantity'}));
      return;
    }
    if (checkQuantity(value)) {
      callback();
    } else {
      this.props.updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.maxQuantity'}, { quantity: MAXCOUNT }))
      callback(intl.formatMessage({id: 'noticeBarText.maxQuantity'}, { quantity: MAXCOUNT }));
    }
  }

  checkRecommendedBonus = (rule, value, callback) => {
    const { RPRegTokenInfo, updateNoticeBarText, intl } = this.props;
    let selectedChainInfo = RPRegTokenInfo.find(item => item.symbol === this.state.selectedChain[0]);

    if (checkRequireValue(value)) {
      return callback(intl.formatMessage({id: 'noticeBarText.inputRecoValue'}))
    }
    if (checkSingleValue(value, selectedChainInfo.decimals)) {
      callback();
    } else {
      updateNoticeBarText(intl.formatMessage({id: 'noticeBarText.overRecoValue'}))
      callback(intl.formatMessage({id: 'noticeBarText.overRecoValue'}));
    }
  }

  render() {
    const { value, quantity, recommendedBonus, currType, currRules, selectedAddr, selectedChain } = this.state;
    const { form, allAccountsInfo, RPRegTokenInfo, rpGasFee, accountsTokenBalance, intl } = this.props;
    const { getFieldProps } = form;
    if (!allAccountsInfo.length || RPRegTokenInfo.length === 0 || rpGasFee === '') {
      return <Loading />
    }

    let balance;
    let [btn1, btn2] = currRules;
    let totalAmount =  calcRPTotalAmount(value, quantity, recommendedBonus, currType, btn2, rpGasFee)[1];
    let tokenValues = RPRegTokenInfo.map(item => {
      let label = item.symbol === 'WAN' ? <div key={item.symbol} className={styles.list_token}><img src={wan_icon} style={ICONTYPE}/><span className={styles.tokenName}>{item.symbol}</span></div> : <div key={item.symbol} className={styles.list_token}><img style={ICONTYPE} src={`data:image/${item.iconType};base64,${item.iconData}`}/><span className={styles.tokenName}>{item.symbol}</span></div>
      return { label, value: item.symbol, key: item.symbol }
    })
    let accounts = allAccountsInfo.find(i => i.name === selectedAddr[0]) || {};

    if (selectedChain[0] === 'WAN') {
      balance = accounts.balance || '0';
    } else {
      let tokenInfo = RPRegTokenInfo.find(item => item.symbol === selectedChain[0])
      if(accountsTokenBalance[tokenInfo.scAddr]) {
        balance = accountsTokenBalance[tokenInfo.scAddr][accounts.address] || '0';
      } else {
        balance = '0'
      }
    }

    return (
      <div className='send_form'>
        <WhiteSpace size="lg" />
        <Picker className='chain_select' itemStyle={{ height: '40px' }} okText={intl.formatMessage({id: 'index.ok'})} dismissText={intl.formatMessage({id: 'index.cancel'})} onPickerChange={this.onChangeToken} indicatorStyle={{ height: '40px' }} data={tokenValues} value={selectedChain} cols={1} onChange={this.onChangeToken}>
          <List.Item className='token_type' thumb={wallet_icon} arrow="down"><span className={styles.list_name}>{intl.formatMessage({id: 'sendredpacket.selectChain'})}</span></List.Item>
        </Picker>
        <WhiteSpace size="lg" />
        <Picker okText={intl.formatMessage({id: 'index.ok'})} dismissText={intl.formatMessage({id: 'index.cancel'})} format={label => formatePickerDate(label)} onPickerChange={this.onChangeAddr} data={formatAccountsPicker(allAccountsInfo)} value={selectedAddr} onChange={this.onChangeAddr} cols={1} >
          <List.Item className='token_type' thumb={wallet_icon} arrow="down"><span className={styles.list_name}>{intl.formatMessage({id: 'sendredpacket.selectAddr'})}</span></List.Item>
        </Picker>
        <InputItemNum name='balance' type='money' disabled={true} initialValue={balance} value={balance} thumb={redpack_icon} getFieldProps={getFieldProps} title={intl.formatMessage({id: 'sendredpacket.balance'})} />
        <InputItemNum name='value' type='money' placeholder='0.00' rules={[{ required: true, validator: this.checkValue }]} value={this.state.value} onChange={this.onChangeValue} getFieldProps={getFieldProps} thumb={redpack_icon} title={intl.formatMessage({id: `sendredpacket.${InputItemTitle[this.state.currType]}`})} />
        <p className={styles.type_text}>{intl.formatMessage({id: 'sendredpacket.currentIs'})}{intl.formatMessage({id: `sendredpacket.${redPacketType[this.state.currType]}`})}，<span className={styles.type_color} onClick={this.changeType}>{intl.formatMessage({id: 'sendredpacket.changeTo'})}{intl.formatMessage({id: `sendredpacket.${redPacketType[this.state.currType^1]}`})}</span></p>
        <InputItemNum name='quantity' type='money' placeholder={intl.formatMessage({id: 'sendredpacket.quantityPlaceholder'})} rules={[{ required: true, validator: this.checkQuantity }]} disabledKeys={['.']} value={this.state.quantity} onChange={this.onChangeQuantity} getFieldProps={getFieldProps} title={intl.formatMessage({id: 'sendredpacket.setQuantity'})} />
        <WhiteSpace size="lg" />
        <Button size="small" onClick={() => this.selectRules(0)} type={btnType[Number(btn1)^1]} inline style={{ marginRight: '1em' }}>{intl.formatMessage({id: 'sendredpacket.normalRp'})}{btn1 ? <span>√</span> : ''}</Button>
        <Button size="small" onClick={() => this.selectRules(1)} type={btnType[Number(btn2)^1]} inline style={{ marginRight: '1em' }}>{intl.formatMessage({id: 'sendredpacket.recommandRp'})}{btn2 ? <span>√</span> : ''}</Button>
        { btn2 && <InputItemNum name='recommendedBonus' type='money' value={this.state.recommendedBonus} rules={[{ required: true, validator: this.checkRecommendedBonus }]} placeholder='0.00' onChange={this.onChangeRecommendedBonus} getFieldProps={getFieldProps} title={intl.formatMessage({id: 'sendredpacket.recommValue'})} /> }
        <h2 className={styles.total_val}>{isNaN(totalAmount) ? '0' : totalAmount}</h2>
        <Button size="small" onClick={this.showComfirmModal} className={styles.send_btn} type="warning">{intl.formatMessage({id: 'sendredpacket.putToken'})}</Button>
        <SendRPConfirm selectedChain={selectedChain[0]} amountArr={this.state.amountArray} onClose={this.closeComfirmModal} visible={this.state.showModal} onSend={this.sendTrans} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { allAccountsInfo, RPRegTokenInfo, transParams, rpGasFee, accountsTokenBalance, approveTransParams } = state.redPacket;
  return {
    rpGasFee,
    transParams,
    RPRegTokenInfo,
    allAccountsInfo,
    approveTransParams,
    accountsTokenBalance,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    updateNoticeBarText: text => {
      const type = `redPacket/updateNoticeBarText`;
      dispatch({ type, payload: { data: text } });
      setTimeout(() => { dispatch({ type, payload: { data: '' } }) }, 5000)
    },
    fetchAllAccountsInfo: () => {
      const action = {
        type: `redPacket/fetchAllAccountsInfo`,
        payload: { chainType: 'WAN' },
      };
      dispatch(action);
    },
    updateTransParams: transParams => {
      const action = {
        type: `redPacket/updateTransParams`,
        payload: { data: transParams },
      };
      dispatch(action);
    },
    updateApproveTransParams: approveTransParams => {
      const action = {
        type: `redPacket/updateApproveTransParams`,
        payload: { data: approveTransParams },
      };
      dispatch(action);
    },
    addCreatedRp: newRp => {
      const action = {
        type: `localStorage/addCreatedRp`,
        payload: { newRp },
      };
      dispatch(action);
    },
    fetchAllAccountTokenBalance: (tokenScAddr, symbol) => {
      const action = {
        type: `redPacket/fetchAllAccountTokenBalance`,
        payload: { tokenScAddr, symbol },
      };
      dispatch(action);
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(createForm()(injectIntl(SendRedPacket)));
