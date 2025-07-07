import * as THREE from "three";
import { useMemo, useRef, useEffect } from "react";
import { useFrame, extend, useThree } from "@react-three/fiber";
import { shaderMaterial, useTexture } from "@react-three/drei";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const GrassMaterial = shaderMaterial(
    {
        uTime: 0,
        uMatcap: null,
        uPerlin: null,
        uViewPosition: new THREE.Vector3(),
    },
    // --- Vertex Shader ---
    `
        // --- NEW MODERN SYNTAX ---
        in float aTipness; // Attribute for the tipness of the blade

        out vec2 vUv;
        out vec3 vViewNormal;
        out float vTipness; // Pass tipness to the fragment shader

        uniform float uTime;
        uniform sampler2D uPerlin;
        uniform vec3 uViewPosition;

        mat2 rotate2d(float angle){
            return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        }

        void main(){
            // Pass the tipness attribute through the varying
            vTipness = aTipness;

            float bladeId = floor(float(gl_VertexID) / 3.0);
            float gridCount = 500.0;
            float gridSize = 100.0;
            vec2 gridUv = vec2(mod(bladeId, gridCount) / gridCount, floor(bladeId / gridCount) / gridCount);
            vec2 gridPosition = (gridUv - 0.5) * gridSize;
            vec2 repeatedPosition = mod(gridPosition - uViewPosition.xz, gridSize) - (gridSize * 0.5);

            vec3 bladePosition = position;
            
            float noise = texture2D(uPerlin, repeatedPosition * 0.05 + uTime * 0.1).r;
            float wind = noise * bladePosition.y * 0.5;
            bladePosition.x += wind;
            bladePosition.z += wind;
            
            vec2 directionToCamera = normalize(uViewPosition.xz - repeatedPosition);
            float angle = atan(directionToCamera.x, directionToCamera.y);
            bladePosition.xz = rotate2d(angle) * bladePosition.xz;
            
            vec3 finalPosition = bladePosition + vec3(repeatedPosition.x, 0.0, repeatedPosition.y);
            gl_Position = projectionMatrix * viewMatrix * vec4(finalPosition, 1.0);

            vViewNormal = normalize(mat3(modelViewMatrix) * normal);
            vUv = uv;
        }
    `,
    // --- Fragment Shader ---
    `
        // --- NEW MODERN SYNTAX ---
        in float vTipness;
        in vec2 vUv;
        in vec3 vViewNormal;

        uniform sampler2D uMatcap;

        void main() {
            vec2 matcapUv = (normalize(vViewNormal).xy * 0.5) + 0.5;
            
            // Sample the matcap texture at the calculated UV
            vec3 matcapColor = texture2D(uMatcap, matcapUv).rgb;
            
            // Create gradient based on tipness
            // Base should be darker, tip should be lighter
            float tipness = vTipness;
            
            // Apply tipness to modify the matcap color
            // This creates a gradient from dark (base) to the full matcap color (tip)
            vec3 finalColor = matcapColor * (0.3 + tipness * 0.7);

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
);

extend({ GrassMaterial });

export function Grass(props) {
    const { camera } = useThree();
    const [matcap, perlin] = useTexture(['/matcap.jpg', '/perlin.png']);
    const materialRef = useRef();

    useEffect(() => {
        if (perlin) {
            perlin.wrapS = perlin.wrapT = THREE.RepeatWrapping;
            perlin.needsUpdate = true;
        }
    }, [perlin]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime;
            materialRef.current.uViewPosition.copy(camera.position);
        }
    });

    const grassGeometry = useMemo(() => {
        const bladeCount = 1000000; // Doubled from 500,000 to 1,000,000
        const bladeWidth = 0.3; // Slightly thinner blades to accommodate more
        const bladeHeight = 0.5;
        const bladeHeightVariance = 0.2;
        
        const geometries = [];
        
        for (let i = 0; i < bladeCount; i++) {
            const blade = new THREE.BufferGeometry();
            const randomHeight = bladeHeight + Math.random() * bladeHeightVariance;
            
            // Add randomness to blade shape and position
            const widthVariation = bladeWidth * (0.5 + Math.random() * 0.5); // 50-100% of base width
            const curve = (Math.random() - 0.5) * 0.05; // Random curve
            const lean = (Math.random() - 0.5) * 0.1; // Random lean
            
            blade.setAttribute('position', new THREE.Float32BufferAttribute([
                -widthVariation / 2, 0, 0,
                 widthVariation / 2, 0, 0,
                 curve + lean, randomHeight, 0
            ], 3));
            blade.setIndex([0, 1, 2]);

            // Create and set the custom 'aTipness' attribute
            const tipness = new Float32Array([0, 0, 1]); // Base vertices are 0, tip is 1
            blade.setAttribute('aTipness', new THREE.BufferAttribute(tipness, 1));
            
            geometries.push(blade);
        }
        
        const merged = mergeGeometries(geometries);
        return merged;
    }, []);

    return (
        <mesh geometry={grassGeometry} frustumCulled={false} {...props}>
            <grassMaterial 
                ref={materialRef}
                uMatcap={matcap} 
                uPerlin={perlin}
            />
        </mesh>
    );
}