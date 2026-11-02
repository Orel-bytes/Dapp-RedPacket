import { injectIntl } from 'umi';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Modal, ActivityIndicator } from 'antd-mobile';

import styles from './index.less';

class SendRPConfirm extends Component {
  state = {
    loading: false
  }

  onWrapTouchStart = e => {
    // fix touch to scroll background page on iOS
    if (!/iPhone|iPod|iPad/i.test(navigator.userAgent)) {
      return;
    }
    const pNode = closest(e.target, '.am-modal-content');
    if (!pNode) {
      e.preventDefault();
    }
  }

  onPress = () => {
    const self = this
    if (!this.state.loading) {
      this.setState({
        loading: true
      })
      this.props.onSend(() => self.setState({ loading: false }));
    }
  }

  render() {
    const { loading } = this.state;
    const { visible, onClose, selectedChain, amountArr, intl } = this.props;

    return (
      <div className='send_confirm'>
        <Modal
          closable={true}
          visible={visible}
          transparent
          maskClosable={false}
          onClose={onClose}
          title={intl.formatMessage({id: 'sendRPConfirm.totalAmount'})}
          footer={[{ text: loading ? <ActivityIndicator animating /> : intl.formatMessage({id: 'sendRPConfirm.send'}), onPress: this.onPress }]}
          wrapProps={{ onTouchStart: this.onWrapTouchStart }}
        >
          <div>
            <div className={styles.totalAmount}>
            {
              selectedChain === 'WAN'
              ? <p>{amountArr[0]}<span>WAN</span></p>
              : <p>{amountArr[1]}<span>{selectedChain}</span>, {amountArr[4]}<span>WAN</span></p>
            }
            </div>
            <p className={styles.divideLine}>- - - - - - - - - - - - - - - - - - - - - - -</p>
            <div className={styles.amountDetail_con}>
              <p className={styles.amountDetail_title}>{intl.formatMessage({id: 'sendRPConfirm.rpFee'})}</p>
              <p className={styles.amountDetail_amount}>{amountArr[4]} <span>WAN</span></p>
            </div>
            <div className={styles.amountDetail_con}>
              <p className={styles.amountDetail_title}>{intl.formatMessage({id: 'sendRPConfirm.rpRecomReward'})}</p>
              <p className={styles.amountDetail_amount}>{amountArr[3]} <span>{selectedChain}</span></p>
            </div>
            <div className={styles.amountDetail_con}>
              <p className={styles.amountDetail_title}>{intl.formatMessage({id: 'sendRPConfirm.rpAmount'})}</p>
              <p className={styles.amountDetail_amount}>{amountArr[2]} <span>{selectedChain}</span></p>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

SendRPConfirm.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  onSend: PropTypes.func,
};

export default injectIntl(SendRPConfirm);
