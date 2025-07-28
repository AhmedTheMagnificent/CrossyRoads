import * as RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Vehicle } from './Vehicle';
import Plane from './Plane';
import { Bush } from './Bush';

const FollowCamera = ({ vehicleRef }) => {
    useFrame((state) => {
        if (!vehicleRef.current) return;

        const vehiclePosition = new THREE.Vector3();
        const vehicleQuaternion = new THREE.Quaternion();

        vehicleRef.current.getWorldPosition(vehiclePosition);
        vehicleRef.current.getWorldQuaternion(vehicleQuaternion);

        const idealOffset = new THREE.Vector3(-15, 8, 0);
        idealOffset.applyQuaternion(vehicleQuaternion);
        idealOffset.add(vehiclePosition);

        state.camera.position.lerp(idealOffset, 0.05);
        state.camera.lookAt(vehiclePosition);
    });

    return null;
};

export default function World() {
    const vehicleRef = useRef();
    const [world, setWorld] = useState(null);
    const [queryPipeline, setQueryPipeline] = useState(null);

    useEffect(() => {
        const init = async () => {
            await RAPIER.init();
            const gravity = new RAPIER.Vector3(0, -9.81, 0);
            const newWorld = new RAPIER.World(gravity);
            setWorld(newWorld);
            setQueryPipeline(true);
        };
        init();
    }, []);

    useFrame(() => {
        if (world) {
            world.step();
        }
    });

    if (!world || !queryPipeline) return null;

    return (
        <>
            <Plane />
            <Bush />
        </>
    );
}
