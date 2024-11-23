import { SPEED, LEVELS, SPACING } from './config.js';
import { collides } from './utilities/collision.js';
import MusicService from './services/MusicService.js';
import Player from './nodes/Player.js';
import Enemy from './nodes/Enemy.js';
import Particle from './nodes/Particle.js';
import Projectile from './nodes/Projectile.js';

const GameState = {
    START: 'start',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameover'
};

class GameEngine {
    constructor() {
        this.state = {
            current: GameState.START,
            score: 0,
            lives: 3,
            isFiring: false,
            currentLevel: 1
        };

        this.entities = {
            player: new Player(),
            enemies: [],
            projectiles: [],
            enemyProjectiles: [],
            particles: []
        };

        this.timers = {
            particles: 0,
            enemiesFire: 0
        };

        this.keys = {
            left: { isPressed: false },
            right: { isPressed: false },
            fire: { isPressed: false }
        };

        this.musicService = new MusicService();
        this.ctx = null;
        this.els = this.initializeElements();

        this.boundHandleKeyDown = this.handleKeyDown.bind(this);
        this.boundHandleKeyUp = this.handleKeyUp.bind(this);
        this.boundHandleClick = this.handleClick.bind(this);
        this.boundHandleResize = this.setCanvasSize.bind(this);
    }

    initializeElements() {
        const elements = [
            'startGUI', 'startButton', 'topGUI', 'score', 'lives',
            'canvas', 'pauseGUI', 'resumeButton', 'exitButton',
            'optonsGui', 'backButton', 'optionsButton',
            'musicSlider', 'sfxSlider', 'gameOverGUI', 'playAgainButton'
        ];

        return elements.reduce((acc, el) => ({
            ...acc,
            [el]: document.querySelector(`[data-${el.toLowerCase()}]`)
        }), {});
    }

    handleKeyDown(event) {
        if (!this.musicService.isPlaying({ channelType: 'music' })) {
            this.musicService.play({ channelType: 'music', loop: true });
        }

        switch (event.key) {
        case 'ArrowLeft':
            this.keys.left.isPressed = true;
            break;
        case 'ArrowRight':
            this.keys.right.isPressed = true;
            break;
        case ' ':
            this.keys.fire.isPressed = true;
            break;
        }
    }

    handleKeyUp(event) {
        switch (event.key) {
        case 'ArrowLeft':
            this.keys.left.isPressed = false;
            break;
        case 'ArrowRight':
            this.keys.right.isPressed = false;
            break;
        case ' ':
            this.keys.fire.isPressed = false;
            this.state.isFiring = false;
            break;
        case 'Escape':
            this.togglePause();
            break;
        }
    }

    handleClick(e) {
        if (!this.musicService.isPlaying({ channelType: 'music' })) {
            this.musicService.play({ channelType: 'music', loop: true });
        }

        const clickHandlers = {
            startButton: () => {
                this.els.startGUI?.classList.add('hidden');
                this.els.topGUI?.classList.remove('hidden');
                this.setState(GameState.PLAYING);
                this.musicService.play({ channelType: 'gui' });
                this.startGame();
            },
            resumeButton: () => {
                this.els.pauseGUI?.classList.add('hidden');
                this.setState(GameState.PLAYING);
                this.musicService.play({ channelType: 'gui' });
            },
            exitButton: () => {
                this.els.pauseGUI?.classList.add('hidden');
                this.els.topGUI?.classList.add('hidden');
                this.els.startGUI?.classList.remove('hidden');
                this.setState(GameState.START);
                this.musicService.play({ channelType: 'gui' });
            },
            backButton: () => {
                this.els.optonsGui?.classList.add('hidden');
                this.els.startGUI?.classList.remove('hidden');
                this.setState(GameState.START);
                this.musicService.play({ channelType: 'gui' });
            },
            optionsButton: () => {
                this.els.startGUI?.classList.add('hidden');
                this.els.optonsGui?.classList.remove('hidden');
                this.musicService.play({ channelType: 'gui' });
            },
            playAgainButton: () => {
                this.els.gameOverGUI?.classList.add('hidden');
                this.els.topGUI?.classList.remove('hidden');
                this.setState(GameState.PLAYING);
                this.musicService.play({ channelType: 'gui' });
                this.startGame();
            }
        };

        const buttonType = Object.keys(clickHandlers).find(key =>
            e.target === this.els[key]
        );

        if (buttonType) {
            clickHandlers[buttonType]();
        }
    }

    togglePause() {
        if (this.state.current === GameState.PLAYING) {
            this.setState(GameState.PAUSED);
            this.els.pauseGUI?.classList.remove('hidden');
        } else if (this.state.current === GameState.PAUSED) {
            this.setState(GameState.PLAYING);
            this.els.pauseGUI?.classList.add('hidden');
        }
        this.musicService.play({ channelType: 'gui' });
    }

    setState(newState) {
        this.state.current = newState;
    }

    updateScore(value) {
        this.state.score += value;
        this.els.score.textContent = this.state.score;
    }

    fire() {
        const { player } = this.entities;
        const position = {
            x: player.position.x + (player.width / 2),
            y: player.position.y
        };

        this.entities.projectiles.push(
            new Projectile({
                position,
                velocity: { x: 0, y: -10 }
            })
        );

        this.musicService.play({ channelType: 'laser' });
    }

    enemyFire(enemy) {
        if (!enemy) return;

        const position = {
            x: enemy.position.x + (enemy.width / 2),
            y: enemy.position.y + enemy.height
        };

        this.entities.enemyProjectiles.push(
            new Projectile({
                position,
                velocity: { x: 0, y: 10 },
                color: 'lightgreen'
            })
        );

        this.musicService.play({ channelType: 'laser' });
    }

    animate(time) {
        requestAnimationFrame(this.animate.bind(this));

        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.els.canvas.width, this.els.canvas.height);

        this.updateParticles(time);

        if (this.state.current !== GameState.PLAYING) return;

        this.updateGameEntities(time);
        this.handleMovement();
        this.checkCollisions();
    }

    updateParticles(time) {
        const { particles } = this.entities;

        particles.forEach((particle, i) => {
            if (particle.position.y < 0 || particle.position.y > window.innerHeight) {
                particles.splice(i, 1);
                return;
            }
            particle.update(this.ctx);
        });

        if (time - this.timers.particles >= 30) {
            this.timers.particles = time;
            particles.push(new Particle());
        }
    }

    updateGameEntities(time) {
        const { player, enemies, projectiles, enemyProjectiles } = this.entities;

        player.update(this.ctx);

        // Enemy firing logic
        if (time - this.timers.enemiesFire >= 2000) {
            const randomIndex = Math.floor(Math.random() * enemies.length);
            this.enemyFire(enemies[randomIndex]);
            this.timers.enemiesFire = time;
        }

        // Update enemies
        let alreadyMoved = false;
        enemies.forEach(enemy => {
            enemy.update(this.ctx);

            if (!alreadyMoved && (enemy.left <= 0 || enemy.right >= window.innerWidth)) {
                enemies.forEach(item => {
                    item.velocity.x *= -1;
                    item.position.y += 64;
                });
                alreadyMoved = true;
            }
        });

        // Update projectiles
        projectiles.forEach((projectile, i) => {
            if (projectile.position.y < 0) {
                projectiles.splice(i, 1);
                return;
            }
            projectile.update(this.ctx);
        });

        enemyProjectiles.forEach((projectile, i) => {
            if (projectile.position.y > window.innerHeight) {
                enemyProjectiles.splice(i, 1);
                return;
            }
            projectile.update(this.ctx);
        });
    }

    handleMovement() {
        const { player } = this.entities;

        if (this.keys.fire.isPressed && !this.state.isFiring) {
            this.fire();
            this.state.isFiring = true;
        }

        if (this.keys.left.isPressed && player.position.x >= 0) {
            player.velocity.x = -SPEED;
        } else if (this.keys.right.isPressed && player.right <= window.innerWidth) {
            player.velocity.x = SPEED;
        } else {
            player.velocity.x = 0;
        }

        if (player.top <= 0) {
            this.startLevel(this.state.currentLevel + 1);
        }
    }

    checkCollisions() {
        this.checkProjectileCollisions();
        this.checkPlayerCollisions();
    }

    checkProjectileCollisions() {
        const { enemies, projectiles } = this.entities;

        enemies.forEach((enemy, i) => {
            projectiles.forEach((projectile, j) => {
                if (collides(enemy, projectile)) {
                    enemies.splice(i, 1);
                    projectiles.splice(j, 1);
                    this.musicService.play({ channelType: 'enemyDeath' });
                    this.updateScore(1);

                    if (enemies.length === 0) {
                        this.entities.player.velocity.y = -10;
                        this.musicService.play({ channelType: 'nextLevel', speed: 2 });
                    }
                }
            });
        });
    }

    checkPlayerCollisions() {
        const { player, enemyProjectiles } = this.entities;

        enemyProjectiles.forEach((projectile, i) => {
            if (collides(player, projectile)) {
                enemyProjectiles.splice(i, 1);
                this.state.lives -= 1;
                this.els.lives.textContent = this.state.lives;
                this.musicService.play({ channelType: 'playerHit' });

                if (this.state.lives <= 0) {
                    this.gameOver();
                }
            }
        });
    }

    gameOver() {
        this.setState(GameState.GAME_OVER);
        this.els.topGUI?.classList.add('hidden');
        this.els.gameOverGUI?.classList.remove('hidden');
        this.musicService.play({ channelType: 'gameOver' });
    }

    setCanvasSize() {
        this.els.canvas.width = window.innerWidth;
        this.els.canvas.height = window.innerHeight;
    }

    startLevel(level = 1) {
        this.entities.player.reset();
        this.state.currentLevel = level;

        this.entities.enemies.length = 0;
        this.entities.projectiles.length = 0;

        const { columns: cols, rows, speed } = LEVELS[level]?.enemies || {};
        const particlesCount = LEVELS[level]?.particles?.count;
        const enemySize = 64 + SPACING;

        // Create enemies grid
        for (let x = 1; x <= cols; x++) {
            for (let y = 1; y <= rows; y++) {
                this.entities.enemies.push(
                    new Enemy({
                        position: { x: x * enemySize, y: y * enemySize },
                        velocity: { x: speed, y: 0 },
                    })
                );
            }
        }

        // Initialize particles
        for (let i = 0; i < particlesCount; i++) {
            this.entities.particles.push(new Particle());
        }
    }

    startGame() {
        this.state.score = 0;
        this.state.lives = 3;
        this.state.currentLevel = 1;
        this.els.score.textContent = this.state.score;
        this.els.lives.textContent = this.state.lives;
        this.startLevel(this.state.currentLevel);
    }

    init() {
        if (!this.els.canvas) {
            console.error('Canvas element not found');
            return;
        }

        this.ctx = this.els.canvas.getContext('2d');

        if (!this.musicService.isPlaying({ channelType: 'music' })) {
            this.musicService.play({ channelType: 'music', loop: true });
        }

        this.setCanvasSize();
        this.attachEventListeners();
        this.animate(0);
    }

    attachEventListeners() {
        window.addEventListener('resize', this.boundHandleResize);
        window.addEventListener('keydown', this.boundHandleKeyDown);
        window.addEventListener('keyup', this.boundHandleKeyUp);
        window.addEventListener('click', this.boundHandleClick);

        this.els.musicSlider.addEventListener('input',
            e => this.musicService.setMusicVolume(e.target.value)
        );

        this.els.sfxSlider.addEventListener('input', e => {
            this.musicService.setSFXVolume(e.target.value);
            this.musicService.play({ channelType: 'laser' });
        });
    }

    cleanup() {
        window.removeEventListener('resize', this.boundHandleResize);
        window.removeEventListener('keydown', this.boundHandleKeyDown);
        window.removeEventListener('keyup', this.boundHandleKeyUp);
        window.removeEventListener('click', this.boundHandleClick);
    }
}

// Initialize game when DOM is ready
addEventListener('DOMContentLoaded', () => {
    const game = new GameEngine();
    game.init();
});
