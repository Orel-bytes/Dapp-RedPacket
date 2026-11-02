// in src/posts.js
import * as React from "react";
import {
    List, Link, SimpleShowLayout,ReferenceManyField,ListGuesser,SimpleList, Datagrid, TextField, ReferenceField, EditButton, Edit, SimpleForm, TextInput, ReferenceInput, SelectInput, Create, Filter,
    DateField, DateInput, NumberField, BooleanField, Show, TabbedShowLayout,Tab,BaseInfo
} from 'react-admin';
import { useMediaQuery } from '@material-ui/core';







export const RpreferenceList = props => (
    <List {...props} bulkActionButtons={false}>
        <Datagrid rowClick="edit">
            <TextField source="rpRefIndex" />
            <TextField source="rpCode" />
            <DateField source="rpStartTime" />
            <TextField source="rpClaimer" />
            <TextField source="rpRefCode" />
            <TextField source="rpRefBonus" />
            <DateField source="rpReferredTime" />
        </Datagrid>
    </List>
);

