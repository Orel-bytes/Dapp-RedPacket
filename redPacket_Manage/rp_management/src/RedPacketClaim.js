// in src/posts.js
import * as React from "react";
import {
    List, Link, SimpleShowLayout,ReferenceManyField,ListGuesser,SimpleList, Datagrid, TextField, ReferenceField, EditButton, Edit, SimpleForm, TextInput, ReferenceInput, SelectInput, Create, Filter,
    DateField, DateInput, NumberField, BooleanField, Show, TabbedShowLayout,Tab,BaseInfo
} from 'react-admin';
import { useMediaQuery } from '@material-ui/core';







export const RpClaimList = props => (
    <List {...props} bulkActionButtons={false}>
        <Datagrid >
            <TextField source="rpCode" />
            <TextField source="rpClaimIndex" />
            <DateField source="rpStartTime" />
            <TextField source="rpClaimer" />
            <TextField source="rpBonus" />
            <TextField source="rpRefCode" />
            <NumberField source="rpClaimedTime" />
        </Datagrid>
    </List>
);













//const RPCodeUrlField = ({ record = {}, source }) => {
//    return (
//        <Link to={`/Redpackets/${record.rpCode}`}>
//            {record[source]}
//        </Link>
//    );
//}

//export const RedPacketList = props => (
//    <List {...props} bulkActionButtons={false}>
//        <Datagrid rowClick="show" >
//            <RPCodeUrlField source="rpCode" />
//            <TextField source="rpStartTime" />
//            <TextField source="rpIndex" />
//            <TextField source="rpSender" />
//            <NumberField source="rpBonus" />
//            <NumberField source="rpRefBonus" />
//            <TextField source="rpType" />
//            <TextField source="rpMode" />
//            <TextField source="rpTokenType" />
//            <NumberField source="rpCounts" />
//            <NumberField source="rpRestCounts" />
//            <TextField source="rpTxHash" />
//            <TextField source="rpPrimeValCode" />
//            <BooleanField source="rpFinished" />
//        </Datagrid>
//    </List>
//);
////<RPCodeUrlField source="rpCode" />
//const RedPacketClaimRecord = (props) => {
//    console.log('RedPacketClaimRecord', props);
//    return (
//        <Show {...props}>
//            <SimpleShowLayout>
//                <TextField source="rpClaimIndex2" />
//                <TextField source="rpClaimer2" />
//                <TextField source="rpStartTime2" />
//                <TextField source="rpBonus2" />
//                <TextField source="rpRefCode2" />
//                <TextField source="rpClaimedTime2" />
//            </SimpleShowLayout>
//        </Show>);
//}

//const RedPacketClaimList = (props) => {
//    let record = props.record;
//    let str = "RedPackets/claim/" + record.rpCode;
//    return (
//        <ReferenceManyField {...props} reference={"RedPackets/claim/"} id={record.rpCode} addLabel={false}>
//            <Datagrid expand={<RedPacketClaimRecord />}>
//                <TextField source="rpClaimIndex1" />
//                <TextField source="rpClaimer1" />
//                <TextField source="rpStartTime1" />
//                <TextField source="rpBonus1" />
//                <TextField source="rpRefCode1" />
//                <TextField source="rpClaimedTime1" />
//            </Datagrid>
//        </ReferenceManyField>
//    )
//}

//const RedPacketBaseInfo = (props) => {
//    return (
//        <div>
//                <table>
//                    <thead>
//                        <tr>
//                            <th>
//                                <div>
//                                    字段名
//                                </div>
//                            </th>
//                            <th>
//                                <div>
//                                    字段值
//                                </div>
//                            </th>
//                            <th>
//                                <div>
//                                    字段名
//                                </div>
//                            </th>
//                            <th>
//                                <div>
//                                    字段值
//                                </div>
//                            </th>
//                        </tr>
//                    </thead>
//                    <tbody>
//                        <tr>
//                            <td>
//                                rpCode
//                            </td>
//                            <td>
//                                <TextField source="rpCode" {...props}/>
//                            </td>
//                            <td>rpStartTime</td>
//                            <td>
//                                <TextField source="rpStartTime" {...props} />
//                            </td>
//                        </tr>
//                        <tr>
//                            <td>rpIndex</td>
//                            <td>
//                                <TextField source="rpIndex" {...props} />
//                            </td>
//                            <td>rpSender</td>
//                            <td>
//                                <TextField source="rpSender" {...props} />
//                            </td>
//                        </tr>
//                        <tr>
//                            <td>rpBonus</td>
//                            <td>
//                                <TextField source="rpBonus" {...props} />
//                            </td>
//                            <td>rpRefBonus</td>
//                            <td>
//                                <TextField source="rpRefBonus" {...props} />
//                            </td>
//                        </tr>
//                        <tr>
//                            <td>rpType</td>
//                            <td>
//                                <TextField source="rpType" {...props} />
//                            </td>
//                            <td>rpMode</td>
//                            <td>
//                                <TextField source="rpMode" {...props} />
//                            </td>
//                        </tr>
//                        <tr>
//                            <td>rpTokenType</td>
//                            <td>
//                                <TextField source="rpTokenType" {...props} />
//                            </td>
//                            <td>rpCounts</td>
//                            <td>
//                                <TextField source="rpCounts" {...props} />
//                            </td>
//                        </tr>
//                        <tr>
//                            <td>rpRestCounts</td>
//                            <td>
//                                <TextField source="rpRestCounts" {...props} />
//                            </td>
//                            <td>rpTxHash</td>
//                            <td>
//                                <TextField source="rpTxHash" {...props} />
//                            </td>
//                        </tr>
//                        <tr>
//                            <td>rpPrimeValCode</td>
//                            <td>
//                                <TextField source="rpPrimeValCode" {...props} />
//                            </td>
//                            <td>rpFinished</td>
//                            <td>
//                                <TextField source="rpFinished" {...props} />
//                            </td>
//                        </tr>
//                    </tbody>
//                    <tfoot>
//                    </tfoot>
//                </table>
//            </div>
//    );
//};


//export const RedPacketDetail = (props) => {
//    return (
//        <Show {...props} basePath={'/RedPackets'} resource={'RedPackets'}>
//            <TabbedShowLayout>
//                <Tab label="红包详情" display={'flex'}>
//                    <RedPacketBaseInfo actionEn={props.actionEn === undefined} />
//                </Tab>
//                <Tab label="领取记录" >
//                    <RedPacketClaimList />
//                </Tab>

//            </TabbedShowLayout >
//        </Show>
//    );
//};




