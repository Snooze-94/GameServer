/*jshint esversion: 6 */ 
require("./Resources/config.js");
var chalk = require("chalk");
var fs = require("fs");
var net = require("net");
var npcs = require("./Resources/Game Data/npcs.js");
var mobs = require("./Resources/Game Data/mobs.js");
var packet = require("./packet.js");
var PF = require('pathfinding');


var init_files = fs.readdirSync(__dirname + "/Initializers");
init_files.forEach(function (initFile) {
    console.log(chalk.cyan("Loading initializer: ") + initFile);
    require(__dirname + "/Initializers/" + initFile);
});

var model_files = fs.readdirSync(__dirname + "/Models");
model_files.forEach(function (modelFile) {
    console.log(chalk.cyan("Loading model: ") + modelFile);
    require(__dirname + "/Models/" + modelFile);
});


maps = {};

var map_files = fs.readdirSync(config.data_paths.maps);
map_files.forEach(function (mapFile) {
    var map = require(config.data_paths.maps + mapFile);
    console.log(chalk.cyan.bold("Loading map: ") + map.room.slice(3) + "(" + map.name + ")");
    maps[map.room] = map;
});

for (var npc in npcs){
    console.log(chalk.green.bold(`Spawning [NPC] ${npcs[npc].name} in ${maps[npcs[npc].room].name}(${npcs[npc].x}, ${npcs[npc].y})`));
    npcs[npc].type = "npc";
    maps[npcs[npc].room].npcs.push(npcs[npc]);
    maphandler.spawn_npc(npcs[npc].room, npcs[npc].x, npcs[npc].y, npcs[npc]);
}

var mob_id = 0;

for(var mob in mobs){
    for(var zone in mobs[mob].spawn_zones){
        for(i = 0; i < mobs[mob].spawn_zones[zone].quantity; i++){
            var thisMob = Object.assign({}, mobs[mob]);
            thisMob.room = zone;
            thisMob.id = mob_id;
            thisMob.type = "mob";
            thisMob.dead = false;
            delete thisMob.spawn_zones;
            maps[zone].mobs.push(thisMob);
            thisMob.spawn(thisMob);
            mob_id ++;
        }
    }
}

net.createServer(function(socket){

    console.log(`Client connected from ${socket.remoteAddress}:${socket.remotePort}`);

    var c_inst = new require("./client.js");
    var thisClient = new c_inst();

    thisClient.socket = socket;
    thisClient.initiate();

    socket.on("error", thisClient.error);

    socket.on("end", thisClient.end);

    socket.on("data", thisClient.data);

}).listen(config.port);

console.log(chalk.magenta.bold("Running on port: ") + chalk.white.bgBlack.bold(config.port));

//console.log(pathfinder.is_target_close("rm_001", 15, 10, 20, 13));