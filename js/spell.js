spells = {
    ESCAPE: function(){
        player.move(randomPassableTile());
    },
    STOMP: function(){                  
        for(let i=0; i<numTiles; i++){
            for(let j=0; j<numTiles; j++){
                let tile = getTile(i,j);
                if(tile.monster){
                    let numWalls = 4 - tile.getAdjacentPassableNeighbors().length;
                    tile.monster.hit(numWalls*2);
                }
            }
        }
        shakeAmount = 20;
    },
    SWIRL: function(){
        for(let i=0;i<monsters.length;i++){
            monsters[i].move(randomPassableTile());
            monsters[i].teleportCounter = 2;
        }
    },
    DAYBREAK: function(){
        startLevel(1, player.spells);
    },
    AURA: function(){
        player.tile.getAdjacentNeighbors().forEach(function(t){
            t.setEffect(22);
            if(t.monster){
                t.monster.heal(1);
            }
        });
        player.tile.setEffect(22);
        player.heal(1);
    },
    DASH: function(){
        if (!player.lastMove) return;
        let newTile = player.tile;
        let collided = false;
        let collisionTile = null;
        let steps = 0;
        while(true){
            let testTile = newTile.getNeighbor(player.lastMove[0],player.lastMove[1]);
            if(testTile.passable && !testTile.monster){
                newTile = testTile;
                steps++;
            }else{
                collided = true;
                collisionTile = testTile;
                break;
            }
        }
        if(player.tile != newTile){
            player.offsetX = player.tile.x - newTile.x;
            player.offsetY = player.tile.y - newTile.y;
            player.move(newTile);
            player.dashCollided = collided;
            newTile.getAdjacentNeighbors().forEach(t => {
                if(t.monster){
                    t.setEffect(17);
                    t.monster.stunned = true;
                    t.monster.hit(2);
                }
            });
            if (collisionTile) {
                // Delay is proportional to dash distance (steps)
                setTimeout(() => {
                    collisionTile.setEffect(17);
                }, 100 * steps); // 100ms per tile
            }
        }
    },
    UNVEIL: function(){
        for(let i=1;i<numTiles-1;i++){
            for(let j=1;j<numTiles-1;j++){
                let tile = getTile(i,j);
                if(!tile.passable){
                    tile.replace(Floor);
                }
            }
        }
        player.tile.setEffect(16);
        player.heal(2);
    },
    GIFT: function(){
        for(let i=0;i<monsters.length;i++){
            monsters[i].tile.setEffect(16);
            monsters[i].heal(1);
            monsters[i].tile.treasure = true;
        }
    },
    REFINE: function(){
        player.tile.getAdjacentNeighbors().forEach(function(t){
            if(!t.passable && inBounds(t.x, t.y)){
                t.replace(Floor).treasure = true;
            }
        });
    },
    EMPOWER: function(){
        player.bonusAttack=5;
    },
    DUPLICATE: function(){
        for(let i=player.spells.length-1;i>0;i--){
            if(!player.spells[i]){
                player.spells[i] = player.spells[i-1];
            }
        }
    },
    BRAVERY: function(){
        player.shield = 2;
        for(let i=0;i<monsters.length;i++){
            monsters[i].stunned = true;
        }
    },

    FOCUS: function(){
        boltTravel(player.lastMove, 18 + Math.abs(player.lastMove[1]), 4);
    },
    CROSS: function(){
        let directions = [
            [0, -1],
            [0, 1],
            [-1, 0],
            [1, 0]
        ];
        for(let k=0;k<directions.length;k++){
            boltTravel(directions[k], 18 + Math.abs(directions[k][1]), 2);
        }
    }, 
    X: function(){
        let directions = [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        ];
        for(let k=0;k<directions.length;k++){
            // Sprite 20 für \, Sprite 21 für /
            let effect = (k === 0 || k === 3) ? 20 : 21;
            boltTravel(directions[k], effect, 3);
        }
    }

};

function boltTravel(direction, effect, damage){
    let newTile = player.tile;
    while(true){
        let testTile = newTile.getNeighbor(direction[0], direction[1]);
        if(testTile.passable){
            newTile = testTile;
            if(newTile.monster){
                newTile.monster.hit(damage);
            }
            newTile.setEffect(effect);
        }else{
            break;
        }
    }
}

const spellDescriptions = {
    ESCAPE: "Teleport to a random passable tile.",
    STOMP: "Stomp all monsters, dealing 2 damage for each wall around them.",
    SWIRL: "Teleport all monsters to random passable tiles.",
    DAYBREAK: "Start the level over, keeping your spells.",
    AURA: "Heal yourself and adjacent monsters for 1 HP.",
    DASH: "Dash in the direction of your last move, stunning and dealing 2 damage to enemies.",
    UNVEIL: "Remove all walls, healing yourself for 2 HP.",
    GIFT: "Heal all monsters for 1 HP and give them treasure.",
    REFINE: "Turn adjacent walls into treasure.",
    EMPOWER: "Gain +5 attack for the next turn.",
    DUPLICATE: "Duplicate your spells, filling empty slots with the previous spell.",
    BRAVERY: "Gain a shield that absorbs 2 damage and stun all monsters.",
    FOCUS: "Shoot a bolt in the direction of your last move, dealing 2 damage.",
    CROSS: "Shoot bolts in cardinal directions, dealing 2 damage each.",
    X: "Shoot bolts diagonally in diagonal directions, dealing 3 damage each."
};
window.spellDescriptions = spellDescriptions;