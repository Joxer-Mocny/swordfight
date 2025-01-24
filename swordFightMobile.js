const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');
const attackButton = document.getElementById('attackButton');
const blockButton = document.getElementById('blockButton');

let player = {
 x: 50,
 y: 20,
 width: 30,
 height: 80,
 speed: 5,
 isAttacking: false,
 isBlocking: false,
 health: 10
};

let opponent = {
 x: 300,
 y: 20,
 width: 30,
 height: 80,
 speed: 2,
 direction: -1,
 isAttacking: false,
 isBlocking: false,
 attackCooldown: 0,
 health: 10
};

let gameRunning = false;
let message = '';
let fadeOpacity = 0;
let isGameOver = false;
let startTime = 0;
let elapsedTime = 0;
let moveDirection = 0; // 0: no movement, -1: left, 1: right

function drawPixelMan(x, y, isAttacking, isBlocking) {
 ctx.fillStyle = '#f1c27d';
 ctx.fillRect(x + 10, y, 10, 10);

 ctx.fillStyle = message === "Game Over!" ? 'red' : '#3498db';
 ctx.fillRect(x + 5, y + 10, 20, 30);

 ctx.fillStyle = '#2c3e50';
 ctx.fillRect(x + 5, y + 40, 5, 20);
 ctx.fillRect(x + 20, y + 40, 5, 20);

 ctx.fillStyle = '#bdc3c7';
 if (isAttacking) {
   ctx.fillRect(x + 20, y + 15, 30, 5); // Sword in attack position
 } else if (isBlocking) {
   ctx.fillRect(x + 25, y + 5, 5, 30); // Sword in block position
 } else {
   ctx.beginPath();
   ctx.moveTo(x + 25, y + 10);
   ctx.lineTo(x + 45, y + 30);
   ctx.lineTo(x + 40, y + 35);
   ctx.lineTo(x + 20, y + 15);
   ctx.closePath();
   ctx.fill();
 }
}

function drawOpponent(x, y, isAttacking, isBlocking) {
 ctx.fillStyle = '#f1c27d';
 ctx.fillRect(x + 10, y, 10, 10);

 ctx.fillStyle = message === "You win!" ? 'red' : 'green';
 ctx.fillRect(x + 5, y + 10, 20, 30);

 ctx.fillStyle = '#2c3e50';
 ctx.fillRect(x + 5, y + 40, 5, 20);
 ctx.fillRect(x + 20, y + 40, 5, 20);

 ctx.fillStyle = '#bdc3c7';
 if (isAttacking) {
   ctx.fillRect(x - 20, y + 15, 30, 5);
 } else if (isBlocking) {
   ctx.fillRect(x, y + 5, 5, 30);
 } else {
   ctx.beginPath();
   ctx.moveTo(x, y + 10);
   ctx.lineTo(x - 20, y + 30);
   ctx.lineTo(x - 15, y + 35);
   ctx.lineTo(x + 5, y + 15);
   ctx.closePath();
   ctx.fill();
 }
}

function update() {
 if (!gameRunning) return;

 player.x += player.speed * moveDirection;
 if (player.x < 0) {
   player.x = 0;
 } else if (player.x > canvas.width - player.width) {
   player.x = canvas.width - player.width;
 }
 // Opponent movement with boundary check
 opponent.x += opponent.speed * opponent.direction;
 if (opponent.x < 0) {
   opponent.x = 0;
   opponent.direction *= -1; // Change direction
 } else if (opponent.x > canvas.width - opponent.width) {
   opponent.x = canvas.width - opponent.width;
   opponent.direction *= -1; // Change direction
 }

 if (Math.random() < 0.01) {
   opponent.direction *= -1;
 }

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
     if (player.x < opponent.x) {
       player.x = opponent.x - player.width;
     } else {
       opponent.x = player.x + player.width;
     }
   }
 }
}

function resetPositions() {
 player.x = 50;
 opponent.x = 300;
 player.isAttacking = false;
 player.isBlocking = false;
 opponent.isAttacking = false;
 opponent.isBlocking = false;
}

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

function drawHealthBars() {
 ctx.fillStyle = 'red';
 ctx.fillRect(10, 10, (player.health / 10) * 100, 5);
 ctx.strokeStyle = 'red';
 ctx.strokeRect(10, 10, 100, 5);

 ctx.fillStyle = 'red';
 ctx.fillRect(canvas.width - 110, 10, (opponent.health / 10) * 100, 5);
 ctx.strokeStyle = 'red';
 ctx.strokeRect(canvas.width - 110, 10, 100, 5);
}

function gameLoop() {
 ctx.clearRect(0, 0, canvas.width, canvas.height);
 update();
 drawPixelMan(player.x, player.y, player.isAttacking, player.isBlocking);
 drawOpponent(opponent.x, opponent.y, opponent.isAttacking, opponent.isBlocking);
 drawHealthBars();

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
   ctx.fillText(`Time: ${elapsedTime.toFixed(2)} seconds`, canvas.width / 2, canvas.height / 2 + 40);;
 }

 requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (e) => {
 if (!gameRunning) {
   if (e.key === ' ') {
     e.preventDefault();
   }
   return;
 }

 switch (e.key) {
   case 'ArrowLeft':
     moveDirection = -1;
     break;
   case 'ArrowRight':
     moveDirection = 1;
     break;
   case ' ':
     e.preventDefault();
     player.isAttacking = true;
     player.isBlocking = false;
     break;
   case 'Shift':
     player.isBlocking = true;
     player.isAttacking = false;
     break;
 }
});

window.addEventListener('keyup', (e) => {
 if (!gameRunning) return;

 switch (e.key) {
   case 'ArrowLeft':
   case 'ArrowRight':
     moveDirection = 0;
     break;
   case ' ':
     player.isAttacking = false;
     break;
   case 'Shift':
     player.isBlocking = false;
     break;
 }
});

// Add touch event listeners for the left and right buttons
leftButton.addEventListener('touchstart', () => {
 moveDirection = -1; // Start moving left
});

rightButton.addEventListener('touchstart', () => {
 moveDirection = 1; // Start moving right
});

attackButton.addEventListener('touchstart', () => {
 player.isAttacking = true;
 player.isBlocking = false;
});

blockButton.addEventListener('touchstart', () => {
 player.isBlocking = true;
 player.isAttacking = false;
});

document.addEventListener('touchend', () => {
 moveDirection = 0; // Stop moving when the touch ends
 player.isAttacking = false;
 player.isBlocking = false;
});

startButton.addEventListener('click', () => {
 resetGame();
 message = '';
});

gameLoop();