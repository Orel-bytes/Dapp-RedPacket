// in src/posts.js
import * as React from "react";
import {
    List, Link, SimpleShowLayout,ReferenceManyField,ListGuesser,SimpleList, Datagrid, TextField, ReferenceField, EditButton, Edit, SimpleForm, TextInput, ReferenceInput, SelectInput, Create, Filter,
    DateField, DateInput, NumberField, BooleanField, Show, TabbedShowLayout,Tab,BaseInfo
} from 'react-admin';
import { useMediaQuery } from '@material-ui/core';

export const RPBalanceList = props => (
    <List {...props} bulkActionButtons={false}>
        <Datagrid rowClick="edit">
            <TextField source="address" />
            <NumberField source="balance" />
        </Datagrid>
    </List>
);

