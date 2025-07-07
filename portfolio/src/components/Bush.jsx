import * as THREE from 'three';
import { useFrame, extend } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import { useTexture, shaderMaterial } from '@react-three/drei';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// The shader definition is correct and doesn't need changes.
const BushMaterial = shaderMaterial(
    {
        uTime: 0,
        uMatcap: null,
        uAlphaMap: null,
        uPerlin: null,
        uWindStrength: 2.0
    },
    // --- Vertex Shader ---
    `
        varying vec2 vUv;
        varying vec3 vViewNormal;

        uniform float uTime;
        uniform sampler2D uPerlin;
        uniform float uWindStrength;

        void main(){
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);

            // Use mod() to prevent precision loss over long periods
            float wrappedTime = mod(uTime, 10000.0);

            // --- Wind Calculation ---
            vec2 direction = normalize(vec2(-1.0, 1.0));
            vec2 noiseUv1 = worldPosition.xz * 0.06 + direction * (wrappedTime * 0.1);
            float noise1 = texture2D(uPerlin, noiseUv1).r - 0.5;
            vec2 noiseUv2 = worldPosition.xz * 0.043 + direction * (wrappedTime * 0.03);
            float noise2 = texture2D(uPerlin, noiseUv2).r;
            float intensity = noise1 * noise2;
            vec2 finalDisplacement = direction * intensity;
            
            vec3 displacement = vec3(finalDisplacement.x, 0.0, finalDisplacement.y);
            float heightFactor = max(0.0, position.y);
            vec3 newPosition = position + (displacement * uWindStrength * heightFactor);

            vec4 modelViewPosition = modelViewMatrix * vec4(newPosition, 1.0);
            gl_Position = projectionMatrix * modelViewPosition;
            vViewNormal = normalize(normalMatrix * normal);
            vUv = uv;
        }
    `,
    // --- Fragment Shader ---
    `
        varying vec2 vUv;
        varying vec3 vViewNormal;
        uniform sampler2D uMatcap;
        uniform sampler2D uAlphaMap;
        void main() {
            vec2 matcapUv = vViewNormal.xy * 0.5 + 0.5;
            vec3 color = texture2D(uMatcap, matcapUv).rgb;
            float alpha = texture2D(uAlphaMap, vUv).r;
            if (alpha < 0.1) discard;
            gl_FragColor = vec4(color, 1.0);
        }
    `
);

extend({ BushMaterial });


export function Bush(props) {
    const [matcap, alphaMap, perlinTexture] = useTexture(['/matcap.jpg', '/alphaMap.jpg', '/perlin.png']);
    
    const materialRef = useRef();
    
    // --- THE FIX: Configure the noise texture to repeat ---
    // This hook runs once after the component mounts and the texture is loaded.
    useEffect(() => {
        if (perlinTexture) {
            // Set the wrapping mode to repeat on both axes.
            perlinTexture.wrapS = THREE.RepeatWrapping;
            perlinTexture.wrapT = THREE.RepeatWrapping;
            // We need to tell Three.js to update the texture on the GPU
            perlinTexture.needsUpdate = true;
        }
    }, [perlinTexture]); // Rerun this effect if the texture ever changes

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime;
        }
    });

    const bushGeometry = useMemo(() => {
        const planeCount = 150;
        const geometries = [];
        for(let i = 0; i < planeCount; i++){
            const plane = new THREE.PlaneGeometry(1, 1);
            const spherical = new THREE.Spherical(1 - Math.pow(Math.random(), 3), Math.PI * 2 * Math.random(), Math.PI * Math.random());
            const position = new THREE.Vector3().setFromSpherical(spherical);
            plane.lookAt(position);
            plane.rotateX(Math.random() * 9999, Math.random() * 9999, Math.random() * 9999)
            plane.translate(position.x, position.y, position.z);
            const normal = position.clone().normalize();
            const normalArray = new Float32Array(12);
            for (let j = 0; j < 4; j++) {
                const j3 = j * 3;
                const position = new THREE.Vector3(
                    plane.attributes.position.array[j3    ],
                    plane.attributes.position.array[j3 + 1],
                    plane.attributes.position.array[j3 + 2],
                );

                const mixedNormal = position.lerp(normal, 0.4);
                normalArray[j3    ] = mixedNormal.x;
                normalArray[j3 + 1] = mixedNormal.y;
                normalArray[j3 + 2] = mixedNormal.z;
            }
            plane.setAttribute('normal', new THREE.BufferAttribute(normalArray, 3));
            geometries.push(plane);
        }
        return mergeGeometries(geometries);
    }, []);

    return (
        <mesh geometry={bushGeometry} {...props}>
            <bushMaterial 
                ref={materialRef}
                uMatcap={matcap} 
                uAlphaMap={alphaMap} 
                uPerlin={perlinTexture}
            />
        </mesh>
    );
}