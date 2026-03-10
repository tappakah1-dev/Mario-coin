function fixPath(url) {
    if (typeof url === 'string' && url.startsWith('/')) {
        return url.substring(1);
    }
    return url;
}

export function loadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', () => reject(new Error(`Failed image: ${url}`)));
        image.src = fixPath(url);
    });
}

export function loadJSON(url) {
    return fetch(fixPath(url))
    .then(r => {
        if (!r.ok) throw new Error(`Failed JSON: ${url}`);
        return r.json();
    });
}
