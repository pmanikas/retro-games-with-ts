import { SCALE, TICK_MS, WIDTH_SIZE, HEIGHT_SIZE } from './config/globals.js';
import { TILE_COLORS, BG_LIGHT_COLOR } from './config/theme.js';
import tiles from './config/tiles.js';
import Player from './nodes/Player.js';
import { getRandomItemFromArray, generateMatrix } from './../utilities/arrays.js';
import MusicService from './services/music.service.js';
import ViewService from './services/view.service.js';

// can be changed to increase difficulty based on elapsed time or score
const DIFFICULTY = 1;

const canvas = document.querySelector('[data-canvas]');
const ctx = canvas.getContext('2d');

const player = new Player();
const musicService = new MusicService();
const viewService = new ViewService();

const state = {
    score: 0,
    level: 0,
    lines: 0,
    isDropping: false,
    currentState: 'start', // start, playing, paused, gameover
};

let arena = null;
let lastTime = 0;
let gravityCounter = 0;

const actions = {
    play() {
        state.score = 0;
        state.level = 0;
        state.lines = 0;
        state.isDropping = false;
        player.tile = getNewTile();
        resetPlayerPosition();
        arena = generateMatrix(canvas.width / SCALE, canvas.height / SCALE);
        updateScore();
        state.currentState = 'playing';
        musicService.playMusic({ track: 'game' });
    },
    pause() {
        state.currentState = 'paused';
    },
    resume() {
        state.currentState = 'playing';
    },
    restart() {
        this.play();
    },
    start () {

        state.currentState = 'start';
        musicService.playMusic({ track: 'game' });
    },
    gameOver () {
        viewService.showView('gameover');
        state.currentState = 'gameover';
        musicService.playMusic({ track: 'game', speed: 0.75 });
    },
};

function getNewTile() {
    return getRandomItemFromArray(tiles);
}

function resetPlayerPosition() {
    player.position = { x: (canvas.width / SCALE / 2) - (Math.floor(player.tile.length / 2)) , y: 0 };
}

function drawGrid({ grid, offset = { x: 0, y: 0 } }) {
    grid.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value) {
                ctx.fillStyle = TILE_COLORS[value - 1] || 'white';
                ctx.strokeStyle = BG_LIGHT_COLOR;
                ctx.lineWidth = 0.05;
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
                ctx.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }

            ctx.strokeStyle = TILE_COLORS[value - 1];
            ctx.lineWidth = 0.001;
            ctx.strokeRect(x + offset.x, y + offset.y, 1, 1);
        });
    });
}

function draw () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid({ grid: arena, offset: { x: 0, y: 0 } });
    drawGrid({ grid: player.tile, offset: player.position });
}

function mergeMatrixToMatrix(matrixFrom, matrixTo) {
    matrixFrom.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value) matrixTo[y + player.position.y][x + player.position.x] = value;
        });
    });
}

function updateScore() {
    document.querySelector('[data-score]').textContent = state.score;
}

function checkForFullRows() {
    let rowCount = 1;
    for(let y = arena.length - 1; y > 0; y--) {
        if(arena[y].every(value => value !== 0)) {
            const row = arena.splice(y, 1)[0].fill(0);
            arena.unshift(row);
            y++;
            state.score += rowCount * 10;
            state.lines += rowCount;
            rowCount *= 2;
            updateScore();
            musicService.playSFX({ track: 'collapse' });
        }
    }
}

function detectCollisions() {
    player.tile.forEach((row, y) => {
        row.forEach((value, x) => {
            try {
                if(value) {
                    // check if the player tile hits the walls
                    if(player.position.x + x < 0 || player.position.x + x >= arena[0].length) {
                        player.position.x -= player.position.x + x < 0 ? -1 : 1;
                    }

                    // check if the player tile hits the floor
                    if(
                        (player.position.y + y >= arena.length) ||
                        (arena[y + player.position.y] && arena[y + player.position.y][x + player.position.x])
                    ) {
                        player.position.y -= 1;
                        mergeMatrixToMatrix(player.tile, arena);
                        player.tile = getNewTile();
                        resetPlayerPosition();
                        checkForFullRows();
                        state.isDropping = false;
                        musicService.playSFX({ track: 'ground' });
                    }
                }
            }
            catch(e) {
                console.log(e);

                actions.gameOver();
            }
        });
    });
}

function animate(time = 0) {
    requestAnimationFrame(animate);

    if(state.currentState !== 'playing') return;

    const deltaTime = time - lastTime;
    lastTime = time;
    gravityCounter += deltaTime;

    if(state.isDropping) {
        player.moveDown();
    }

    if(gravityCounter > (TICK_MS / DIFFICULTY)) {
        player.moveDown();
        gravityCounter = 0;
    }

    detectCollisions();
    draw();
}

function keyUpHandler(e) {
    e.preventDefault();
    switch(e.key) {
    case ' ':
        state.isDropping = false;
        break;
    }
}

function keyDownHandler(e) {
    e.preventDefault();
    switch(e.key) {
    case 'w':
        // FOR TESTING - REMOVE LATER
        player.moveUP();
        musicService.playSFX({ track: 'move' });
        break;
    case 'ArrowLeft':
        player.moveLeft();
        musicService.playSFX({ track: 'move' });
        break;
    case 'ArrowRight':
        player.moveRight();
        musicService.playSFX({ track: 'move' });
        break;
    case 'ArrowDown':
        player.moveDown();
        musicService.playSFX({ track: 'move' });
        break;
    case ' ':
        state.isDropping = true;
        break;
    case 'ArrowUp':
        player.rotate();
        break;
    }
}

function clickHandler({ target }) {
    if(!musicService.isCurrentlyPlaying) {
        musicService.playMusic({ track: 'game', loop: true });
    }

    const view = target.dataset.button ? target.dataset.button : '';
    if(view) viewService.showView(view);

    const action = target.dataset.action ? target.dataset.action : '';
    if(!action) return;
    if(!actions[action]) throw new Error(`Action does not exist: ${action}`);
    actions[action]();
}

function init () {
    canvas.width = SCALE * WIDTH_SIZE;
    canvas.height = SCALE * HEIGHT_SIZE;

    ctx.scale(SCALE, SCALE);

    viewService.showView('start');

    player.tile = getNewTile();
    resetPlayerPosition();
    arena = generateMatrix(canvas.width / SCALE, canvas.height / SCALE);

    animate();

    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    window.addEventListener('click', clickHandler);
}

addEventListener('DOMContentLoaded', init);
