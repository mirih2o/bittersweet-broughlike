function generateLevel(){
    // Draw the floor and walls
    tryTo('generate map', function(){
        return generateTiles() == randomPassableTile().getConnectedTiles().length;
    });

    // Place treasures
    generateTreasures();

    // Then generate monsters (they will avoid treasure tiles)
    generateMonsters();

    // Place the exit only after the map is valid
    placeExitOnOuterWall();
}

function generateTiles(){
    let passableTiles=0;
    tiles = [];
    for(let i=0;i<numTiles;i++){
        tiles[i] = [];
        for(let j=0;j<numTiles;j++){
            // 30% chance of wall, otherwise floor
            // and ensure that the edges are walls
            if(i === 0 || j === 0 || i === numTiles-1 || j === numTiles-1){
                tiles[i][j] = new Wall(i,j);
            }else if(Math.random() < 0.3){
                tiles[i][j] = new Wall(i,j);
            }else{
                tiles[i][j] = new Floor(i,j);
                passableTiles++;
            }
        }
    }
    return passableTiles;
}

function inBounds(x,y){
    return x>=0 && y>=0 && x<numTiles && y<numTiles;
}

function getTile(x, y){
    if(inBounds(x,y)){
        return tiles[x][y];
    }else{
        return new Wall(x,y);
    }
}

function randomPassableTile(avoidTreasure = false, avoidExit = false){
    let tile;
    tryTo('get random passable tile', function(){
        let x = randomRange(0,numTiles-1);
        let y = randomRange(0,numTiles-1);
        tile = getTile(x, y);
        return tile.passable
            && !tile.monster
            && (!avoidTreasure || !tile.treasure)
            && (!avoidExit || !tile.exit);
    });
    return tile;
}

function generateTreasures(){
    for(let i=0;i<3;i++){                                         
        randomPassableTile().treasure = true;                            
    }
}

function generateMonsters(){
    monsters = [];
    let numMonsters = level+1;
    for(let i=0;i<numMonsters;i++){
        spawnMonster();
    }
}

function spawnMonster(){
    let monsterType = shuffle([Bird, Snake, Tank, Eater, Jester])[0];
    let monster = new monsterType(randomPassableTile(true)); // avoid treasure
    monsters.push(monster);
}

function placeExitOnOuterWall() {
    // Collect all non-corner outer wall positions and their inside direction
    let candidates = [];
    for (let x = 1; x < numTiles - 1; x++) {
        // Top row (y=0), faces down
        if (tiles[x][0] instanceof Wall) candidates.push({x: x, y: 0, dir: [0, 1]});
        // Bottom row (y=numTiles-1), faces up
        if (tiles[x][numTiles - 1] instanceof Wall) candidates.push({x: x, y: numTiles - 1, dir: [0, -1]});
    }
    for (let y = 1; y < numTiles - 1; y++) {
        // Left column (x=0), faces right
        if (tiles[0][y] instanceof Wall) candidates.push({x: 0, y: y, dir: [1, 0]});
        // Right column (x=numTiles-1), faces left
        if (tiles[numTiles - 1][y] instanceof Wall) candidates.push({x: numTiles - 1, y: y, dir: [-1, 0]});
    }
    if (candidates.length === 0) return;
    let pos = candidates[Math.floor(Math.random() * candidates.length)];
   
    // Place the Exit tile with direction
    tiles[pos.x][pos.y] = new Exit(pos.x, pos.y, pos.dir);
    console.log("Placing exit at", pos.x, pos.y, "dir", pos.dir, "instanceof Exit:", tiles[pos.x][pos.y] instanceof Exit);
    
    // Ensure the inside-adjacent tile is a Floor
    let insideX = pos.x + pos.dir[0];
    let insideY = pos.y + pos.dir[1];
    if (tiles[insideX] && tiles[insideX][insideY] && !(tiles[insideX][insideY] instanceof Floor)) {
        tiles[insideX][insideY] = new Floor(insideX, insideY);
    }
}