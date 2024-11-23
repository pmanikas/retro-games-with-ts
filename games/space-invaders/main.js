import { SPEED, LEVELS, SPACING } from './config.js';
import { collides } from './utilities/collision.js';

// SERVICES
import MusicService from './services/MusicService.js';

// NODES
import Player from './nodes/Player.js';
import Enemy from './nodes/Enemy.js';
import Particle from './nodes/Particle.js';
import Projectile from './nodes/Projectile.js';

const musicService = new MusicService();

const player = new Player();
const enemies = [];
const projectiles = [];
const particles = [];

let lastTime = 0;
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

}

function updateScore(value) {
    state.score += value;
    els.score.textContent = state.score;
}

function fire() {
    projectiles.push(new Projectile({ x: player.position.x + (player.width / 2), y: player.position.y }));
    musicService.play({ channelType: 'laser' });
}

function animate(time) {
    // const deltaTime = (time - lastTime) / 1000;

    requestAnimationFrame(animate);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, els.canvas.width, els.canvas.height);

    particles.forEach((particle, i) => {
        if(particle.position.y < 0 || particle.position.y > window.innerHeight) return particles.splice(i, 1);

        particle.update(ctx);
    });

    if(time - lastTime >= 30) {
        lastTime = time;
        particles.push(new Particle());
    }

    if(state.currentState !== 'playing') return;

    player.update(ctx);

    enemies.forEach(enemy => {
        enemy.update(ctx);
        let alreadyMoved = false;

        if(!alreadyMoved && (enemy.left <= 0 || enemy.right >= window.innerWidth)) {
            enemies.forEach(item => {
                item.velocity.x *= -1;
                item.position.y += 64;
            });
            alreadyMoved = true;
        }
    });

    projectiles.forEach((projectile, i) => {
        if(projectile.position.y < 0) return projectiles.splice(i, 1);

        projectile.update();
        projectile.draw(ctx);
    });

    if(keys.fire.isPressed) {
        if(state.isFiring) return;
        fire();
        state.isFiring = true;
    }

    if (keys.left.isPressed && player.position.x >= 0) player.velocity.x = -SPEED;
    else if (keys.right.isPressed && player.right <= window.innerWidth) player.velocity.x = SPEED;
    else player.velocity.x = 0;


    // check for collisions
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

    if(player.top <= 0) {
        startLevel(state.currentLevel + 1);
    }
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

    window.addEventListener('resize', setCanvasSize);
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    window.addEventListener('click', clickHandler);
    els.musicSlider.addEventListener('input', e => {
        console.log(e.target.value);

        musicService.setMusicVolume(e.target.value);
    });

    els.sfxSlider.addEventListener('input', e => {
        console.log(e.target.value);

        musicService.setSFXVolume(e.target.value);
        musicService.play({ channelType: 'laser' });
    });

}

addEventListener('DOMContentLoaded', init);
