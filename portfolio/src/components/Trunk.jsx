import React from "react";
import { Cylinder } from "@react-three/drei";

export function Trunk(props){
    return (
        <Cylinder args={[0.1, 0.1, 10, 8]} {...props} >
            <meshStandardMaterial color="#6a4a3a" />
        </Cylinder>
    );
}