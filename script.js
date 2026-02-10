// ============================================
// PERSONALIZATION - Edit these values!
// ============================================
const FRIEND_NAME = "Adheesh";
const PERSONAL_MESSAGE = `
    Another wonderful lap around the sun - full of learning, exploring, and laughter! 
Here’s to many more adventures, projects, and memories still to come. 
Love you lots and hope you have a fabulous birthday in beautiful BC 💕 Thinking of you on your special day! 😊 🦫💕🍁
`;

// ============================================
// GAME CONFIGURATION
// ============================================
const GAME_CONFIG = {
    canvasWidth: 320,
    canvasHeight: 480,
    roadWidth: 240,
    laneCount: 3,
    playerWidth: 40,
    playerHeight: 60,
    itemSize: 35,
    obstacleSize: 40,
    initialSpeed: 3,
    maxSpeed: 15,
    speedIncrement: 0.002,
    boostAmount: 3,
    boostDuration: 180,         // Frames of boost (about 3 seconds)
    spawnRateInitial: 80,
    spawnRateMin: 35,
    spawnRateDecrement: 0.01,
    lives: 3
};

// ============================================
// CUSTOM OBSTACLES - Edit these!
// ============================================
const OBSTACLE_TYPES = [
    { emoji: '🧱', name: 'bricks' },
    { emoji: '🏔️', name: 'mountain' },
    { emoji: '🌲', name: 'tree' },
    { emoji: '🪨', name: 'rock' }
];

// ============================================
// CUSTOM COLLECTIBLES - Edit these!
// type: 'points' = just adds points
// type: 'boost' = gives speed boost + points
// ============================================
const COLLECTIBLE_TYPES = [
    { emoji: '🎁', name: 'present', points: 10, type: 'points', chance: 0.40 },
    { emoji: '🎂', name: 'cake', points: 25, type: 'boost', chance: 0.52 },
    { emoji: '🍁', name: 'maple', points: 15, type: 'points', chance: 0.62 },
    { emoji: '🍺', name: 'beer', points: 20, type: 'points', chance: 0.72 },
];

// ============================================
// CONFETTI SYSTEM
// ============================================
const confettiCanvas = document.getElementById('confettiCanvas');
const confettiCtx = confettiCanvas.getContext('2d');
let confetti = [];
let confettiRunning = false;
let mouse = {
    x: null,
    y: null,
    radius: 150
};

window.addEventListener('mousemove', function(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseout', function() {
    mouse.x = null;
    mouse.y = null;
});

function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeConfettiCanvas);
resizeConfettiCanvas();

// ============================================
// TEXT COLLISION BOUNDARIES
// ============================================
let textBoundaries = [];

function updateTextBoundaries() {
    textBoundaries = [];
    
    const title = document.querySelector('.birthday-title');
    if (title && !document.getElementById('celebration').classList.contains('hidden')) {
        const rect = title.getBoundingClientRect();
        textBoundaries.push({
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
        });
    }
    
    const message = document.querySelector('.message');
    if (message && !document.getElementById('celebration').classList.contains('hidden')) {
        const rect = message.getBoundingClientRect();
        textBoundaries.push({
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
        });
    }
}

setInterval(updateTextBoundaries, 500);

// ============================================
// CONFETTI PIECE CLASS
// ============================================
class ConfettiPiece {
    constructor(x = null, y = null, fromClick = false) {
        if (fromClick && x !== null) {
            this.x = x;
            this.y = y;
            let angle = Math.random() * Math.PI * 2;
            let speed = Math.random() * 10 + 5;
            this.speedX = Math.cos(angle) * speed;
            this.speedY = Math.sin(angle) * speed - 5;
        } else {
            this.x = Math.random() * confettiCanvas.width;
            this.y = Math.random() * confettiCanvas.height - confettiCanvas.height;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 3 + 2;
        }
        
        this.baseSpeedX = Math.random() * 1 - .5;
        this.baseSpeedY = Math.random() * 1 + .5;
        this.size = Math.random() * 10 + 5;
        
       // const canadaColors = ['#ff0000', '#cc0000', '#ffffff', '#f0f0f0', '#ffd700', '#ffec8b'];
       // this.color = canadaColors[Math.floor(Math.random() * canadaColors.length)];
        this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
        this.gravity = 0.05;
        this.friction = 0.99;
    }
    
    update() {
        if (mouse.x !== null && mouse.y !== null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                let force = (mouse.radius - distance) / mouse.radius;
                this.speedX += (dx / distance) * force * 0.5;
                this.speedY += (dy / distance) * force * 0.3;
            }
        }
        
        for (let boundary of textBoundaries) {
            const padding = this.size + 2;
            
            if (this.x > boundary.x - padding &&
                this.x < boundary.x + boundary.width + padding &&
                this.y > boundary.y - padding &&
                this.y < boundary.y + boundary.height + padding) {
                
                const centerX = boundary.x + boundary.width / 2;
                const centerY = boundary.y + boundary.height / 2;
                
                const awayX = this.x - centerX;
                const awayY = this.y - centerY;
                const awayDist = Math.sqrt(awayX * awayX + awayY * awayY);
                
                if (awayDist > 0) {
                    const pushForce = 3;
                    this.speedX = (awayX / awayDist) * pushForce + (Math.random() - 0.5) * 4;
                    this.speedY = (awayY / awayDist) * pushForce + (Math.random() - 0.5) * 4;
                }
                
                const overlapLeft = (this.x + this.size) - boundary.x;
                const overlapRight = (boundary.x + boundary.width) - (this.x - this.size);
                const overlapTop = (this.y + this.size) - boundary.y;
                const overlapBottom = (boundary.y + boundary.height) - (this.y - this.size);
                
                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
                
                if (minOverlap === overlapLeft) {
                    this.x = boundary.x - this.size - 5;
                } else if (minOverlap === overlapRight) {
                    this.x = boundary.x + boundary.width + this.size + 5;
                } else if (minOverlap === overlapTop) {
                    this.y = boundary.y - this.size - 5;
                } else {
                    this.y = boundary.y + boundary.height + this.size + 5;
                }
                
                this.rotationSpeed += (Math.random() - 0.5) * 15;
            }
        }
        
        this.speedY += this.gravity;
        this.speedX *= this.friction;
        this.speedY *= this.friction;
        
        if (this.speedY < this.baseSpeedY * 0.3) {
            this.speedY = this.baseSpeedY * 0.3;
        }
        
        const maxSpeed = 15;
        if (Math.abs(this.speedX) > maxSpeed) {
            this.speedX = maxSpeed * Math.sign(this.speedX);
        }
        if (Math.abs(this.speedY) > maxSpeed) {
            this.speedY = maxSpeed * Math.sign(this.speedY);
        }
        
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        
        if (this.y > confettiCanvas.height + this.size) {
            this.y = -this.size;
            this.x = Math.random() * confettiCanvas.width;
            this.speedX = this.baseSpeedX;
            this.speedY = this.baseSpeedY;
        }
        
        if (this.x < -this.size) this.x = confettiCanvas.width + this.size;
        if (this.x > confettiCanvas.width + this.size) this.x = -this.size;
    }
    
    draw() {
        confettiCtx.save();
        confettiCtx.translate(this.x, this.y);
        confettiCtx.rotate(this.rotation * Math.PI / 180);
        
        const scale = this.size / 4000;
        confettiCtx.scale(scale, scale);
        
        confettiCtx.fillStyle = this.color;
        
        confettiCtx.beginPath();
        const path = new Path2D('m-90 2030 45-863a95 95 0 0 0-111-98l-859 151 116-320a65 65 0 0 0-20-73l-941-762 212-99a65 65 0 0 0 34-79l-186-572 542 115a65 65 0 0 0 73-38l105-247 423 454a65 65 0 0 0 111-57l-204-1052 327 189a65 65 0 0 0 91-27l332-652 332 652a65 65 0 0 0 91 27l327-189-204 1052a65 65 0 0 0 111 57l423-454 105 247a65 65 0 0 0 73 38l542-115-186 572a65 65 0 0 0 34 79l212 99-941 762a65 65 0 0 0-20 73l116 320-859-151a95 95 0 0 0-111 98l45 863z');
        confettiCtx.fill(path);
        
        confettiCtx.restore();
    }
}

// ============================================
// CONFETTI FUNCTIONS
// ============================================
function createConfetti() {
    confettiRunning = true;
    for (let i = 0; i < 150; i++) {
        confetti.push(new ConfettiPiece());
    }
}

function animateConfetti() {
    if (!confettiRunning) return;
    
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    if (confetti.length > 400) {
        confetti = confetti.slice(-400);
    }
    
    confetti.forEach(piece => {
        piece.update();
        piece.draw();
    });
    
    requestAnimationFrame(animateConfetti);
}

function stopConfetti() {
    confettiRunning = false;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
}

function resumeConfetti() {
    if (!confettiRunning) {
        confettiRunning = true;
        animateConfetti();
    }
}

// Click to spawn confetti (only when not playing game)
window.addEventListener('click', function(e) {
    if (!document.getElementById('celebration').classList.contains('hidden') && gameState !== 'playing') {
        for (let i = 0; i < 30; i++) {
            confetti.push(new ConfettiPiece(e.clientX, e.clientY, true));
        }
    }
});

// ============================================
// BIRTHDAY RACER GAME
// ============================================
let gameCanvas, gameCtx;
let gameState = 'waiting';
let score = 0;
let lives = GAME_CONFIG.lives;
let speed = GAME_CONFIG.initialSpeed;
let baseSpeed = GAME_CONFIG.initialSpeed;
let boostTimer = 0;
let isBoosting = false;
let spawnRate = GAME_CONFIG.spawnRateInitial;
let frameCount = 0;
let spawnCounter = 0;
let difficultyLevel = 1;

let player = {
    x: 0,
    y: 0,
    width: GAME_CONFIG.playerWidth,
    height: GAME_CONFIG.playerHeight,
    lane: 1,
    targetX: 0,
    moveSpeed: 8
};

let items = [];
let obstacles = [];
let roadLines = [];

let keys = {
    left: false,
    right: false
};

function initGame() {
    gameCanvas = document.getElementById('gameCanvas');
    gameCtx = gameCanvas.getContext('2d');
    
    gameCanvas.width = GAME_CONFIG.canvasWidth;
    gameCanvas.height = GAME_CONFIG.canvasHeight;
    
    for (let i = 0; i < 10; i++) {
        roadLines.push({ y: i * 60 });
    }
    
    resetPlayer();
    setupGameControls();
    gameLoop();
}

function resetPlayer() {
    player.lane = 1;
    player.x = getLaneX(player.lane);
    player.targetX = player.x;
    player.y = GAME_CONFIG.canvasHeight - player.height - 30;
}

function setupGameControls() {
    document.addEventListener('keydown', (e) => {
        if (gameState !== 'playing') return;
        
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            keys.left = true;
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            keys.right = true;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            keys.left = false;
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            keys.right = false;
        }
    });
    
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    
    if (leftBtn) {
        leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys.left = true; });
        leftBtn.addEventListener('touchend', () => keys.left = false);
        leftBtn.addEventListener('mousedown', () => keys.left = true);
        leftBtn.addEventListener('mouseup', () => keys.left = false);
    }
    
    if (rightBtn) {
        rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys.right = true; });
        rightBtn.addEventListener('touchend', () => keys.right = false);
        rightBtn.addEventListener('mousedown', () => keys.right = true);
        rightBtn.addEventListener('mouseup', () => keys.right = false);
    }
    
    document.getElementById('startGameBtn').addEventListener('click', startGame);
}

function startGame() {
    stopConfetti();
    
    score = 0;
    lives = GAME_CONFIG.lives;
    baseSpeed = GAME_CONFIG.initialSpeed;
    boostTimer = 0;
    isBoosting = false;
    speed = baseSpeed;
    spawnRate = GAME_CONFIG.spawnRateInitial;
    frameCount = 0;
    spawnCounter = 0;
    difficultyLevel = 1;
    items = [];
    obstacles = [];
    
    resetPlayer();
    updateGameUI();
    
    document.getElementById('startGameBtn').textContent = '🏁 Restart Game';
    gameState = 'playing';
}

function getLaneX(lane) {
    const roadStart = (GAME_CONFIG.canvasWidth - GAME_CONFIG.roadWidth) / 2;
    const laneWidth = GAME_CONFIG.roadWidth / GAME_CONFIG.laneCount;
    return roadStart + lane * laneWidth + (laneWidth - player.width) / 2;
}

function updateGameUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = '❤️'.repeat(Math.max(0, lives));
}

function gameLoop() {
    if (gameState === 'playing') {
        updateGame();
    }
    renderGame();
    requestAnimationFrame(gameLoop);
}

function updateGame() {
    frameCount++;
    spawnCounter++;
    
    // Progressive difficulty: increase base speed over time
    baseSpeed = Math.min(
        GAME_CONFIG.maxSpeed, 
        GAME_CONFIG.initialSpeed + frameCount * GAME_CONFIG.speedIncrement
    );
    
    // Progressive difficulty: decrease spawn rate over time (more obstacles)
    spawnRate = Math.max(
        GAME_CONFIG.spawnRateMin,
        GAME_CONFIG.spawnRateInitial - frameCount * GAME_CONFIG.spawnRateDecrement
    );
    
    // Update difficulty level for display
    difficultyLevel = Math.floor((baseSpeed - GAME_CONFIG.initialSpeed) / 2) + 1;
    
    // Handle boost timer
    if (boostTimer > 0) {
        boostTimer--;
        isBoosting = true;
        speed = baseSpeed + GAME_CONFIG.boostAmount;
    } else {
        isBoosting = false;
        speed = baseSpeed;
    }
    
    // Handle lane changes
    if (keys.left && player.lane > 0) {
        player.lane--;
        player.targetX = getLaneX(player.lane);
        keys.left = false;
    }
    if (keys.right && player.lane < GAME_CONFIG.laneCount - 1) {
        player.lane++;
        player.targetX = getLaneX(player.lane);
        keys.right = false;
    }
    
    // Smooth player movement
    if (player.x < player.targetX) {
        player.x = Math.min(player.x + player.moveSpeed, player.targetX);
    } else if (player.x > player.targetX) {
        player.x = Math.max(player.x - player.moveSpeed, player.targetX);
    }
    
    // Spawn objects based on current spawn rate
    if (spawnCounter >= Math.floor(spawnRate)) {
        spawnObject();
        spawnCounter = 0;
    }
    
    // Update road lines
    roadLines.forEach(line => {
        line.y += speed;
        if (line.y > GAME_CONFIG.canvasHeight) {
            line.y = -20;
        }
    });
    
    // Update items
    items.forEach((item, index) => {
        item.y += speed;
        
        if (checkCollision(player, item)) {
            collectItem(item);
            items.splice(index, 1);
        }
        
        if (item.y > GAME_CONFIG.canvasHeight) {
            items.splice(index, 1);
        }
    });
    
    // Update obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.y += speed;
        
        if (checkCollision(player, obstacle)) {
            hitObstacle();
            obstacles.splice(index, 1);
        }
        
        if (obstacle.y > GAME_CONFIG.canvasHeight) {
            obstacles.splice(index, 1);
        }
    });
    
    updateGameUI();
}

function spawnObject() {
    const lane = Math.floor(Math.random() * GAME_CONFIG.laneCount);
    const x = getLaneX(lane) + (player.width - GAME_CONFIG.itemSize) / 2;
    
    const rand = Math.random();
    
    // Check collectibles first
    let spawned = false;
    for (let collectible of COLLECTIBLE_TYPES) {
        if (rand < collectible.chance) {
            items.push({
                x: x,
                y: -GAME_CONFIG.itemSize,
                width: GAME_CONFIG.itemSize,
                height: GAME_CONFIG.itemSize,
                type: collectible.type,
                name: collectible.name,
                emoji: collectible.emoji,
                points: collectible.points
            });
            spawned = true;
            break;
        }
    }
    
    // If no collectible spawned, spawn an obstacle
    if (!spawned) {
        const obstacleType = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
        
        obstacles.push({
            x: x,
            y: -GAME_CONFIG.obstacleSize,
            width: GAME_CONFIG.obstacleSize,
            height: GAME_CONFIG.obstacleSize,
            emoji: obstacleType.emoji,
            name: obstacleType.name
        });
    }
}

function checkCollision(a, b) {
    const padding = 8;
    return (
        a.x < b.x + b.width - padding &&
        a.x + a.width > b.x + padding &&
        a.y < b.y + b.height - padding &&
        a.y + a.height > b.y + padding
    );
}

function collectItem(item) {
    // Add points
    score += item.points;
    
    // If it's a boost item (cake!), activate boost
    if (item.type === 'boost') {
        boostTimer = GAME_CONFIG.boostDuration;
        isBoosting = true;
    }
}

function hitObstacle() {
    lives--;
    
    // Cancel boost when hit
    boostTimer = 0;
    isBoosting = false;
    
    if (lives <= 0) {
        gameState = 'gameover';
        document.getElementById('startGameBtn').textContent = '🏁 Play Again!';
        resumeConfetti();
    }
}

function renderGame() {
    gameCtx.fillStyle = '#2d3436';
    gameCtx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
    
    drawRoad();
    
    // Draw items
    items.forEach(item => {
        gameCtx.font = `${item.width}px Arial`;
        gameCtx.textAlign = 'center';
        gameCtx.textBaseline = 'middle';
        gameCtx.fillText(item.emoji, item.x + item.width / 2, item.y + item.height / 2);
        
        // Add glow effect to boost items
        if (item.type === 'boost') {
            gameCtx.shadowColor = '#ffd700';
            gameCtx.shadowBlur = 15;
            gameCtx.fillText(item.emoji, item.x + item.width / 2, item.y + item.height / 2);
            gameCtx.shadowBlur = 0;
        }
    });
    
    // Draw obstacles
    obstacles.forEach(obstacle => {
        gameCtx.font = `${obstacle.width}px Arial`;
        gameCtx.textAlign = 'center';
        gameCtx.textBaseline = 'middle';
        gameCtx.fillText(obstacle.emoji, obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
    });
    
    drawPlayer();
    
    // Draw boost indicator and speed
    if (gameState === 'playing') {
        drawBoostMeter();
        drawSpeedIndicator();
    }
    
    // Waiting screen
    if (gameState === 'waiting') {
        gameCtx.fillStyle = 'rgba(0,0,0,0.7)';
        gameCtx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
        
        gameCtx.fillStyle = 'white';
        gameCtx.font = 'bold 24px Georgia';
        gameCtx.textAlign = 'center';
        gameCtx.fillText('🍁 Birthday Racer 🍁', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 - 70);
        
        gameCtx.font = '14px Georgia';
        gameCtx.fillText('Collect presents for points!', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 - 30);
        
        gameCtx.fillStyle = '#ffd700';
        gameCtx.fillText('🎂 Catch CAKE for BOOST! 🎂', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2);
        
        gameCtx.fillStyle = 'white';
        gameCtx.fillText('Avoid ' + OBSTACLE_TYPES.map(o => o.emoji).join(' '), GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 30);
        
        gameCtx.fillStyle = '#87CEEB';
        gameCtx.fillText('← → or A D to move', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 60);
        
        gameCtx.fillStyle = 'white';
        gameCtx.fillText('Click Start to Play!', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 90);
    }
    
    // Game over screen
    if (gameState === 'gameover') {
        gameCtx.fillStyle = 'rgba(0,0,0,0.7)';
        gameCtx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
        
        gameCtx.fillStyle = 'white';
        gameCtx.font = 'bold 28px Georgia';
        gameCtx.textAlign = 'center';
        gameCtx.fillText('Game Over, Eh!', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 - 50);
        
        gameCtx.font = '20px Georgia';
        gameCtx.fillStyle = '#ffd700';
        gameCtx.fillText(`Score: ${score}`, GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 - 10);
        
        gameCtx.font = '16px Georgia';
        gameCtx.fillStyle = '#87CEEB';
        gameCtx.fillText(`Max Level: ${difficultyLevel}`, GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 20);
        
        gameCtx.fillStyle = 'white';
        gameCtx.fillText('Click to Play Again!', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 55);
    }
}

function drawBoostMeter() {
    const meterWidth = 80;
    const meterHeight = 12;
    const meterX = 10;
    const meterY = GAME_CONFIG.canvasHeight - 25;
    
    // Background
    gameCtx.fillStyle = 'rgba(255,255,255,0.3)';
    gameCtx.fillRect(meterX, meterY, meterWidth, meterHeight);
    
    // Boost level
    const boostPercent = boostTimer / GAME_CONFIG.boostDuration;
    if (boostPercent > 0) {
        // Gradient effect for boost
        const gradient = gameCtx.createLinearGradient(meterX, meterY, meterX + meterWidth, meterY);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(0.5, '#ffd700');
        gradient.addColorStop(1, '#ff6b6b');
        gameCtx.fillStyle = gradient;
        gameCtx.fillRect(meterX, meterY, meterWidth * boostPercent, meterHeight);
    }
    
    // Border
    gameCtx.strokeStyle = isBoosting ? '#ffd700' : 'white';
    gameCtx.lineWidth = isBoosting ? 2 : 1;
    gameCtx.strokeRect(meterX, meterY, meterWidth, meterHeight);
    
    // Label
    gameCtx.fillStyle = isBoosting ? '#ffd700' : 'white';
    gameCtx.font = isBoosting ? 'bold 10px Arial' : '10px Arial';
    gameCtx.textAlign = 'left';
    gameCtx.fillText(isBoosting ? '🔥 BOOST!' : 'Catch 🎂 for boost!', meterX, meterY - 4);
}

function drawSpeedIndicator() {
    const x = GAME_CONFIG.canvasWidth - 70;
    const y = GAME_CONFIG.canvasHeight - 25;
    
    gameCtx.fillStyle = 'white';
    gameCtx.font = '10px Arial';
    gameCtx.textAlign = 'left';
    gameCtx.fillText(`LEVEL: ${difficultyLevel}`, x, y - 3);
    
    gameCtx.fillStyle = isBoosting ? '#ff6b6b' : '#ffd700';
    gameCtx.font = 'bold 12px Arial';
    gameCtx.fillText(`${speed.toFixed(1)}x`, x, y + 10);
}

function drawRoad() {
    const roadStart = (GAME_CONFIG.canvasWidth - GAME_CONFIG.roadWidth) / 2;
    
    // Road surface
    gameCtx.fillStyle = '#636e72';
    gameCtx.fillRect(roadStart, 0, GAME_CONFIG.roadWidth, GAME_CONFIG.canvasHeight);
    
    // Road edges (Canadian red!)
    gameCtx.fillStyle = '#ff0000';
    gameCtx.fillRect(roadStart - 5, 0, 5, GAME_CONFIG.canvasHeight);
    gameCtx.fillRect(roadStart + GAME_CONFIG.roadWidth, 0, 5, GAME_CONFIG.canvasHeight);
    
    // Lane dividers
    const laneWidth = GAME_CONFIG.roadWidth / GAME_CONFIG.laneCount;
    gameCtx.fillStyle = 'white';
    
    roadLines.forEach(line => {
        for (let i = 1; i < GAME_CONFIG.laneCount; i++) {
            gameCtx.fillRect(roadStart + i * laneWidth - 2, line.y, 4, 30);
        }
    });
    
    // Grass on sides
    gameCtx.fillStyle = '#228B22';
    gameCtx.fillRect(0, 0, roadStart - 5, GAME_CONFIG.canvasHeight);
    gameCtx.fillRect(roadStart + GAME_CONFIG.roadWidth + 5, 0, roadStart - 5, GAME_CONFIG.canvasHeight);
}

function drawPlayer() {
    const x = player.x;
    const y = player.y;
    const w = player.width;
    const h = player.height;
    
    // Car body - changes color when boosting!
    if (isBoosting) {
        // Rainbow/golden effect when boosting
        const hue = (frameCount * 5) % 360;
        gameCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    } else {
        gameCtx.fillStyle = '#ff0000';
    }
    gameCtx.beginPath();
    gameCtx.roundRect(x + 4, y + 12, w - 8, h - 16, 6);
    gameCtx.fill();
    
    // Car top
    gameCtx.fillStyle = isBoosting ? '#ffd700' : '#cc0000';
    gameCtx.beginPath();
    gameCtx.roundRect(x + 8, y + 20, w - 16, h - 36, 4);
    gameCtx.fill();
    
    // Windshield
    gameCtx.fillStyle = '#87CEEB';
    gameCtx.beginPath();
    gameCtx.roundRect(x + 10, y + 22, w - 20, 12, 2);
    gameCtx.fill();
    
    // Wheels
    gameCtx.fillStyle = '#2d3436';
    gameCtx.fillRect(x, y + 16, 6, 16);
    gameCtx.fillRect(x + w - 6, y + 16, 6, 16);
    gameCtx.fillRect(x, y + h - 20, 6, 16);
    gameCtx.fillRect(x + w - 6, y + h - 20, 6, 16);
    
    // Headlights
    gameCtx.fillStyle = '#ffd700';
    gameCtx.beginPath();
    gameCtx.arc(x + 12, y + 14, 4, 0, Math.PI * 2);
    gameCtx.arc(x + w - 12, y + 14, 4, 0, Math.PI * 2);
    gameCtx.fill();
    
    // Maple leaf on car
    gameCtx.font = '16px Arial';
    gameCtx.textAlign = 'center';
    gameCtx.fillText('🍁', x + w / 2, y + 6);
    
    // Boost flames when boosting!
    if (isBoosting) {
        gameCtx.font = '14px Arial';
        gameCtx.fillText('🔥', x + w / 2 - 10, y + h + 8);
        gameCtx.fillText('🔥', x + w / 2 + 10, y + h + 8);
        
        // Extra flames for dramatic effect
        if (frameCount % 4 < 2) {
            gameCtx.fillText('🔥', x + w / 2, y + h + 12);
        }
    }
}

// Polyfill for roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
    };
}

// ============================================
// PAGE REVEAL LOGIC
// ============================================
document.getElementById('revealBtn').addEventListener('click', function() {
    document.getElementById('introScreen').classList.add('hidden');
    document.getElementById('celebration').classList.remove('hidden');
    
    document.getElementById('friendName').textContent = FRIEND_NAME;
    document.getElementById('personalMessage').textContent = PERSONAL_MESSAGE;
    
    createConfetti();
    animateConfetti();
    
    initGame();
    
    setTimeout(updateTextBoundaries, 100);
});

console.log("🍁 Canadian Birthday Script Loaded, eh! 🍁");