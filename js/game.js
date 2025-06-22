let monsters = [];

function setupCanvas(){
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
        x*tileSize + shakeX,
        y*tileSize + shakeY,
        tileSize,
        tileSize
    );
}

let spellsUI = [];

function draw(){
    if(gameState == "running" || gameState == "dead"){  
        ctx.clearRect(0,0,canvas.width,canvas.height);

        screenshake();

        for(let i=0;i<numTiles;i++){
            for(let j=0;j<numTiles;j++){
                tiles[i][j].draw();
            }
        }

        for(let i=0;i<monsters.length;i++){
            monsters[i].draw();
        }

        player.draw();

        for(let i=0;i<numTiles;i++){
            for(let j=0;j<numTiles;j++){
                tiles[i][j].drawEffectIfPresent();
            }
        }

        drawText("Level: "+level, 20, false, 30, "black");
        drawText("Score: "+score, 20, false, 60, "black");

        spellsUI = [];

        for(let i=0; i<player.spells.length; i++){
            let spellName = player.spells[i];
            let spellText = (i+1) + ") " + (spellName || "");
            let x = canvas.width - uiWidth * tileSize + 25, y = 110 + i*40;
            drawText(spellText, 20, false, y, "#282828");
            // Store bounding box for tooltip detection (adjust width as needed)
            spellsUI.push({x: x, y: y-20, width: 200, height: 30, spell: spellName});
        }
        window.spellsUI = spellsUI;
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

    player.update();

    if(player.dead){    
        addScore(score, false);
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
    ctx.fillStyle = 'rgba(0,0,0,.8)';
    ctx.fillRect(0,0,canvas.width, canvas.height);

    gameState = "title";
    
    drawSprite(0, 2, 4)
    drawText("Bittersweet", 50, true, canvas.height/2 - 110, "white");
    drawText("Broughlike", 50, true, canvas.height/2 - 50, "white"); 

    drawScores(); 
}

function startGame(){                                           
    level = 1;
    score = 0;  
    numSpells = 1;

    startLevel(startingHp);

    gameState = "running";
}

function startLevel(playerHp, playerSpells){     
    spawnRate = 15;              
    spawnCounter = spawnRate; 
                         
    generateLevel();

    // Preserve outfit if player exists, otherwise default to 0
    let currentOutfit = (typeof player !== "undefined" && player && player.outfit !== undefined) ? player.outfit : 0;
    player = new Player(randomPassableTile(true, true)); // avoid treasure and exit
    player.hp = playerHp;
    if(playerSpells){
        player.spells = playerSpells;
    } 
    player.outfit = currentOutfit;

}


function drawText(text, size, centered, textY, color, customX = null) {
    ctx.font = size + "px monospace";
    let textWidth = ctx.measureText(text).width;
    let textHeight = size * 1.2; // Approximate height
    let textX;
    if (customX !== null) {
        textX = customX - textWidth / 2;
    } else if(centered){
        textX = (canvas.width - textWidth) / 2;
    }else{
        textX = canvas.width - uiWidth * tileSize + 25;
    }

    ctx.fillStyle = color;
    ctx.fillText(text, textX, textY);
}

function getScores(){
    if(localStorage["scores"]){
        return JSON.parse(localStorage["scores"]);
    }else{
        return [];
    }
}

function addScore(score, won){
    let scores = getScores();
    let scoreObject = {score: score, run: 1, totalScore: score, active: won};
    let lastScore = scores.pop();

    if(lastScore){
        if(lastScore.active){
            scoreObject.run = lastScore.run+1;
            scoreObject.totalScore += lastScore.totalScore;
        }else{
            scores.push(lastScore);
        }
    }
    scores.push(scoreObject);

    localStorage["scores"] = JSON.stringify(scores);
}

function drawScores(){
    let scores = getScores();
    if(scores.length){
        let newestScore = scores.pop();
        scores.sort(function(a,b){
            return b.totalScore - a.totalScore;
        });
        scores.unshift(newestScore);
        
        // Prepare header and rows as arrays of strings
        const header = ["RUN", "SCORE", "TOTAL"];
        const rows = scores.slice(0, 10).map(s => [s.run, s.score, s.totalScore]);

        // Calculate column widths
        ctx.font = "18px monospace";
        const allRows = [header, ...rows];
        const colWidths = [0, 0, 0];
        for (let row of allRows) {
            for (let c = 0; c < 3; c++) {
                const w = ctx.measureText(String(row[c])).width;
                if (w > colWidths[c]) colWidths[c] = w;
            }
        }

        // Calculate total table width and startX for horizontal centering
        const colGap = 32;
        const tableWidth = colWidths[0] + colWidths[1] + colWidths[2] + colGap * 2;
        const startX = (canvas.width - tableWidth) / 2;
        const startY = 340; // Fixed vertical position

        // Draw header
        let x = startX;
        for (let c = 0; c < 3; c++) {
            drawText(
                String(header[c]),
                18,
                false,
                startY,
                "white",
                x + (colWidths[c] / 2)
            );
            x += colWidths[c] + colGap;
        }

        // Draw rows
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            let x = startX;
            for (let c = 0; c < 3; c++) {
                drawText(
                    String(row[c]),
                    18,
                    false,
                    startY + (i + 1) * 24,
                    i == 0 ? "#85C4D1" : "#DC99E1",
                    x + (colWidths[c] / 2)
                );
                x += colWidths[c] + colGap;
            }
        }
    }
}

function screenshake(){
    if(shakeAmount){
        shakeAmount--;
    }
    let shakeAngle = Math.random()*Math.PI*2;
    shakeX = Math.round(Math.cos(shakeAngle)*shakeAmount);
    shakeY = Math.round(Math.sin(shakeAngle)*shakeAmount);
}

function initSounds(){          
    sounds = {
        hit1: new Audio('sounds/hit1.wav'),
        hit2: new Audio('sounds/hit2.wav'),
        treasure: new Audio('sounds/treasure.wav'),
        newLevel: new Audio('sounds/newLevel.wav'),
        spell: new Audio('sounds/spell.wav'),
        footstep1: new Audio('sounds/footstep1.wav'),
        footstep2: new Audio('sounds/footstep2.wav'),
        footstep3: new Audio('sounds/footstep3.wav'),
        footstep4: new Audio('sounds/footstep4.wav'),
    };
    // Ensure all sounds respect the muted state on init
    setAllSoundsMuted(muted);
}

function setAllSoundsMuted(mute) {
    if (!sounds) return;
    Object.values(sounds).forEach(audio => {
        audio.muted = mute;
    });
}

function playSound(soundName){                       
    if (muted) return; // Prevent playing if muted
    sounds[soundName].currentTime = 0;  
    sounds[soundName].play();
}