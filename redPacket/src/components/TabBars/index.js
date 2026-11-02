import { Empty } from 'antd';
import { injectIntl } from 'umi';
import React, { Component } from 'react';
import { Tabs, WingBlank  } from 'antd-mobile';

import styles from './index.less';
import ListItem from '@/components/ListItem';

const leftUnderlineStyle = { borderTop: '1px #2385FC solid', width: '16%', left: '17%' };
const rightUnderlineStyle = { borderTop: '1px #2385FC solid', width: '16%', left: '68%' };

class TabBars extends Component {
  state = {
    tabBarUnderlineStyle: leftUnderlineStyle
  }

  handleTabChange = tab => {
    this.setState({ tabBarUnderlineStyle: tab.sub === '1' ? leftUnderlineStyle : rightUnderlineStyle});
  }

  render() {
    const { tabFirstData, tabSecondData, tabs, name, intl } = this.props;
    let tab1Title = tabFirstData.isUpdate ? intl.formatMessage({id: 'ActivityIndicator.noData'}) : intl.formatMessage({id: 'ActivityIndicator.loading'});
    let tab2Title = tabSecondData.isUpdate ? intl.formatMessage({id: 'ActivityIndicator.noData'}) : intl.formatMessage({id: 'ActivityIndicator.loading'});

    return (
      <WingBlank>
        <div className='tabBars_con'>
          <Tabs onChange={this.handleTabChange} tabs={tabs} initialPage={0} tabBarUnderlineStyle={this.state.tabBarUnderlineStyle} tabBarTextStyle={{ fontSize: '14px', padding: '6% 0' }}>
            <div className={styles.tabContent}>
              { tabFirstData.length === 0
                  ? <Empty description={tab1Title} />
                  : <ListItem name={`${name}_tab1`} mockData={tabFirstData} />
              }
            </div>
            <div className={styles.tabContent}>
              { tabSecondData.length === 0
                ? <Empty description={tab2Title} />
                : <ListItem name={`${name}_tab2`} mockData={tabSecondData} />
              }
            </div>
          </Tabs>
        </div>
      </WingBlank>
    );
  }
}

export default injectIntl(TabBars);
