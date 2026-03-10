import Keyboard from './KeyboardState.js';
import InputRouter from './InputRouter.js';
import Jump from './traits/Jump.js';
import PipeTraveller from './traits/PipeTraveller.js';
import Go from './traits/Go.js';

export function setupKeyboard(window) {
    const input = new Keyboard();
    const router = new InputRouter();

    input.listenTo(window);

    // STOP PAGE SCROLLING: Prevents Arrow keys and Space from moving the website
    const preventDefaultKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
    window.addEventListener('keydown', e => {
        if (preventDefaultKeys.includes(e.key)) e.preventDefault();
    });

    // --- JUMPING (Space or Arrow Up) ---
    const jumpAction = keyState => {
        if (keyState) {
            router.route(entity => entity.traits.get(Jump).start());
        } else {
            router.route(entity => entity.traits.get(Jump).cancel());
        }
    };
    input.addMapping('Space', jumpAction);
    input.addMapping('ArrowUp', jumpAction);

    // --- MOVEMENT (Arrows or WASD) ---
    input.addMapping('ArrowRight', keyState => {
        router.route(entity => {
            entity.traits.get(Go).dir += keyState ? 1 : -1;
            entity.traits.get(PipeTraveller).direction.x += keyState ? 1 : -1;
        });
    });
    input.addMapping('KeyD', keyState => {
        router.route(entity => {
            entity.traits.get(Go).dir += keyState ? 1 : -1;
            entity.traits.get(PipeTraveller).direction.x += keyState ? 1 : -1;
        });
    });

    input.addMapping('ArrowLeft', keyState => {
        router.route(entity => {
            entity.traits.get(Go).dir += keyState ? -1 : 1;
            entity.traits.get(PipeTraveller).direction.x += keyState ? -1 : 1;
        });
    });
    input.addMapping('KeyA', keyState => {
        router.route(entity => {
            entity.traits.get(Go).dir += keyState ? -1 : 1;
            entity.traits.get(PipeTraveller).direction.x += keyState ? -1 : 1;
        });
    });

    // --- PIPE TRAVELLING (Down Arrow or S) ---
    const downAction = keyState => {
        router.route(entity => {
            entity.traits.get(PipeTraveller).direction.y += keyState ? 1 : -1;
        });
    };
    input.addMapping('ArrowDown', downAction);
    input.addMapping('KeyS', downAction);

    // Turbo/Run button (Shift or O)
    input.addMapping('ShiftLeft', keyState => {
        router.route(entity => entity.turbo(keyState));
    });
    input.addMapping('KeyO', keyState => {
        router.route(entity => entity.turbo(keyState));
    });

    return router;
}
