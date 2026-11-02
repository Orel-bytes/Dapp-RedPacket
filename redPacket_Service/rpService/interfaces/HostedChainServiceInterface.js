

module.exports = class ChainServiceInterface {
    constructor() {
        if (new.target === ChainServiceInterface) {
            throw new TypeError("Cannot construct Abstract class directly");
        }
    }

    async init() {
        throw new Error("Abstract method!");
    }
}
