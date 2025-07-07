import * as THREE from "three";
import { useMemo } from "react";

export default function Grass() {
    const geometry = useMemo(() => {
        const geom = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            0, 1, 0,   // top vertex
           -0.3, -1, 0,  // bottom left
            0.3, -1, 0   // bottom right
        ]);
        geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geom.computeVertexNormals();
        return geom;
    }, []);

    return (
        <mesh geometry={geometry} rotation={[0, -Math.PI, 0]}>
            <meshBasicMaterial color="green" side={THREE.DoubleSide} />
        </mesh>
    );
}
