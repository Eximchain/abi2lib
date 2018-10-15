let fs = require("fs");
let path = require("path");
let sortBy = require('lodash.sortby');
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
                return inputs.map(input => input.name !== "" ? input.name : input.type).join(', ');
            },
            inputSpread(inputs){
                if (inputs.length > 0) return ', '+inputs.map(input => input.name !== "" ? input.name : input.type).join(', ');
                return '';
            }
        });
        const getters = this.cs.abi.filter(elt => elt.constant);
        const setters = this.cs.abi.filter(elt => !elt.constant);
        this.cs.abi = sortBy(getters, 'name').concat(sortBy(setters, 'name'));
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
        // Different naming conventions in different Solidity versions
        let name = this.cs.contractName || this.cs.contract_name;
        let folderName = path.join(folder_path, `/${name}ContractLib`);
        try{
            fs.mkdirSync(folderName);
        }catch(e){
            //pass
        }
        let contractPath = path.join(folderName, "/contract.json");
        let configPath = path.join(folderName, "/config.json");
        let controllerPath = path.join(folderName, `/${name}Controller.js`);
        let connectorPath = path.join(folderName, "/GenericETHConnector.js");
        fs.writeFileSync(controllerPath, this.controller_class_code);
        fs.writeFileSync(connectorPath, fs.readFileSync(path.resolve(__dirname, "./GenericETHConnector.js")));
        fs.writeFileSync(contractPath, JSON.stringify(this.cs, undefined, 4));
        fs.writeFileSync(configPath, JSON.stringify(this.config, undefined, 4));
        console.log('');
        console.log('  ETHConnector generation complete!');
        console.log('  + ',folderName);
        [controllerPath, connectorPath, contractPath, configPath].forEach((path)=>{
            console.log('    + ',path)
        });
        console.log('');
    }

    static generate(contract_path, folder_path, config={}){
        let generator = new ETHConnectorGenerator(contract_path, config);
        generator.process();
        generator.build(folder_path);
        return;
    }
}

module.exports = ETHConnectorGenerator;