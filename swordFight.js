const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const winCountElement = document.getElementById('winCount');
const loseCountElement = document.getElementById('loseCount');

let player = {
   x: 100,
   y: 300,
   width: 60,
   height: 160,
   speed: 5,
   isAttacking: false,
   isBlocking: false
};

let opponent = {
   x: 600,
   y: 300,
   width: 60,
   height: 160,
   speed: 2,
   direction: -1,
   isAttacking: false,
   isBlocking: false,
   attackCooldown: 0
};

let winCount = 0;
let loseCount = 0;
let gameRunning = false;
let message = '';

function drawPixelMan(x, y, isAttacking, isBlocking) {
   // Draw head
   ctx.fillStyle = '#f1c27d';
   ctx.fillRect(x + 20, y, 20, 20);

   // Draw body
   ctx.fillStyle = message === "Game Over!" ? 'red' : '#3498db'; // Change color when player loses
   ctx.fillRect(x + 10, y + 20, 40, 60);

   // Draw legs
   ctx.fillStyle = '#2c3e50';
   ctx.fillRect(x + 10, y + 80, 10, 40);
   ctx.fillRect(x + 40, y + 80, 10, 40);

   // Draw sword
   ctx.fillStyle = '#bdc3c7';
   if (isAttacking) {
       ctx.fillRect(x + 40, y + 30, 60, 10); // Sword horizontal position
   } else if (isBlocking) {
       ctx.fillRect(x + 50, y + 10, 10, 60); // Sword vertical position
   } else {
       ctx.beginPath();
       ctx.moveTo(x + 50, y + 20);
       ctx.lineTo(x + 90, y + 60);
       ctx.lineTo(x + 80, y + 70);
       ctx.lineTo(x + 40, y + 30);
       ctx.closePath();
       ctx.fill();
   }
}


function drawOpponent(x, y, isAttacking, isBlocking) {
   // Draw head
   ctx.fillStyle = '#f1c27d';
   ctx.fillRect(x + 20, y, 20, 20);

   // Draw body
   ctx.fillStyle = message === "You win!" ? 'red' : 'green'; // Change color when player wins
   ctx.fillRect(x + 10, y + 20, 40, 60);

   // Draw legs
   ctx.fillStyle = '#2c3e50';
   ctx.fillRect(x + 10, y + 80, 10, 40);
   ctx.fillRect(x + 40, y + 80, 10, 40);

   // Draw sword
   ctx.fillStyle = '#bdc3c7';
   if (isAttacking) {
       ctx.fillRect(x - 60, y + 30, 60, 10); // Sword horizontal position
   } else if (isBlocking) {
       ctx.fillRect(x - 10, y + 10, 10, 60); // Sword vertical position
   } else {
       ctx.beginPath();
       ctx.moveTo(x - 10, y + 20);
       ctx.lineTo(x - 50, y + 60);
       ctx.lineTo(x - 40, y + 70);
       ctx.lineTo(x, y + 30);
       ctx.closePath();
       ctx.fill();
   }
}


function update() {
   if (!gameRunning) return;

   // Opponent movement
   opponent.x += opponent.speed * opponent.direction;
   if (opponent.x <= 0 || opponent.x >= canvas.width - opponent.width) {
       opponent.direction *= -1; // Change direction at edges
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
       opponent.attackCooldown = opponent.isAttacking ? 50 : 100; // Attack for 50 frames, cooldown for 100 frames
   }

   // Prevent player and opponent from passing through each other
   if (player.x + player.width > opponent.x && player.x < opponent.x + opponent.width) {
       if (player.isAttacking && !opponent.isBlocking) {
           winCount++;
           message = "You win!";
           updateScoreboard();
           gameRunning = false;
       } else if (opponent.isAttacking && !player.isBlocking) {
           loseCount++;
           message = "Game Over!";
           updateScoreboard();
           gameRunning = false;
       } else {
           // Stop movement if they collide
           if (player.x < opponent.x) {
               player.x = opponent.x - player.width;
           } else {
               opponent.x = player.x + player.width;
           }
       }
   }
}


function updateScoreboard() {
   winCountElement.textContent = winCount;
   loseCountElement.textContent = loseCount;
}

function resetGame() {
   player.x = 100;
   player.isAttacking = false;
   player.isBlocking = false;
   opponent.x = 600;
   opponent.isAttacking = false;
   opponent.isBlocking = false;
   opponent.attackCooldown = 0;
   message = '';
   gameRunning = true;
}

function gameLoop() {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   update();
   drawPixelMan(player.x, player.y, player.isAttacking, player.isBlocking);
   drawOpponent(opponent.x, opponent.y, opponent.isAttacking, opponent.isBlocking);

   // Display message
   if (message) {
       ctx.fillStyle = 'black';
       ctx.font = '24px Arial';
       ctx.textAlign = 'center';
       ctx.fillText(message, canvas.width / 2, canvas.height / 2);
   }

   requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (e) => {
   if (!gameRunning) return;

   switch (e.key) {
       case 'ArrowLeft':
           player.x -= player.speed;
           break;
       case 'ArrowRight':
           player.x += player.speed;
           break;
       case ' ':
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

   if (e.key === ' ') {
       player.isAttacking = false;
   }
   if (e.key === 'Shift') {
       player.isBlocking = false;
   }
});

startButton.addEventListener('click', () => {
   resetGame();
   message = ''; // Clear any win/lose message
});

window.addEventListener('keydown', (e) => {
   if (!gameRunning) return;

   switch (e.key) {
       case 'ArrowLeft':
           player.x -= player.speed;
           break;
       case 'ArrowRight':
           player.x += player.speed;
           break;
       case ' ':
           e.preventDefault(); // Prevent the default action of the space bar
           player.isAttacking = true;
           player.isBlocking = false;
           break;
       case 'Shift':
           player.isBlocking = true;
           player.isAttacking = false;
           break;
   }
});

gameLoop();
