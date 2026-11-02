const OnlineServiceEth = require('./OnlineServiceEth');

class OnlineServiceWan extends OnlineServiceEth {

    constructor(connector) {
        super(connector);
        this.chain = 'WAN';
    }
};

module.exports = OnlineServiceWan;
