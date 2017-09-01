/**
 * Created by Ale on 4/10/2016.
 */
//Import required libraries
var args = require("minimist")(process.argv.slice(2));
var extend = require("extend");

//Store environment variable
var environment = args.env || "test";

//Common config
var common_conf = {
    name: "PeronAO game server",
    version: "0.0.1",
    environment: environment,
    max_player: 100,
    data_paths: {
        items: __dirname + "\\Game Data\\" + "Items\\",
        maps: __dirname + "\\Game Data\\" + "Maps\\"
    },
    starting_zone: "rm_001"
};

//Environment config
var conf = {
    test: {
        ip: args.ip || "localhost",
        port: args.port || 16164,
        database: "mongodb://localhost:16165/PeronAOdb"
    }
};

extend(false, conf.test, common_conf);

module.exports = config = conf[environment];