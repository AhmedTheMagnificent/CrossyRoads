import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { extend } from '@react-three/fiber';
import { useTexture, shaderMaterial, useMatcapTexture } from '@react-three/drei';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';


const BushMaterial = shaderMaterial(
    {
        uTime: 0,
        uMatcap: null,
        uAlphaMap: null,
        uPerlin: null
    },
    `
        varying vec2 vUv;
        varying vec3 vViewNormal;

        uniform float uTime;
        uniform sampler2D uPerlin;

        void main(){
            vec3 pos = position;

            float windStrength = 0.1;
            float windFrequency = 2.0;
            float perlin = texture2D(uPerlin, vec2(uv.x * windFrequency + uTime * 0.1, uv.y * windFrequency)).r;
            pos.x += perlin * windStrength * position.y;

            vec4 modelViewPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * modelViewPosition;

            vViewNormal = normalize(normalMatrix * normal);
            vUv = uv;
        }
    `,
    `
        varying vec2 vUv;
        varying vec3 vViewNormal;

        uniform sampler2D uMatcap;
        uniform sampler2D uAlphaMap;
        void main() {
            // MatCap UV calculation
            vec2 matcapUv = vViewNormal.xy * 0.5 + 0.5;
            vec3 color = texture2D(uMatcap, matcapUv).rgb;

          // Alpha map for leaf shape
            float alpha = texture2D(uAlphaMap, vUv).r;
            if (alpha < 0.1) discard;

            gl_FragColor = vec4(color, 1.0);
        }
    `
);

extend({ BushMaterial });

export function Bush(props){
    const materialRef = useRef();
    const [matcap, alphaMap, perlin] = useTexture(['/matcap.jpg', '/alphaMap.jpg', '/perlin.png']);

    const bushGeometry = useMemo(() => {
        const planeCount = 150;
        const geometries = [];
        
        for(let i = 0; i < planeCount; i++){
            const plane = new THREE.PlaneGeometry(1, 1);
            const spherical = new THREE.Spherical(
                1 - Math.pow(Math.random(), 3),
                Math.PI * 2 * Math.random(),
                Math.PI * Math.random()
            );
            const position = new THREE.Vector3().setFromSpherical(spherical);
            plane.lookAt(position);
            plane.translate(position.x, position.y, position.z);

            const outwardDirection = position.clone().normalize();
            const customNormals = new Float32Array(plane.attributes.normal.array.length);

            for (let j = 0; j < plane.attributes.normal.count; j++) {
                outwardDirection.toArray(customNormals, j * 3);
            }

            plane.setAttribute('normal', new THREE.BufferAttribute(customNormals, 3))
            geometries.push(plane);
        }

        const mergedGeometry = mergeGeometries(geometries);
        return mergedGeometry;
    }, []);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.getElapsedTime();
        }
    });

    return(
        <mesh geometry={bushGeometry} {...props}>
            <bushMaterial ref={materialRef} uMatcap={matcap} uAlphaMap={alphaMap} uPerlin={perlin} />
        </mesh>
    );
}