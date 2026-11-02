
import * as React from "react";
import { Admin, Resource,ListGuesser } from "react-admin";

import Dashboard from "./Dashboard";
import authProvider from './authProvider';

import dataProvider from './dataProvider';
import { RedPacketList, RedPacketDetail } from "./RedPackets";
import { RpClaimList } from "./RedPacketClaim";
import { RpreferenceList } from "./RedPacketReference.js";
import { RpreqclaimList, RPReqClaimDetail } from "./RedPacketReqClaim.js";

import { RPFillNonceTxList } from "./RedPacketFillNonceTx.js";
import { RPBalanceList } from "./RedPacketBalance.js";

//import { Admin, Resource, ListGuesser, EditGuesser } from "react-admin";
//import { UserList } from "./users";
//import { PostList, PostEdit, PostCreate } from "./posts";
import UserIcon from '@material-ui/icons/Group';
//import PostIcon from '@material-ui/icons/Book';
// import jsonServerProvider from 'ra-data-json-server';
// const dataProvider = jsonServerProvider('https://jsonplaceholder.typicode.com');



const App = () => (
    <Admin title="Test Title" dashboard={Dashboard} dataProvider={dataProvider}>
        <Resource name="Balance" options={{ label: '账户余额' }} list={RPBalanceList} icon={UserIcon} />
        <Resource name="RPReqClaim" options={{ label: '用户申领红包记录' }} list={RpreqclaimList} icon={UserIcon} show={RPReqClaimDetail} />
        <Resource name="RPFillNonceTx" options={{ label: '填补nonce空洞构造的记录' }} list={RPFillNonceTxList} icon={UserIcon} />

        <Resource name="RPReqHistory" options={{ label: '红包领取上链操作历史' }} icon={UserIcon} />
        <Resource name="RedPackets" options={{ label: '链上红包创建记录' }} icon={UserIcon} show={RedPacketDetail} />
        <Resource name="RPClaim" options={{ label: '链上红包领取记录' }} icon={UserIcon} />
        <Resource name="RPReference" options={{ label: '链上红包分享记录' }} icon={UserIcon} />

    </Admin>
);

        //<Resource name="RPReqHistory" options={{ label: '红包领取上链操作历史' }} icon={UserIcon} />
        //<Resource name="RedPackets" options={{ label: '链上红包创建记录' }} list={RedPacketList} icon={UserIcon} show={RedPacketDetail} />
        //<Resource name="RPClaim" options={{ label: '链上红包领取记录' }} list={RpClaimList} icon={UserIcon} />
        //<Resource name="RPReference" options={{ label: '链上红包分享记录' }} list={RpreferenceList} icon={UserIcon} />

export default App;
