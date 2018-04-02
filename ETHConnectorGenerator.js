let fs = require("fs");
let Handlebars = require("Handlebars");


/**
 * @class
 * @classdesc Parser class that actually parses and generates OpenAPI config
 * */
class ETHConnectorGenerator {

    /**
     * @constructor
     * @description
     * Read's the contract schema which is built using truffle migrate and stores the schema.
     * */
    constructor(config_file) {
        "use strict";
        this.config = JSON.parse(fs.readFileSync(config_file));
        this.cs = JSON.parse(fs.readFileSync((this.config.contract)));    //cs = contract_schema
    }

    /**
     * @function
     * @instance
     * @description handle's reading the data loaded from file and creating objects
     * */
    process() {
        let controller_template = String(fs.readFileSync("./ETHController_template.hbs"));
        Handlebars.registerHelper({
            ifEquals(param1, param2, options){
                return param1 === param2 ? options.fn(this) : options.inverse(this);
            },
            logconsole(){
                let args = Array.prototype.slice.call(arguments);
                console.log(args.splice(args.length -1 ));
            }
        });

        this.controller_class_code = Handlebars.compile(controller_template)({
            abi: this.cs.abi
        })
    }

    /**
     * @function
     * @instance
     * @param {String} folder_path - path of output folder
     * @description Writes the serialized json data to provided file path. Else writes the output to console...
     * */
    build(folder_path){
        try{
            fs.mkdirSync(folder_path+"/eth_connector");
        }catch(e){
            //pass
        }
        fs.writeFileSync(folder_path+"/eth_connector/Controller.js", this.controller_class_code);
        fs.writeFileSync(folder_path+"/eth_connector/GenericETHConnector.js", fs.readFileSync("./GenericETHConnector.js"));
        fs.writeFileSync(folder_path+"/eth_connector/contract.json", JSON.stringify(this.cs, undefined, 4));
        fs.writeFileSync(folder_path+"/eth_connector/config.json", JSON.stringify(this.config, undefined, 4));

    }

}

if (require.main === module) {
    let eth_connector_generator = new ETHConnectorGenerator(process.argv[2]);
    eth_connector_generator.process();
    eth_connector_generator.build(process.argv[3]);
} else {
    module.exports = ETHConnectorGenerator;
}
