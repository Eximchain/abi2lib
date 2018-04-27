#!/usr/bin/env node

let fs = require("fs");
let path = require("path");
const program = require('commander');
const package = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json')));

const ETHConnectorGenerator = require('./ETHConnectorGenerator');

program
    .version(package.version)
    .name(package.name)
    .description(package.description)
    .usage('<contract_path> [options]')
    .option('-C, --config <config>', 'Specify path to config.json from current working directory.  If other options are also specified, they will override values in file.')
    .option('-P, --provider <provider>', 'Set the Web3 provider; defaults to localhost:8545.')
    .option('-p, --price <price>', 'Set default gas price, must be int; defaults to 40.', parseInt)
    .option('-g, --gas <gas>', 'Specify default gas, must be int; defaults to 0.', parseInt)
    .option('-o, --output <output>', 'Specify output path relative to current directory; path must exist; defaults to ./')
    .action((contract_path, option={}) => {
        let config = { eth : {
            provider : 'http://localhost:8545',
            default_gas : 0,
            default_gasPrice : 40
        }};
        if (option.price === NaN){
            throw new Error(`Provided default gas price needs to be an integer, but was ${option.price} instead.`)
        }
        if (option.gas === NaN){
            throw new Error(`Provided default gas needs to be an integer, but was ${option.gas} instead.`)
        }
        if (option.config) config = JSON.parse(fs.readFileSync(option.config));
        if (option.provider) config.eth.provider = option.provider;
        if (option.gas) config.eth.default_gas = option.gas;
        if (option.price) config.eth.default_gasPrice = option.price;
        ETHConnectorGenerator.generate(contract_path, option.output || './', config);
    })

program.on('--help', () => {
    console.log('');
    console.log('  Call with a path to your contract file and a folder to output your web3 contract lib code into.');
    console.log('');
});      

if (require.main === module) {
    if (process.argv.length === 2) program.help();
    program.parse(process.argv);
} else {
    module.exports = ETHConnectorGenerator;
}
