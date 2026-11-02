import { fetchUtils } from 'react-admin';
import { stringify } from 'query-string';

import configJson from "./config";

const apiUrl = configJson.api_url;
const httpClient = fetchUtils.fetchJson;



export default {
    getList: (resource, params) => {
        console.log("getList resource:", resource);
        console.log("getList params:", params);
        if (resource === "RedPackets") {
            console.log("getList RedPackets params:", params);
            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;
            let query = {
                sort: JSON.stringify([field, order]),
                range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
                filter: JSON.stringify(params.filter),
            };
            const url = `${apiUrl}/${resource}?${stringify(query)}`;
            console.log("getList RedPackets url:", url);
            return httpClient(url).then(function ({ headers, json }) {
                console.log("headers.get('content-range').split('/'):", headers.get('content-range').split('/'));
                const ret_data = {
                    data: json,
                    total: parseInt(headers.get('content-range').split('/').pop(), 10)
                };
                return ret_data;
            });
        }
        else if (resource === "RPClaim") {
            console.log("getList RPClaim params:", params);
            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;
            let query = {
                sort: JSON.stringify([field, order]),
                range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
                filter: JSON.stringify(params.filter),
            };
            const url = `${apiUrl}/${resource}?${stringify(query)}`;
            console.log("getList RPClaim url:", url);
            return httpClient(url).then(function ({ headers, json }) {
                console.log("headers.get('content-range').split('/'):", headers.get('content-range').split('/'));
                const ret_data = {
                    data: json,
                    total: parseInt(headers.get('content-range').split('/').pop(), 10)
                };
                return ret_data;
            });
        }
        else if (resource === "RPReference") {
            console.log("getList RPReference params:", params);
            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;
            let query = {
                sort: JSON.stringify([field, order]),
                range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
                filter: JSON.stringify(params.filter),
            };
            const url = `${apiUrl}/${resource}?${stringify(query)}`;
            console.log("getList RPReference url:", url);
            return httpClient(url).then(function ({ headers, json }) {
                console.log("headers.get('content-range').split('/'):", headers.get('content-range').split('/'));
                const ret_data = {
                    data: json,
                    total: parseInt(headers.get('content-range').split('/').pop(), 10)
                };
                return ret_data;
            });
        }
        else if (resource === "RPReqClaim") {
            console.log("getList RPReqClaim params:", params);
            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;
            let query = {
                sort: JSON.stringify([field, order]),
                range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
                filter: JSON.stringify(params.filter),
            };
            const url = `${apiUrl}/${resource}?${stringify(query)}`;
            console.log("getList RPReqClaim url:", url);
            return httpClient(url).then(function ({ headers, json }) {
                console.log("headers.get('content-range').split('/'):", headers.get('content-range').split('/'));
                const ret_data = {
                    data: json,
                    total: parseInt(headers.get('content-range').split('/').pop(), 10)
                };
                return ret_data;
            });
        }
        else if (resource === "RPFillNonceTx") {
            console.log("getList RPFillNonceTx params:", params);
            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;
            let query = {
                sort: JSON.stringify([field, order]),
                range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
                filter: JSON.stringify(params.filter),
            };
            const url = `${apiUrl}/${resource}?${stringify(query)}`;
            console.log("getList RPReqClaim url:", url);
            return httpClient(url).then(function ({ headers, json }) {
                console.log("headers.get('content-range').split('/'):", headers.get('content-range').split('/'));
                const ret_data = {
                    data: json,
                    total: parseInt(headers.get('content-range').split('/').pop(), 10)
                };
                return ret_data;
            });
        }
        else if (resource === "Balance") {
            console.log("getList Balance params:", params);
            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;
            let query = {
                sort: JSON.stringify([field, order]),
                range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
                filter: JSON.stringify(params.filter),
            };
            const url = `${apiUrl}/${resource}?${stringify(query)}`;
            console.log("getList Balance url:", url);
            return httpClient(url).then(function ({ headers, json }) {
                console.log("headers.get('content-range').split('/'):", headers.get('content-range').split('/'));
                const ret_data = {
                    data: json,
                    total: parseInt(headers.get('content-range').split('/').pop(), 10)
                };
                return ret_data;
            });
        }
        else {
            console.log("skldsklfdksfdks");
        }
    },

    getOne: (resource, params) => {
        console.log("getOne resource:", resource);
        console.log("getOne prarms:", params);
        if (resource === "RedPackets") {
            let url = `${apiUrl}/${resource}/${params.id}`;
            console.log("getOne url:", url);
            return httpClient(url).then(function ({ json }) {
                console.log("json:", json);
                return { data: json };
            });
        }
        else if (resource === "RPReqClaim") {
            console.log("getOne RPReqClaim params:", params);
            let url = `${apiUrl}/${resource}/${params.id}`;
            console.log("getOne url:", url);
            return httpClient(url).then(function ({ json }) {
                console.log("json:", json);
                return { data: json };
            });
        }
        else {
        }
    },
    
    getMany: (resource, params) => {
        console.log("getMany resource:", resource);
        console.log("getMany prarms:", params);
        if (resource === "RedPackets") {
            const query = {
                filter: JSON.stringify({ id: params.ids }),
            };
            const url = `${apiUrl}/${resource}?${stringify(query)}`;
            return httpClient(url).then(({ json }) => ({ data: json }));
        }
        else if (resource === "RPReference") {
            const query = {
                filter: JSON.stringify({ id: params.ids }),
            };
            const url = `${apiUrl}/${resource}?${stringify(query)}`;
            return httpClient(url).then(({ json }) => ({ data: json }));
        }
        else {
            console.log("getMany else");
        }
    },

    getManyReference: (resource, params) => {
        console.log("getManyReference resource:", resource);
        console.log("getManyReference prarms:", params);
        if (resource === "RedPackets") {
            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;
            const query = {
                sort: JSON.stringify([field, order]),
                range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
                filter: JSON.stringify({
                    ...params.filter,
                    [params.target]: params.id,
                }),
            };
            const url = `${apiUrl}/${resource}?${stringify(query)}`;

            return httpClient(url).then(({ headers, json }) => ({
                data: json,
                total: parseInt(headers.get('content-range').split('/').pop(), 10),
            }));
        }
        else if (resource === "RPClaim") {
            const query1 = {
                filter: JSON.stringify({ id: params.ids }),
            };
            console.log("query1:", query1);
            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;
            const query = {
                sort: JSON.stringify([field, order]),
                range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
                filter: JSON.stringify({
                    ...params.filter,
                    [params.target]: params.id,
                }),
            };
            console.log("query:", query);
            const url = `${apiUrl}/${resource}?${stringify(query)}`;
            console.log("url:", url);
            return httpClient(url).then(({ json }) => ({ data: json }));
        }
        else if (resource === "RPReference") {
            const query1 = {
                filter: JSON.stringify({ id: params.ids }),
            };
            console.log("RPReference query1:", query1);
            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;
            const query = {
                sort: JSON.stringify([field, order]),
                range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
                filter: JSON.stringify({
                    ...params.filter,
                    [params.target]: params.id,
                }),
            };
            console.log("RPReference query:", query);
            const url = `${apiUrl}/${resource}?${stringify(query)}`;
            console.log("RPReference url:", url);
            return httpClient(url).then(({ json }) => ({ data: json }));
        }
        else if (resource === "RPReqHistory") {
            const query1 = {
                filter: JSON.stringify({ id: params.ids }),
            };
            console.log("RPReqHistory query1:", query1);
            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;
            const query = {
                sort: JSON.stringify([field, order]),
                range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
                filter: JSON.stringify({
                    ...params.filter,
                    [params.target]: params.id,
                }),
            };
            console.log("RPReqHistory query:", query);
            const url = `${apiUrl}/${resource}?${stringify(query)}`;
            console.log("RPReqHistory url:", url);
            return httpClient(url).then(function ({ json }) {
                console.log("RPReqHistory json:", json);
                return { data: json };
            });
        }
        else {
            console.log("getManyReference else");
        }
    },

    update: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({ data: json })),

    updateMany: (resource, params) => {
        const query = {
            filter: JSON.stringify({ id: params.ids}),
        };
        return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({ data: json }));
    },

    create: (resource, params) =>
        httpClient(`${apiUrl}/${resource}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({
            data: { ...params.data, id: json.id },
        })),

    delete: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'DELETE',
        }).then(({ json }) => ({ data: json })),

    deleteMany: (resource, params) => {
        const query = {
            filter: JSON.stringify({ id: params.ids}),
        };
        return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
            method: 'DELETE',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({ data: json }));
    }
};


