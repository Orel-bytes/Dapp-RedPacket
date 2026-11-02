// in src/posts.js
import * as React from "react";
import {
    List, Link, SimpleShowLayout,ReferenceManyField,ListGuesser,SimpleList, Datagrid, TextField, ReferenceField, EditButton, Edit, SimpleForm, TextInput, ReferenceInput, SelectInput, Create, Filter,
    DateField, DateInput, NumberField, BooleanField, Show, TabbedShowLayout,Tab,BaseInfo
} from 'react-admin';
import { useMediaQuery } from '@material-ui/core';

const RPListFilter = (props) => (
    <Filter {...props}>
        <TextInput label="rpCode" source="rpCode" alwaysOn />
        <TextInput label="rpClaimer" source="rpClaimer" alwaysOn />
    </Filter>
);

export const RpreqclaimList = props => (
    <List {...props} filters={<RPListFilter />} bulkActionButtons={false}>
        <Datagrid rowClick="show">
            <TextField source="rpCode" />
            <TextField source="rpClaimer" />
            <TextField source="rpCheckTs" />
            <TextField source="rpPrimeValCode" />
            <TextField source="rpStartTime" />
            <TextField source="rpRefCode" />
            <TextField source="rpReceiveTs" />
            <TextField source="rpSendTs" />
            <NumberField source="rpTxNonce" />
            <TextField source="rpTxHash" />
            <NumberField source="rpGasPrice" />
            <BooleanField source="rpSuccess" />
            <NumberField source="rpStatus" />
        </Datagrid>
    </List>
);

const RPReqBaseInfo = (props) => {
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>
                            <div>字段名</div>
                        </th>
                        <th>
                            <div>字段值</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>rpCode</td>
                        <td>
                            <TextField source="rpCode" {...props} />
                        </td>
                    </tr>
                    <tr>
                        <td>rpClaimer</td>
                        <td>
                            <TextField source="rpClaimer" {...props} />
                        </td>
                    </tr>
                    <tr>
                        <td>rpCheckTs</td>
                        <td>
                            <TextField source="rpCheckTs" {...props} />
                        </td>
                    </tr>
                    <tr>
                        <td>rpPrimeValCode</td>
                        <td>
                            <TextField source="rpPrimeValCode" {...props} />
                        </td>
                    </tr>
                    <tr>
                        <td>rpStartTime</td>
                        <td>
                            <TextField source="rpStartTime" {...props} />
                        </td>
                    </tr>
                    <tr>
                        <td>rpRefCode</td>
                        <td>
                            <TextField source="rpRefCode" {...props} />
                        </td>
                    </tr>
                    <tr>
                        <td>rpReceiveTs</td>
                        <td>
                            <TextField source="rpReceiveTs" {...props} />
                        </td>
                    </tr>
                    <tr>
                        <td>rpSendTs</td>
                        <td>
                            <TextField source="rpSendTs" {...props} />
                        </td>
                    </tr>
                    <tr>
                        <td>rpTxNonce</td>
                        <td>
                            <TextField source="rpTxNonce" {...props} />
                        </td>
                    </tr>
                    <tr>
                        <td>rpTxHash</td>
                        <td>
                            <TextField source="rpTxHash" {...props} />
                        </td>
                    </tr>
                    <tr>
                        <td>rpGasPrice</td>
                        <td>
                            <TextField source="rpGasPrice" {...props} />
                        </td>
                    </tr>
                    <tr>
                        <td>rpSuccess</td>
                        <td>
                            <TextField source="rpSuccess" {...props} />
                        </td>
                    </tr>
                    <tr>
                        <td>rpStatus</td>
                        <td>
                            <TextField source="rpStatus" {...props} />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}


const RPReqOnChainHistory = (props) => {
    let record = props.record;
    console.log("RPReqOnChainHistory record:", record);

    return (
        <ReferenceManyField {...props} reference={"RPReqHistory"} target={"rpCode"} id={record.rpCode} addLabel={false} >
            <Datagrid >
                <TextField source="rpCode" />
                <TextField source="rpClaimer" />
                <TextField source="rpCheckTs" />
                <TextField source="rpPrimeValCode" />
                <TextField source="rpStartTime" />
                <TextField source="rpRefCode" />
                <TextField source="rpReceiveTs" />
                <TextField source="rpSendTs" />
                <NumberField source="rpTxNonce" />
                <TextField source="rpTxHash" />
                <NumberField source="rpGasPrice" />
                <BooleanField source="rpSuccess" />
                <NumberField source="rpStatus" />
            </Datagrid>
        </ReferenceManyField>
    );
}

export const RPReqClaimDetail = (props) => {
    return (
        <Show {...props} basePath={'/RPReqClaim'} resource={'RPReqClaim'}>
            <TabbedShowLayout>
                <Tab label="领取记录" display={'flex'}>
                    <RPReqBaseInfo />
                </Tab>
                <Tab label="上链记录" >
                    <RPReqOnChainHistory />
                </Tab>
            </TabbedShowLayout >
        </Show>
    );
};
