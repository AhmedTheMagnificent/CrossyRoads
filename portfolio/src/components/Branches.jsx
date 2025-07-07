import React from "react";
import { Cylinder } from "@react-three/drei";

export function Branches(props){
    return (
        <Cylinder args={[0.06, 0.1, 1, 8]} {...props} rotation={[Math.PI / 4, 0, 0]} translation={[10, 8, 9]}>
            <meshStandardMaterial color="#6a4a3a" />
        </Cylinder>
    );
}