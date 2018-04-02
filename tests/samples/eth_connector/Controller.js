let Connector = require("./GenericETHConnector");
let fs = require("fs");

/**
* @class
* @classdesc - interface to interact with ETH Connector for all methods
* */
class Controller{

    /**
    * @constructor
    * @description initializes the connector, which will interact with SmartContract via web3
    * */
    constructor(){
        this.config = JSON.parse(fs.readFileSync("./config.json"));
        this.connector = new Connector("./contract.json", this.config);
    }

    /**
    * @function
    * @instance
    * @param { address } from - from address
    * @param { address } name
    * @description execute post method as a transaction on addAddress
    * @returns { Promise }
    * */
    post_addAddress(from, name ){
        return this.connector.write("addAddress", from, null, [ name ]);
    }


    /**
    * @function
    * @instance
    * @param { address } from - from address
    * @param { Number } value - eth to be sent
    * @param { address } name
    * @description execute post method as a transaction on whitelistAddress
    * @returns { Promise }
    * */
    post_whitelistAddress(from, value, name ){
        return this.connector.write("whitelistAddress", from, value, [ name ]);
    }


    /**
    * @function
    * @instance
    * @param { address } from - from address
    * @param { address } name
    * @description execute post method as a transaction on owner
    * @returns { Promise }
    * */
    post_owner(from, name ){
        return this.connector.write("owner", from, null, [ name ]);
    }

    /**
    * @function
    * @instance
    * @param { address } from - from address
    * @param { address } name
    * @description execute get method without a transaction on owner
    * @returns { Promise }
    * */
    get_owner(from, name ){
        return this.connector.read("owner", from, [ name ]);
    }

    /**
    * @function
    * @instance
    * @param { address } from - from address
    * @param { address } name
    * @description execute post method as a transaction on userAddr
    * @returns { Promise }
    * */
    post_userAddr(from, name ){
        return this.connector.write("userAddr", from, null, [ name ]);
    }

    /**
    * @function
    * @instance
    * @param { address } from - from address
    * @param { address } name
    * @description execute get method without a transaction on userAddr
    * @returns { Promise }
    * */
    get_userAddr(from, name ){
        return this.connector.read("userAddr", from, [ name ]);
    }


}

module.exports = Controller;