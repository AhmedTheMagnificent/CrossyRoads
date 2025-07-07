import * as THREE from "three";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import {RigidBody, CuboidCollider} from "@react-three/rapier";
import { useVehicleControls } from "./useVehicleControls";

const FORCE = 5;
const TORQUE = 10;
const S = 5;

export function Vehicle(props){
    const vehicleRef = useRef();
    const controls = useVehicleControls();

    useEffect(() => {
    console.log("Controls:", controls);
}, [controls]);


    useFrame((state, delta) => {
        if(!vehicleRef.current) return;

        const { forward, backward, left, right, brake, jump } = controls;

        const rayOrigin = new THREE.Vector3();
        const rayDirection = new THREE.Vector3(0, -1, 0); // down
        const raycaster = new THREE.Raycaster();

        const position = vehicleRef.current.translation();
        rayOrigin.set(position.x, position.y, position.z);
        raycaster.set(rayOrigin, rayDirection);
        const intersects = raycaster.intersectObjects(state.scene.children, true);
        const isGrounded = intersects.length > 0 && intersects[0].distance < 1.1;
        
        const engineForce = forward || backward ? (forward ? 1 : -1) * FORCE : 0;
        const impulse = new THREE.Vector3(0, 0, -engineForce * FORCE * delta);
        impulse.applyQuaternion(vehicleRef.current.rotation())
        
        const steeringTorque = left || right ? (left ? 1 : -1) * TORQUE : 0;
        const torque = new THREE.Vector3();
        torque.y += steeringTorque * delta;

        const jumpImpulse = new THREE.Vector3(0, 2, 0);

        

        vehicleRef.current.applyImpulse(impulse);
        vehicleRef.current.applyTorqueImpulse(torque);
        if(jump && isGrounded){
            vehicleRef.current.applyImpulse(jumpImpulse);
        }

        // if(brake){
        //     vehicleRef.
        // }


    });

    return (
        <RigidBody ref={vehicleRef} colliders={false} position={[0, 1, 0]} rotation={[0, Math.PI, 0]} {...props}  >
            <mesh>
                <boxGeometry args={[1, 0.5, 2]} />
                <meshStandardMaterial color="royalblue" />
            </mesh>
            <CuboidCollider args={[0.5, 0.25, 1]} />
        </RigidBody>
    );

}