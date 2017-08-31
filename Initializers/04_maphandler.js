var chalk = require("chalk");
var PF = require("pathfinding");
module.exports = maphandler = {

    check_free: function(roomname, x, y){
        if(maps[roomname].tiles[maphandler.coord_to_tile(x,y)] != 0){
            return false;
        } else {
            return true;
        }
    },

    check_object_free: function(roomname, x, y){
        if(maps[roomname].object_tiles[maphandler.coord_to_tile(x,y)] != 0){
            return false;
        } else {
            return true;
        }
    },

    return_map_array_empty: function(){

        var maparray = [];

        for(var i = 0; i < (100 * 100); i++){
            maparray.push(0);
        }

        return maparray;

    },

    return_map_array: function(jsonmap){
        var maparray = []
        jsonmap["layers"].forEach(function(map){
            if(map["name"] == "layer1"){
                maparray = map["data"];
            }
        });
        jsonmap["layers"].forEach(function(map){
            if(map["name"] == "collision"){
                for(var i = 0; i < map["data"].length; i++){
                    if(map["data"][i] == 46){
                        maparray[i] = 46;
                    }
                }
            }
        });

        for(var i = 0; i < maparray.length; i++){
            maparray[i] --;
            maparray[i] = jsonmap["tilesets"][0]["tileproperties"][maparray[i]]["type"];
        }

        return maparray;
    },

    return_grid_array: function(maparray){
        var grid = new PF.Grid(100,100);
        for(var i = 0; i < maparray.length; i++){
            if(maparray[i] == 0) continue;
            var cord = maphandler.tile_to_cord(i);
            grid.setWalkableAt(cord.x,cord.y,false);
        }

        return grid;

    },

    return_type: function(roomname, x, y){
        if(!maphandler.check_object_free(roomname, x, y)){
            return maps[roomname].object_tiles[maphandler.coord_to_tile(x,y)].type;
            }
    },

    return_random_free: function(roomname){
        var found = false;
        while(!found){
            var search_x = getRandomInt(43,48);
            var search_y = getRandomInt(43,48);
            if(maphandler.check_object_free(roomname, search_x, search_y) && maphandler.check_free(roomname, search_x, search_y)){
                found = true;
                return {search_x, search_y};
            }
        }
    },

    return_random_specific: function(roomname, specific){
        var found = false;
        while(!found){
            var search_x = getRandomInt(0,100);
            var search_y = getRandomInt(0,100);
            if(maps[roomname].tiles[maphandler.coord_to_tile(search_x,search_y)] == specific && maphandler.check_object_free(roomname, search_x, search_y)){
                found = true;
                return {search_x, search_y}
            }
        }
    },

    return_random_free_between: function(roomname,x_min,y_min,x_max,y_max){
        var found = false;
        while(!found){
            var search_x = getRandomInt(x_min,x_max);
            var search_y = getRandomInt(y_min,y_max);
            if(maphandler.check_object_free(roomname, search_x, search_y) && maphandler.check_free(roomname, search_x, search_y)){
                found = true;
                return {search_x, search_y};
            }
        }
    },

    return_random_free_around: function(roomname,x,y){

    },

    return_random_wanted: function(roomname, wanted){

    },

    get_object: function(roomname, x, y){
        return maps[roomname].object_tiles[maphandler.coord_to_tile(x,y)];
    },

    spawn_mob: function(roomname, x, y, mob){
        maps[roomname].object_tiles[maphandler.coord_to_tile(x,y)] = mob;
        maps[roomname].grid.setWalkableAt(x,y,false);
        maps[roomname].clients.forEach(function(client){
            client.socket.write(packet.build([
                "SPAWN_MOB",
                mob.name,
                mob.x,
                mob.y,
                mob.facing,
                mob.dialogue,
                mob.id
            ]));
        });
    },

    clear_mob: function(roomname, x, y, mob_id){
        maps[roomname].object_tiles[maphandler.coord_to_tile(x,y)] = 0;
        maps[roomname].grid.setWalkableAt(x,y,true);
        maps[roomname].clients.forEach(function(client){
            client.socket.write(packet.build([
                "CLEAR_MOB",
                mob_id
            ]));
        });
    },

    clear_player: function(roomname, name){
        var client_x, client_y;
        maps[roomname].clients.forEach(function(client){
            if(client.name == name) {
                client_x = client.user.pos_x;
                client_y = client.user.pos_y;
            }
        });

        maps[roomname].object_tiles[maphandler.coord_to_tile(client_x,client_y)] = 0;
        maps[roomname].grid.setWalkableAt(client_x,client_y,true);
        console.log(name);
        removeByAttr(maps[roomname].clients, "name", name);
        maps[roomname].clients.forEach(function(client){
            client.socket.write(packet.build([
                "PLAYER_EXIT",
                name
            ]));
        });
    },

    coord_to_tile: function(x,y){
        return (y * 100) + x;
    },

    tile_to_cord: function(tile){
        var x = tile % 100;
        var y = Math.floor(tile/100);
        return {x,y};
    },

    spawn_npc: function(roomname, x, y, npc){
        if(maps[roomname].object_tiles[maphandler.coord_to_tile(x,y)] == 0){
            maps[roomname].object_tiles[maphandler.coord_to_tile(x,y)] = npc;
            maps[roomname].grid.setWalkableAt(x,y,false);
        } else {
            console.log(chalk.red.bold(`Couldn't spawn [NPC] ${npc.name} in ${roomname}(${x}, ${y}), perhaps there's something there?`));
        }
    },

    spawn_player: function(roomname, x, y, player){
        if(maphandler.check_object_free(roomname,x,y)){
            maps[roomname].object_tiles[maphandler.coord_to_tile(x,y)] = player;
            maps[roomname].grid.setWalkableAt(x,y,false);
        } else{
            console.log(chalk.red.bold(`Couldn't spawn [Player] ${player.name} in ${roomname}(${x}, ${y}), perhaps there's something there?`));
        }
    },

    move: function(roomname, current_x, current_y, x, y){

        if(maphandler.check_free(roomname,x,y) && maphandler.check_object_free(roomname,x,y)){
            maps[roomname].object_tiles[maphandler.coord_to_tile(x,y)] = maps[roomname].object_tiles[maphandler.coord_to_tile(current_x,current_y)];
            maps[roomname].grid.setWalkableAt(x,y,false);
            maps[roomname].object_tiles[maphandler.coord_to_tile(current_x,current_y)] = 0;
            maps[roomname].grid.setWalkableAt(current_x,current_y,true);

            if(maps[roomname].object_tiles[maphandler.coord_to_tile(x,y)].type == "player"){

                maps[roomname].mobs.forEach(function(mob){
                    if(mob.aggro == maps[roomname].object_tiles[maphandler.coord_to_tile(x,y)].name){
                        if(pathfinder.return_distance(roomname, x, y, mob.x, mob.y) > 14  && !mob.dead){
                            mob.aggro = null;
                        }
                    }
                    if(pathfinder.return_distance(roomname, x, y, mob.x, mob.y) <= 7 && mob.aggro == null && !mob.dead){
                        console.log(`DEBUG: ${mob.name} [${mob.id}]  fround a player to get aggro (${maps[roomname].object_tiles[maphandler.coord_to_tile(x,y)].name}).`);
                        mob.aggro = maps[roomname].object_tiles[maphandler.coord_to_tile(x,y)].name;
                        mob.get_aggro();
                    }

                });
            }
            //console.log(`Moved [${maps[roomname].object_tiles[maphandler.coord_to_tile(x,y)].type}] ${maps[roomname].object_tiles[maphandler.coord_to_tile(x,y)].name} from ${roomname}(${current_x}, ${current_y}) to ${roomname}(${x}, ${y})`);
            return true;
        } else {
            console.log(chalk.red.bold(`Error moving to ${roomname}(${x}, ${y}), collision detected.`));
            return false;
        }
    },

    clear: function(roomname, x, y){
        if(maps[roomname].object_tiles[maphandler.coord_to_tile(x,y)] != 0){
            maps[roomname].object_tiles[maphandler.coord_to_tile(x,y)] = 0;
            maps[roomname].grid.setWalkableAt(x,y,true);
        } else {
            console.log(chalk.red.bold(`Error clearing position ${roomname}(${x}, ${y}). Is position already clear?`));
            return false;
        }
    }
}
