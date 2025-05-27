function setupCanvas(){
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = tileSize*(numTiles+uiWidth);
    canvas.height = tileSize*numTiles;
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    ctx.imageSmoothingEnabled = false;
}

function drawSprite(sprite, x, y, row = 0){
    ctx.drawImage(
        spritesheet,
        sprite*16,
        row,
        16,
        16,
        x*tileSize,
        y*tileSize,
        tileSize,
        tileSize
    );
}

function draw(){
    if(gameState == "running" || gameState == "dead"){  
        ctx.clearRect(0,0,canvas.width,canvas.height);

        for(let i=0;i<numTiles;i++){
            for(let j=0;j<numTiles;j++){
                getTile(i,j).draw();
            }
        }

        for(let i=0;i<monsters.length;i++){
            monsters[i].draw();
        }

        player.draw();

        drawText("Level: "+level, 20, false, 30, "black");
    }
}

function tick(){
    for(let k=monsters.length-1;k>=0;k--){
        if(!monsters[k].dead){
            monsters[k].update();
        }else{
            monsters.splice(k,1);
        }
    }

    if(player.dead){    
        gameState = "dead";
    }

    spawnCounter--;
    if(spawnCounter <= 0){  
        spawnMonster();
        spawnCounter = spawnRate;
        spawnRate--;
    }
}

function showTitle(){                                          
    ctx.fillStyle = 'rgba(0,0,0,.75)';
    ctx.fillRect(0,0,canvas.width, canvas.height);

    gameState = "title";

    drawText("Bittersweet", 50, true, canvas.height/2 - 110, "white");
    drawText("Broughlike", 50, true, canvas.height/2 - 50, "white"); 
}

function startGame(){                                           
    level = 1;
    startLevel(startingHp);

    gameState = "running";
}

function startLevel(playerHp){     
    spawnRate = 15;              
    spawnCounter = spawnRate; 
                         
    generateLevel();

    // Preserve outfit if player exists, otherwise default to 0
    let currentOutfit = (typeof player !== "undefined" && player && player.outfit !== undefined) ? player.outfit : 0;
    player = new Player(randomPassableTile());
    player.hp = playerHp;
    player.outfit = currentOutfit;
    
    randomPassableTile().replace(Exit);  
}


function drawText(text, size, centered, textY, color){
    ctx.fillStyle = color;
    ctx.font = size + "px monospace";
    let textX;
    if(centered){
        textX = (canvas.width-ctx.measureText(text).width)/2;
    }else{
        textX = canvas.width-uiWidth*tileSize+25;
    }

    ctx.fillText(text, textX, textY);
}