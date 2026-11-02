
const _ = require('lodash');
const path = require("path");

const QueueBase = require("../rpService/services/hostedChainService/queueBase.js");

class TestQueue extends QueueBase {
    constructor(sort_filed_name) {
        super(sort_filed_name);
    }
}

function test_fun() {
    let test_queue = new TestQueue("abc");

    // 1 测试添加数组
    let tmp_ary = [{ "abc": 100, "other": "a" }, { "abc": 99, "other": "a" }, { "abc": 9, "other": "a" }];
    console.log("tmp_ary:", tmp_ary);
    test_queue.clear();
    test_queue.push_by_ary(tmp_ary);
    console.log("test_queue:", test_queue);

    // 2 正向添加测试排序
    for (let idx = 0; idx < 5; ++idx) {
        test_queue.push({ "abc": idx + 1, "other": "a" + idx });
    }
    console.log("test_queue", test_queue);

    // 3 反向添加测试排序
    test_queue.clear();
    for (let idx = 0; idx < 5; ++idx) {
        test_queue.push({ "abc": 100 - idx, "other": "a" + idx });
    }
    console.log("test_queue", test_queue);

    // 4 已有数据的情况下继续添加数据
    test_queue.push({ "abc": 50, "asfdasfdsa": "other" });
    console.log("test_queue", test_queue);

    // 5 已有数据的情况下继续添加数组
    test_queue.push_by_ary(tmp_ary);
    console.log("test_queue", test_queue);

    //test_queue.clear();
    //for (let idx = 0; idx < 5; ++idx) {
    //    test_queue.push({ "abc": 100 - idx, "other": "a" + idx });
    //}
    console.log("test_queue", test_queue);

    let size = test_queue.size();

    for (let idx = 0; idx < size + 1; ++idx) {
        let t = test_queue.pop();
        console.log("t:", t);
    }

    for (let idx = 0; idx < 5; ++idx) {
        let t = test_queue.pop();
        console.log("t:", t);
    }

    // 测试非数字值排序
    test_queue.clear();
    for (let idx = 0; idx < 5; ++idx) {
        test_queue.push({ "abc": "a" + (idx + 8), "other": "a" + idx });
    }
    console.log("test_queue:", test_queue);

    test_queue.clear();
    console.log("test_queue:", test_queue);
    for (let idx = 0; idx < 5; ++idx) {
        let t = { "abc": "a" + (100 - idx), "other": "a" + idx };
        test_queue.push(t);
    }
    console.log("test_queue:", test_queue);
}
test_fun();

function test_ary(){

    let ary = [99,100,9];
    //for (let idx = 0; idx < 20; ++idx) {
    //    ary.push(idx);
    //}
    console.log("befort sort ary:", ary);
    ary.sort();
    console.log("after sort:", ary);
    let ary2 = _.sortBy(ary);
    console.log("sortBy ary:", ary);
    console.log("sortBy ary2:", ary2);

}
test_ary();

let aaa = 0;
