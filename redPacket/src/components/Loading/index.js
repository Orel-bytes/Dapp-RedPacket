import React, { Component } from 'react';
import { Progress } from 'antd-mobile';

import styles from './index.less';

class Loading extends Component {
  state = {
    percent: 0
  }
  componentDidMount() {
    this.timer = setInterval(() => {
      if (this.state.percent === 90) {
        clearInterval(this.timer);
        return;
      }
      this.setState(state => ({
        percent: state.percent + 10
      }))
    }, 1000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  render() {
    return (
      <div className='progress_container'>
        <Progress percent={this.state.percent} position="fixed" />
      </div>
    );
  }
}

export default Loading;
