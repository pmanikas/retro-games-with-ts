class MusicService {
    static instance = null;

    #tracks = {
        music: {
            game: './assets/sounds/tetris-reversed.mp3',
            menu: './assets/sounds/menu.mp3',
        },
        sfx: {
            move: 'assets/sounds/rotate.mp3',
            collapse: 'assets/sounds/collapse.wav',
            ground: 'assets/sounds/ground.wav',
            rotate: 'assets/sounds/move.mp3',
        }
    };

    #channels = {
        music: null,
        sfx: {}
    };

    #musicVolume = 0.5;
    #sfxVolume = 0.5;

    isCurrentlyPlaying = false;

    constructor() {
        if (MusicService.instance) {
            return MusicService.instance;
        }

        this.#initializeChannels();
        MusicService.instance = this;
    }

    #initializeChannels() {
        this.#channels.music = new Audio();
        this.#channels.music.volume = this.#musicVolume;

        for (const key in this.#tracks.sfx) {
            this.#channels.sfx[key] = new Audio();
            this.#channels.sfx[key].src = this.#tracks.sfx[key];
            this.#channels.sfx[key].volume = this.#sfxVolume;
        }
    }

    playMusic({ track, loop = true, speed = 1 }) {
        if (!this.#tracks.music[track]) throw new Error(`Track does not exist: ${track}`);

        if(this.isCurrentlyPlaying) this.stopMusic();

        this.#channels.music.src = this.#tracks.music[track];
        this.#channels.music.loop = loop;
        this.#channels.music.playbackRate = speed;
        this.#channels.music.play();
        this.isCurrentlyPlaying = true;
    }

    stopMusic() {
        this.#channels.music.pause();
        this.isCurrentlyPlaying = false;
    }

    playSFX({ track }) {
        if (!this.#tracks.sfx[track]) throw new Error(`SFX does not exist: ${track}`);

        console.log(this.#channels.sfx[track]);

        this.#channels.sfx[track].currentTime = 0;
        this.#channels.sfx[track].play();
    }

    stopSFX({ track }) {
        if (!this.#tracks.sfx[track]) throw new Error(`SFX does not exist: ${track}`);

        this.#channels.sfx[track].pause();
    }

    setMusicVolume(volume) {
        this.#musicVolume = volume;
        this.#channels.music.volume = volume;
    }

    setSFXVolume(volume) {
        this.#sfxVolume = volume;
        for (const key in this.#channels.sfx) {
            this.#channels.sfx[key].volume = volume;
        }
    }

    stopAll() {
        this.stopMusic();
        for (const key in this.#channels.sfx) {
            this.stopSFX({ sfx: key });
        }
    }
}

export default MusicService;
