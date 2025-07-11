class Monster{
	constructor(tile, sprite, hp){
        this.move(tile);
        this.sprite = sprite;
        this.hp = hp;
        this.teleportCounter = 2;
        this.offsetX = 0;                                                   
        this.offsetY = 0;
        this.lastMove = [-1,0];
        this.bonusAttack = 0;
        this.stunned = 0;
	}

    heal(damage){
        this.hp = Math.min(maxHp, this.hp+damage);
    }

    update(){
        this.teleportCounter--;
        
        if(this.stunned > 0){
            this.stunned--;
            return;
        }
            
        if(this.teleportCounter > 0){
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

        if(this.stunned > 0){
            drawSprite(24, this.getDisplayX(), this.getDisplayY());
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
            this.lastMove = [dx,dy];
            if(!newTile.monster){
                this.move(newTile);
            }else{
                if(this.isPlayer != newTile.monster.isPlayer){
                    this.attackedThisTurn = true;
                    newTile.monster.stunned = true;
                    newTile.monster.hit(1 + this.bonusAttack);
                    this.bonusAttack = 0;

                    shakeAmount = 5;

                    this.offsetX = (newTile.x - this.tile.x)/2;         
                    this.offsetY = (newTile.y - this.tile.y)/2;   
                }
            }
            return true;
        }
    }

    hit(damage){
        if(this.shield>0){           
            return;                                                             
        }

        this.hp -= damage;
        if(this.hp <= 0){
            this.die();
        }

        if(this.isPlayer){                                                     
            playSound("hit1");                                              
        }else{                                                       
            playSound("hit2");                                              
        } 
    }

    die(){
        this.dead = true;
        this.tile.monster = null;
        this.sprite = 4;
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
        this.spells = shuffle(Object.keys(spells)).splice(0,numSpells);
        this.outfit = 0; // y offset: 0, 16, 32, or 48
    }

    update(){          
        this.shield--;                                                      
    } 

    tryMove(dx, dy){
        let newTile = this.tile.getNeighbor(dx, dy);
        if (typeof newTile.isPassable === "function" ? newTile.isPassable() : newTile.passable) {
            if(super.tryMove(dx,dy)){
                tick();
            }
        }
    }

    addSpell(){                                                       
        let newSpell = shuffle(Object.keys(spells))[0];
        this.spells.push(newSpell);
    }

    castSpell(index){                                                   
        let spellName = this.spells[index];
        if(spellName){
            delete this.spells[index];
            spells[spellName]();
            playSound("spell");
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
            // Draw shield sprite behind player if shield > 0
            if(this.shield > 0){
            drawSprite(23, this.getDisplayX(), this.getDisplayY());
        }
            // Use outfit as y offset for drawSprite
            drawSprite(0, this.getDisplayX(), this.getDisplayY(), this.outfit);
            this.drawHp();
        }

        this.offsetX -= Math.sign(this.offsetX)*(1/8);     
        this.offsetY -= Math.sign(this.offsetY)*(1/8); 

        // Trigger shake when dash animation ends
        if (this.dashCollided && this.offsetX === 0 && this.offsetY === 0) {
            shakeAmount = 10;
            this.dashCollided = false;
        }
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
        this.name = "Old Polaroid";
        this.description = this.name + ": Jumps over walls to reach targets.";
    }

    doStuff(){
        let possibleMoves = this.getAllPossibleMoves();
        
        if(possibleMoves.length){
            let bestMove = this.chooseBestMove(possibleMoves);
            this.executeMove(bestMove);
        }
    }
    
    getAllPossibleMoves(){
        let possibleMoves = [];
        
        // Add normal movement options
        possibleMoves.push(...this.getNormalMoves());
        
        // Add jump movement options
        possibleMoves.push(...this.getJumpMoves());
        
        return possibleMoves;
    }
    
    getNormalMoves(){
        let moves = [];
        let neighbors = this.tile.getAdjacentPassableNeighbors();
        neighbors = neighbors.filter(t => !t.monster || t.monster.isPlayer);
        
        for(let neighbor of neighbors){
            moves.push({
                tile: neighbor,
                dx: neighbor.x - this.tile.x,
                dy: neighbor.y - this.tile.y,
                isJump: false
            });
        }
        
        return moves;
    }
    
    getJumpMoves(){
        let moves = [];
        let allNeighbors = this.tile.getAdjacentNeighbors();
        
        for(let neighbor of allNeighbors){
            if(this.isWall(neighbor)){
                let jumpTile = this.getJumpDestination(neighbor);
                if(jumpTile && this.canJumpTo(jumpTile)){
                    moves.push({
                        tile: jumpTile,
                        dx: jumpTile.x - this.tile.x,
                        dy: jumpTile.y - this.tile.y,
                        isJump: true
                    });
                }
            }
        }
        
        return moves;
    }
    
    isWall(tile){
        return !tile.passable && inBounds(tile.x, tile.y);
    }
    
    getJumpDestination(wallTile){
        let jumpX = wallTile.x + (wallTile.x - this.tile.x);
        let jumpY = wallTile.y + (wallTile.y - this.tile.y);
        
        if(inBounds(jumpX, jumpY)){
            return getTile(jumpX, jumpY);
        }
        return null;
    }
    
    canJumpTo(tile){
        return tile.passable && !tile.monster;
    }
    
    chooseBestMove(possibleMoves){
        possibleMoves.sort((a,b) => a.tile.dist(player.tile) - b.tile.dist(player.tile));
        return possibleMoves[0];
    }
    
    executeMove(move){
        if(move.isJump){
            this.jumpMove(move.tile);
        }else{
            this.tryMove(move.dx, move.dy);
        }
    }
    
    jumpMove(targetTile){
        this.lastMove = [targetTile.x - this.tile.x, targetTile.y - this.tile.y];
        this.move(targetTile);
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