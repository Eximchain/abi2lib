# abi2lib
An easy way to autogenerate boilerplate calls to web3 so your JS app can communicate with Ethereum.  

## Usage
Use in command line by running `node abi2lib <path_to_config_json> <path_to_connector_output_folder>`.  

The config JSON includes the path to the desired smart contract ABI JSON, as well as some constants for configuring web3 calls.  

```json
{
  "contract": "<PathToYourContract>.json", 
  "eth": {                                      
    "provider": "http://localhost:8545",       
    "default_gas": 0,                      
    "default_gasPrice": 40            
  }
}
```

You can then communicate with the smart contract by:

```javascript
import Controller from '<path_to_connector_output>/eth_connector/Controller.js';

const ContractController = new Controller();

// Perform transaction using config values & required inputs
ContractController.post_<name of contract fxn>(fromAddr, [value if allowed], ...contractInputs);

// Query output of contract using required inputs, does not perform transaction
ContractController.get_<name of contract fxn>(fromAddr, ...contractInputs);
```

## Output Structure

Outputs a directory named `contract_lib` which contains:

1. `GenericEthConnector.js` : Generically converts ethereum read/write calls into web3 calls.
2. `Controller.js` : Contains all generated methods corresponding to the contract.
3. `Contract.json` : A copy of your chosen smart contract ABI JSON
4. `Config.json` : A copy of your chosen config JSON

## Connector Methods

The Controller class will have methods corresponding to each of the function/event descriptions listed in the ABI.  If the function can be called with inputs, then there will be a method shaped like:

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