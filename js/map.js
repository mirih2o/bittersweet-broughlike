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
            // Ensure that the edges are ALWAYS walls
            if(i === 0 || j === 0 || i === numTiles-1 || j === numTiles-1){
                tiles[i][j] = new Wall(i,j);
            }else{
                // 30% chance of wall for interior tiles, otherwise floor
                if(Math.random() < 0.3){
                    tiles[i][j] = new Wall(i,j);
                }else{
                    tiles[i][j] = new Floor(i,j);
                    passableTiles++;
                }
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
    let treasuresPlaced = 0;
    let maxAttempts = 1000; // Safety limit
    let attempts = 0;
    
    while(treasuresPlaced < 3 && attempts < maxAttempts){
        attempts++;
        let tile = randomPassableTile();
        
        // Check if this tile already has a treasure
        if(!tile.treasure){
            tile.treasure = true;
            treasuresPlaced++;
        }
    }
    
    // If we still don't have 3 treasures, force place them
    if(treasuresPlaced < 3){
        let passableTiles = [];
        for(let i = 0; i < numTiles; i++){
            for(let j = 0; j < numTiles; j++){
                let tile = getTile(i, j);
                if(tile.passable && !tile.treasure){
                    passableTiles.push(tile);
                }
            }
        }
        
        // Shuffle and place remaining treasures
        passableTiles = shuffle(passableTiles);
        for(let i = treasuresPlaced; i < 3 && i < passableTiles.length; i++){
            passableTiles[i].treasure = true;
        }
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
    // Count current number of Jesters
    let jesterCount = 0;
    for(let i=0; i<monsters.length; i++){
        if(monsters[i] instanceof Jester){
            jesterCount++;
        }
    }
    
    // Calculate maximum allowed Jesters for this level
    const maxJesters = Math.floor(level/5) + 1;
    
    // Prepare available monster types
    let availableMonsters = [Bird, Snake, Tank, Eater];
    
    // Only include Jester if we haven't reached the maximum
    if(jesterCount < maxJesters){
        availableMonsters.push(Jester);
    }
    
    // Select a random monster type from available options
    let monsterType = shuffle(availableMonsters)[0];
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
    
    // Get the connected tiles from a random passable tile (represents the main area)
    let connectedTiles = randomPassableTile().getConnectedTiles();
    
    // Filter candidates to only those that would be reachable
    let reachableCandidates = candidates.filter(pos => {
        let insideX = pos.x + pos.dir[0];
        let insideY = pos.y + pos.dir[1];
        let insideTile = getTile(insideX, insideY);
        
        // Check if the inside tile is already connected, or if making it a floor would connect it
        return connectedTiles.some(tile => tile.x === insideX && tile.y === insideY) ||
               insideTile.getAdjacentPassableNeighbors().some(neighbor => 
                   connectedTiles.includes(neighbor)
               );
    });
    
    // If no reachable candidates, use any candidate and ensure connectivity
    if (reachableCandidates.length === 0) {
        reachableCandidates = candidates;
    }
    
    let pos = reachableCandidates[Math.floor(Math.random() * reachableCandidates.length)];
   
    // Place the Exit tile with direction
    tiles[pos.x][pos.y] = new Exit(pos.x, pos.y, pos.dir);
    console.log("Placing exit at", pos.x, pos.y, "dir", pos.dir, "instanceof Exit:", tiles[pos.x][pos.y] instanceof Exit);
    
    // Ensure the inside-adjacent tile is a Floor and connected
    let insideX = pos.x + pos.dir[0];
    let insideY = pos.y + pos.dir[1];
    if (tiles[insideX] && tiles[insideX][insideY]) {
        if (!(tiles[insideX][insideY] instanceof Floor)) {
            tiles[insideX][insideY] = new Floor(insideX, insideY);
        }
        
        // Ensure this floor tile is connected to the main area
        let insideTile = tiles[insideX][insideY];
        if (!connectedTiles.includes(insideTile)) {
            // Create a path to connect it
            ensurePathToMainArea(insideTile, connectedTiles);
        }
    }
}

function ensurePathToMainArea(targetTile, connectedTiles) {
    // Find the nearest connected tile and create a path
    let queue = [targetTile];
    let visited = new Set([`${targetTile.x},${targetTile.y}`]);
    
    while (queue.length > 0) {
        let current = queue.shift();
        
        // Check if any neighbor is already connected
        for (let neighbor of current.getAdjacentNeighbors()) {
            if (connectedTiles.includes(neighbor)) {
                // Found connection, we're done
                return;
            }
            
            let key = `${neighbor.x},${neighbor.y}`;
            if (!visited.has(key) && inBounds(neighbor.x, neighbor.y)) {
                visited.add(key);
                
                // Convert walls to floors to create path, BUT NOT EDGE WALLS
                if (neighbor instanceof Wall && 
                    neighbor.x > 0 && neighbor.x < numTiles-1 && 
                    neighbor.y > 0 && neighbor.y < numTiles-1) {
                    tiles[neighbor.x][neighbor.y] = new Floor(neighbor.x, neighbor.y);
                    neighbor = tiles[neighbor.x][neighbor.y];
                    queue.push(neighbor);
                } else if (neighbor.passable) {
                    queue.push(neighbor);
                }
            }
        }
    }
}