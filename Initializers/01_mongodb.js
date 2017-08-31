/**
 * Created by Ale on 4/10/2016.
 */
var mongoose = require("mongoose");
mongoose.Promise = require("promise");
module.exports = gamedb = mongoose.createConnection(config.database);
