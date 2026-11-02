const TestServiceInterface = require("../../interfaces/TestServiceInterface");

class TestService extends TestServiceInterface {

    sayHello(msgData) {
        return "hello";
    }

}

module.exports = TestService;