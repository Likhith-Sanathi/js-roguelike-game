// Initial config
let canvas, context;
let fpsInterval = 1000/16;
let now, then = Date.now();
let enemies = [];
let animationFrame = 0, animationCounter = 0;
const animationSpeed = 8;

// Player config
let player = {
    x: 0,
    y: 0,
    width: 48,
    height: 64,
    sprite_width: 16,
    sprite_height: 32,
    num_frames: 8,
    num_rows: 6,
    frame: 0,
    direction: 'down',
    speed: 3,
    moving: false,
    scale: 0.5,
    idle: new Image(),
    walk: new Image(),
    health: 300,
    maxHealth: 300,
    invulnerable: false
};

// Enemy configuration with round-based scaling
const enemyConfig = {
    spawn_time: 10000,
    speed: 1.5,
    damage: 20,
    health: 100,
    attack_cooldown: 1000,
    shoot_range: 200,
    shoot_cooldown: 2000,
    score_value: 100,
    dragonSizeMultiplier: { 1: 1.0, 2: 1.25, 3: 1.5 },
    dragonDamageMultiplier: { 1: 1.0, 2: 1.5, 3: 2.0 },
    dragonHealthMultiplier: { 1: 1.0, 2: 1.5, 3: 2.0 },
    dragonsPerRound: 3
};

// Weapon configurations based on round number
const WEAPON_CONFIG = {
    1: { 
        name: "Bullet",
        damage: 25,
        speed: 15,
        sprite: null,
        size: 32,
        width: 32,
        height: 32, 
        frameWidth: 32,
        frameHeight: 32,
        frames: 7
    },
    2: { 
        name: "Golden Arrow",
        damage: 40,
        speed: 18,
        sprite: null,
        size: 32,
        width: 32,
        height: 32,
        frameWidth: 32,
        frameHeight: 32,
        frames: 8
    },
    3: { 
        name: "Acidball",
        damage: 60,
        speed: 12,
        sprite: null,
        size: 32,
        width: 32,
        height: 32,
        frameWidth: 32,
        frameHeight: 32,
        frames: 7
    }
};

// Projectile system
let projectiles = [], enemyProjectiles = [];
let fireballImage = new Image();
let goldenArrowImage = new Image();
let bulletImage = new Image();
let acidballImage = new Image();

// Audio system
let walkSound = new Audio();
let attackSound = new Audio();
let gameMusic = new Audio();
let walkSoundPlaying = false;
let walkSoundCooldown = 0;

// Dragon sprites
let babyBrassDragon = new Image();
let babyCopperDragon = new Image();
let babyGreenDragon = new Image();
let youngBrassDragon = new Image();
let youngRedDragon = new Image();
let juvenileBronzeDragon = new Image();
let adultGreenDragon = new Image();
let adultWhiteDragon = new Image();
let poisonDrake = new Image();
let tileset = new Image();

// Game state with round tracking
let gameState = {
    lastSpawn: 0,
    gameOver: false,
    score: 0,
    startTime: Date.now(),
    round: 1,
    dragonsDefeated: 0,
    roundStartTime: Date.now(),
    totalDragonsDefeated: 0,
    scoreSubmitted: false
};

// Input states
let moveUp = false;
let moveDown = false;
let moveLeft = false;
let moveRight = false;
let spacePressed = false;
let prevSpacePressed = false;

// Tilemap configuration
const tile_size = 16;
const map_cols = 40, map_rows = 28;

// Camera/viewport for the tilemap
let camera = {
    x: 0, y: 0, width: 800, height: 600
};

// Define tile mappings from the FG_Cellar tileset
const tilesetConfig = {
    0: null, //space                
    1: { x: 160, y: 208 }, // floor
    2: { x: 176, y: 208 }, // checkered floor
    10: { x: 80, y: 3 }, // top left wall
    11: { x: 96, y: 3 }, // top wall
    12: { x: 112, y: 3 }, // top right wall
    13: { x: 80, y: 16 }, // left wall
    14: { x: 112, y: 17 }, // right wall
    15: { x: 80, y: 48 }, // bottom left wall
    16: { x: 96, y: 48 }, // bottom wall
    17: { x: 112, y: 48 }, // bottom right wall
    21: { x: 449, y: 129 }, // chest
    23: { x: 80, y: 464 }, // spikes
    24: { x: 80, y: 432 } // torch
};

let tilemap = [
    [10,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,12],
    [13, 24, 24, 24, 24, 2, 2, 23, 23, 23, 23, 23, 2, 2, 2, 23, 23, 23, 2, 21, 21, 2, 23, 23, 23, 2, 2, 2, 23, 23, 23, 23, 23, 2, 2, 24, 24, 24, 24,14],
    [13, 24, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 24,14],
    [13, 24, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 24,14],
    [13, 24, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 24,14],
    [13, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2,14],
    [13, 2, 1, 1, 2, 1, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 1, 1, 1, 1, 1, 1, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 1, 2, 1, 1, 2,14],
    [13, 23, 1, 1, 2, 1, 13, 24, 24, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 24, 24, 14, 1, 2, 1, 1, 23,14],
    [13, 23, 1, 1, 2, 1, 13, 24, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 24, 14, 1, 2, 1, 1, 23,14],
    [13, 23, 1, 1, 2, 1, 13, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 14, 1, 2, 1, 1, 23,14],
    [13, 2, 1, 1, 2, 1, 13, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 14, 1, 2, 1, 1, 2,14],
    [13, 2, 1, 1, 2, 1, 13, 2, 1, 1, 2, 10, 11, 11, 11, 11, 11, 23, 23, 23, 23, 23, 23, 11, 11, 11, 11, 11, 12, 2, 1, 1, 2, 14, 1, 2, 1, 1, 2,14],
    [13, 23, 1, 1, 2, 1, 1, 2, 1, 1, 2, 13, 21, 21, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 21, 21, 14, 2, 1, 1, 2, 1, 1, 2, 1, 1, 23,14],
    [13, 23, 1, 1, 2, 1, 1, 2, 1, 1, 2, 23, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 23, 2, 1, 1, 2, 1, 1, 2, 1, 1, 23,14],
    [13, 23, 1, 1, 2, 1, 1, 2, 1, 1, 2, 23, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 23, 2, 1, 1, 2, 1, 1, 2, 1, 1, 23,14],
    [13, 23, 1, 1, 2, 1, 1, 2, 1, 1, 2, 13, 21, 21, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 21, 21, 14, 2, 1, 1, 2, 1, 1, 2, 1, 1, 23,14],
    [13, 2, 1, 1, 2, 1, 13, 2, 1, 1, 2, 15, 16, 16, 16, 16, 16, 23, 23, 23, 23, 23, 23, 16, 16, 16, 16, 16, 17, 2, 1, 1, 2, 14, 1, 2, 1, 1, 2, 14],
    [13, 2, 1, 1, 2, 1, 13, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 14, 1, 2, 1, 1, 2,14],
    [13, 23, 1, 1, 2, 1, 13, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 14, 1, 2, 1, 1, 23,14],
    [13, 23, 1, 1, 2, 1, 13, 24, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 24, 14, 1, 2, 1, 1, 23,14],
    [13, 23, 1, 1, 2, 1, 13, 24, 24, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 24, 24, 14, 1, 2, 1, 1, 23,14],
    [13, 2, 1, 1, 2, 1, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 1, 1, 1, 1, 1, 1, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17, 1, 2, 1, 1, 2,14],
    [13, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2,14],
    [13, 24, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 24,14],
    [13, 24, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 24,14],
    [13, 24, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 24,14],
    [13, 24, 24, 24, 24, 2, 2, 23, 23, 23, 23, 23, 2, 2, 2, 23, 23, 23, 2, 21, 21, 2, 23, 23, 23, 2, 2, 2, 23, 23, 23, 23, 23, 2, 2, 24, 24, 24, 24,14],
    [15,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,17]
];


// Code from lines 195-239 was written with some help from the internet, links mentioned in attributions

// Submit player score to the server leaderboard
function getAppBasePath() {
    const path = window.location.pathname;
    const lastSlash = path.lastIndexOf('/');
    if (lastSlash !== -1) {
        return path.substring(0, lastSlash);
    }
    return ''; // Return empty string if we're at root
}

const appBasePath = getAppBasePath();

// Submit player score to the server leaderboard
function submitScore(score) {
    const apiUrl = `${appBasePath}/api/submit_score`;
    console.log('Submitting score to:', apiUrl);
    
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ score: score })
    })
    .then(response => response.json())
    .catch(error => console.error('Error submitting score:', error));
}

// Submit player time to the server leaderboard
function submitTime(time) {
    const apiUrl = `${appBasePath}/api/submit_time`;
    console.log('Submitting time to:', apiUrl);
    
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ time: time })
    })
    .then(response => response.json())
    .catch(error => console.error('Error submitting time:', error));
}

// Return the current weapon configuration based on game round
function getCurrentWeapon() {
    const round = Math.min(gameState.round, 3);
    const weaponConfig = WEAPON_CONFIG[round];
    
    if (!weaponConfig.sprite) {
        weaponConfig.sprite = round === 1 ? bulletImage : 
                             round === 2 ? goldenArrowImage : acidballImage;
    }
    return weaponConfig;
}

// Game Audio for walking, attacking, and background music
function setupAudio() {
    gameMusic.loop = true;
    gameMusic.volume = 1;
    walkSound.volume = 1;
    attackSound.volume = 1;
    gameMusic.play().catch(() => {});
}

// Play the walking sound effect
function playWalkSound() {
    if (!walkSoundPlaying && walkSoundCooldown <= 0) {
        walkSound.currentTime = 0;
        walkSound.play().catch(() => {});
        walkSoundPlaying = true;
        walkSoundCooldown = 100;
        walkSound.onended = () => walkSoundPlaying = false;
    }
}

// Play the attack sound effect
function playAttackSound() {
    attackSound.currentTime = 0;
    attackSound.play().catch(() => {});
}

// Stop all game sounds
function stopAllSounds() {
    gameMusic.pause();
    walkSound.pause();
    attackSound.pause();
}

// Initialize the game
function init() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    context.imageSmoothingEnabled = false;
    
    camera.width = canvas.width;
    camera.height = canvas.height;
    
    player.x = 3 * tile_size;
    player.y = 7 * tile_size;
    
    gameState.startTime = Date.now();
    gameState.roundStartTime = Date.now();
    gameState.score = 0;
    gameState.round = 1;
    gameState.dragonsDefeated = 0;
    gameState.totalDragonsDefeated = 0;
    gameState.gameOver = false;
    gameState.scoreSubmitted = false;
    
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    
    const replayButton = document.getElementById('replayButton');
    if (replayButton) {
        replayButton.addEventListener('click', resetGame);
    }

    loadAssets([
        { var: player.idle, url: '../static/assets/character/idle/idle.png' },
        { var: player.walk, url: '../static/assets/character/walk/walk.png' },
        { var: fireballImage, url: '../static/assets/projectiles/fireball.png' },
        { var: acidballImage, url: '../static/assets/projectiles/acidball.png' },
        { var: bulletImage, url: '../static/assets/projectiles/bullet.png' },
        { var: goldenArrowImage, url: '../static/assets/projectiles/golden_arrow.png' },
        { var: tileset, url: '../static/assets/dungeon/Tilesets/FG_Cellar.png'},
        { var: babyBrassDragon, url: '../static/assets/mobs/Basic Dragon Animations/Baby Brass Dragon/BabyBrassDragon.png'},
        { var: babyCopperDragon, url: '../static/assets/mobs/Basic Dragon Animations/Baby Copper Dragon/BabyCopperDragon.png'},
        { var: babyGreenDragon, url: '../static/assets/mobs/Basic Dragon Animations/Baby Green Dragon/BabyGreenDragon.png'},
        { var: youngBrassDragon, url: '../static/assets/mobs/Basic Dragon Animations/Young Brass Dragon/YoungBrassDragon.png'},
        { var: youngRedDragon, url: '../static/assets/mobs/Basic Dragon Animations/Young Red Dragon/YoungRedDragon.png'},
        { var: juvenileBronzeDragon, url: '../static/assets/mobs/Basic Dragon Animations/Juvenile Bronze Dragon/JuvenileBronzeDragon.png'},
        { var: adultGreenDragon, url: '../static/assets/mobs/Basic Dragon Animations/Adult Green Dragon/AdultGreenDragon.png'},
        { var: adultWhiteDragon, url: '../static/assets/mobs/Basic Dragon Animations/Adult White Dragon/AdultWhiteDragon.png'},
        { var: poisonDrake, url: '../static/assets/mobs/Basic Dragon Animations/Poison Drake/PoisonDrake.png'},
        { var: walkSound, url: '../static/assets/sfx/16_human_walk_stone_1.wav' },
        { var: attackSound, url: '../static/assets/sfx/08_human_charge_1.wav' },
        { var: gameMusic, url: '../static/assets/music/Music/Goblins_Den_(Regular).wav' },
    ], () => {
        WEAPON_CONFIG[1].sprite = bulletImage;
        WEAPON_CONFIG[2].sprite = goldenArrowImage;
        WEAPON_CONFIG[3].sprite = acidballImage;

        for (let i = 0; i < 3; i++) spawnEnemy();
        
        gameState.lastSpawn = Date.now();

        const gameOverContainer = document.getElementById('gameOverContainer');
        if (gameOverContainer) {
            gameOverContainer.style.display = 'none';
        }
        setupAudio();
        draw();
    });
}

// Check if conditions are met to advance to next round
function checkRoundAdvancement() {
    if (gameState.dragonsDefeated >= enemyConfig.dragonsPerRound && gameState.round < 3) {
        gameState.round++;
        gameState.dragonsDefeated = 0;
        gameState.roundStartTime = Date.now();
        projectiles = [];
        enemyProjectiles = [];
    }
}

// Update animation frames
function updateAnimations() {
    animationCounter++;
    if (animationCounter >= animationSpeed) {
        animationCounter = 0;
        animationFrame = (animationFrame + 1) % 4;
    }
}

// Update score and timer UI elements
function updateScoreAndTimer() {
    const scoreElement = document.getElementById('scoreValue');
    if (scoreElement) {
        scoreElement.textContent = gameState.score;
    }
    
    if (!gameState.gameOver) {
        const elapsedTime = (Date.now() - gameState.startTime);
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        const milliseconds = elapsedTime % 1000;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
        
        const timeElement = document.getElementById('timeValue');
        if (timeElement) {
            timeElement.textContent = `${formattedTime} (Round ${gameState.round})`;
        }
    }
}

// Reset the game to initial state
function resetGame() {
    const gameOverContainer = document.getElementById('gameOverContainer');
    if (gameOverContainer) {
        gameOverContainer.style.display = 'none';
    }
    
    player.health = player.maxHealth;
    player.x = 3 * tile_size;
    player.y = 7 * tile_size;
    player.invulnerable = false;
    
    enemies = [];
    projectiles = [];
    enemyProjectiles = [];
    
    gameState.score = 0;
    gameState.startTime = Date.now();
    gameState.roundStartTime = Date.now();
    gameState.round = 1;
    gameState.dragonsDefeated = 0;
    gameState.totalDragonsDefeated = 0;
    gameState.gameOver = false;
    gameState.scoreSubmitted = false;
    
    if (gameMusic.paused) {
        gameMusic.play().catch(error => console.log("Audio playback failed:", error));
    }
    
    for (let i = 0; i < 4; i++) spawnEnemy();
    
    gameState.lastSpawn = Date.now();
    updateScoreAndTimer();
    
}

// Check if the player is on a spike tile and apply damage
function checkSpikeDamage() {
    if (animationFrame !== 2 && animationFrame !== 3) return;
    
    const playerTileX = Math.floor((player.x + player.width * player.scale / 2) / tile_size);
    const playerTileY = Math.floor((player.y + player.height * player.scale / 2) / tile_size);
    
    if (tilemap[playerTileY] && tilemap[playerTileY][playerTileX] === 23 && !player.invulnerable) {
        player.health -= 15;
        player.invulnerable = true;
        setTimeout(() => player.invulnerable = false, 1000);
        
        if (player.health <= 0 && !gameState.gameOver) {
            handleGameOver();
        }
    }
}

// Spawn a new enemy with properties based on current round
function spawnEnemy() {
    // Find valid spawn location
    let spawnX = 5 * tile_size, spawnY = 5 * tile_size;
    let attempts = 0;
    
    while (attempts < 100) {
        const testX = Math.floor(Math.random() * (map_cols - 2) + 1) * tile_size;
        const testY = Math.floor(Math.random() * (map_rows - 2) + 1) * tile_size;
        
        const tileX = Math.floor(testX / tile_size);
        const tileY = Math.floor(testY / tile_size);
        
        if (tilemap[tileY] && [1, 2].includes(tilemap[tileY][tileX]) && 
            !checkTileCollision(testX, testY, 16, 16)) {
            spawnX = testX;
            spawnY = testY;
            break;
        }
        attempts++;
    }
    
    // Determine enemy properties based on game round
    const round = Math.min(gameState.round, 3);
    const sizeMultiplier = enemyConfig.dragonSizeMultiplier[round];
    const healthMultiplier = enemyConfig.dragonHealthMultiplier[round];
    
    // Select dragon type and scale based on round
    let selectedDragon, dragonScale;
    
    if (gameState.round === 1) {
        selectedDragon = [babyBrassDragon, babyCopperDragon, babyGreenDragon]
            [Math.floor(Math.random() * 3)];
        dragonScale = 1.0 * sizeMultiplier;
    } else if (gameState.round === 2) {
        selectedDragon = [youngBrassDragon, youngRedDragon, juvenileBronzeDragon]
            [Math.floor(Math.random() * 3)];
        dragonScale = 1.2 * sizeMultiplier;
    } else {
        selectedDragon = [adultGreenDragon, adultWhiteDragon, poisonDrake]
            [Math.floor(Math.random() * 3)];
        dragonScale = 1.5 * sizeMultiplier;
    }
    
    // Add enemy to game
    enemies.push({
        x: spawnX, 
        y: spawnY,
        width: 16 * dragonScale, 
        height: 16 * dragonScale,
        health: enemyConfig.health * healthMultiplier,
        maxHealth: enemyConfig.health * healthMultiplier,
        lastAttack: 0, 
        lastShot: 0, 
        frame: 0,
        sprite: selectedDragon,
        speed: enemyConfig.speed * (1 + (gameState.round - 1) * 0.1),
        damage: enemyConfig.damage * enemyConfig.dragonDamageMultiplier[round],
        round: gameState.round
    });
}

// Update enemy positions, attacks, and health
function updateEnemies() {
    if (gameState.gameOver) return;
    
    const currentTime = Date.now();
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let newX = enemy.x, newY = enemy.y;
        
        if (distance > 0) {
            newX += (dx / distance) * enemy.speed;
            newY += (dy / distance) * enemy.speed;
        }
        
        if (!checkTileCollision(newX, enemy.y, enemy.width, enemy.height)) {
            enemy.x = newX;
        }
        
        if (!checkTileCollision(enemy.x, newY, enemy.width, enemy.height)) {
            enemy.y = newY;
        }

        if (checkCollision(enemy, player) && !player.invulnerable) {
            player.health -= enemy.damage;
            player.invulnerable = true;
            setTimeout(() => player.invulnerable = false, 500);
            
            if (player.health <= 0 && !gameState.gameOver) {
                handleGameOver();
            }
        }

        if (distance < enemyConfig.shoot_range && currentTime - enemy.lastShot > enemyConfig.shoot_cooldown) {
            createEnemyFireball(enemy);
            enemy.lastShot = currentTime;
        }

        if (enemy.health <= 0) {
            gameState.score += enemyConfig.score_value;
            gameState.dragonsDefeated++;
            gameState.totalDragonsDefeated++;
            enemies.splice(i, 1);
            
            checkRoundAdvancement();
        }
        
        enemy.frame = (enemy.frame + 0.3) % 4;
    }
}

// Create a new enemy fireball projectile
function createEnemyFireball(enemy) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    enemyProjectiles.push({
        x: enemy.x + enemy.width/2 - 16,
        y: enemy.y + enemy.height/2 - 16,
        width: 32, height: 32,
        dirX: dx / distance,
        dirY: dy / distance,
        speed: 4, frame: 0, num_frames: 6,
        damage: enemy.damage / 2
    });
}

// Update enemy projectile positions and collisions
function updateEnemyProjectiles() {
    if (gameState.gameOver) return;
    
    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        const p = enemyProjectiles[i];
        
        p.x += p.dirX * p.speed;
        p.y += p.dirY * p.speed;
        
        if (checkCollision(p, player) && !player.invulnerable) {
            player.health -= p.damage;
            player.invulnerable = true;
            setTimeout(() => player.invulnerable = false, 500);
            enemyProjectiles.splice(i, 1);
            
            if (player.health <= 0 && !gameState.gameOver) {
                handleGameOver();
            }
            continue;
        }
        
        if (checkTileCollision(p.x, p.y, p.width, p.height)) {
            enemyProjectiles.splice(i, 1);
            continue;
        }
        
        p.frame = (p.frame + 1) % p.num_frames;
        if (p.x < -p.width || p.x > map_cols * tile_size || 
            p.y < -p.height || p.y > map_rows * tile_size) {
            enemyProjectiles.splice(i, 1);
        }
    }
}

// Render enemy fireballs
function drawEnemyFireballs() {
    for (let p of enemyProjectiles) {
        try {
            context.save();
            const centerX = p.x - camera.x + p.width/2;
            const centerY = p.y - camera.y + p.height/2;
            context.translate(centerX, centerY);
            
            const angle = Math.atan2(p.dirY, p.dirX);
            context.rotate(angle);
            
            if (fireballImage && fireballImage.complete) {
                context.drawImage(
                    fireballImage,
                    p.frame * 32, 0, 32, 32,
                    -p.width/2, -p.height/2,
                    p.width, p.height
                );
            } else {
                context.fillStyle = 'orange';
                context.fillRect(-p.width/2, -p.height/2, p.width, p.height);
            }
        } catch (e) {
            console.error("Error drawing enemy fireball:", e);
        } finally {
            context.restore();
        }
    }
    
    context.setTransform(1, 0, 0, 1, 0, 0);
}

// Handle game over state
function handleGameOver() {
    if (gameState.gameOver) return;
    
    gameState.gameOver = true;
    stopAllSounds();
    
    const time = Date.now() - gameState.startTime;
    const formattedTime = `${Math.floor(time / 60000).toString().padStart(2, '0')}:${Math.floor((time % 60000) / 1000).toString().padStart(2, '0')}:${(time % 1000).toString().padStart(3, '0')}`;
    
    if (!gameState.scoreSubmitted) {
        submitScore(gameState.score);
        submitTime(formattedTime);
        gameState.scoreSubmitted = true;
    }
    
    context.fillStyle = 'rgba(0,0,0,0.5)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    const gameOverContainer = document.getElementById('gameOverContainer');
    if (gameOverContainer) {
        gameOverContainer.style.display = 'block';
    }
}


// Check collision between two objects
function checkCollision(a, b) {
    return a.x < b.x + b.width * (b.scale || 1) &&
           a.x + a.width * (a.scale || 1) > b.x &&
           a.y < b.y + b.height * (b.scale || 1) &&
           a.y + a.height * (a.scale || 1) > b.y;
}

// Handle collisions between projectiles and enemies
function handleProjectileCollisions() {
    if (gameState.gameOver) return;
    
    for (let p = projectiles.length - 1; p >= 0; p--) {
        for (let e = enemies.length - 1; e >= 0; e--) {
            if (checkCollision(projectiles[p], enemies[e])) {
                enemies[e].health -= getCurrentWeapon().damage;
                projectiles.splice(p, 1);
                break;
            }
        }
    }
}

// Draw health bars for player and enemies
function drawHealthBar() {
    const healthBarWidth = 50;
    const healthBarHeight = 5;
    const healthBarX = player.x - camera.x + (player.width * player.scale)/2 - healthBarWidth/2;
    const healthBarY = player.y - camera.y - 15;
    
    context.fillStyle = '#300';
    context.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    context.fillStyle = '#f00';
    context.fillRect(healthBarX, healthBarY, (player.health / player.maxHealth) * healthBarWidth, healthBarHeight);

    enemies.forEach(enemy => {
        const enemyHealthBarWidth = 30 * (enemy.width / 16);
        
        context.fillStyle = '#300';
        context.fillRect(enemy.x - camera.x, enemy.y - camera.y - 10, enemyHealthBarWidth, 5);
        context.fillStyle = '#0f0';
        context.fillRect(enemy.x - camera.x, enemy.y - camera.y - 10, 
                      (enemy.health / enemy.maxHealth) * enemyHealthBarWidth, 5);
    });
}

// Handle keyboard key down events
function keyDownHandler(e) {
    if (gameState.gameOver) return;
    
    const k = e.key;
    if (k === 'ArrowUp' || k === 'w') moveUp = true;
    if (k === 'ArrowDown' || k === 's') moveDown = true;
    if (k === 'ArrowLeft' || k === 'a') moveLeft = true;
    if (k === 'ArrowRight' || k === 'd') moveRight = true;
    if (k === ' ') spacePressed = true;
}

// Handle keyboard key up events
function keyUpHandler(e) {
    const k = e.key;
    if (k === 'ArrowUp' || k === 'w') moveUp = false;
    if (k === 'ArrowDown' || k === 's') moveDown = false;
    if (k === 'ArrowLeft' || k === 'a') moveLeft = false;
    if (k === 'ArrowRight' || k === 'd') moveRight = false;
    if (k === ' ') spacePressed = false;
}

// Render the tilemap
function drawTilemap() {
    const startCol = Math.floor(camera.x / tile_size);
    const endCol = Math.min(map_cols - 1, Math.ceil((camera.x + camera.width) / tile_size));
    const startRow = Math.floor(camera.y / tile_size);
    const endRow = Math.min(map_rows - 1, Math.ceil((camera.y + camera.height) / tile_size));
    
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            const tileId = tilemap[row][col];
            const tileConfig = tilesetConfig[tileId];
            
            if (!tileConfig) continue;
            
            let sourceX = tileConfig.x;
            let sourceY = tileConfig.y;
            
            if (tileId === 23 || tileId === 24) {
                sourceX += (animationFrame * tile_size);
            }
            
            context.drawImage(
                tileset,
                sourceX, sourceY, tile_size, tile_size,
                Math.floor(col * tile_size - camera.x),
                Math.floor(row * tile_size - camera.y),
                tile_size, tile_size
            );
        }
    }
}

// Check if a position collides with solid tiles
function checkTileCollision(x, y, width, height) {
    const startCol = Math.floor(x / tile_size);
    const endCol = Math.floor((x + width - 1) / tile_size);
    const startRow = Math.floor(y / tile_size);
    const endRow = Math.floor((y + height - 1) / tile_size);
    
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            if (row >= 0 && row < map_rows && col >= 0 && col < map_cols) {
                const tileId = tilemap[row][col];
                if ((tileId >= 10 && tileId !== 23) || tileId === 24) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Update camera position to follow player
function updateCamera() {
    if (gameState.gameOver) return;
    
    camera.x = Math.floor(player.x + (player.width * player.scale) / 2 - camera.width / 2);
    camera.y = Math.floor(player.y + (player.height * player.scale) / 2 - camera.height / 2);
    
    camera.x = Math.max(0, Math.min(map_cols * tile_size - camera.width, camera.x));
    camera.y = Math.max(0, Math.min(map_rows * tile_size - camera.height, camera.y));
}

// Main game drawing function
function draw() {
    requestAnimationFrame(draw);
    now = Date.now();
    
    if ((now - then) <= fpsInterval) return;
    then = now - ((now - then) % fpsInterval);

    if (player.health <= 0 && !gameState.gameOver) {
        handleGameOver();
    }

    if (!gameState.gameOver) {
        updateAnimations();
        update();
    }
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawTilemap();
    drawPlayer();
    drawFireballs();
    drawEnemyFireballs();
    drawEnemies();
    drawHealthBar();
    
    
    if (gameState.gameOver) {
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    updateScoreAndTimer();
    
    if (walkSoundCooldown > 0) {
        walkSoundCooldown -= fpsInterval;
    }
}

// Main game update function
function update() {
    updatePlayer();
    handleProjectiles();
    updateEnemyProjectiles();
    updateCamera();
    updateEnemies();
    handleProjectileCollisions();
    checkSpikeDamage();
    
    if (now - gameState.lastSpawn > enemyConfig.spawn_time) {
        spawnEnemy();
        gameState.lastSpawn = now;
    }
}

// Render enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.sprite && enemy.sprite.complete) {
            context.drawImage(
                enemy.sprite,
                Math.floor(enemy.frame) * 16, 0, 16, 16,
                enemy.x - camera.x, enemy.y - camera.y,
                enemy.width, enemy.height
            );
        } else {
            context.fillStyle = 'purple';
            context.fillRect(enemy.x - camera.x, enemy.y - camera.y, enemy.width, enemy.height);
        }
    });
}

// Update player position and animation
function updatePlayer() {
    if (gameState.gameOver) return;
    
    player.moving = false;
    let newX = player.x, newY = player.y;
    
    if (moveLeft) { 
        newX -= player.speed;
        player.direction = 'left';
        player.moving = true; 
    }

    if (moveRight) { 
        newX += player.speed;
        player.direction = 'right';
        player.moving = true; 
    }
    
    if (moveUp) { 
        newY -= player.speed;
        player.direction = 'up';
        player.moving = true; 
    }

    if (moveDown) { 
        newY += player.speed;
        player.direction = 'down';
        player.moving = true; 
    }
    
    if (moveUp && moveRight) player.direction = 'up-right';
    if (moveUp && moveLeft) player.direction = 'up-left';
    if (moveDown && moveRight) player.direction = 'down-right';
    if (moveDown && moveLeft) player.direction = 'down-left';
    
    if (!checkTileCollision(newX, player.y, player.width * player.scale, player.height * player.scale)) {
        player.x = newX;
    }
    
    if (!checkTileCollision(player.x, newY, player.width * player.scale, player.height * player.scale)) {
        player.y = newY;
    }
    
    player.frame = (player.frame + 1) % player.num_frames;
    
    if (player.moving) {
        playWalkSound();
    }
}

// Render the player
function drawPlayer() {
    if (player.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) return;
    
    const directionMap = {
        'down': 0, 'left': 1, 'up-left': 2, 'up': 3, 
        'up-right': 4, 'right': 5, 'down-right': 5, 'down-left': 1
    };
    
    const srcX = player.frame * (player.sprite_width + 32) + 16;
    const srcY = directionMap[player.direction] * (player.sprite_height + 32) + 16;
    
    if ((player.moving ? player.walk : player.idle).complete) {
        context.drawImage(
            player.moving ? player.walk : player.idle,
            srcX, srcY, player.sprite_width, player.sprite_height,
            Math.round(player.x - camera.x), Math.round(player.y - camera.y),
            player.width * player.scale, player.height * player.scale
        );
    }
}

// Handle player projectiles
function handleProjectiles() {
    if (gameState.gameOver) return;
    
    const currentWeapon = getCurrentWeapon();
    
    if (spacePressed && !prevSpacePressed) {
        playAttackSound();
        
        projectiles.push({
            x: player.x + (player.width * player.scale)/2 - currentWeapon.width/2,
            y: player.y + (player.height * player.scale)/2 - currentWeapon.height/2,
            width: currentWeapon.width, height: currentWeapon.height, 
            speed: currentWeapon.speed, direction: player.direction,
            frame: 0, num_frames: currentWeapon.frames, 
            active: true, weapon: gameState.round,
            frameWidth: currentWeapon.frameWidth,
            frameHeight: currentWeapon.frameHeight
        });
    }
    prevSpacePressed = spacePressed;

    for (let i = projectiles.length-1; i >= 0; i--) {
        const p = projectiles[i];
        
        if (p.direction.includes('up')) p.y -= p.speed;
        if (p.direction.includes('down')) p.y += p.speed;
        if (p.direction.includes('left')) p.x -= p.speed;
        if (p.direction.includes('right')) p.x += p.speed;
        
        if (checkTileCollision(p.x, p.y, p.width, p.height)) {
            projectiles.splice(i, 1);
            continue;
        }
        
        p.frame = (p.frame + 1) % p.num_frames;
        
        if (p.x < -p.width || p.x > map_cols * tile_size || 
            p.y < -p.height || p.y > map_rows * tile_size) {
            projectiles.splice(i, 1);
        }
    }
}

// Render player projectiles
function drawFireballs() {
    for (let p of projectiles) {
        context.save();

        const centerX = p.x - camera.x + p.width / 2;
        const centerY = p.y - camera.y + p.height / 2;
        context.translate(centerX, centerY);

        const angles = {
            'left': Math.PI,
            'up': -Math.PI / 2,
            'down': Math.PI / 2,
            'up-left': -3 * Math.PI / 4,
            'up-right': -Math.PI / 4,
            'down-left': 3 * Math.PI / 4,
            'down-right': Math.PI / 4
        };

        context.rotate(angles[p.direction] || 0);

        const sprite = p.weapon === 1 ? bulletImage :
                      p.weapon === 2 ? goldenArrowImage : acidballImage;
                      
        if (sprite?.complete && sprite.naturalWidth) {
            context.drawImage(
                sprite,
                p.frame * p.frameWidth, 0, p.frameWidth, p.frameHeight,
                -p.width / 2, -p.height / 2,
                p.width, p.height
            );
        }
        context.restore();
    }
    context.setTransform(1, 0, 0, 1, 0, 0);
}

// Load game assets
function loadAssets(assets, callback) {
    let loaded = 0;

    const onLoad = () => {
        if (++loaded === assets.length) {
            WEAPON_CONFIG[1].sprite = bulletImage;
            WEAPON_CONFIG[2].sprite = goldenArrowImage;
            WEAPON_CONFIG[3].sprite = acidballImage;
            callback();
        }
    };

    assets.forEach(asset => {
        const src = asset.url + "?v=" + Date.now();

        if (asset.var instanceof HTMLImageElement) {
            asset.var.onload = onLoad;
            asset.var.onerror = onLoad;
            asset.var.src = src;
        } else if (asset.var instanceof HTMLAudioElement) {
            asset.var.addEventListener('canplaythrough', onLoad, { once: true });
            asset.var.addEventListener('error', onLoad, { once: true });
            asset.var.src = src;
            asset.var.load();
        } else {
            onLoad();
        }
    });
}

// Initialize game on page load
document.addEventListener('DOMContentLoaded', init, false);
