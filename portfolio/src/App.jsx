import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Grid } from '@react-three/drei'
import { Bush } from './components/Bush'
import "./App.css"

function BushGrid(){
  const bushes = [];
  const gridSize = 20;
  const spacing = 3;
  const max = 1;
  const min = 1;

  for(let i = 0; i < gridSize; i++){
    for(let k = 0; k < gridSize; k++){
      const x = (i - gridSize / 2) * spacing;
      const z = (k - gridSize / 2) * spacing;
      bushes.push(<Bush key={`${i}-${k}`} position={[x, 0.5, z]} scale={Math.random() *(max - min + 1) + min} />)
    }
  }
  return bushes;
}

export default function App() {
  return (
    <Canvas camera={{ position: [3, 2, 3], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <Environment preset="sunset" />
      
      <BushGrid />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#799F27" />
        <planeGeometry args={[100, 100]} />
      </mesh>

      <OrbitControls />
      
    </Canvas>
  )
}