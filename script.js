const gameContainer = document.getElementById('game-container');
const basket = document.getElementById('basket');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const overlay = document.getElementById('overlay');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

const FRUIT_EMOJIS = ['🍎', '🍌', '🍊', '🍇'];
const BASKET_SPEED = 460;
const SPAWN_EVERY_MS = 1200;

let score = 0;
let lives = 3;
let fruits = [];
let moveLeft = false;
let moveRight = false;
let basketX = 0;
let lastFrame = 0;
let spawnTimer = 0;
let gameRunning = true;

function getDimensions() {
  return {
    width: gameContainer.clientWidth,
    height: gameContainer.clientHeight,
    basketWidth: basket.offsetWidth,
    basketHeight: basket.offsetHeight,
  };
}

function setBasketPosition(x) {
  const { width, basketWidth } = getDimensions();
  basketX = Math.max(0, Math.min(x, width - basketWidth));
  basket.style.left = `${basketX}px`;
  basket.style.transform = 'translateX(0)';
}

function createFruit() {
  const fruitEl = document.createElement('div');
  fruitEl.className = 'fruit';
  fruitEl.textContent = FRUIT_EMOJIS[Math.floor(Math.random() * FRUIT_EMOJIS.length)];

  const fruitSize = 48;
  const { width } = getDimensions();
  const x = Math.random() * (width - fruitSize);
  const speed = 140 + Math.random() * 120;

  fruitEl.style.left = `${x}px`;
  fruitEl.style.top = `-60px`;

  gameContainer.appendChild(fruitEl);
  fruits.push({ x, y: -60, size: fruitSize, speed, element: fruitEl });
}

function updateScore(points) {
  score += points;
  scoreEl.textContent = String(score);
}

function loseLife() {
  lives -= 1;
  livesEl.textContent = String(lives);

  if (lives <= 0) {
    endGame();
  }
}

function intersects(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function updateFruits(deltaSeconds) {
  const { height, basketHeight, basketWidth } = getDimensions();
  const basketRect = {
    left: basketX,
    right: basketX + basketWidth,
    top: height - basketHeight - 18,
    bottom: height - 18,
  };

  fruits = fruits.filter((fruit) => {
    fruit.y += fruit.speed * deltaSeconds;
    fruit.element.style.transform = `translateY(${fruit.y}px)`;

    const fruitRect = {
      left: fruit.x,
      right: fruit.x + fruit.size,
      top: fruit.y,
      bottom: fruit.y + fruit.size,
    };

    if (intersects(fruitRect, basketRect)) {
      updateScore(10);
      fruit.element.remove();
      return false;
    }

    if (fruit.y > height - fruit.size) {
      loseLife();
      fruit.element.remove();
      return false;
    }

    return true;
  });
}

function handleMovement(deltaSeconds) {
  if (!moveLeft && !moveRight) {
    return;
  }

  let direction = 0;
  if (moveLeft) direction -= 1;
  if (moveRight) direction += 1;

  setBasketPosition(basketX + direction * BASKET_SPEED * deltaSeconds);
}

function gameLoop(timestamp) {
  if (!gameRunning) {
    return;
  }

  const deltaSeconds = Math.min((timestamp - lastFrame) / 1000, 0.03);
  lastFrame = timestamp;
  spawnTimer += deltaSeconds * 1000;

  if (spawnTimer >= SPAWN_EVERY_MS) {
    createFruit();
    spawnTimer = 0;
  }

  handleMovement(deltaSeconds);
  updateFruits(deltaSeconds);

  requestAnimationFrame(gameLoop);
}

function endGame() {
  gameRunning = false;
  finalScoreEl.textContent = String(score);
  overlay.classList.remove('hidden');
}

function resetGame() {
  fruits.forEach((fruit) => fruit.element.remove());
  fruits = [];

  score = 0;
  lives = 3;
  scoreEl.textContent = '0';
  livesEl.textContent = '3';

  overlay.classList.add('hidden');
  gameRunning = true;
  spawnTimer = 0;
  lastFrame = performance.now();

  const { width, basketWidth } = getDimensions();
  setBasketPosition((width - basketWidth) / 2);

  requestAnimationFrame(gameLoop);
}

function onKeyDown(event) {
  if (event.key === 'ArrowLeft') {
    moveLeft = true;
  } else if (event.key === 'ArrowRight') {
    moveRight = true;
  }
}

function onKeyUp(event) {
  if (event.key === 'ArrowLeft') {
    moveLeft = false;
  } else if (event.key === 'ArrowRight') {
    moveRight = false;
  }
}

window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
window.addEventListener('resize', () => {
  const { width, basketWidth } = getDimensions();
  setBasketPosition(Math.min(basketX, width - basketWidth));
});
restartBtn.addEventListener('click', resetGame);

resetGame();
