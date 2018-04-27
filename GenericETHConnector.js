const path = require('path');
const fs = require("fs");
const Web3 = require("web3");
const conf = require(path.resolve(__dirname, "./config.json"));

const web3 = new Web3(new Web3.providers.HttpProvider(conf.eth.provider));

/**
 * @class
 * @classdesc
 * ETH error. will be thrown from Connector
 * */
class ETHError extends Error{
    constructor(message, extra){
        "use strict";
        super(message, extra);
    }
}

/**
 * @class
 * @classdesc
 * ETH Connector, will be used to interact with the smart contract
 * */
class Connector{

    /**
     * @constructor
     * @description
     * Read's the contract schema which is built using truffle migrate and creates a contract instance which can be then interacted with.
     * */
    constructor(contract_path, netId){
        "use strict";
        try {
            let data = fs.readFileSync(contract_path);
            let contract_schema = JSON.parse(data);
            if (!contract_schema.abi || 
                !contract_schema.contractName ||
                !contract_schema.networks){
                throw new Error(`The provided contract JSON is missing the 'abi', 'contractName', 'networks' keys.  Are you sure you're using the build artifact produced by truffle compile?`);
            }
            let currentNetwork = contract_schema.networks[netId];
            if (!currentNetwork){ 
                throw new Error(`None of the networks listed in ${contract_schema.contractName} match the current network ID ${netId}, as viewed from web3 provider running at ${conf.eth.provider}.`);
            }
            this.contract = new web3.eth.Contract(contract_schema.abi, currentNetwork.address);
        } catch (err) {
            this.contract =null;
            console.log(err);
        }
    }

    /**
     * @function
     * @private
     * @param {Error} err
     * @param {String} method_name
     * @description
     * reads the error instance and message string and creates an eth error and throws it.
     * */
    _handleError(err, method_name){
        "use strict";
        console.log( `failed to execute ${method_name}... ${err}` );
        throw new ETHError( " Error Occurred!!! " );
    }

    /**
     * @function
     * @private
     * @param {Hex} from - eth address of user executing this function
     * */
    _createCallParams(from){
        "use strict";
        let send_config = {
            from: from
        };
        if(conf.eth.default_gas){
            send_config.gas = conf.eth.default_gas
        }
        if(conf.eth.default_gasPrice){
            send_config.gasPrice = conf.eth.default_gasPrice
        }
        return send_config;
    }

    /**
     * @function
     * @param {String} method_name - name of the method to be called
     * @param {Hex} from - from address
     * @param {Number} value - amount to be sent to the contract
     * @param {Array} write_params - params needed to call the contract... in same order as defined!!!
     * @description
     * calls the smart contract's method, and on successful transaction, will call the callback with a receipt
     * @returns {Promise}
     * */
    write(method_name, from, value, write_params){
        "use strict";
        return this.contract.methods[method_name]
            .apply(this, write_params)
            .send(this._createCallParams(from))
    }

    /**
     * @function
     * @param {String} method_name - name of the method to be called
     * @param {Hex} from - from address
     * @param {Array} read_params - params needed to call the contract... in same order as defined!!!
     * @param {Function} callback
     * @description
     * calls the smart contract's method, and on successful transaction, will call the callback with a receipt
     * @returns {Promise}
     * */
    read(method_name, from, read_params, callback=()=>{}){
        return this.contract.methods[method_name]
            .apply(this, read_params)
            .call({from}, (err, result) => {
                if(err){
                    this._handleError(err, method_name);
                }else {
                    callback(result);
                }
            });
    }

}

Connector.ETHError = ETHError;
module.exports = Connector;