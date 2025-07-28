import { useEffect } from "react";
import { useGame } from '../stores/useControls';

const keyActionMap = {
    KeyW: 'forward', ArrowUp: 'forward',
    KeyS: 'backward', ArrowDown: 'backward',
    KeyA: 'left', ArrowLeft: 'left',
    KeyD: 'right', ArrowRight: 'right',
    Space: 'jump',
    KeyB: 'brake',
    ShiftLeft: 'boost', ShiftRight: 'boost'
};

export const KeyboardControls = () => {
    useEffect(() => {
        const handleKey = (event, isPressed) => {
            const action = keyActionMap[event.code];
            if (action) {
                useGame.setState((state) => ({
                    keys: { ...state.keys, [action]: isPressed },
                }));
            }
        };
        const handleKeyDown = (event) => handleKey(event, true);
        const handleKeyUp = (event) => handleKey(event, false);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);
    
    return null;
}
