module.exports = removeByAttr = function(arr, attr, value){
    var i = arr.length;
    while(i--){
       if( arr[i] 
           && arr[i].hasOwnProperty(attr) 
           && (arguments.length > 2 && arr[i][attr] === value ) ){ 

           arr.splice(i,1);

       }
    }
    return arr;
}

module.exports = getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = respawnMob = function(mob_id, delay, room){
    setTimeout(function(){
            maps[room].mobs.forEach(function(mob){
                if(mob.id == mob_id){
                    mob.spawn(mob);
                }
            });
    }, delay * 1000);
}

module.exports = setMobAttackDelay = function(mob_id, attack_delay, room){
    setTimeout(function(){
            maps[room].mobs.forEach(function(mob){
                if(mob.id == mob_id){
                    mob.get_aggro();
                }
            });
    }, attack_delay * 1000);
}

module.exports = setMobMoveDelay = function(mob_id, speed, room){
    setTimeout(function(){
            maps[room].mobs.forEach(function(mob){
                if(mob.id == mob_id){
                    mob.get_aggro();
                }
            });
    }, speed * 1000);
}