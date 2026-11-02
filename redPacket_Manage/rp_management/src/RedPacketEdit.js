

import * as React from "react";
import { Edit, SimpleForm, TextInput, DateInput } from "react-admin";

export const RedPacketEdit = props => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput source="name" />
            <TextInput source="sex" />
            <TextInput source="id" />
            <TextInput source="photo" />
            <DateInput source="birthday" />
            <TextInput source="ver" />
            <TextInput source="hash_type" />
            <TextInput source="hash" />
        </SimpleForm>
    </Edit>
);
