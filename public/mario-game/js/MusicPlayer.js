export default class MusicPlayer {
    constructor() {
        this.tracks = new Map();
    }

    addTrack(name, url) {
        const audio = new Audio();
        audio.loop = true;
        // Logic to fix paths if they still have slashes
        audio.src = url.startsWith('/') ? url.substring(1) : url;
        this.tracks.set(name, audio);
    }

    playTrack(name) {
        this.pauseAll();
        const audio = this.tracks.get(name);
        if (audio) {
            // Browsers block audio until a click happens. 
            // This catch prevents the game from crashing if it's blocked.
            audio.play().catch(err => {
                console.warn("Music blocked by browser. Click the game screen to start!");
            });
        }
        return audio;
    }

    pauseAll() {
        for (const audio of this.tracks.values()) {
            audio.pause();
        }
    }
}
