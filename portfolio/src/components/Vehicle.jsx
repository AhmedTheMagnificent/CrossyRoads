import { useFrame } from "@react-three/fiber";
import { useRef, useEffect, useMemo, forwardRef } from "react";
import { Box, Cylinder } from "@react-three/drei";
import { useControls } from "../stores/useControls";
import * as RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

const vehicleParams = {
    engineForce: 50,
    brakeForce: 8,
    steering: 0.6,
    jumpForce: 15
};

const Wheel = forwardRef((props, ref) => (
    <group ref={ref}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
            <meshStandardMaterial color="black" />
        </mesh>
    </group>
))

export const Vehicle = forwardRef(({ queryPipeline, world, position = [0, 1, 0] }, ref) => {
    const chassisRef = useRef();
    const wheel1Ref = useRef();
    const wheel2Ref = useRef();
    const wheel3Ref = useRef();
    const wheel4Ref = useRef();
    const wheelRefs = [wheel1Ref, wheel2Ref, wheel3Ref, wheel4Ref];

    const controls = useControls();

    const vehicleController = useMemo(() => {
        const rigidBodyDesc = new RAPIER.RigidBodyDesc(RAPIER.RigidBodyType.Dynamic).setTranslation(...position)
        const chassisBody = world.createRigidBody(rigidBodyDesc);

        const colliderDesc = RAPIER.ColliderDesc.cuboid(1.1, 0.4, 2);
        world.createCollider(colliderDesc, chassisBody);

        const controller = new RAPIER.DynamicRayCastVehicleController(
            chassisBody,
            world.colliders,
            queryPipeline
        );

        const wheelPositions = [
            new RAPIER.Vector3(-1, -0.3, 1.5), // Front-left
            new RAPIER.Vector3(1, -0.3, 1.5), // Front-right
            new RAPIER.Vector3(-1, -0.3, -1.5), // Back-left
            new RAPIER.Vector3(1, -0.3, -1.5), // Back-right
        ];

        wheelPositions.forEach((pos, i) => {
            controller.addWheel(
                pos,
                new RAPIER.Vector3(0, -1, 0),
                new RAPIER.Vector3(0, 0, 1),
                0.2,
                0.4
            );
        });

        for (let i = 0; i < controller.numWheels(); i++) {
            controller.setWheelSuspensionStiffness(i, 80);
            controller.setWheelSuspensionCompression(i, 5);
            controller.setWheelMaxSuspensionTravel(i, 0.3);
        }

        return controller;

    }, [world, position]);

    useFrame((state, delta) => {
        vehicleController.updateVehicle(delta);
        const { forward, backward, left, right, brake, reset } = controls.current;

        const engineForce = 1500;
        const maxSteer = 0.4;
        const brakeForce = 100;

        vehicleController.setWheelEngineForce(2, forward ? engineForce : backward ? -engineForce : 0);
        vehicleController.setWheelEngineForce(3, forward ? engineForce : backward ? -engineForce : 0);

        vehicleController.setWheelSteering(0, left ? maxSteer : right ? -maxSteer : 0);
        vehicleController.setWheelSteering(1, left ? maxSteer : right ? -maxSteer : 0);

        vehicleController.setWheelBrake(2, brake ? brakeForce : 0);
        vehicleController.setWheelBrake(3, brake ? brakeForce : 0);

        if (reset) {
            const p = new RAPIER.Vector3(position[0], position[1], position[2]);
            const r = new RAPIER.Quaternion(0, 0, 0, 1);

            vehicleController.chassis().setTranslation(p, true);
            vehicleController.chassis().setRotation(r, true);
            vehicleController.chassis().setLinvel(new RAPIER.Vector3(0, 0, 0), true);
            vehicleController.chassis().setAngvel(new RAPIER.Vector3(0, 0, 0), true);
        }

        const chassisBody = vehicleController.chassis();
        chassisRef.current.position.copy(chassisBody.translation());
        chassisRef.current.quaternion.copy(chassisBody.rotation());

        for (let i = 0; i < vehicleController.numWheels(); i++) {
            const transform = vehicleController.getWheelTransformWS(i);
            wheelRefs[i].current.position.copy(transform.translation());
            wheelRefs[i].current.quaternion.copy(transform.rotation());
        }
    });

    return (
        <group ref={ref}>
            <group ref={chassisRef}>
                <Box args={[2.2, 0.8, 4]} castShadow>
                    <meshStandardMaterial color="mediumpurple" />
                </Box>
                <Box args={[1.8, 0.7, 2]} position={[0, 0.75, -0.5]} castShadow>
                    <meshStandardMaterial color="#c7d2fe" />
                </Box>
            </group>

            <Wheel ref={wheel1Ref} />
            <Wheel ref={wheel2Ref} />
            <Wheel ref={wheel3Ref} />
            <Wheel ref={wheel4Ref} />
        </group>
    )

})