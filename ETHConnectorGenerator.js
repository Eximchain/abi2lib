let fs = require("fs");
let path = require("path");
let dotProp = require('dot-prop');
let Handlebars = require("handlebars");

const ensureDefaults = (config) => {
    let setIfNot = (prop, val) => {if (!dotProp.has(config, prop)) dotProp.set(config, prop, val) }
    setIfNot('eth.provider', 'http://localhost:8545');
    setIfNot('eth.default_gas', 0);
    setIfNot('eth.default_gasPrice', 40);
    return config;
}

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
    constructor(contract_path, config={}) {
        if (typeof config === 'string'){
            this.config = ensureDefaults(JSON.parse(fs.readFileSync(config)));
        } else {
            this.config = ensureDefaults(config);
        }
        this.cs = JSON.parse(fs.readFileSync(contract_path));    //cs = contract_schema
    }

    /**
     * @function
     * @instance
     * @description handle's reading the data loaded from file and creating objects
     * */
    process() {
        let controller_template = String(fs.readFileSync(path.resolve(__dirname, "./ETHController_template.hbs")));
        Handlebars.registerHelper({
            ifEquals(param1, param2, options){
                return param1 === param2 ? options.fn(this) : options.inverse(this);
            },
            logconsole(){
                let args = Array.prototype.slice.call(arguments);
                console.log(args.splice(args.length -1 ));
            },
            inputList(inputs){
                return inputs.map(input => input.name).join(', ');
            }
        });

        this.controller_class_code = Handlebars.compile(controller_template)({
            abi: this.cs.abi,
            contractName : this.cs.contractName
        })
    }

    /**
     * @function
     * @instance
     * @param {String} folder_path - path of output folder
     * @description Writes the serialized json data to provided file path. Else writes the output to console...
     * */
    build(folder_path){
        let folderName = path.join(folder_path, `/${this.cs.contractName}ContractLib`);
        try{
            fs.mkdirSync(folderName);
        }catch(e){
            //pass
        }
        fs.writeFileSync(path.join(folderName, "/Controller.js"), this.controller_class_code);
        fs.writeFileSync(path.join(folderName, "/GenericETHConnector.js"), fs.readFileSync(path.resolve(__dirname, "./GenericETHConnector.js")));
        fs.writeFileSync(path.join(folderName, "/contract.json"), JSON.stringify(this.cs, undefined, 4));
        fs.writeFileSync(path.join(folderName, "/config.json"), JSON.stringify(this.config, undefined, 4));
    }

    static generate(contract_path, folder_path, config={}){
        let generator = new ETHConnectorGenerator(contract_path, config);
        generator.process();
        generator.build(folder_path);
        console.log('ETHConnector generation complete!');
        return;
    }
}

module.exports = ETHConnectorGenerator;