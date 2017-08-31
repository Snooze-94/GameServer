/**
 * Created by Ale on 5/10/2016.
 */
var Parser = require("binary-parser").Parser;
var StringOptions = {length: 99, zeroTerminated:true};

module.exports = PacketModels = {

    header: new Parser().skip(1)
        .string("command", StringOptions),

    login: new Parser().skip(1)
        .string("command", StringOptions)
        .string("username", StringOptions)
        .string("password", StringOptions),

    register: new Parser().skip(1)
        .string("command", StringOptions)
        .string("username", StringOptions)
        .string("password", StringOptions),

    move: new Parser().skip(1)
        .string("command", StringOptions)
        .uint32le("current_x", StringOptions)
        .uint32le("current_y", StringOptions)
        .uint32le("target_x", StringOptions)
        .uint32le("target_y", StringOptions),

    facing: new Parser().skip(1)
        .string("command", StringOptions)
        .string("facing", StringOptions),

    attack: new Parser().skip(1)
        .string("command", StringOptions)
        .string("attack_type", StringOptions)
        .uint32le("attack_x", StringOptions)
        .uint32le("attack_y", StringOptions)

};

