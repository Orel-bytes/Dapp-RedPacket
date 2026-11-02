// in src/posts.js
import * as React from "react";
import {
    List, Link, DatagridBody,SimpleShowLayout,ReferenceManyField,ListGuesser,SimpleList, Datagrid, TextField, ReferenceField, EditButton, Edit, SimpleForm, TextInput, ReferenceInput, SelectInput, Create, Filter,
    DateField, DateInput, NumberField, BooleanField, Show, TabbedShowLayout,Tab,BaseInfo
} from 'react-admin';
import TableRow from '@material-ui/core/TableRow';
import { useMediaQuery } from '@material-ui/core';


const RPCodeUrlField = ({ record = {}, source }) => {
    return (
        <Link to={`/Redpackets/${record.rpCode}`}>
            {record[source]}
        </Link>
    );
}

export const RedPacketList = props => (
    <List {...props} bulkActionButtons={false}>
        <Datagrid rowClick="show" >
            <RPCodeUrlField source="rpCode" />
            <TextField source="rpStartTime" />
            <TextField source="rpIndex" />
            <TextField source="rpSender" />
            <NumberField source="rpBonus" />
            <NumberField source="rpRefBonus" />
            <TextField source="rpType" />
            <TextField source="rpMode" />
            <TextField source="rpTokenType" />
            <NumberField source="rpCounts" />
            <NumberField source="rpRestCounts" />
            <TextField source="rpTxHash" />
            <TextField source="rpPrimeValCode" />
            <BooleanField source="rpFinished" />
        </Datagrid>
    </List>
);

const RedPacketClaimRow = ({ rpClaimIndex, rpClaimer, rpStartTime, rpBonus, rpRefCode, rpClaimedTime }) => (
    <TableRow key={rpClaimIndex}>
    </TableRow>
)
const RedPacketClaimBody = props => <DatagridBody {...props} row={<RedPacketClaimRow />} />;


const RedPacketClaimList = (props) => {
    let record = props.record;
    return (
        <ReferenceManyField {...props} reference={"RPClaim"} target={"rpCode"} id={record.rpCode} addLabel={false} >
            <Datagrid >
                <TextField source="rpClaimIndex" />
                <TextField source="rpClaimer" />
                <TextField source="rpStartTime" />
                <TextField source="rpBonus" />
                <TextField source="rpRefCode" />
                <TextField source="rpClaimedTime" />
            </Datagrid>
        </ReferenceManyField>
    )
}

const RedPacketReferenceList = (props) => {
    let record = props.record;
    return (
        <ReferenceManyField {...props} reference={"RPReference"} target={"rpCode"} id={record.rpCode} addLabel={false} >
            <Datagrid >
                <TextField source="rpRefIndex" />
                <TextField source="rpCode" />
                <DateField source="rpStartTime" />
                <TextField source="rpClaimer" />
                <TextField source="rpRefCode" />
                <TextField source="rpRefBonus" />
                <DateField source="rpReferredTime" />
            </Datagrid>
        </ReferenceManyField>
    )
}

const RedPacketBaseInfo = (props) => {
    return (
        <div>
                <table>
                    <thead>
                        <tr>
                            <th>
                                <div>
                                    字段名
                                </div>
                            </th>
                            <th>
                                <div>
                                    字段值
                                </div>
                            </th>
                            <th>
                                <div>
                                    字段名
                                </div>
                            </th>
                            <th>
                                <div>
                                    字段值
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                rpCode
                            </td>
                            <td>
                                <TextField source="rpCode" {...props}/>
                            </td>
                            <td>rpStartTime</td>
                            <td>
                                <TextField source="rpStartTime" {...props} />
                            </td>
                        </tr>
                        <tr>
                            <td>rpIndex</td>
                            <td>
                                <TextField source="rpIndex" {...props} />
                            </td>
                            <td>rpSender</td>
                            <td>
                                <TextField source="rpSender" {...props} />
                            </td>
                        </tr>
                        <tr>
                            <td>rpBonus</td>
                            <td>
                                <TextField source="rpBonus" {...props} />
                            </td>
                            <td>rpRefBonus</td>
                            <td>
                                <TextField source="rpRefBonus" {...props} />
                            </td>
                        </tr>
                        <tr>
                            <td>rpType</td>
                            <td>
                                <TextField source="rpType" {...props} />
                            </td>
                            <td>rpMode</td>
                            <td>
                                <TextField source="rpMode" {...props} />
                            </td>
                        </tr>
                        <tr>
                            <td>rpTokenType</td>
                            <td>
                                <TextField source="rpTokenType" {...props} />
                            </td>
                            <td>rpCounts</td>
                            <td>
                                <TextField source="rpCounts" {...props} />
                            </td>
                        </tr>
                        <tr>
                            <td>rpRestCounts</td>
                            <td>
                                <TextField source="rpRestCounts" {...props} />
                            </td>
                            <td>rpTxHash</td>
                            <td>
                                <TextField source="rpTxHash" {...props} />
                            </td>
                        </tr>
                        <tr>
                            <td>rpPrimeValCode</td>
                            <td>
                                <TextField source="rpPrimeValCode" {...props} />
                            </td>
                            <td>rpFinished</td>
                            <td>
                                <TextField source="rpFinished" {...props} />
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                    </tfoot>
                </table>
            </div>
    );
};


export const RedPacketDetail = (props) => {
    return (
        <Show {...props} basePath={'/RedPackets'} resource={'RedPackets'}>
            <TabbedShowLayout>
                <Tab label="红包详情" display={'flex'}>
                    <RedPacketBaseInfo />
                </Tab>
                <Tab label="领取记录" >
                    <RedPacketClaimList />
                </Tab>
                <Tab label="分享记录" >
                    <RedPacketReferenceList />
                </Tab>
            </TabbedShowLayout >
        </Show>
    );
};




