var now = require("performance-now");
var _ = require("underscore");

module.exports = function(){

    var client = this;
    this.name = "UNDEFINED CLIENT NAME";
    this.type = "player";
    this.playing = false;

    this.initiate = function(){
        client.socket.write(packet.build(["HELLO", now().toString()]));
        console.log("Client initiated.");
    };

    this.enterroom = function(room){

        if(client.name == "UNDEFINED CLIENT NAME"){
            client.name = client.user.username;
        }

        maphandler.spawn_player(room, client.user.pos_x, client.user.pos_y, client);

        maps[room].clients.push(client);

    };

    this.getusersinroom = function(){
        maps[client.user.current_room].clients.forEach(function(otherClient){
            if(otherClient.name != client.name){
                client.socket.write(packet.build([
                    "PLAYER_SPAWN",
                    false,
                    otherClient.user.username,
                    otherClient.user.pos_x,
                    otherClient.user.pos_y,
                    otherClient.user.facing
                ]));
            }
        });
    };

    this.getnpc = function(){
        maps[client.user.current_room].npcs.forEach(function(npc){
            client.socket.write(packet.build([
                "SPAWN_NPC", 
                npc.name, 
                npc.x, 
                npc.y, 
                npc.dialogue, 
                npc.profession,
                npc.facing
            ]));
        });
    };

    this.getmob = function(){
        maps[client.user.current_room].mobs.forEach(function(mob){
            if(!mob.dead){
                client.socket.write(packet.build([
                    "SPAWN_MOB", 
                    mob.name, 
                    mob.x, 
                    mob.y,
                    mob.facing,
                    mob.dialogue,
                    mob.id
                ]));
            }
        });
    };

    this.levelup = function(){
        client.user.level++;

        client.user.attributes.strength += 2;
        client.user.attributes.dexterity += 2;
        client.user.attributes.vitality += 2;
        client.user.attributes.intelligence += 2;
        client.user.attributes.endurance += 2;
        client.user.attributes.resistance += 2;

        client.user.experience -= client.user.needed_experience;
        client.user.needed_experience = client.user.needed_experience * 1.15;
        
        client.socket.write(packet.build([
            "LEVEL_UP",
            client.user.level,
            client.user.needed_experience,
            client.user.experience
        ]));
        client.broadcastroom(packet.build([
            "PLAYER_SOUND",
            "LEVELUP"
        ]));
        if(client.user.experience >= client.user.needed_experience) client.levelup();

    };


    this.exitroom = function(room){
        maphandler.clear_player(room,client.name);
    };

    this.broadcastroom = function(packetData){
        maps[client.user.current_room].clients.forEach(function(otherClient){
            if(otherClient.name != client.name){
                otherClient.socket.write(packetData);
            }
        });
    };

    this.broadcastroomall = function(packetData){
        maps[client.user.current_room].clients.forEach(function(otherClient){
            otherClient.socket.write(packetData);
        });
    };

    this.data = function(data){
        packet.parse(client, data);
    };

    this.error = function(err){
        console.log("Client error. " + err.toString());
    };

    this.end = function(){
        if(client.playing){
            client.exitroom(client.user.current_room);
            console.log(client.name + " logged out.");
        }
    };

};