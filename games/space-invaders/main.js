import { SPEED, LEVELS, SPACING } from './config.js';
import { collides } from './utilities/collision.js';

// SERVICES
import MusicService from './services/MusicService.js';

// NODES
import Player from './nodes/Player.js';
import Enemy from './nodes/Enemy.js';
import Particle from './nodes/Particle.js';
import Projectile from './nodes/Projectile.js';
import { getRandomFromRange } from './utilities/numbers.js';

const musicService = new MusicService();

const player = new Player();
const enemies = [];
const projectiles = [];
const enemyProjectiles = [];
const particles = [];

let ctx = null;

const els = {
    startGUI: document.querySelector('[data-start-GUI]'),
    startButton: document.querySelector('[data-start-button]'),
    topGUI: document.querySelector('[data-top-GUI]'),
    score: document.querySelector('[data-score]'),
    lives: document.querySelector('[data-lives]'),
    canvas: document.querySelector('[data-canvas]'),
    pauseGUI: document.querySelector('[data-pause-GUI]'),
    resumeButton: document.querySelector('[data-resume-button]'),
    exitButton: document.querySelector('[data-exit-button]'),
    optonsGui: document.querySelector('[data-options-GUI]'),
    backButton: document.querySelector('[data-back-button]'),
    optionsButton: document.querySelector('[data-options-button]'),
    musicSlider: document.querySelector('[data-music-volume-slider]'),
    sfxSlider: document.querySelector('[data-sfx-volume-slider]'),
    gameOverGUI: document.querySelector('[data-game-over-GUI]'),
    playAgainButton: document.querySelector('[data-play-again-button]'),
};

const times = {
    particles: 0,
    enemiesFire: 0,
};

const state = {
    score: 0,
    lives: 3,
    isFiring: false,
    currentLevel: 1,
    currentState: 'start', // start, playing, paused, gameover
};

const keys = {
    left: {
        isPressed: false,
    },
    right: {
        isPressed: false,
    },
    fire: {
        isPressed: false,
    },
};

function keyDownHandler({ key }) {
    if(!musicService.isPlaying({ channelType: 'music' })) {
        musicService.play({ channelType: 'music', loop: true });
    }

    switch (key) {
    case 'ArrowLeft':
        keys.left.isPressed = true;
        break;
    case 'ArrowRight':
        keys.right.isPressed = true;
        break;
    case ' ':
        keys.fire.isPressed = true;
        break;
    }
}

function keyUpHandler({ key }) {
    switch (key) {
    case 'ArrowLeft':
        keys.left.isPressed = false;
        break;
    case 'ArrowRight':
        keys.right.isPressed = false;
        break;
    case ' ':
        keys.fire.isPressed = false;
        state.isFiring = false;
        break;
    case 'Escape':
        if(state.currentState === 'playing') {
            state.currentState = 'paused';
            els.pauseGUI?.classList.remove('hidden');
            musicService.play({ channelType: 'gui' });
        }
        else if(state.currentState === 'paused') {
            state.currentState = 'playing';
            els.pauseGUI?.classList.add('hidden');
            musicService.play({ channelType: 'gui' });
        }
        break;
    }
}

function clickHandler(e) {
    if(!musicService.isPlaying({ channelType: 'music' })) {
        musicService.play({ channelType: 'music', loop: true });
    }

    if(e.target === els.startButton) {
        els.startGUI?.classList.add('hidden');
        els.topGUI?.classList.remove('hidden');
        state.currentState = 'playing';
        musicService.play({ channelType: 'gui' });
        startGame();
    }

    else if(e.target === els.resumeButton) {
        els.pauseGUI?.classList.add('hidden');
        state.currentState = 'playing';
        musicService.play({ channelType: 'gui' });
    }

    else if(e.target === els.exitButton) {
        els.pauseGUI?.classList.add('hidden');
        els.topGUI?.classList.add('hidden');
        els.startGUI?.classList.remove('hidden');
        state.currentState = 'start';
        musicService.play({ channelType: 'gui' });
    }

    else if(e.target === els.backButton) {
        els.optonsGui?.classList.add('hidden');
        els.startGUI?.classList.remove('hidden');
        state.currentState = 'start';
        musicService.play({ channelType: 'gui' });
    }

    else if(e.target === els.optionsButton) {
        els.startGUI?.classList.add('hidden');
        els.optonsGui?.classList.remove('hidden');
        musicService.play({ channelType: 'gui' });
    }

    else if(e.target === els.playAgainButton) {
        els.gameOverGUI?.classList.add('hidden');
        els.topGUI?.classList.remove('hidden');
        state.currentState = 'playing';
        musicService.play({ channelType: 'gui' });
        startGame();
    }
}

function updateScore(value) {
    state.score += value;
    els.score.textContent = state.score;
}

function fire() {
    const position = { x: player.position.x + (player.width / 2), y: player.position.y };
    const velocity = { x: 0, y: -10 };
    projectiles.push(new Projectile({ position, velocity }));
    musicService.play({ channelType: 'laser' });
}

function enemyFire(enemy) {
    if(!enemy) return;
    const position = { x: enemy.position.x + (enemy.width / 2), y: enemy.position.y + enemy.height };
    const velocity = { x: 0, y: 10 };
    enemyProjectiles.push(new Projectile({ position, velocity, color: 'lightgreen' }));
    musicService.play({ channelType: 'laser' });
}

function animate(time) {
    // const deltaTime = (time - lastTime) / 1000;

    requestAnimationFrame(animate);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, els.canvas.width, els.canvas.height);

    particles.forEach((particle, i) => {
        if(particle.position.y < 0 || particle.position.y > els.canvas.height) return particles.splice(i, 1);

        particle.update(ctx);
    });

    if(time - times.particles >= 30) {
        times.particles = time;
        particles.push(new Particle());
    }

    if(state.currentState !== 'playing') return;

    player.update(ctx);

    if(time - times.enemiesFire >= getRandomFromRange(1500, 3000)) {
        const randomIndex = Math.floor(Math.random() * enemies.length);
        enemyFire(enemies[randomIndex]);
        times.enemiesFire = time;
    }

    enemies.forEach(enemy => {
        enemy.update(ctx);
        let alreadyMoved = false;

        if(!alreadyMoved && (enemy.left <= 0 || enemy.right >= els.canvas.width)) {
            enemies.forEach(item => {
                item.velocity.x *= -1;
                item.position.y += 64;
            });
            alreadyMoved = true;
        }
    });

    projectiles.forEach((projectile, i) => {
        if(projectile.position.y < 0) return projectiles.splice(i, 1);
        projectile.update(ctx);
    });

    enemyProjectiles.forEach((projectile, i) => {
        if(projectile.position.y > els.canvas.height) return enemyProjectiles.splice(i, 1);
        projectile.update(ctx);
    });

    if(keys.fire.isPressed) {
        if(state.isFiring) return;
        fire();
        state.isFiring = true;
    }

    if (keys.left.isPressed && player.position.x >= 0) player.velocity.x = -SPEED;
    else if (keys.right.isPressed && player.right <= els.canvas.width) player.velocity.x = SPEED;
    else player.velocity.x = 0;

    enemies.forEach((enemy, i) => {
        projectiles.forEach((projectile, j) => {
            if(collides(enemy, projectile)) {
                enemies.splice(i, 1);
                musicService.play({ channelType: 'enemyDeath' });
                projectiles.splice(j, 1);
                updateScore(1);
                if(enemies.length === 0) {
                    player.velocity.y = -10;
                    musicService.play({ channelType: 'nextLevel', speed: 2 });
                }
            }
        });
    });

    enemyProjectiles.forEach((projectile, i) => {
        if(collides(player, projectile)) {
            enemyProjectiles.splice(i, 1);
            state.lives -= 1;
            els.lives.textContent = state.lives;
            musicService.play({ channelType: 'playerHit' });
            if(state.lives <= 0) gameOverHandler();
        }
    });

    if(player.top <= 0) {
        startLevel(state.currentLevel + 1);
    }
}

function gameOverHandler() {
    state.currentState = 'gameover';
    els.topGUI?.classList.add('hidden');
    els.gameOverGUI?.classList.remove('hidden');
    musicService.play({ channelType: 'gameOver' });
}

function setCanvasSize() {
    els.canvas.width = window.innerWidth;
    els.canvas.height = window.innerHeight;
}

function startLevel(level = 1) {
    player.reset();

    state.currentLevel = level;

    enemies.length = 0;
    projectiles.length = 0;

    const cols = LEVELS[level]?.enemies?.columns;
    const rows = LEVELS[level]?.enemies?.rows;
    const speed = LEVELS[level]?.enemies?.speed;

    const particlesCount = LEVELS[level]?.particles?.count;

    const enemySize = 64 + SPACING;

    for (let x = 1; x <= cols; x++) {
        for (let y = 1; y <= rows; y++) {
            enemies.push(new Enemy({
                position: { x: x * enemySize, y: y * enemySize },
                velocity: { x: speed, y: 0 },
            }));
        }
    }

    for (let i = 0; i < particlesCount; i++) {
        particles.push(new Particle());
    }
}

function startGame() {
    state.score = 0;
    state.lives = 3;
    state.currentLevel = 1;
    els.score.textContent = state.score;
    els.lives.textContent = state.lives;
    startLevel(state.currentLevel);
}

function init() {
    if(!els.canvas) return console.error('Canvas element not found');
    ctx = els.canvas.getContext('2d');

    if(!musicService.isPlaying({ channelType: 'music' })) {
        musicService.play({ channelType: 'music', loop: true });
    }

    setCanvasSize();
    animate();

    addEventListener('resize', setCanvasSize);
    addEventListener('keydown', keyDownHandler);
    addEventListener('keyup', keyUpHandler);
    addEventListener('click', clickHandler);

    els.musicSlider.addEventListener('input', e => {
        musicService.setMusicVolume(e.target.value);
    });

    els.sfxSlider.addEventListener('input', e => {
        musicService.setSFXVolume(e.target.value);
        musicService.play({ channelType: 'laser' });
    });

}

addEventListener('DOMContentLoaded', init);
