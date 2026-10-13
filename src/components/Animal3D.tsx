import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import {
  ACCESSORY_CATALOG,
  AccessoryId,
  AnimalInstance,
  DroppedSnack,
  FURNITURE_CATALOG,
  FURNITURE_SLOTS,
  PlacedFurniture,
  SPECIES_CATALOG,
  VARIANT_CATALOG,
} from '../types/game';

interface Animal3DProps {
  animal: AnimalInstance;
  index: number;
  islandRadius: number;
  placedFurniture: PlacedFurniture[];
  droppedSnacks: DroppedSnack[];
  isFocusing: boolean;
  onPetAnimal: (animalId: string, worldPos: [number, number, number]) => void;
  onConsumeSnack: (snackId: string, animalId: string) => void;
}

const AccessoryMesh: React.FC<{ accessory: AccessoryId; isFocusing: boolean }> = ({
  accessory,
  isFocusing,
}) => {
  return (
    <group>
      {/* Top-of-head accessories */}
      {accessory === 'yuzu' && (
        <group position={[0, 0.56, 0.04]}>
          <mesh castShadow>
            <sphereGeometry args={[0.13, 14, 14]} />
            <meshStandardMaterial color="#fb923c" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.13, 0]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.07, 0.03, 0.04]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
        </group>
      )}

      {accessory === 'sakura_crown' && (
        <group position={[0, 0.48, 0.02]} rotation={[0.15, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.24, 0.045, 10, 20]} />
            <meshStandardMaterial color="#f472b6" />
          </mesh>
        </group>
      )}

      {accessory === 'straw_hat' && (
        <group position={[0, 0.5, 0]}>
          <mesh>
            <cylinderGeometry args={[0.38, 0.38, 0.03, 20]} />
            <meshStandardMaterial color="#fde047" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.2, 0.23, 0.18, 20]} />
            <meshStandardMaterial color="#facc15" roughness={0.7} />
          </mesh>
        </group>
      )}

      {accessory === 'frog_hat' && (
        <group position={[0, 0.5, 0]}>
          <mesh rotation={[0.1, 0, 0]}>
            <cylinderGeometry args={[0.34, 0.36, 0.04, 18]} />
            <meshStandardMaterial color="#4ade80" />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <sphereGeometry args={[0.08, 10, 10]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
        </group>
      )}

      {accessory === 'crown' && (
        <group position={[0, 0.54, 0.02]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.18, 0.14, 0.16, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.02, 0.15]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </group>
      )}

      {accessory === 'bachelor_cap' && (
        <group position={[0, 0.53, 0.02]}>
          <mesh position={[0, 0.07, 0]}>
            <boxGeometry args={[0.46, 0.035, 0.46]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.18, 0.18, 0.12, 14]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0.22, 0.02, 0.1]}>
            <cylinderGeometry args={[0.015, 0.02, 0.15, 6]} />
            <meshStandardMaterial color="#fbbf24" />
          </mesh>
        </group>
      )}

      {/* Scholar Glasses (shown if equipped OR automatically during Focus Mode!) */}
      {(accessory === 'glasses' || isFocusing) && (
        <group position={[0, 0.24, 0.44]}>
          <mesh position={[-0.13, 0, 0]}>
            <torusGeometry args={[0.075, 0.016, 8, 18]} />
            <meshStandardMaterial color="#1e293b" metalness={0.6} />
          </mesh>
          <mesh position={[0.13, 0, 0]}>
            <torusGeometry args={[0.075, 0.016, 8, 18]} />
            <meshStandardMaterial color="#1e293b" metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.01, 0]}>
            <boxGeometry args={[0.11, 0.016, 0.016]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      )}
    </group>
  );
};

export const Animal3D: React.FC<Animal3DProps> = ({
  animal,
  index,
  islandRadius,
  placedFurniture,
  droppedSnacks,
  isFocusing,
  onPetAnimal,
  onConsumeSnack,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [petAnimTime, setPetAnimTime] = useState(0);
  const [activityLabel, setActivityLabel] = useState<string>('');

  const speciesInfo = SPECIES_CATALOG[animal.species];
  const variantInfo = VARIANT_CATALOG[animal.variant];

  // Initial position and movement target state stored in ref for smooth 60fps updates
  const aiState = useMemo(() => {
    const angle = (index * Math.PI * 2) / 5 + 0.4;
    const dist = 1.4 + (index % 3) * 0.9;
    return {
      pos: new THREE.Vector3(Math.cos(angle) * dist, 0, Math.sin(angle) * dist),
      target: new THREE.Vector3(Math.cos(angle + 1) * dist, 0, Math.sin(angle + 1) * dist),
      waitTimer: 1 + (index % 3),
      inHotSpring: false,
      currentActivity: '',
    };
  }, [index]);

  const bodyColor = variantInfo.colorOverride || speciesInfo.baseColor;

  useFrame((state, delta) => {
    if (!groupRef.current || !bodyRef.current) return;
    const t = state.clock.getElapsedTime();

    // 1. Check if there is any dropped snack to chase!
    let chasingSnack: DroppedSnack | null = null;
    if (droppedSnacks.length > 0) {
      chasingSnack = droppedSnacks[0];
      aiState.target.set(chasingSnack.position[0], 0, chasingSnack.position[2]);
      aiState.inHotSpring = false;
      if (aiState.currentActivity !== '😋 抢零食中!') {
        aiState.currentActivity = '😋 抢零食中!';
        setActivityLabel('😋 抢零食中!');
      }
    }

    // 2. Move or wait
    const dx = aiState.target.x - aiState.pos.x;
    const dz = aiState.target.z - aiState.pos.z;
    const dist = Math.hypot(dx, dz);

    const speed = chasingSnack ? 2.6 : isFocusing ? 0.85 : 1.25;

    if (dist > 0.18) {
      const step = Math.min(dist, speed * delta);
      aiState.pos.x += (dx / dist) * step;
      aiState.pos.z += (dz / dist) * step;

      // Face movement direction smoothly
      const targetAngle = Math.atan2(dx, dz);
      const currentY = groupRef.current.rotation.y;
      let diff = targetAngle - currentY;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      groupRef.current.rotation.y += diff * Math.min(1, delta * 8);

      // Cute waddle hop while walking
      const hop = Math.abs(Math.sin(t * (chasingSnack ? 14 : 8) + index)) * 0.12;
      aiState.pos.y = hop;
      bodyRef.current.rotation.z = Math.sin(t * 8 + index) * 0.08;
    } else {
      // Reached target!
      if (chasingSnack) {
        onConsumeSnack(chasingSnack.id, animal.id);
        setPetAnimTime(0.65);
      } else {
        aiState.pos.y = aiState.inHotSpring ? -0.12 : 0;
        bodyRef.current.rotation.z = Math.sin(t * 2 + index) * 0.03;
        aiState.waitTimer -= delta;

        if (aiState.waitTimer <= 0) {
          aiState.waitTimer = isFocusing ? 6 + Math.random() * 5 : 3.5 + Math.random() * 4;
          // Decide next target: 55% chance to visit a placed furniture, 45% random stroll
          if (placedFurniture.length > 0 && Math.random() < 0.6) {
            const pick = placedFurniture[Math.floor(Math.random() * placedFurniture.length)];
            const slotCoords = FURNITURE_SLOTS[pick.slotIndex];
            const fInfo = FURNITURE_CATALOG[pick.furnitureId];
            const offsetAngle = Math.random() * Math.PI * 2;
            const offsetDist = pick.furnitureId === 'hotspring' ? 0.35 : 0.75;
            aiState.target.set(
              slotCoords[0] + Math.cos(offsetAngle) * offsetDist,
              0,
              slotCoords[2] + Math.sin(offsetAngle) * offsetDist
            );
            aiState.inHotSpring = pick.furnitureId === 'hotspring';
            const nextLabel = isFocusing ? '📖 安静陪读中' : fInfo.interactionText;
            if (aiState.currentActivity !== nextLabel) {
              aiState.currentActivity = nextLabel;
              setActivityLabel(nextLabel);
            }
          } else {
            const r = Math.random() * (islandRadius - 1.6);
            const a = Math.random() * Math.PI * 2;
            aiState.target.set(Math.cos(a) * r, 0, Math.sin(a) * r);
            aiState.inHotSpring = false;
            const nextLabel = isFocusing ? '📖 专注陪读中' : '';
            if (aiState.currentActivity !== nextLabel) {
              aiState.currentActivity = nextLabel;
              setActivityLabel(nextLabel);
            }
          }
        }
      }
    }

    groupRef.current.position.copy(aiState.pos);

    // 3. Q-bouncy squish animation when petted!
    if (petAnimTime > 0) {
      const nextTime = Math.max(0, petAnimTime - delta);
      setPetAnimTime(nextTime);
      const wave = Math.sin(nextTime * 22) * (nextTime / 0.65);
      bodyRef.current.scale.set(1 + wave * 0.32, 1 - wave * 0.28, 1 + wave * 0.32);
      groupRef.current.position.y += Math.sin((1 - nextTime / 0.65) * Math.PI) * 0.38;
    } else {
      // Gentle breathing pulse
      const breath = Math.sin(t * 2.5 + index) * 0.025;
      bodyRef.current.scale.set(1 + breath, 1 - breath * 0.8, 1 + breath);
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setPetAnimTime(0.65);
    onPetAnimal(animal.id, [aiState.pos.x, aiState.pos.y + 0.9, aiState.pos.z]);
  };

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <group ref={bodyRef} position={[0, 0.38, 0]}>
        {/* Chubby Round Body */}
        <mesh castShadow receiveShadow scale={animal.species === 'capybara' ? [1.05, 0.92, 1.25] : [1, 0.95, 1.08]}>
          <sphereGeometry args={[0.42, 24, 20]} />
          <meshStandardMaterial
            color={bodyColor}
            emissive={variantInfo.emissiveColor || '#000000'}
            emissiveIntensity={variantInfo.emissiveColor ? 0.22 : 0}
            metalness={variantInfo.metalness ?? 0.05}
            roughness={variantInfo.roughness ?? 0.55}
            transparent={Boolean(variantInfo.transmission)}
            opacity={variantInfo.transmission ? 0.88 : 1}
          />
        </mesh>

        {/* Soft Belly Patch */}
        <mesh position={[0, -0.05, 0.26]} scale={[0.72, 0.68, 0.5]}>
          <sphereGeometry args={[0.38, 16, 16]} />
          <meshStandardMaterial color={speciesInfo.bellyColor} roughness={0.6} />
        </mesh>

        {/* Species-Specific Snout / Beak & Ears */}
        {animal.species === 'capybara' && (
          <>
            {/* Capybara Blunt Snout */}
            <mesh position={[0, 0.12, 0.38]} scale={[0.65, 0.55, 0.65]} castShadow>
              <boxGeometry args={[0.42, 0.36, 0.36]} />
              <meshStandardMaterial color="#854d27" roughness={0.65} />
            </mesh>
            {/* Little Round Ears */}
            <mesh position={[-0.24, 0.38, -0.05]}>
              <sphereGeometry args={[0.09, 10, 10]} />
              <meshStandardMaterial color="#854d27" />
            </mesh>
            <mesh position={[0.24, 0.38, -0.05]}>
              <sphereGeometry args={[0.09, 10, 10]} />
              <meshStandardMaterial color="#854d27" />
            </mesh>
          </>
        )}

        {(animal.species === 'cat' || animal.species === 'shiba' || animal.species === 'redpanda') && (
          <>
            {/* Pointy Cute Ears */}
            <mesh position={[-0.24, 0.42, 0.05]} rotation={[0, 0, 0.25]} castShadow>
              <coneGeometry args={[0.13, 0.24, 12]} />
              <meshStandardMaterial color={bodyColor} />
            </mesh>
            <mesh position={[0.24, 0.42, 0.05]} rotation={[0, 0, -0.25]} castShadow>
              <coneGeometry args={[0.13, 0.24, 12]} />
              <meshStandardMaterial color={bodyColor} />
            </mesh>
            {/* Fluffy Tail */}
            <mesh
              position={[0, 0.05, -0.45]}
              rotation={[-0.6, 0, 0]}
              scale={animal.species === 'redpanda' ? [1.3, 1.5, 1.3] : [1, 1, 1]}
            >
              <capsuleGeometry args={[0.09, 0.24, 8, 12]} />
              <meshStandardMaterial color={bodyColor} />
            </mesh>
          </>
        )}

        {animal.species === 'frog' && (
          <>
            {/* Big Bulging Frog Eyes on Top */}
            <mesh position={[-0.18, 0.38, 0.18]}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshStandardMaterial color={bodyColor} />
            </mesh>
            <mesh position={[0.18, 0.38, 0.18]}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshStandardMaterial color={bodyColor} />
            </mesh>
          </>
        )}

        {animal.species === 'duck' && (
          <>
            {/* Cute Yellow Duck Bill */}
            <mesh position={[0, 0.12, 0.44]} scale={[1.2, 0.45, 0.9]}>
              <sphereGeometry args={[0.14, 12, 12]} />
              <meshStandardMaterial color="#f59e0b" />
            </mesh>
          </>
        )}

        {/* Cute Eyes & Rosy Cheeks */}
        <mesh position={[-0.13, 0.23, 0.39]}>
          <sphereGeometry args={[0.042, 10, 10]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.13, 0.23, 0.39]}>
          <sphereGeometry args={[0.042, 10, 10]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Pink Blush Cheeks */}
        <mesh position={[-0.22, 0.15, 0.36]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color="#fb7185" transparent opacity={0.75} />
        </mesh>
        <mesh position={[0.22, 0.15, 0.36]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color="#fb7185" transparent opacity={0.75} />
        </mesh>

        {/* Little Chubby Feet */}
        {[
          [-0.22, -0.34, 0.2],
          [0.22, -0.34, 0.2],
          [-0.22, -0.34, -0.2],
          [0.22, -0.34, -0.2],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshStandardMaterial color={speciesInfo.bellyColor} />
          </mesh>
        ))}

        {/* Equipped 3D Headwear Accessory + Auto Focus Glasses */}
        <AccessoryMesh accessory={animal.accessory} isFocusing={isFocusing} />

        {/* Rare Variant Sparkles */}
        {variantInfo.rarity >= 3 && (
          <Sparkles
            count={10}
            scale={[1.1, 1.1, 1.1]}
            size={2.2}
            speed={0.5}
            color={variantInfo.emissiveColor || '#fde047'}
          />
        )}
      </group>

      {/* Floating Info Tag (on hover or when petted or active status) */}
      {(hovered || petAnimTime > 0 || activityLabel) && (
        <Html position={[0, 1.22, 0]} center distanceFactor={13} zIndexRange={[10, 0]}>
          <div className="pointer-events-none flex flex-col items-center gap-0.5">
            {petAnimTime > 0 && (
              <div className="animate-bounce text-sm font-bold text-rose-400 drop-shadow">
                ❤️ Q弹摸头 +橡果!
              </div>
            )}
            {(hovered || activityLabel) && (
              <div className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-[11px] text-white whitespace-nowrap shadow-md flex items-center gap-1">
                <span>{speciesInfo.emoji}</span>
                <span className="font-semibold">{animal.name}</span>
                {animal.variant !== 'normal' && (
                  <span className="text-amber-300 text-[10px]">[{variantInfo.name}]</span>
                )}
                {animal.accessory !== 'none' && (
                  <span>{ACCESSORY_CATALOG[animal.accessory].emoji}</span>
                )}
                {activityLabel && (
                  <span className="text-emerald-300 ml-0.5">{activityLabel}</span>
                )}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};
