// Get references to the canvas and its drawing context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Get reference to the start button
const startButton = document.getElementById('startButton');

// Define the player object with initial properties
let player = {
x: 100, // Initial x position
y: 100, // Initial y position
width: 60, // Width of the player
height: 160, // Height of the player
speed: 5, // Movement speed
isAttacking: false, // Attack state
isBlocking: false, // Block state
health: 10 // Health points
};

// Define the opponent object with initial properties
let opponent = {
x: 600, // Initial x position
y: 100, // Initial y position
width: 60, // Width of the opponent
height: 160, // Height of the opponent
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

// Function to draw the player character
function drawPixelMan(x, y, isAttacking, isBlocking) {
// Draw head
ctx.fillStyle = '#f1c27d';
ctx.fillRect(x + 20, y, 20, 20);

// Draw body
ctx.fillStyle = message === "Game Over!" ? 'red' : '#3498db';
ctx.fillRect(x + 10, y + 20, 40, 60);

// Draw legs
ctx.fillStyle = '#2c3e50';
ctx.fillRect(x + 10, y + 80, 10, 40);
ctx.fillRect(x + 40, y + 80, 10, 40);

// Draw sword
ctx.fillStyle = '#bdc3c7';
if (isAttacking) {
    ctx.fillRect(x + 40, y + 30, 60, 10); // Sword in attack position
} else if (isBlocking) {
    ctx.fillRect(x + 50, y + 10, 10, 60); // Sword in block position
} else {
    ctx.beginPath(); // Sword in idle position
    ctx.moveTo(x + 50, y + 20);
    ctx.lineTo(x + 90, y + 60);
    ctx.lineTo(x + 80, y + 70);
    ctx.lineTo(x + 40, y + 30);
    ctx.closePath();
    ctx.fill();
}
}

// Function to draw the opponent character
function drawOpponent(x, y, isAttacking, isBlocking) {
// Draw head
ctx.fillStyle = '#f1c27d';
ctx.fillRect(x + 20, y, 20, 20);

// Draw body
ctx.fillStyle = message === "You win!" ? 'red' : 'green';
ctx.fillRect(x + 10, y + 20, 40, 60);

// Draw legs
ctx.fillStyle = '#2c3e50';
ctx.fillRect(x + 10, y + 80, 10, 40);
ctx.fillRect(x + 40, y + 80, 10, 40);

// Draw sword
ctx.fillStyle = '#bdc3c7';
if (isAttacking) {
    ctx.fillRect(x - 40, y + 30, 60, 10); // Sword in attack position
} else if (isBlocking) {
    ctx.fillRect(x, y + 10, 10, 60); // Sword in block position
} else {
    ctx.beginPath(); // Sword in idle position
    ctx.moveTo(x, y + 20);
    ctx.lineTo(x - 40, y + 60);
    ctx.lineTo(x - 30, y + 70);
    ctx.lineTo(x + 10, y + 30);
    ctx.closePath();
    ctx.fill();
}
}

// Function to update the game state
function update() {
  if (!gameRunning) return;

  // Opponent movement
  opponent.x += opponent.speed * opponent.direction;

  // Prevent opponent from going through the canvas edges
  if (opponent.x <= 0 || opponent.x >= canvas.width - opponent.width) {
      opponent.direction *= -1; // Change direction
  }

  // Randomly change direction
  if (Math.random() < 0.01) {
      opponent.direction *= -1;
  }

  // Opponent attack and block logic
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

  // Prevent player and opponent from passing through each other
  if (player.x + player.width > opponent.x && player.x < opponent.x + opponent.width) {
      if (player.isAttacking && opponent.isBlocking) {
          // Reset player's attack if opponent is blocking
          player.isAttacking = false;
      } else if (opponent.isAttacking && player.isBlocking) {
          // Reset opponent's attack if player is blocking
          opponent.isAttacking = false;
      } else if (player.isAttacking && !opponent.isBlocking) {
          opponent.health--;
          resetPositions();
          if (opponent.health <= 0) {
              message = "PREY SLAUGHTERED";
              isGameOver = true;
              gameRunning = false;
              elapsedTime = (Date.now() - startTime) / 1000; // Calculate elapsed time in seconds
          }
      } else if (opponent.isAttacking && !player.isBlocking) {
          player.health--;
          resetPositions();
          if (player.health <= 0) {
              message = "You Died";
              isGameOver = true;
              gameRunning = false;
              elapsedTime = (Date.now() - startTime) / 1000; // Calculate elapsed time in seconds
          }
      } else {
          if (player.x < opponent.x) {
              player.x = opponent.x - player.width;
          } else {
              opponent.x = player.x + player.width;
          }
      }
  }

  // Prevent player from going through the canvas edges
  if (player.x < 0) {
      player.x = 0;
  } else if (player.x > canvas.width - player.width) {
      player.x = canvas.width - player.width;
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
player.x = 100;
opponent.x = 600;
player.isAttacking = false;
player.isBlocking = false;
opponent.isAttacking = false;
opponent.isBlocking = false;
}

// Function to reset the game state
function resetGame() {
player.x = 100;
player.isAttacking = false;
player.isBlocking = false;
player.health = 10;
opponent.x = 600;
opponent.isAttacking = false;
opponent.isBlocking = false;
opponent.attackCooldown = 0;
opponent.health = 10;
message = '';
fadeOpacity = 0;
isGameOver = false;
gameRunning = true;
startTime = Date.now(); // Start the timer
}

// Function to draw health bars for player and opponent
function drawHealthBars() {
// Player health bar
ctx.fillStyle = 'red';
ctx.fillRect(10, 30, (player.health / 10) * 100, 10);
ctx.strokeStyle = 'red';
ctx.strokeRect(10, 30, 100, 10); // Red border for player health bar

// Opponent health bar
ctx.fillStyle = 'red';
ctx.fillRect(canvas.width - 110, 30, (opponent.health / 10) * 100, 10);
ctx.strokeStyle = 'red';
ctx.strokeRect(canvas.width - 110, 30, 100, 10); // Red border for opponent health bar
}

// Main game loop function
function gameLoop() {
ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
update(); // Update game state
drawPixelMan(player.x, player.y, player.isAttacking, player.isBlocking); // Draw player
drawOpponent(opponent.x, opponent.y, opponent.isAttacking, opponent.isBlocking); // Draw opponent
drawHealthBars(); // Draw health bars

// Display message with fade-in effect
if (isGameOver) {
    // Draw black overlay
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(fadeOpacity, 0.7)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Increase opacity for fade-in effect
    if (fadeOpacity < 1) {
        fadeOpacity += 0.01; // Adjust speed of fade-in here
    }

    // Draw message text
    ctx.fillStyle = message === "You Died" ? `rgba(255, 0, 0, ${fadeOpacity})` : `rgba(255, 255, 0, ${fadeOpacity})`;
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);

    // Display elapsed time
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Time: ${elapsedTime.toFixed(2)} seconds`, canvas.width / 2, canvas.height / 2 + 60);
}

requestAnimationFrame(gameLoop); // Request the next frame
}

// Event listener for keydown events
window.addEventListener('keydown', (e) => {
  if (!gameRunning) {
    // Prevent any action if the game is not running
    if (e.key === ' ') {
      e.preventDefault(); // Prevent default space bar action (e.g., scrolling)
    }
    return;
  }

switch (e.key) {
    case 'ArrowLeft':
        player.x -= player.speed; // Move player left
        break;
    case 'ArrowRight':
        player.x += player.speed; // Move player right
        break;
    case ' ':
        e.preventDefault();
        player.isAttacking = true; // Start attacking
        player.isBlocking = false;
        break;
    case 'Shift':
        player.isBlocking = true; // Start blocking
        player.isAttacking = false;
        break;
}
});

// Event listener for keyup events
window.addEventListener('keyup', (e) => {
if (!gameRunning) return;

if (e.key === ' ') {
    player.isAttacking = false; // Stop attacking
}
if (e.key === 'Shift') {
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
