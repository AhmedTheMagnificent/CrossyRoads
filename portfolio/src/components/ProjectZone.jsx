import { Box } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const zoneBounds = new THREE.Box3();

export function ProjectZone({ position, color="gold", size=[3, 0.2, 3], onCollide, playerRef }){
    useFrame(() => {
        if(!playerRef.current) return;

        const playerPosition = playerRef.current.position;
        const playerBounds = new THREE.Box3().setFromCenterAndSize(
            playerPosition,
            new THREE.Vector3(0.5, 0.5, 0.5)
        );
        zoneBounds.setFromCenterAndSize(
            new THREE.Vector3(...position),
            new THREE.Vector3(...size),
        )

        if(playerBounds.intersectsBox(zoneBounds)){
            onCollide();
        }
    });
    return (
        <Box position={position} args={size}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
        </Box>
    );
}

