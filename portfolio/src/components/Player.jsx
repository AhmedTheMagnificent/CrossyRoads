import { useFrame } from "@react-three/fiber";
import { forwardRef, useRef, useEffect } from "react";

const keyboardControls = {
    w: false, a: false, s: false, d: false,
    ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false
};

export const Player = forwardRef((props, ref) => {
    useEffect(() => {
        const handleKeyDown = (e) => (keyboardControls[e.key] = true);
        const handleKeyUp = (e) => (keyboardControls[e.key] = false);
        
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    useFrame((state, delta) => {
        const speed = 5 * delta;
        if(!ref.current) return;

        if(keyboardControls.w || keyboardControls.ArrowUp) ref.current.position.z -= speed;
        if(keyboardControls.a || keyboardControls.ArrowLeft) ref.current.position.x -= speed;
        if(keyboardControls.s || keyboardControls.ArrowDown) ref.current.position.z += speed;
        if(keyboardControls.d || keyboardControls.ArrowRight) ref.current.position.x += speed;

        state.camera.position.x = ref.current.position.x;
        state.camera.position.z = ref.current.position.z + 12;
        state.camera.position.y = 8;
        state.camera.lookAt(ref.current.position);
    });

    return (
        <mesh ref={ref} position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[1, 1, 1]}/>
            <meshStandardMaterial color="mediumpurple" />
        </mesh>
    )
})