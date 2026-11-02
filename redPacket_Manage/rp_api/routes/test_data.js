'use strict';


let g_dataAry = [
    { "name": "周瑜", "sex": "男", "id": "20200806", "photo": "photo.jpg", "birthday": "2012.03.05", "ver": "v1.0.0", "hash_type": "obj_hash", "hash": "0xe4dd51d85e5c387c35299630017eb13ff75bcbde" },
    { "name": "孙权", "sex": "男", "id": "20200807", "photo": "photo.jpg", "birthday": "2012.02.06", "ver": "v1.0.0", "hash_type": "obj_hash", "hash": "0x4229fccc31646c5fe63bc2c31f2664842081750d" },
    { "name": "刘备", "sex": "男", "id": "20200808", "photo": "photo.jpg", "birthday": "2012.01.07", "ver": "v1.0.0", "hash_type": "obj_hash", "hash": "0x13ed0b130a7ea2f1aad84d9642f303ef49bd89be" },
    { "name": "关羽", "sex": "男", "id": "20200809", "photo": "photo.jpg", "birthday": "2011.12.08", "ver": "v1.0.0", "hash_type": "obj_hash", "hash": "0xb945ab18ed2e49239474262e7be57891001989d2" },
    { "name": "张飞", "sex": "男", "id": "20200810", "photo": "photo.jpg", "birthday": "2011.12.09", "ver": "v1.0.0", "hash_type": "obj_hash", "hash": "0xd00a3aef431b9138a8e88e524f073cdf508cabe3" },

    { "name": "曹操", "sex": "男", "id": "20200811", "photo": "photo.jpg", "birthday": "2012.03.05", "ver": "v1.0.0", "hash_type": "obj_hash", "hash": "0x4ae1d624bf4cc7b6d68eff872b77801093632642" },
    { "name": "董卓", "sex": "男", "id": "20200812", "photo": "photo.jpg", "birthday": "2012.02.06", "ver": "v1.0.0", "hash_type": "obj_hash", "hash": "0xc1cbdb826ee05e7511efb861d27b2f964de7ec91" },
    { "name": "鲁肃", "sex": "男", "id": "20200813", "photo": "photo.jpg", "birthday": "2012.01.07", "ver": "v1.0.0", "hash_type": "obj_hash", "hash": "0xa0a2812d62ab29073471f636c223fe203e9b6b90" },
    { "name": "典韦", "sex": "男", "id": "20200814", "photo": "photo.jpg", "birthday": "2011.12.08", "ver": "v1.0.0", "hash_type": "obj_hash", "hash": "0x06466ce31d8a6b3ab312e218c426e6cecc553251" },
    { "name": "张郃", "sex": "男", "id": "20200815", "photo": "photo.jpg", "birthday": "2011.12.09", "ver": "v1.0.0", "hash_type": "obj_hash", "hash": "0x4c989a31d242368201fc0652b0f44957c4b4101d" }
];
let g_map_data = new Map();
for (let idx = 0; idx < g_dataAry.length; ++idx) {
    let obj = g_dataAry[idx];
    g_map_data.set(obj.id, obj);
}

module.exports = { g_dataAry, g_map_data };




