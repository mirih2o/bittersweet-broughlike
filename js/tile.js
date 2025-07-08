class Tile{
	constructor(x, y, sprite, passable){
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.passable = passable;
	}

    replace(newTileType){
        tiles[this.x][this.y] = new newTileType(this.x, this.y);
        return tiles[this.x][this.y];
    }

     //manhattan distance
     dist(other){
        return Math.abs(this.x-other.x)+Math.abs(this.y-other.y);
    }

    getNeighbor(dx, dy){
        return getTile(this.x + dx, this.y + dy)
    }

    getAdjacentNeighbors(){
        return shuffle([
            this.getNeighbor(0, -1),
            this.getNeighbor(0, 1),
            this.getNeighbor(-1, 0),
            this.getNeighbor(1, 0)
        ]);
    }

    getAdjacentPassableNeighbors(){
        return this.getAdjacentNeighbors().filter(
            t => typeof t.isPassable === "function" ? t.isPassable() : t.passable
        );
    }

    getConnectedTiles(){
        let connectedTiles = [this];
        let frontier = [this];
        while(frontier.length){
            let neighbors = frontier.pop()
                                .getAdjacentPassableNeighbors()
                                .filter(t => !connectedTiles.includes(t));
            connectedTiles = connectedTiles.concat(neighbors);
            frontier = frontier.concat(neighbors);
        }
        return connectedTiles;
    }

	draw(){
        drawSprite(this.sprite, this.x, this.y);

        // Only draw treasure if not an exit
        if(this.treasure && !this.exit){                      
            drawSprite(15, this.x, this.y);                                             
        }

        this.drawEffectIfPresent();
	}

    drawEffectIfPresent() {
        if(this.effectCounter) {
            this.effectCounter--;
            ctx.globalAlpha = this.effectCounter / 20;
            drawSprite(this.effect, this.x, this.y);
            ctx.globalAlpha = 1;
        }
    }

    setEffect(effectSprite){                                  
        this.effect = effectSprite;
        this.effectCounter = 20;
    }
}

class Floor extends Tile{
    constructor(x, y, sprite = 5, passable = true) {
        super(x, y, sprite, passable);
    };

    draw() {
        drawSprite(this.sprite, this.x, this.y);
        if (this.treasure) {
            drawSprite(15, this.x, this.y);
        }
    }

    stepOn(monster){
        if(monster.isPlayer){
            // Play random footstep sound
            const n = Math.floor(Math.random() * 4) + 1;
            playSound("footstep" + n);
        }
        if(monster.isPlayer && this.treasure){   
            score++;
            if(score % 3 == 0 && numSpells < 9){                         
                numSpells++;                
                player.addSpell();            
            }  
            playSound("treasure");
            this.treasure = false;
            spawnMonster();
        }
    }
}

class Wall extends Tile{
    constructor(x, y){
        super(x, y, 6, false);
    }

    draw() {
        drawSprite(this.sprite, this.x, this.y);
    }
}

class Exit extends Floor {
    constructor(x, y, dirToInside) {
        super(x, y, 14, true); // passable
        this.exit = true;
        this.dirToInside = dirToInside;
    }
    isPassable() {
        if (typeof gameState === "undefined" || gameState !== "running") return true;
        if (!player || !player.tile) return true;
        let px = player.tile.x, py = player.tile.y;
        let passable = (px === this.x + this.dirToInside[0] && py === this.y + this.dirToInside[1]);
        return passable;
    }
    stepOn(monster) {
        if (monster.isPlayer) {
            playSound("newLevel");
            if (level == numLevels) {
                // Special celebration for completing the last level (20)
                addScore(score, true);
                showTemporaryMessage("You've completed the journey! Your true self shines brightly.");
                
                // Optional: add a slight delay before showing the title screen
                setTimeout(() => {
                    showTitle();
                }, 3000); // 3-second delay to show the message
            } else {
                level++;
                startLevel(Math.min(maxHp, player.hp + 1));
            }
        }
    }
    draw() {
        drawSprite(this.sprite, this.x, this.y);
    }
}