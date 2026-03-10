🍄 Mario Game Repair Pack (Interaction Fix Edition)

Replace the code in these files on GitHub to fix Mario's immortality, the broken blocks, and the debug squares.

1. public/mario-game/js/Entity.js

What it fixes: Exports the Trait class so that all other traits (like Killable, Solid, and Physics) can work. This is why Mario was immortal and blocks weren't reacting.

import {Vec2} from './math.js';
import AudioBoard from './AudioBoard.js';
import BoundingBox from './BoundingBox.js';
import EventBuffer from './EventBuffer.js';
import Trait from './Trait.js';

// --- CRITICAL FIX: Export Trait so other files can find it! ---
export { Trait };

export const Align = {
    center(target, subject) {
        subject.bounds.setCenter(target.bounds.getCenter());
    },
    bottom(target, subject) {
        subject.bounds.bottom = target.bounds.bottom;
    }
};

export const Sides = {
    TOP: Symbol('top'),
    BOTTOM: Symbol('bottom'),
    LEFT: Symbol('left'),
    RIGHT: Symbol('right'),
};

export default class Entity {
    constructor() {
        this.id = null;
        this.audio = new AudioBoard();
        this.events = new EventBuffer();
        this.sounds = new Set();
        this.pos = new Vec2(0, 0);
        this.vel = new Vec2(0, 0);
        this.size = new Vec2(0, 0);
        this.offset = new Vec2(0, 0);
        this.bounds = new BoundingBox(this.pos, this.size, this.offset);
        this.lifetime = 0;
        this.traits = new Map();
    }

    addTrait(trait) {
        this.traits.set(trait.constructor, trait);
    }

    collides(candidate) {
        this.traits.forEach(trait => {
            trait.collides(this, candidate);
        });
    }

    obstruct(side, match) {
        this.traits.forEach(trait => {
            trait.obstruct(this, side, match);
        });
    }

    finalize() {
        this.events.emit(Trait.EVENT_TASK, this);
        this.traits.forEach(trait => {
            trait.finalize(this);
        });
        this.events.clear();
    }

    playSounds(audioBoard, audioContext) {
        this.sounds.forEach(name => {
            audioBoard.playAudio(name, audioContext);
        });
        this.sounds.clear();
    }

    update(gameContext, level) {
        this.traits.forEach(trait => {
            trait.update(this, gameContext, level);
        });
        this.playSounds(this.audio, gameContext.audioContext);
        this.lifetime += gameContext.deltaTime;
    }
}


2. public/mario-game/js/traits/Killable.js

What it fixes: Connects to the new export in Entity.js. This allows the game to register when Mario hits an enemy.

import { Trait } from '../Entity.js';

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


3. public/mario-game/js/main.js

What it fixes: Removes the red and blue "Strange Squares" (debug boxes).

Instruction: Find the line level.comp.layers.push(createCollisionLayer(level)); (usually near line 80-100) and add // to the front of it.

// FIND THIS LINE IN main.js AND ADD // AT THE START:
// level.comp.layers.push(createCollisionLayer(level));
