// in src/posts.js
import * as React from "react";
import {
    List, Link, SimpleShowLayout,ReferenceManyField,ListGuesser,SimpleList, Datagrid, TextField, ReferenceField, EditButton, Edit, SimpleForm, TextInput, ReferenceInput, SelectInput, Create, Filter,
    DateField, DateInput, NumberField, BooleanField, Show, TabbedShowLayout,Tab,BaseInfo
} from 'react-admin';
import { useMediaQuery } from '@material-ui/core';

export const RPFillNonceTxList = props => (
    <List {...props} bulkActionButtons={false}>
        <Datagrid rowClick="edit">
            <NumberField source="rpTxNonce" />
            <TextField source="rpReceiveTs" />
            <TextField source="rpSendTs" />
            <TextField source="rpTxHash" />
            <NumberField source="rpGasPrice" />
            <TextField source="rpCheckTs" />
            <BooleanField source="rpSuccess" />
        </Datagrid>
    </List>
);

