import {Trait} from '../Entity.js';

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

    revive() {
        this.dead = false;
        this.deadTime = 0;
    }

    update(entity, {deltaTime}, level) {
        if (this.dead) {
            this.deadTime += deltaTime;
            if (this.deadTime > this.removeAfter) {
                this.queue(() => {
                    level.entities.delete(entity);
                    
                    // --- LEADERBOARD TRIGGER ---
                    if (window.mario === entity) {
                        let finalScore = 0;
                        entity.traits.forEach(trait => {
                            if (trait.score !== undefined) {
                                finalScore = trait.score;
                            }
                        });
                        // Notify the main website that Mario died
                        window.parent.postMessage({ type: 'MARIO_GAME_OVER', score: finalScore }, '*');
                    }
                });
            }
        }
    }
}
