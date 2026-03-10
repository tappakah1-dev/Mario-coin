import AudioBoard from '../AudioBoard.js';
import {loadJSON} from '../loaders.js';

export function loadAudioBoard(name, audioContext) {
    const loadAudio = createAudioLoader(audioContext);
    return loadJSON(`sounds/${name}.json`)
        .then(audioSheet => {
            const audioBoard = new AudioBoard();
            const fx = audioSheet.fx;
            return Promise.all(Object.keys(fx).map(name => {
                return loadAudio(fx[name].url)
                    .then(buffer => {
                        audioBoard.addAudio(name, buffer);
                    });
            }))
            .then(() => audioBoard);
        });
}

export function createAudioLoader(context) {
    return function loadAudio(url) {
        // Remove slash so it doesn't look at root domain
        const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
        return fetch(cleanUrl)
           .then(r => r.arrayBuffer())
           .then(buffer => context.decodeAudioData(buffer));
    }
}
