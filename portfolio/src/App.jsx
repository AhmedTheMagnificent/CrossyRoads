import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import World from './components/World';
import * as RAPIER from '@dimforge/rapier3d-compat';


export default function App() {
  const [rapierLoaded, setRapierLoaded] = useState(false);
  useEffect(() => {
        RAPIER.init().then(() => {
            setRapierLoaded(true);
        });
    }, []);

  return (
    <Canvas shadows camera={{ fov: 25, near: 0.1, far: 1000, position: [0, 1, 6] }} >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 4, 4]} />
      {rapierLoaded ? <World /> : null}
      <OrbitControls />
    </Canvas>
  );
}