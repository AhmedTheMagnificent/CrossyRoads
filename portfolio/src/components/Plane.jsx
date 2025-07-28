import { useEffect, useRef } from 'react';
import { Physics, RigidBody } from '@react-three/rapier';


export default function Plane() {
    return (
        <Physics>
            <RigidBody type="fixed" colliders="cuboid" >
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.6, 0]} >
                    <planeGeometry args={[100, 100]} />
                    <meshBasicMaterial color="#8CAC2C" />
                </mesh>
            </RigidBody>
        </Physics>
    )
}