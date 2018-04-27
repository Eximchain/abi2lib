const path = require("path");
const fs = require("fs");
const Web3 = require("web3");

const herePath = aPath => path.resolve(__dirname, aPath)
const conf = require(herePath("./config.json"));
const web3 = new Web3(new Web3.providers.HttpProvider(conf.eth.provider));
const Connector = require(herePath("./GenericETHConnector"));

/**
* @class
* @classdesc - interface to interact with ETH Connector for all methods
* */
class WhitelistController{

    /**
    * @constructor
    * @description initializes the connector, which will interact with SmartContract via web3
    * */
    constructor(){
        this.config = JSON.parse(fs.readFileSync(herePath("./config.json")));
    }

    /**
    * @function
    * @instance
    * @description Detects current network and instantiates web3 interface to it.
    * @returns { Promise }
    * */
    connect(){
        return web3.eth.net.getId().then((netId) => {
            this.connector = new Connector(herePath("./contract.json"), netId);
        }).catch(err => {
            console.log(err)
        });
    }

    /**
    * @function
    * @instance
    * @param { address } from - from address
    * @param { address } user
    * @description Send transaction to addAddress.
    * @returns { Promise }
    * */
    post_addAddress(from, user){
        return this.connector.write("addAddress", from, null, [user]);
    }
    /**
    * @function
    * @instance
    * @param { address } from - from address
    * @param { Number } value - eth to be sent
    * @param { address } user
    * @description Send transaction to whitelistAddress; real value is spent.
    * @returns { Promise }
    * */
    post_whitelistAddress(from, value, user){
        return this.connector.write("whitelistAddress", from, value, [user]);
    }
    /**
    * @function
    * @instance
    * @param { address } from - from address
    * @param { address } address
    * @description Call owner, does not execute a transaction.
    * @returns { Promise }
    * */
    get_owner(from, address){
        return this.connector.read("owner", from, [address]);
    }
    /**
    * @function
    * @instance
    * @param { address } from - from address
    * @param { address } address
    * @description Call userAddr, does not execute a transaction.
    * @returns { Promise }
    * */
    get_userAddr(from, address){
        return this.connector.read("userAddr", from, [address]);
    }

}

module.exports = WhitelistController;