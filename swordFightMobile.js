// Get references to the canvas and its context for drawing
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Get references to the control buttons
const startButton = document.getElementById('startButton');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');
const attackButton = document.getElementById('attackButton');
const blockButton = document.getElementById('blockButton');

// Define the player object with initial properties
let player = {
x: 50, // Initial x position
y: 20, // Initial y position
width: 30, // Width of the player
height: 80, // Height of the player
speed: 5, // Movement speed
isAttacking: false, // Attack state
isBlocking: false, // Block state
health: 10 // Health points
};

// Define the opponent object with initial properties
let opponent = {
x: 300, // Initial x position
y: 20, // Initial y position
width: 30, // Width of the opponent
height: 80, // Height of the opponent
speed: 2, // Movement speed
direction: -1, // Movement direction
isAttacking: false, // Attack state
isBlocking: false, // Block state
attackCooldown: 0, // Cooldown for attacks
health: 10 // Health points
};

// Game state variables
let gameRunning = false;
let message = '';
let fadeOpacity = 0;
let isGameOver = false;
let startTime = 0;
let elapsedTime = 0;
let moveDirection = 0; // Movement direction: 0 = no movement, -1 = left, 1 = right

// Function to draw the player character
function drawPixelMan(x, y, isAttacking, isBlocking) {
ctx.fillStyle = '#f1c27d'; // Skin color
ctx.fillRect(x + 10, y, 10, 10); // Head

ctx.fillStyle = message === "Game Over!" ? 'red' : '#3498db'; // Body color
ctx.fillRect(x + 5, y + 10, 20, 30); // Body

ctx.fillStyle = '#2c3e50'; // Leg color
ctx.fillRect(x + 5, y + 40, 5, 20); // Left leg
ctx.fillRect(x + 20, y + 40, 5, 20); // Right leg

ctx.fillStyle = '#bdc3c7'; // Sword color
if (isAttacking) {
    ctx.fillRect(x + 20, y + 15, 30, 5); // Sword in attack position
} else if (isBlocking) {
    ctx.fillRect(x + 25, y + 5, 5, 30); // Sword in block position
} else {
    ctx.beginPath(); // Sword in idle position
    ctx.moveTo(x + 25, y + 10);
    ctx.lineTo(x + 45, y + 30);
    ctx.lineTo(x + 40, y + 35);
    ctx.lineTo(x + 20, y + 15);
    ctx.closePath();
    ctx.fill();
}
}

// Function to draw the opponent character
function drawOpponent(x, y, isAttacking, isBlocking) {
ctx.fillStyle = '#f1c27d'; // Skin color
ctx.fillRect(x + 10, y, 10, 10); // Head

ctx.fillStyle = message === "You win!" ? 'red' : 'green'; // Body color
ctx.fillRect(x + 5, y + 10, 20, 30); // Body

ctx.fillStyle = '#2c3e50'; // Leg color
ctx.fillRect(x + 5, y + 40, 5, 20); // Left leg
ctx.fillRect(x + 20, y + 40, 5, 20); // Right leg

ctx.fillStyle = '#bdc3c7'; // Sword color
if (isAttacking) {
    ctx.fillRect(x - 20, y + 15, 30, 5); // Sword in attack position
} else if (isBlocking) {
    ctx.fillRect(x, y + 5, 5, 30); // Sword in block position
} else {
    ctx.beginPath(); // Sword in idle position
    ctx.moveTo(x, y + 10);
    ctx.lineTo(x - 20, y + 30);
    ctx.lineTo(x - 15, y + 35);
    ctx.lineTo(x + 5, y + 15);
    ctx.closePath();
    ctx.fill();
}
}

// Function to update the game state
function update() {
if (!gameRunning) return;

// Update player position based on movement direction
player.x += player.speed * moveDirection;
if (player.x < 0) {
    player.x = 0; // Prevent moving out of left boundary
} else if (player.x > canvas.width - player.width) {
    player.x = canvas.width - player.width; // Prevent moving out of right boundary
}

// Update opponent position and handle boundary checks
opponent.x += opponent.speed * opponent.direction;
if (opponent.x < player.width) { // Restrict opponent's left boundary
    opponent.x = player.width;
    opponent.direction *= -1; // Change direction
} else if (opponent.x > canvas.width - opponent.width) {
    opponent.x = canvas.width - opponent.width;
    opponent.direction *= -1; // Change direction
}

// Randomly change opponent's direction
if (Math.random() < 0.01) {
    opponent.direction *= -1;
}

// Handle opponent attack and block logic
if (opponent.attackCooldown > 0) {
    opponent.attackCooldown--;
} else {
    if (Math.random() < 0.3) {
        opponent.isBlocking = true;
        opponent.isAttacking = false;
    } else {
        opponent.isAttacking = !opponent.isAttacking;
        opponent.isBlocking = false;
    }
    opponent.attackCooldown = opponent.isAttacking ? 50 : 100;
}

// Handle collision and attack/block interactions
if (player.x + player.width > opponent.x && player.x < opponent.x + opponent.width) {
    if (player.isAttacking && !opponent.isBlocking) {
        opponent.health--;
        resetPositions();
        if (opponent.health <= 0) {
            message = "PREY SLAUGHTERED";
            isGameOver = true;
            gameRunning = false;
            elapsedTime = (Date.now() - startTime) / 1000;
        }
    } else if (opponent.isAttacking && !player.isBlocking) {
        player.health--;
        resetPositions();
        if (player.health <= 0) {
            message = "You Died";
            isGameOver = true;
            gameRunning = false;
            elapsedTime = (Date.now() - startTime) / 1000;
        }
    } else {
        if (player.isAttacking && opponent.isBlocking) {
            player.isAttacking = false; // Reset player's attack if blocked
        }
        if (opponent.isAttacking && player.isBlocking) {
            opponent.isAttacking = false; // Reset opponent's attack if blocked
        }
        if (player.x < opponent.x) {
            player.x = opponent.x - player.width;
        } else {
            opponent.x = player.x + player.width;
        }
    }
}

// Prevent opponent from passing through player when player is against the wall
if (player.x === 0 && opponent.x < player.x + player.width) {
    opponent.x = player.x + player.width;
} else if (player.x === canvas.width - player.width && opponent.x > player.x - opponent.width) {
    opponent.x = player.x - opponent.width;
}
}

// Function to reset player and opponent positions
function resetPositions() {
player.x = 50;
opponent.x = 300;
player.isAttacking = false;
player.isBlocking = false;
opponent.isAttacking = false;
opponent.isBlocking = false;
}

// Function to reset the game state
function resetGame() {
player.x = 50;
player.isAttacking = false;
player.isBlocking = false;
player.health = 10;
opponent.x = 300;
opponent.isAttacking = false;
opponent.isBlocking = false;
opponent.attackCooldown = 0;
opponent.health = 10;
message = '';
fadeOpacity = 0;
isGameOver = false;
gameRunning = true;
startTime = Date.now();
}

// Function to draw health bars for player and opponent
function drawHealthBars() {
ctx.fillStyle = 'red';
ctx.fillRect(10, 10, (player.health / 10) * 100, 5); // Player health bar
ctx.strokeStyle = 'red';
ctx.strokeRect(10, 10, 100, 5);

ctx.fillStyle = 'red';
ctx.fillRect(canvas.width - 110, 10, (opponent.health / 10) * 100, 5); // Opponent health bar
ctx.strokeStyle = 'red';
ctx.strokeRect(canvas.width - 110, 10, 100, 5);
}

// Main game loop function
function gameLoop() {
ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
update(); // Update game state
drawPixelMan(player.x, player.y, player.isAttacking, player.isBlocking); // Draw player
drawOpponent(opponent.x, opponent.y, opponent.isAttacking, opponent.isBlocking); // Draw opponent
drawHealthBars(); // Draw health bars

if (isGameOver) {
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(fadeOpacity, 0.7)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (fadeOpacity < 1) {
        fadeOpacity += 0.01;
    }

    ctx.fillStyle = message === "You Died" ? `rgba(255, 0, 0, ${fadeOpacity})` : `rgba(255, 255, 0, ${fadeOpacity})`;
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);

    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Time: ${elapsedTime.toFixed(2)} seconds`, canvas.width / 2, canvas.height / 2 + 40);
}

requestAnimationFrame(gameLoop); // Request the next frame
}

// Event listeners for keyboard input
window.addEventListener('keydown', (e) => {
 if (!gameRunning) {
     if (e.key === ' ') {
         e.preventDefault();
     }
     return;
 }

 switch (e.key) {
     case 'ArrowLeft':
         moveDirection = -1; // Move left
         break;
     case 'ArrowRight':
         moveDirection = 1; // Move right
         break;
     case ' ':
         e.preventDefault();
         player.isAttacking = true; // Start attacking
         break;
     case 'Shift':
         player.isBlocking = true; // Start blocking
         break;
 }
});

window.addEventListener('keyup', (e) => {
 if (!gameRunning) return;

 switch (e.key) {
     case 'ArrowLeft':
     case 'ArrowRight':
         moveDirection = 0; // Stop moving
         break;
     case ' ':
         player.isAttacking = false; // Stop attacking
         break;
     case 'Shift':
         player.isBlocking = false; // Stop blocking
         break;
 }
});

// Touch event listeners for mobile controls
leftButton.addEventListener('touchstart', () => {
 moveDirection = -1; // Start moving left
});

rightButton.addEventListener('touchstart', () => {
 moveDirection = 1; // Start moving right
});

attackButton.addEventListener('touchstart', () => {
 player.isAttacking = true; // Start attacking
});

blockButton.addEventListener('touchstart', () => {
 player.isBlocking = true; // Start blocking
});

document.addEventListener('touchend', (e) => {
 if (e.target === leftButton || e.target === rightButton) {
     moveDirection = 0; // Stop moving when the touch ends
 }
 if (e.target === attackButton) {
     player.isAttacking = false; // Stop attacking
 }
 if (e.target === blockButton) {
     player.isBlocking = false; // Stop blocking
 }
});

// Start button event listener to reset the game
startButton.addEventListener('click', () => {
 resetGame();
 message = '';
});

// Start the game loop
gameLoop();
