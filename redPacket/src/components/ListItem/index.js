import { List } from 'antd-mobile';
import PropTypes from 'prop-types';
import { Link, useIntl } from 'umi';
import React, { Component } from 'react';

import styles from './index.less';
import { formatLongText, formatLongValue } from '@/utils'


const Item = List.Item;
const Brief = Item.Brief;

function ExtraCom (props) {
  const { detail } = props;
  return <div className={styles.extra_con}><span className={styles.extra_text}>{formatLongValue(detail.val)} {detail.rpTokenSymbol}</span><br /><span>{detail.status}</span></div>
}

function ItemCom (props) {
  const { detail, route } = props;
  const intl = useIntl();
  let textId;
  if(route === 'sendrpdetail') {
    textId = detail.code;
  } else {
    textId = detail.addr;
  }
  return (
    <div className={styles.list_text}>
      <span className={styles.addr}>{formatLongText(textId)}</span>
      { detail.tui && <span className={styles.tui}>{intl.formatMessage({id: 'index.tui'})}</span> }
      { detail.sui && <span className={styles.sui}>{intl.formatMessage({id: 'index.sui'})}</span> }
    </div>
  )
}

class ListItem extends Component {
  rendChildren = data => {
    const { name } = this.props;

    if (name.search('index') !== -1) {
      return data.map((item, index) => {
        let route = name.split('_')[1] === 'tab1' ? 'getrpdetail' : 'sendrpdetail';
        let url = route === 'getrpdetail' ? `/${route}/${item.claimId}` : `/${route}/${item.id}`;

        return (
          <Link key={index} to={url}>
            <Item multipleLine extra={<ExtraCom detail={item}/>}>
              <ItemCom route={route} detail={item}/><Brief>{item.date}</Brief>
            </Item>
          </Link>
        );
      });
    } else {
      return data.map((item, index) => {
        return (
          <Item key={index} multipleLine extra={<ExtraCom detail={item}/>}>
            <ItemCom detail={item}/><Brief>{item.date}</Brief>
          </Item>
        );
      });
    }
  }

  render() {
    const { mockData } = this.props;

    return (
      <div className='lists'>
        <List>
          { this.rendChildren(mockData) }
        </List>
      </div>
    );
  }
}

ListItem.propTypes = {
  name: PropTypes.string,
  mockData: PropTypes.array,
};

export default ListItem;
