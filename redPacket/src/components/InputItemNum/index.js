import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { WhiteSpace, InputItem } from 'antd-mobile';

import styles from './index.less';
const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);

let moneyKeyboardWrapProps;
if (isIPhone) {
  moneyKeyboardWrapProps = {
    onTouchStart: e => e.preventDefault(),
  };
}

function normalizeNum (v, prev) {
  if (v && !/^(([1-9]\d*)|0)(\.\d{0,6}?)?$/.test(v)) {
    if (v === '.') {
      return '0.';
    }
    return prev;
  }
  return v;
}

class InputItemNum extends Component {
  render() {
    const { getFieldProps, type, placeholder, name, thumb, title, moneyKeyboardAlign, disabled, value, onChange, disabledKeys, rules, initialValue } = this.props;

    return (
      <React.Fragment>
        <WhiteSpace size="lg" />
        <div className='inputitemnum_container'>
          <InputItem
            clear
            type={type}
            thumb={thumb}
            disabled={!!disabled}
            value={value}
            maxLength={14}
            autoAdjustHeight={true}
            moneyKeyboardAlign={moneyKeyboardAlign || 'right'}
            placeholder={disabled ? value : placeholder}
            ref={el => this.inputRef = el}
            disabledKeys={disabledKeys}
            moneyKeyboardWrapProps={moneyKeyboardWrapProps}
            {...getFieldProps(name, { normalize: normalizeNum, rules, initialValue })}
            onVirtualKeyboardConfirm={v => !disabled && onChange(v)}
            onBlur={v => !disabled && onChange(v)}
            onChange={v => !disabled && onChange(v)}
          >
            { thumb && <img src={thumb} className={styles.input_icon} /> }
            { title && <span className={styles.input_title}>{title}</span> }
          </InputItem>
        </div>
      </React.Fragment>

    );
  }
}

InputItemNum.propTypes = {
  name: PropTypes.string,
  title: PropTypes.string,
  thumb: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  getFieldProps: PropTypes.func,
  moneyKeyboardAlign: PropTypes.string,
};

export default InputItemNum;
