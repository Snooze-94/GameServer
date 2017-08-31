var PF = require('pathfinding');
module.exports = pathfinder = {

    is_target_close: function(roomname, x, y, target_x, target_y){
        maps[roomname].grid.setWalkableAt(x,y,true);
        maps[roomname].grid.setWalkableAt(target_x,target_y,true);
        var gridClone = maps[roomname].grid.clone();
        maps[roomname].grid.setWalkableAt(x,y,false);
        maps[roomname].grid.setWalkableAt(target_x,target_y,false);
        var finder = new PF.AStarFinder({
            allowDiagonal: false
        })
        var path = finder.findPath(x,y,target_x,target_y,gridClone);
        if(path.length == 0){
            return false;
        }
        var next_x = path[1][0];
        var next_y = path[1][1];
        if(next_x == target_x && next_y == target_y){
            return true;
        } else {
            return false;
        }
        
    },

    return_next_coord: function(roomname, x, y, target_x, target_y){
        maps[roomname].grid.setWalkableAt(x,y,true);
        maps[roomname].grid.setWalkableAt(target_x,target_y,true);
        var gridClone = maps[roomname].grid.clone();
        maps[roomname].grid.setWalkableAt(x,y,false);
        maps[roomname].grid.setWalkableAt(target_x,target_y,false);
        var finder = new PF.AStarFinder({
            allowDiagonal: false
        })
        var path = finder.findPath(x,y,target_x,target_y,gridClone);
        if(path.length == 0){
            var next_x = x;
            var next_y = y;
            return {next_x, next_y};
        }
        var next_x = path[1][0];
        var next_y = path[1][1];
        return {next_x, next_y};
    },

    return_distance: function(roomname, x, y, target_x, target_y){
        maps[roomname].grid.setWalkableAt(x,y,true);
        maps[roomname].grid.setWalkableAt(target_x,target_y,true);
        var gridClone = maps[roomname].grid.clone();
        maps[roomname].grid.setWalkableAt(x,y,false);
        maps[roomname].grid.setWalkableAt(target_x,target_y,false);
        var finder = new PF.AStarFinder({
            allowDiagonal: true,
            dontCrossCorners: true
        })
        var path = finder.findPath(x,y,target_x,target_y,gridClone);
        if(path.length == 0){
            return 100;
        }
        return path.length;
    }

}