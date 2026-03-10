import {loadImage} from '../loaders.js';
import SpriteSheet from '../SpriteSheet.js';

export function loadFont() {
    // REMOVED leading slash: '/img/font.png' -> 'img/font.png'
    return loadImage('img/font.png')
    .then(image => {
        const fontSprite = new SpriteSheet(image, 8, 8);

        const chars = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

        const size = 8;
        const rowLen = image.width;
        for (let [index, char] of [...chars].entries()) {
            const x = index * size % rowLen;
            const y = Math.floor(index * size / rowLen) * size;
            fontSprite.define(char, x, y, size, size);
        }

        return fontSprite;
    });
}