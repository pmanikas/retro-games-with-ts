import MusicService from './MusicService.js';

export default class GUIService {
    static instance;

    GUIS = {
        game: document.querySelector('[data-game-GUI]'),
        start: document.querySelector('[data-start-GUI]'),
        pause: document.querySelector('[data-pause-GUI]'),
        options: document.querySelector('[data-options-GUI]'),
        gameOver: document.querySelector('[data-game-over-GUI]'),
        credits: document.querySelector('[data-credits-GUI]'),
    };

    previousGuis = null;
    currentGuis = null;

    musicService = new MusicService();

    constructor() {
        if(GUIService.instance) return GUIService.instance;
        GUIService.instance = this;
    }

    hideAllGUIs() {
        Object.values(this.GUIS).forEach(GUI => GUI?.classList.add('hidden'));
    }

    // supports multiple GUIs as an array or a single GUI as a string
    selectGUIs(guis) {
        if(this.currentGuis === guis) return;

        this.previousGuis = JSON.parse(JSON.stringify(this.currentGuis));

        this.currentGuis = JSON.parse(JSON.stringify(guis));

        console.log('Previous GUIs:', this.previousGuis);
        console.log('Current GUIs:', this.currentGuis);


        this.hideAllGUIs();

        if(typeof guis === 'string') this.GUIS[guis]?.classList.remove('hidden');
        else guis.forEach(gui => this.GUIS[gui]?.classList.remove('hidden'));

        this.musicService.play({ channelType: 'gui' });
    }

    goBack() {
        if(!this.previousGuis) return;
        this.selectGUIs(this.previousGuis);
    }
}
