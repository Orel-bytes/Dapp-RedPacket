'use strict';




module.exports = class Utils {
    constructor() {
    }

    getDateStr(timeStamp) {
        let d = new Date(timeStamp * 1000);
        return (d.getFullYear()) + "-" +
            (d.getMonth() + 1) + "-" +
            (d.getDate()) + " " +
            (d.getHours()) + ":" +
            (d.getMinutes()) + ":" +
            (d.getSeconds());
    }

    getDateStrEx(timeStamp) {
        let d = new Date(timeStamp);
        return (d.getFullYear()) + "-" +
            (d.getMonth() + 1) + "-" +
            (d.getDate()) + " " +
            (d.getHours()) + ":" +
            (d.getMinutes()) + ":" +
            (d.getSeconds());
    }
};






