import React, { useRef } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Html, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  AnimalInstance,
  COURTYARD_LEVELS,
  DroppedSnack,
  FurnitureId,
  PlacedFurniture,
  SNACK_CATALOG,
  SnackId,
  TreasureDrop,
  WeatherId,
} from '../types/game';
import { Furniture3D } from './Furniture3D';
import { Animal3D } from './Animal3D';

interface CourtyardSceneProps {
  courtyardLevel: number;
  weather: WeatherId;
  animals: AnimalInstance[];
  placedFurniture: PlacedFurniture[];
  droppedSnacks: DroppedSnack[];
  treasures: TreasureDrop[];
  isFocusing: boolean;
  isEditingFurniture: boolean;
  selectedFurnitureToPlace: FurnitureId | null;
  activeSnackBrush: SnackId | null;
  onPetAnimal: (animalId: string, worldPos: [number, number, number]) => void;
  onConsumeSnack: (snackId: string, animalId: string) => void;
  onTossSnackAt: (worldPos: [number, number, number]) => void;
  onClaimTreasure: (treasureId: string) => void;
  onSelectFurnitureSlot: (slotIndex: number) => void;
}

const TreasureChest3D: React.FC<{
  treasure: TreasureDrop;
  onClaim: (id: string) => void;
}> = ({ treasure, onClaim }) => {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = 0.28 + Math.sin(t * 3.5) * 0.08;
      ref.current.rotation.y = t * 1.4;
    }
  });

  return (
    <group
      position={[treasure.position[0], 0, treasure.position[2]]}
      onClick={(e) => {
        e.stopPropagation();
        onClaim(treasure.id);
      }}
    >
      <group ref={ref}>
        <mesh castShadow>
          <boxGeometry args={[0.42, 0.32, 0.34]} />
          <meshStandardMaterial color="#d97706" metalness={0.35} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.44, 0.08, 0.36]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.15} />
        </mesh>
      </group>
      <Sparkles count={12} scale={[0.9, 0.9, 0.9]} position={[0, 0.4, 0]} size={2.8} color="#fde047" />
      <Html position={[0, 0.85, 0]} center distanceFactor={13}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClaim(treasure.id);
          }}
          className="px-2.5 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg animate-bounce whitespace-nowrap"
        >
          🎁 点我开宝 (+{treasure.acorns}🌰)
        </button>
      </Html>
    </group>
  );
};

const DroppedSnack3D: React.FC<{ snack: DroppedSnack }> = ({ snack }) => {
  const ref = useRef<THREE.Mesh>(null);
  const info = SNACK_CATALOG[snack.snackId];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = 0.24 + Math.abs(Math.sin(t * 5)) * 0.12;
      ref.current.rotation.y = t * 2.5;
    }
  });

  return (
    <group position={[snack.position[0], 0, snack.position[2]]}>
      <mesh ref={ref} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={info.color} roughness={0.3} />
      </mesh>
      <Html position={[0, 0.65, 0]} center distanceFactor={14}>
        <div className="pointer-events-none px-2 py-0.5 rounded-full bg-orange-500/90 text-white text-xs font-bold shadow whitespace-nowrap">
          {info.emoji} {info.name}
        </div>
      </Html>
    </group>
  );
};

const FloatingIsland: React.FC<{
  radius: number;
  weather: WeatherId;
  activeSnackBrush: SnackId | null;
  onGroundClick: (e: ThreeEvent<MouseEvent>) => void;
}> = ({ radius, weather, activeSnackBrush, onGroundClick }) => {
  const grassColor =
    weather === 'night'
      ? '#1e4631'
      : weather === 'sunset'
      ? '#65a30d'
      : weather === 'rain'
      ? '#22c55e'
      : '#4ade80';

  return (
    <group>
      {/* Top Grass Layer (clickable to toss snacks!) */}
      <mesh
        position={[0, -0.18, 0]}
        receiveShadow
        onClick={onGroundClick}
        onPointerOver={() => {
          if (activeSnackBrush) document.body.style.cursor = 'crosshair';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <cylinderGeometry args={[radius, radius * 0.96, 0.36, 40]} />
        <meshStandardMaterial color={grassColor} roughness={0.8} />
      </mesh>

      {/* Center Stepping Stones Path */}
      {[-1.5, -0.5, 0.5, 1.5].map((z, idx) => (
        <mesh
          key={idx}
          position={[Math.sin(idx * 1.4) * 0.4, 0.01, z]}
          receiveShadow
        >
          <cylinderGeometry args={[0.42, 0.46, 0.04, 12]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.85} />
        </mesh>
      ))}

      {/* Earth & Floating Rock Underside */}
      <mesh position={[0, -0.85, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.92, radius * 0.58, 1.0, 28]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      <mesh position={[0, -1.7, 0]}>
        <coneGeometry args={[radius * 0.58, 1.1, 18]} />
        <meshStandardMaterial color="#57534e" roughness={0.9} />
      </mesh>
    </group>
  );
};

export const CourtyardScene: React.FC<CourtyardSceneProps> = ({
  courtyardLevel,
  weather,
  animals,
  placedFurniture,
  droppedSnacks,
  treasures,
  isFocusing,
  isEditingFurniture,
  selectedFurnitureToPlace,
  activeSnackBrush,
  onPetAnimal,
  onConsumeSnack,
  onTossSnackAt,
  onClaimTreasure,
  onSelectFurnitureSlot,
}) => {
  const levelInfo = COURTYARD_LEVELS[courtyardLevel - 1] || COURTYARD_LEVELS[0];
  const activeAnimals = animals.filter((a) => a.inCourtyard).slice(0, levelInfo.maxAnimals);
  const isNightOrSunset = weather === 'night' || weather === 'sunset';

  const bgGradient =
    weather === 'sunny'
      ? 'from-sky-300 via-pink-100 to-emerald-100'
      : weather === 'sunset'
      ? 'from-indigo-900 via-rose-400 to-amber-200'
      : weather === 'night'
      ? 'from-slate-950 via-indigo-950 to-slate-900'
      : 'from-slate-700 via-teal-900 to-slate-800';

  const handleGroundClick = (e: ThreeEvent<MouseEvent>) => {
    if (!activeSnackBrush) return;
    e.stopPropagation();
    const pt = e.point;
    onTossSnackAt([pt.x, 0, pt.z]);
  };

  return (
    <div className={`w-full h-full bg-gradient-to-b ${bgGradient} transition-colors duration-1000`}>
      <Canvas
        shadows
        camera={{ position: [0, 7.8, 10.5], fov: 42 }}
        gl={{ antialias: true }}
      >
        {/* Dynamic Atmosphere Lighting */}
        <ambientLight
          intensity={
            weather === 'sunny'
              ? 0.85
              : weather === 'sunset'
              ? 0.65
              : weather === 'night'
              ? 0.35
              : 0.6
          }
          color={
            weather === 'sunset'
              ? '#fed7aa'
              : weather === 'night'
              ? '#818cf8'
              : '#ffffff'
          }
        />
        <directionalLight
          castShadow
          position={[8, 14, 8]}
          intensity={
            weather === 'sunny'
              ? 1.35
              : weather === 'sunset'
              ? 1.15
              : weather === 'night'
              ? 0.45
              : 0.7
          }
          color={
            weather === 'sunset'
              ? '#fb923c'
              : weather === 'night'
              ? '#a5b4fc'
              : '#fffbeb'
          }
          shadow-mapSize={[1024, 1024]}
        />

        {/* Weather Particles */}
        {weather === 'night' && (
          <>
            <Stars radius={50} depth={30} count={1500} factor={3} fade speed={1} />
            <Sparkles
              count={45}
              scale={[14, 5, 14]}
              position={[0, 2, 0]}
              size={3.2}
              speed={0.4}
              color="#bef264"
            />
          </>
        )}
        {weather === 'sunny' && (
          <Sparkles
            count={35}
            scale={[14, 6, 14]}
            position={[0, 2.5, 0]}
            size={2.5}
            speed={0.3}
            color="#fbcfe8"
          />
        )}
        {weather === 'rain' && (
          <Sparkles
            count={90}
            scale={[15, 9, 15]}
            position={[0, 4, 0]}
            size={2.2}
            speed={2.2}
            color="#bae6fd"
          />
        )}

        {/* 3D Floating Courtyard Island */}
        <FloatingIsland
          radius={levelInfo.islandRadius}
          weather={weather}
          activeSnackBrush={activeSnackBrush}
          onGroundClick={handleGroundClick}
        />

        {/* Placed 3D Courtyard Furniture */}
        <Furniture3D
          placedFurniture={placedFurniture}
          maxSlots={levelInfo.maxSlots}
          isEditing={isEditingFurniture}
          selectedFurnitureToPlace={selectedFurnitureToPlace}
          onSelectSlot={onSelectFurnitureSlot}
          isNightOrSunset={isNightOrSunset}
        />

        {/* Chubby 3D Animals */}
        {activeAnimals.map((animal, idx) => (
          <Animal3D
            key={animal.id}
            animal={animal}
            index={idx}
            islandRadius={levelInfo.islandRadius}
            placedFurniture={placedFurniture}
            droppedSnacks={droppedSnacks}
            isFocusing={isFocusing}
            onPetAnimal={onPetAnimal}
            onConsumeSnack={onConsumeSnack}
          />
        ))}

        {/* Dropped 3D Snacks */}
        {droppedSnacks.map((snack) => (
          <DroppedSnack3D key={snack.id} snack={snack} />
        ))}

        {/* Dug-Up 3D Courtyard Treasure Chests */}
        {treasures.map((t) => (
          <TreasureChest3D key={t.id} treasure={t} onClaim={onClaimTreasure} />
        ))}

        <OrbitControls
          enablePan={false}
          minDistance={5.5}
          maxDistance={18}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.25}
          target={[0, 0.3, 0]}
        />
      </Canvas>
    </div>
  );
};
