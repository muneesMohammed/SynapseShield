// components/visualization/NetworkTopology.jsx
'use client'

import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Text, OrbitControls } from '@react-three/drei';
import { useSimulation } from '../../store/simulationStore';

function NetworkNode({ device, position, threatLevel }) {
  const color = threatLevel > 0.7 ? '#ef4444' : 
                threatLevel > 0.4 ? '#f59e0b' : '#10b981';

  return (
    <group position={position}>
      <Sphere args={[0.3]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={threatLevel * 0.8}
        />
      </Sphere>
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {device.name}
      </Text>
    </group>
  );
}

export default function NetworkTopology({ devices }) {
  const { state } = useSimulation();

  const getNodePositions = (count) => {
    const positions = [];
    const radius = 5;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 2;
      positions.push([x, y, z]);
    }
    
    return positions;
  };

  const positions = getNodePositions(devices.length);

  return (
    <div className="h-96 bg-gray-900 rounded-lg">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls enableZoom={true} />
        
        {devices.map((device, index) => (
          <NetworkNode
            key={device.id}
            device={device}
            position={positions[index]}
            threatLevel={device.threatProbability}
          />
        ))}
      </Canvas>
    </div>
  );
}