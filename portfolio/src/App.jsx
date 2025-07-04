import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import './App.css'
import { useRef } from "react";
import { Player } from "./components/Player";

function App() {

  const playerRef = useRef();

  return (
    <Canvas shadows>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <Player ref={playerRef} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} >
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="springgreen" />
      </mesh>
    </Canvas>

  )
}

export default App
