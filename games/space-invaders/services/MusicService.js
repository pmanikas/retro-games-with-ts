export default class MusicService {
    tracks = {
        music: './assets/sounds/spaceship-travelling.mp3',
        laser: './assets/sounds/laser-shoot.wav',
        enemyDeath: './assets/sounds/enemy-death.wav',
        nextLevel: './assets/sounds/next-level.mp3',
        gui: './assets/sounds/gui.wav',
        start: './assets/sounds/start.wav',

    };

    channels = {
        music: new Audio(this.tracks.music),
        laser: new Audio(this.tracks.laser),
        enemyDeath: new Audio(this.tracks.enemyDeath),
        nextLevel: new Audio(this.tracks.nextLevel),
        gui: new Audio(this.tracks.gui),
        start: new Audio(this.tracks.start),
    };

    musicVolume = 0.5;
    sfxVolume = 0.5;

    constructor() {}

    play({ channelType, loop = false, speed = 1 }) {
        const channel = this.channels[channelType];
        channel.currentTime = 0;
        channel.loop = loop;
        channel.volume = channelType === 'music' ? this.musicVolume : this.sfxVolume;
        channel.playbackRate = speed;
        channel.play();
    }

    pause({ channelType }) {
        this.channels[channelType].pause();
    }

    stop({ channelType }) {
        this.channels[channelType].pause();
        this.channels[channelType].currentTime = 0;
    }

    isPlaying({ channelType }) {
        return !this.channels[channelType].paused;
    }

    setMusicVolume(volume) {
        this.musicVolume = volume;
        this.channels.music.volume = volume;
    }

    setSFXVolume(volume) {
        this.sfxVolume = volume;
    }
}
