module.exports = combatsystem = {

    normal_attack: function (attacker, roomname, x, y) {


        if (!maphandler.check_object_free(roomname, x, y)) {

            var victim = maphandler.get_object(roomname, x, y);
            var hitpoints = 0;
            var missed = false;
            var speed = 0;


            switch (attacker.type) {
                case "player":
                    speed = combatsystem.return_attackspeed_user(attacker.user);
                    switch (victim.type) {
                        case "mob":

                            if (combatsystem.return_hit(combatsystem.return_assert_user(attacker.user), victim.evasion)) {
                                hitpoints = combatsystem.return_hitpoints(combatsystem.return_attackpower_user(attacker.user), victim.defense);
                                victim.hp -= hitpoints;

                                if (victim.hp <= 0) {
                                    attacker.user.experience += victim.experience;

                                    if (attacker.user.experience >= attacker.user.needed_experience) attacker.levelup();

                                    attacker.user.save();
                                    victim.die();

                                    attacker.socket.write(packet.build([
                                        "KILLED_MOB",
                                        attacker.user.experience,
                                    ]));

                                    attacker.broadcastroom(packet.build([
                                        "PLAYER_SOUND",
                                        "HIT"
                                    ]));

                                }
                            } else {
                                missed = true;
                                attacker.broadcastroom(packet.build([
                                    "PLAYER_SOUND",
                                    "MISS"
                                ]));
                            }
                            console.log(missed);
                            attacker.socket.write(packet.build([
                                "ATTACK_RESULT",
                                missed,
                                hitpoints,
                                speed
                            ]))

                            break;

                        default:
                            console.log("Attacked unknown type: " + victim.type);
                            break;
                    }
                    break;

                default:
                    console.log("Unknown attacker type: " + attacker.type);
                    break;
            }
        } else {

            attacker.socket.write(packet.build([
                "ATTACK_RESULT",
                true,
                0,
                combatsystem.return_attackspeed_user(attacker.user)
            ]))

            attacker.broadcastroom(packet.build([
                "PLAYER_SOUND",
                "MISS"
            ]))

        }

    },

    return_attackpower_user: function (user) {
        return ((user.attributes.strength * 10) + user.attributes.dexterity + user.attributes.intelligence) / 12;
    },

    return_attackspeed_user: function (user) {
        var dex = 0;
        if (user.attributes.dexterity > 200) {
            dex = 200;
        } else {
            dex = user.attributes.dexterity;
        }
        return (-(((dex * 60) / 200) - 60) + 60);
    },

    return_defense_user: function (user) {
        return ((user.attributes.resistance * 9) + user.attributes.strength + user.attributes.dexterity + user.attributes.intelligence) / 12;
    },

    return_evasion_user: function (user) {
        var dex = Math.round(user.attributes.dexterity / 2);
        var int = Math.round(user.attributes.intelligence / 2);
        return Math.round(((((dex * 4) + int) / 5) * 100) / 400);
    },

    return_assert_user: function (user) {
        var dex = Math.round(user.attributes.dexterity * 2);
        var int = Math.round(user.attributes.intelligence * 2);
        return Math.round(((((dex * 4) + int) / 5) * 100) / 400);
    },

    return_hit: function (attacker_assert, defender_evasion) {
        var pool = attacker_assert + defender_evasion;
        return getRandomInt(0, pool) <= attacker_assert;
    },

    return_hitpoints: function (attacker_ap, defender_defense) {
        var attack = getRandomInt(((90 * attacker_ap) / 100), attacker_ap);
        attack = attack * 1.7;
        attack = attack * ((1 + (-(defender_defense * 0.5) / 200) + 1) / 2);
        return Math.round(attack);
    }
}
