'use strict';
const utils = require("./utils");
const fs = require("fs");
const assert = require('chai').assert;

let schema = [
    {
        className: "ETHConnectorGenerator",
        classPath: "../ETHConnectorGenerator",
        call_instance(cls){
            let generator = new cls("./tests/samples/test_config.json");
            generator.init();
            generator.process();
            return generator;
        },
        verify: function(instance){
            it(`Generated ETH connector controller output class matches the sample output file contents`, () => {
                assert.equal(
                    instance.controller_class_code,
                    fs.readFileSync("./tests/samples/eth_connector/Controller.js"),
                );
            });
        },
    }
];

utils.test(schema);