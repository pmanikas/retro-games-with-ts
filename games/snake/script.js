import Snake from './components/Snake.js';
import Fruit from './components/Fruit.js';
import { updateScore } from './components/Score.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const scale = 20;

let snake;
let fruit;
let gameLoop;
let gameState = false;

(function setup() {
    initialScreen();
})();

function initialScreen() {
    ctx.font = '20px "Press Start 2P"';
    ctx.fillStyle = '#212519';
    ctx.textAlign = 'center';
    ctx.fillText('Press any key to start', canvas.width / 2, canvas.height / 2);
}

function gameOverScreen() {
    ctx.font = '20px "Press Start 2P"';
    ctx.fillStyle = '#212519';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    ctx.fillText('Press any key to start', canvas.width / 2, canvas.height / 2 + 60);
}

function startGame() {
    gameState = true;
    updateScore('zero');
    snake = new Snake(canvas, ctx, scale);
    fruit = new Fruit(scale, ctx, canvas);
    snake.draw();
    snake.initiate();

    fruit.pickLocation();

    gameLoop = window.setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        fruit.draw();
        snake.update();
        snake.draw();

        if (snake.x === fruit.x && snake.y === fruit.y) {
            fruit.pickLocation();
            snake.grow();
            updateScore('score');
        }
        if (snake.collide()) {
            clearInterval(gameLoop);
            gameState = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            updateScore('zero');
            gameOverScreen();
        }
    }, 100);
}

window.addEventListener('keydown', evt => {
    if (gameState) {
        const direction = evt.key.replace('Arrow', '');
        evt.stopPropagation();
        evt.preventDefault();
        snake.changeDirection(direction);
    } else {
        clearInterval(gameLoop);
        startGame();
    }
});
