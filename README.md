# abi2lib

An easy way to autogenerate boilerplate code for calling [web3.js](https://github.com/ethereum/web3.js/) so your app can communicate with Ethereum.  

## Installation

Install globally via `npm`, `yarn`, or your preferred Javascript package manager:

```
npm install -g abi2lib

// OR

yarn global add abi2lib
```

If you are on Windows, you might need to refresh your path by restarting the terminal.

You can also install `abi2lib` in your own project

```
npm install --save abi2lib

// OR 

yarn global add abi2lib
```

## Usage

### CLI
Use in your terminal of choice by running:
```
abi2lib <contract_path> [options]
```
The options let you specify config values directly in the command, or specify a path to a config file.  If you do not specify an output directory via an option, then it will be created in the working one.  Run `abi2lib --help` to learn more.

### Module
Use in your own nodejs scripts:
```
const abi2lib = require('abi2lib');

abi2lib.generate(contract_path, output_folder, config_options);
```

### Output
Either of these methods will generate a directory named `<ContractName>ContractLib` which contains all of your autogenerated code.  You can then use that code to communicate with your smart contract via:

```javascript
const BaseController = require('<ContractName>ContractLib/<ContractName>Controller.js');

const ContractController = new BaseController();

// Connects controller to the specified provider -- detecting network ID is async, connect must be separate step.
ContractController.connect();

// Perform transaction using config values & required inputs
ContractController.post_<fxnA>(fromAddr, [value if allowed], ...contractInputs);

// Query output of contract using required inputs, does not perform transaction
ContractController.get_<fxnB>(fromAddr, ...contractInputs);
```

## Config

The optional config object includes constants for configuring web3 calls.  

```json
{
  "eth": {                                      
    "provider": "http://localhost:8545",       
    "default_gas": 0,                      
    "default_gasPrice": 40            
  }
}
```


## Connector Methods

The Controller class will have methods corresponding to each of the function descriptions listed in the ABI.  If the function can be called with inputs, then there will be a method shaped like:

```javascript
post_<fxnName>(from, [value if fxn is payable], [fxnParams...]){
	// Properly configured call to contract's `send` function, triggers transaction
}
```

If the function also has outputs, then there will be a method shaped like:

```javascript
get_<fxnName>(from, [inputParams...]){
	// Properly configured call to contract's `call` function, triggers no transaction
}
```

## Output Structure

Outputs a directory named `<ContractName>ContractLib` which contains:

1. `GenericEthConnector.js` : Generically converts ethereum read/write calls into web3 calls.
2. `<ContractName>Controller.js` : Contains all generated methods corresponding to the contract.
3. `contract.json` : A copy of your chosen smart contract ABI JSON
4. `config.json` : A copy of your chosen config JSON

## Licensing
`abi2lib` is developed & maintained by [Eximchain](https://eximchain.com/), released for public use under the Apache-2.0 License.  

Output from `abi2lib` uses the same license.