class Monster{
	constructor(tile, sprite, hp){
        this.move(tile);
        this.sprite = sprite;
        this.hp = hp;
        this.teleportCounter = 2;
        this.offsetX = 0;                                                   
        this.offsetY = 0;
	}

    heal(damage){
        this.hp = Math.min(maxHp, this.hp+damage);
    }

    update(){
        this.teleportCounter--;
        if(this.stunned || this.teleportCounter > 0){
            this.stunned = false;
            return;
        }

        this.doStuff();
    }

    doStuff(){
       let neighbors = this.tile.getAdjacentPassableNeighbors();
       
       neighbors = neighbors.filter(t => !t.monster || t.monster.isPlayer);

       if(neighbors.length){
           neighbors.sort((a,b) => a.dist(player.tile) - b.dist(player.tile));
           let newTile = neighbors[0];
           this.tryMove(newTile.x - this.tile.x, newTile.y - this.tile.y);
       }
    }

    getDisplayX(){                     
        return this.tile.x + this.offsetX;
    }

    getDisplayY(){                                                                  
        return this.tile.y + this.offsetY;
    }

	draw(){
        if(this.teleportCounter > 0){
            drawSprite(13, this.getDisplayX(),  this.getDisplayY());                 
        }else{
            drawSprite(this.sprite, this.getDisplayX(),  this.getDisplayY());
            this.drawHp();
        }

        this.offsetX -= Math.sign(this.offsetX)*(1/8);     
        this.offsetY -= Math.sign(this.offsetY)*(1/8); 
	}
    
    drawHp(){
        for(let i=0; i<this.hp; i++){
            drawSprite(
                12,
                this.getDisplayX() + (i%3)*(3/16),
                this.getDisplayY() - Math.floor(i/3)*(3/16)
            );
        }
    }	

    tryMove(dx, dy){
        let newTile = this.tile.getNeighbor(dx,dy);
        if(newTile.passable){
            if(!newTile.monster){
                this.move(newTile);
            }else{
                if(this.isPlayer != newTile.monster.isPlayer){
                    this.attackedThisTurn = true;
                    newTile.monster.stunned = true;
                    newTile.monster.hit(1);

                    shakeAmount = 5;

                    this.offsetX = (newTile.x - this.tile.x)/2;         
                    this.offsetY = (newTile.y - this.tile.y)/2;   
                }
            }
            return true;
        }
    }

    hit(damage){
        this.hp -= damage;
        if(this.hp <= 0){
            this.die();
        }
    }

    die(){
        this.dead = true;
        this.tile.monster = null;
        this.sprite = 1;
    }

    move(tile){
        if(this.tile){
            this.tile.monster = null;
            this.offsetX = this.tile.x - tile.x;    
            this.offsetY = this.tile.y - tile.y;
        }
        this.tile = tile;
        tile.monster = this;
        tile.stepOn(this);
    }

}

class Player extends Monster{
    constructor(tile){
        super(tile, 0, 3);
        this.isPlayer = true;
        this.teleportCounter = 0;
        this.outfit = 0; // y offset: 0, 16, 32, or 48
    }

    tryMove(dx, dy){
        if(super.tryMove(dx,dy)){
            tick();
        }
    }

    setOutfit(offset) {
        // offset should be 0, 16, 32, or 48
        this.outfit = offset;
    }

    draw() {
        if(this.teleportCounter > 0){
            drawSprite(13, this.getDisplayX(), this.getDisplayY());
        }else if(this.dead){
            // Draw dead sprite
            drawSprite(4, this.tile.x, this.tile.y, this.outfit);
        }else{
            // Use outfit as y offset for drawSprite
            drawSprite(0, this.getDisplayX(), this.getDisplayY(), this.outfit);
            this.drawHp();
        }

        this.offsetX -= Math.sign(this.offsetX)*(1/8);     
        this.offsetY -= Math.sign(this.offsetY)*(1/8); 
    }
}

class Bird extends Monster{
    constructor(tile){
        super(tile, 7, 3);
        this.name = "Tailor's Mannequin";
        this.description = this.name + ": Basic enemy.";
    }
}

class Snake extends Monster{
    constructor(tile){
        super(tile, 8, 1);
        this.name = "Gossip Wisp";
        this.description = this.name + ": Moves twice if possible.";
    }

    doStuff(){
        this.attackedThisTurn = false;
        super.doStuff();

        if(!this.attackedThisTurn){
            super.doStuff();
        }
    }
}

class Tank extends Monster{
    constructor(tile){
        super(tile, 9, 2);
        this.name = "Cracked Mirror";
        this.description = this.name + ": Slow, acts every other turn.";
    }

    update(){
        let startedStunned = this.stunned;
        super.update();
        if(!startedStunned){
            this.stunned = true;
        }
    }
}

class Eater extends Monster{
    constructor(tile){
        super(tile, 10, 1);
        this.name = "Spider";
        this.description = this.name + ": Consumes walls and grows.";
    }

    doStuff(){
        let neighbors = this.tile.getAdjacentNeighbors().filter(t => !t.passable && inBounds(t.x,t.y));
        if(neighbors.length){
            neighbors[0].replace(Floor);
            this.heal(0.5);
        }else{
            super.doStuff();
        }
    }
}

class Jester extends Monster{
    constructor(tile){
        super(tile, 11, 2);
        this.name = "Uniformed Group";
        this.description = this.name + ":  Moves unpredictably.";
    }

    doStuff(){
        let neighbors = this.tile.getAdjacentPassableNeighbors();
        if(neighbors.length){
            this.tryMove(neighbors[0].x - this.tile.x, neighbors[0].y - this.tile.y);
        }
    }
}