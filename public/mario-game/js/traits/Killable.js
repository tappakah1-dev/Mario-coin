import Trait from '../Trait.js';

export default class Killable extends Trait {
    constructor() {
        super('killable');
        this.dead = false;
        this.deadTime = 0;
        this.removeAfter = 2;
    }

    kill() {
        this.queue(() => this.dead = true);
    }

    update(entity, {deltaTime}, level) {
        if (this.dead) {
            this.deadTime += deltaTime;
            if (this.deadTime > this.removeAfter) {
                this.queue(() => {
                    level.entities.delete(entity);
                    if (window.mario === entity) {
                        let finalScore = 0;
                        entity.traits.forEach(t => { if (t.score !== undefined) finalScore = t.score; });
                        window.parent.postMessage({ type: 'MARIO_GAME_OVER', score: finalScore }, '*');
                    }
                });
            }
        }
    }
}
