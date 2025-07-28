import * as THREE from 'three';
import { useFrame, extend } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import { useTexture, shaderMaterial } from '@react-three/drei';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// --- THE FIX: The vertex shader MUST use the 'instanceMatrix' ---
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
            // 1. Calculate world position using the instanceMatrix for correct wind
            vec4 worldPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);

            float wrappedTime = mod(uTime, 10000.0);

            // --- Wind Calculation (This part was already correct) ---
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

            // 2. Apply the instance's transformation to the final vertex position
            vec4 modelViewPosition = modelViewMatrix * instanceMatrix * vec4(newPosition, 1.0);
            gl_Position = projectionMatrix * modelViewPosition;
            
            // 3. Transform normals correctly using the instance's rotation
            vViewNormal = normalize(normalMatrix * mat3(instanceMatrix) * normal);
            vUv = uv;
        }
    `,
    // --- Fragment Shader (Unchanged) ---
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
    const meshRef = useRef();
    
    useEffect(() => {
        if (perlinTexture) {
            perlinTexture.wrapS = THREE.RepeatWrapping;
            perlinTexture.wrapT = THREE.RepeatWrapping;
            perlinTexture.needsUpdate = true;
        }
    }, [perlinTexture]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime;
        }
    });

    const bushGeometry = useMemo(() => {
        const planeCount = 180;
        const geometries = [];
        for(let i = 0; i < planeCount; i++){
            const plane = new THREE.PlaneGeometry(1, 1);
            const spherical = new THREE.Spherical(1 - Math.pow(Math.random(), 3), Math.PI * 2 * Math.random(), Math.PI * Math.random());
            const position = new THREE.Vector3().setFromSpherical(spherical);
            plane.lookAt(position);
            plane.translate(position.x, position.y, position.z);
            const normal = position.clone().normalize();
            const normalArray = new Float32Array(12);
            for (let j = 0; j < 4; j++) {
                const j3 = j * 3;
                const iPosition = new THREE.Vector3(
                    plane.attributes.position.array[j3],
                    plane.attributes.position.array[j3 + 1],
                    plane.attributes.position.array[j3 + 2],
                );

                const mixedNormal = iPosition.lerp(normal, 0.4);
                normalArray[j3] = mixedNormal.x;
                normalArray[j3 + 1] = mixedNormal.y;
                normalArray[j3 + 2] = mixedNormal.z;
            }
            plane.setAttribute('normal', new THREE.BufferAttribute(normalArray, 3));
            geometries.push(plane);
        }
        return mergeGeometries(geometries);
    }, []);

    // This part of your code was already correct!
    const dummy = useMemo(() => new THREE.Object3D(), []);
    useEffect(() => {
        if (!meshRef.current) return;

        for (let i = 0; i < 500 ; i++) {
            dummy.position.set(
                (Math.random() - 0.5) * 100,
                0,
                (Math.random() - 0.5) * 100
            );
            const scale = 0.8 + Math.random() * 0.4;
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.y = Math.random() * Math.PI;

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [dummy]); // dummy dependency is good practice here

    return (
        <instancedMesh ref={meshRef} args={[bushGeometry, null, 500]} {...props}>
            <bushMaterial 
                ref={materialRef}
                uMatcap={matcap} 
                uAlphaMap={alphaMap} 
                uPerlin={perlinTexture}
            />
        </instancedMesh>
    );
}