import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import "./App.css";
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { Vehicle } from './features/vehicle/Vehicle';
import {Bushes } from "./components/Bushes"
import Grass from './components/Grass';


export default function App() {
  return (
    <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
      <Environment preset="sunset" />
      <Physics debug>
        <Bushes />
        {/* <Vehicle />  */}
        <Grass />
        <RigidBody type='fixed' >
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#799F27" />
            <planeGeometry args={[1000, 1000]} />
          </mesh>
        </RigidBody>
      </Physics>
      

      <OrbitControls />
      
    </Canvas>
  )
}