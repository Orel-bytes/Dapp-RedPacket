const Web3 = require('web3');
const solc = require('solc');
const fs = require('fs');
const path = require('path');

// var linker = require('solc/linker');


class ContractToolKit {
    constructor() {
        this.output = undefined;
        this.contract_instance = undefined;
        this.contractAddress = undefined;
        this.contractName = undefined;
        this.contractFile = undefined;
    }

    compile2(solcFile) {
        const parseFile = path.parse(solcFile);
        solcFile = path.join(parseFile.dir, parseFile.base);
        let solcFileName = parseFile.base;
        var input = {
            language: 'Solidity',
            sources: {
                [solcFileName]: {
                    content: fs.readFileSync(solcFile).toString()
                }
            },
            settings: {
                evmVersion: "byzantium",
                outputSelection: {
                    '*': {
                        '*': ['*']
                    }
                }
            }
        }

        function findImports(file) {
            let solcFileDependency = path.resolve(parseFile.dir, file);
            return { contents: fs.readFileSync(solcFileDependency).toString() };
        }

        // // Current syntax
        // var output = JSON.parse(solc.compile(JSON.stringify(input), findImports))

        // New syntax (supported from 0.5.12)
        // this.output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
        console.log("-------------",solc.version);
        this.output = JSON.parse(solc.compileStandard(JSON.stringify(input), findImports));

        // `output` here contains the JSON output as specified in the documentation
        if (!this.output.errors) {
            // let result = {};
        } else {
            for (let index = 0; index < this.output.errors.length; index++) {
                const err = this.output.errors[index];
                if (err.severity === "error") {
                    this.contractFile = "";
                    return false;
                }
            }

        }

        // for (var contractName in this.output.contracts[solcFileName]) {
        //     // console.log(contractName + '0: ' + output.contracts[solcFileName][contractName].evm.deployedBytecode.object);
        //     console.log(contractName + ': ' + this.output.contracts[solcFileName][contractName].evm.deployedBytecode.object);
        //     // result[contractName] = {abi:output.contracts[solcFileName][contractName].abi,bytecode:output.contracts[solcFileName][contractName].evm.deployedBytecode.object}
        // }
        this.contractFile = solcFileName;
        return true;

    }

    compileError() {
        return this.output.errors;
    }

    getABI(contractName) {
        if (this.output && this.output.contracts && this.output.contracts[this.contractFile] && this.output.contracts[this.contractFile][contractName]) {
            return this.output.contracts[this.contractFile][contractName].abi;
        }
    }

    getByteCode(contractName) {
        if (this.output && this.output.contracts && this.output.contracts[this.contractFile] && this.output.contracts[this.contractFile][contractName]) {
            // let byteCode = fs.readFileSync("./contracts/__ucct-poc-contracts_bourse_sol_Bourse.bin");
            // return '0x'+byteCode;
            // return '0x' + this.output.contracts[this.contractFile][contractName].evm.deployedBytecode.object;
            return '0x' + this.output.contracts[this.contractFile][contractName].evm.bytecode.object;
        }

    }
    constructorData(contractName, args) {
        let contractByteCode = this.getByteCode(contractName);
        if (!contractByteCode) return;

        let web3 = new Web3();
        const instanceContract = web3.eth.contract(this.output.contracts[this.contractFile][contractName].abi);
        args.push({ data: this.getByteCode(contractName) });
        let txData = instanceContract.new.getData.apply(null, args);
        return txData;
    }
    // const instanceContract = web3.eth.contract(JSON.parse(this.output.contracts[keyword].interface));
    // args.push({ data: this.output.contracts[keyword].bytecode });
    // console.log("bytesCode:", this.output.contracts[keyword].bytecode);
    //     let txdata = '0x' + instanceContract.new.getData.apply(null, args);

// loadFromABI(web3, abi, address, contractName) {
//     this.contractAddress = address;
//     this.contract_instance = web3.eth.contract(JSON.parse(abi)).at(address);
//     this.contractName = contractName;
//     if (this.contract_instance) { }
//     else {
//         console.error("load contract from abi failed");
//     }
// }

isInitialized() {
    return (typeof this.contract_instance != 'undefined');
}

getAllContractMethod() {
    return this.contract_instance.getOwnPropertyNames();
}

contractCall(web3, contractName, address, method, args){
    let abi = this.getABI(contractName);
    let contract = web3.eth.contract(abi);
    let contract_instance = contract.at(address);
    let result = contract_instance[method].apply(null,args);
    return result;
}

methodRawTransactionData(contractName, method, args){
    let web3 = new Web3(null);
    let contract = web3.eth.contract(this.output.contracts[this.contractFile][contractName].abi);
    let contractInstance = contract.at("0x00070FEd061E7747CD9a38d680A601510CB659FB");
    let txData = contractInstance[method].getData.apply(null, args);
    return txData;
}

getNonce(web3, address) {
    var nonce = web3.eth.getTransactionCount(address);
    var txpoolContent = web3.currentProvider.send({
        method: "txpool_content",
        params: [],
        jsonrpc: "2.0",
        id: new Date().getTime()
    })
    console.log("nonce *:" + nonce);
    if (txpoolContent && txpoolContent.result && txpoolContent.result.pending) {
        var keys = Object.keys(txpoolContent.result.pending);
        var totalCount = keys.length;
        console.log("keys.length *:" + totalCount);
        for (var i = 0; i < totalCount; i++) {
            if (keys[i].toLowerCase() == address.toLowerCase()) {
                nonce += Object.values(txpoolContent.result.pending[keys[i]]).length;
                console.log("nonce ->:" + nonce);
                break;
            }
        }
    }

    return nonce;
}
}

ContractToolKit.prototype.ContractToolKit = ContractToolKit;
module.exports = exports = ContractToolKit;