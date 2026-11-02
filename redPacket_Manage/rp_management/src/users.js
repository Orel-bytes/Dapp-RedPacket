

// in src/users.js
import * as React from "react";
import { List, Datagrid, TextField, DateField, EditButton } from 'react-admin';
import MyUrlField from './MyUrlField';

export const UserList = props => (
    <List {...props}>
        <Datagrid rowClick="edit">
            <TextField source="name" />
            <TextField source="sex" />
            <TextField source="id" />
            <TextField source="photo" />
            <DateField source="birthday" />
            <TextField source="ver" />
            <TextField source="hash_type" />
            <TextField source="hash" />
            <EditButton/>
        </Datagrid>
    </List>
);


//export const UserList = props => (
//    <List {...props}>
//        <Datagrid rowClick="edit">
//            <TextField source="id" />
//            <TextField source="name" />
//            <EmailField source="email" />
//            <TextField source="phone" />
//            <MyUrlField source="website" />
//            <TextField source="company.name" />
//        </Datagrid>
//    </List>
//);


