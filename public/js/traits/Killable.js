import Trait from '../Trait.js';

export default class Killable extends Trait {
    constructor() {
        super();
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
                    
                    // --- CUSTOM LEADERBOARD CODE ---
                    // 1. Check if the entity that just died is Mario
                    if (window.mario === entity) {
                        let finalScore = 0;
                        
                        // 2. Loop through his traits to find the 'Player' trait score
                        entity.traits.forEach(trait => {
                            if (trait.score !== undefined) {
                                finalScore = trait.score;
                            }
                        });
                        
                        // 3. Send the message out to the React Website!
                        window.parent.postMessage({ type: 'MARIO_GAME_OVER', score: finalScore }, '*');
                    }
                    // --------------------------------
                });
            }
        }
    }

