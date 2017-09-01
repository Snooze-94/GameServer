var PF = require('pathfinding');

var mobs = {
    wolf:{

        name: "Wolf",
        hp: 100,
        max_hp: 7,
        x: 0,
        y: 0,
        assert: 2,
        evasion: 0,
        speed: 0.5,
        attackpower: 10,
        attack_delay: 2,
        level: 1,
        aggro: null,
        experience: 505,
        defense: 0,
        style: "nature",
        dialogue: "woof",
        facing: "down",
        spawn_random: true,
        spawn_respawns: true,
        spawn_ground: 0,
        spawn_delay: 4,
        spawn_zones: {
            rm_001:{
                quantity: 10
            }
        }

    }
}

for(var mob in mobs){

    mobs[mob].spawn = function(theMob){
        mob = theMob;
        mob.hp = mob.max_hp;
        var spawn_position = maphandler.return_random_specific(mob.room, mob.spawn_ground);
        mob.x = spawn_position.search_x;
        mob.y = spawn_position.search_y;
        mob.dead = false;
        mob.aggro = null;
        console.log(`Spawned [MOB] ${mob.id} ${mob.name} in ${mob.room}(${mob.x}, ${mob.y}).`)
        maphandler.spawn_mob(mob.room, spawn_position.search_x, spawn_position.search_y, mob);
    }

    mobs[mob].die = function(){
        mob = this;
        mob.aggro = null;
        maphandler.clear_mob(mob.room, mob.x, mob.y, mob.id);
        mob.dead = true;
        
        
        respawnMob(mob.id, mob.spawn_delay, mob.room);
    }

    mobs[mob].get_aggro = function(){
        mob = this;
        console.log(`DEBUG: get_aggro(); function fired by ${this.name} [${this.id}]`);
        if(mob.aggro != null && !mob.dead) {
            if(maps[mob.room].clients.length == 0){
                mob.aggro = null;
                return;
            } else{
                maps[mob.room].clients.forEach(function(client){
                    if(client.name == mob.aggro){
                        if(pathfinder.is_target_close(mob.room, mob.x, mob.y, client.user.pos_x, client.user.pos_y)){
                            console.log("Wolf wants to attack " + client.name);
                            setMobAttackDelay(mob.id, mob.attack_delay, mob.room);
                        } else {
                            var move_position = pathfinder.return_next_coord(mob.room, mob.x,mob.y,client.user.pos_x, client.user.pos_y);
                            maphandler.move(mob.room, mob.x, mob.y, move_position.next_x, move_position.next_y);
                            maps[mob.room].clients.forEach(function(client){
                                client.socket.write(packet.build([
                                    "MOB_MOVE",
                                    mob.id,
                                    mob.x,
                                    mob.y,
                                    move_position.next_x,
                                    move_position.next_y
                                ]));
                            });
                            mob.x = move_position.next_x;
                            mob.y = move_position.next_y;
                            setMobMoveDelay(mob.id, mob.speed, mob.room);
                        }

                    }
                    return;
                });
            }
            
        }
    }

}

module.exports = mobs;