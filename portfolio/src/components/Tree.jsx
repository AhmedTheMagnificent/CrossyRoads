import React from "react";
import { Bush } from "./Bush";
import { Trunk } from "./Trunk";
import { Branches } from "./Branches";


export function Tree(props){
    return (
        <group {...props} >
            <Trunk position={[0, 1, 0]} />
            <Branches position={[0, 1, 0]} />
            {/* <Bush position={[0, 5, 0]} scale={1.3} /> 
            <Bush position={[0.9, 3.5, 0]} scale={0.6} />  */}
        </group>
    )
}