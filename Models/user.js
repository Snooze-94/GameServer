/**
 * Created by Ale on 4/10/2016.
 */
var mongoose = require("mongoose");
mongoose.Promise = require("promise");

var userSchema = new mongoose.Schema({

    username: {type: String, unique: true},
    password: String,
    sprite: String,
    current_room: String,
    pos_x: Number,
    pos_y: Number,
    facing: String,
    level: Number,
    race: String,
    class: String,
    allience: String,
    experience: Number,
    needed_experience: Number,
    attributes: {
        strength: Number,
        dexterity: Number,
        vitality: Number,
        intelligence: Number,
        endurance: Number,
        resistance: Number
    }

});

userSchema.statics.register = function(username,password, cb){

    var new_user = new User({
        username : username,
        password : password,
        sprite : "spr_hero",
        current_room : maps[config.starting_zone].room,
        pos_x: maps[config.starting_zone].start_x,
        pos_y: maps[config.starting_zone].start_y,
        facing: "down",
        level: 1,
        race: "Human",
        class: "None",
        allience: "Citizen",
        experience: 0,
        needed_experience: 100,
        attributes: {
            strength: 1,
            dexterity: 1,
            vitality: 1,
            intelligence: 1,
            endurance: 1,
            resistance: 1
        }
    });

    new_user.save(function(err){
        if(!err){
            cb(true);
        }else{
            cb(false);
        }
    });

};

userSchema.statics.login = function(username,password, cb){

    User.findOne({username: username},function(err, user){

        if(!err && user) {
            if(user.password == password) {
                cb(true, user);
            }else {
                cb(false, null);
            }
        }else {
            cb(false, null);
        }

    })

};

module.exports = User = gamedb.model("User", userSchema);