var zeroBuffer = new Buffer("00", "hex");
module.exports = packet = {

build: function(params) {

        var packetParts = [];
        var packetSize = 0;

        params.forEach(function (param) {

            var buffer;

            if (typeof param === "string") {
                buffer = new Buffer(param, "utf8");
                buffer = Buffer.concat([buffer, zeroBuffer], buffer.length + 1);
            } else if (typeof param === "number") {
                buffer = Buffer.allocUnsafe(4);
                buffer.writeUInt32LE(param, 0);
            } else if (typeof param === "boolean"){
                buffer = new Buffer(1);
                buffer.writeUInt8(param, 0);
            } else {
                console.log("Unknown data type in packet builder. (" + typeof param + ")");
            }
            ;

            packetSize += buffer.length;
            packetParts.push(buffer);

        });

        var dataBuffer = Buffer.concat(packetParts, packetSize);

        var size = new Buffer(1);
        size.writeUInt8(dataBuffer.length + 1, 0);

        var finalPacket = Buffer.concat([size,dataBuffer], size.length + dataBuffer.length);

        return finalPacket;

    },

    parse: function(c, data){

        var idx = 0;

        while(idx < data.length){
            var packetSize = data.readUInt8(idx);
            var extractedPacket = new Buffer(packetSize);
            data.copy(extractedPacket, 0, idx, idx + packetSize);

            this.interpret(c, extractedPacket);

            idx += packetSize;
        }

    },

    interpret: function(c, datapacket){
        var header = PacketModels.header.parse(datapacket);
        //console.log("Interpret: " + header.command);

        switch (header.command.toUpperCase()){

            case "PING":
                c.socket.write(packet.build(["PING"]));
            break;

            case "LOGIN":
                var data = PacketModels.login.parse(datapacket);
                User.login(data.username, data.password, function(result, user){
                    if(result){
                        console.log(data.username + " has logged in.");
                        c.user = user;
                        c.socket.write(packet.build([
                            "LOGIN",
                            true,
                            c.user.current_room,
                            c.user.pos_x,
                            c.user.pos_y,
                            c.user.username,
                            c.user.facing,
                            c.user.experience,
                            c.user.needed_experience,
                            c.user.level
                            ]));
                        c.playing = true;
                        c.enterroom(c.user.current_room);
                        c.broadcastroom(packet.build(["PLAYER_SPAWN", true, c.user.username, c.user.pos_x, c.user.pos_y, c.user.facing]));
                    }else{
                        c.socket.write(packet.build(["LOGIN", false]));
                    }
                });
                break;

            case "REGISTER":
                var data = PacketModels.register.parse(datapacket);
                User.register(data.username,data.password,function(result){
                   if(result){
                       c.socket.write(packet.build(["REGISTER", true]));
                   } else{
                       c.socket.write(packet.build(["REGISTER", false]));
                   }
                });
            break;

            case "MOVE":
                var data = PacketModels.move.parse(datapacket);
                if(maphandler.move(c.user.current_room, data.current_x, data.current_y, data.target_x, data.target_y)){
                    console.log("Move packet recieved.");
                    c.user.pos_x = data.target_x;
                    c.user.pos_y = data.target_y;
                    c.user.save();
                    c.broadcastroom(packet.build(["PLAYER_POS", c.user.username, data.current_x, data.current_y, data.target_x, data.target_y]));
                }else{
                    c.socket.write(packet.build(["GET_POS", data.current_x, data.current_y]));
                    maps[c.user.current_room].object_tiles[maphandler.coord_to_tile(data.current_x,data.current_y)] = c;
                }
            break;

            case "ATTACK":
                var data = PacketModels.attack.parse(datapacket);
                switch(data.attack_type){
                    case "normal":
                        combatsystem.normal_attack(c, c.user.current_room, data.attack_x, data.attack_y);
                    break;
                }
            break;

            case "FACING":
                var data = PacketModels.facing.parse(datapacket);
                c.user.facing = data.facing;
                c.user.save();
                c.broadcastroom(packet.build(["PLAYER_FACING", c.user.username, data.facing]));
            break;

            case "GET_NPC":
                c.getnpc();
            break;

            case "GET_USERS":
                c.getusersinroom();
            break;

            case "GET_MOB":
                c.getmob();
            break;
        }
    }

};
