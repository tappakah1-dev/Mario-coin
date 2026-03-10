import {loadJSON} from '../loaders.js';
import MusicPlayer from '../MusicPlayer.js';

export function loadMusicSheet(name) {
    return loadJSON(`music/${name}.json`)
        .then(musicSheet => {
            const musicPlayer = new MusicPlayer();
            for (const [name, track] of Object.entries(musicSheet)) {
                // Remove the leading slash so it stays in the mario-game folder
                const url = track.url.startsWith('/') ? track.url.substring(1) : track.url;
                musicPlayer.addTrack(name, url);
            }
            return musicPlayer;
        });
}
