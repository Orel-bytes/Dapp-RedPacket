import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import { Link } from 'umi';

import styles from './index.less';

class CardAction extends Component {
  renderCover = props => {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block', width: '170px', cursor:'pointer', height: '170px' }}>
          <Link to={props.link}>
            <img src={props.imgSrc} style={{ width: '90%' }}/>
    　　     <div style={{ position:'absolute', zIindex:'2', left:'14%', top: '17%', fontSize: '21px', fontWeight: '700', color: '#fff' }}>{props.cardText}</div>
          </Link>
        </div>
      </div>
    )
  }
  render() {
    return (
      <div className='card_container'>
        <Card cover={this.renderCover(this.props)} bordered={false} ></Card>
      </div>
    );
  }
}

CardAction.propTypes = {
  link: PropTypes.string,
  imgSrc: PropTypes.string,
  cardText: PropTypes.string,
};

export default CardAction;
