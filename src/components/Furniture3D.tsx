import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import {
  FURNITURE_CATALOG,
  FURNITURE_SLOTS,
  FurnitureId,
  PlacedFurniture,
} from '../types/game';

interface Furniture3DProps {
  placedFurniture: PlacedFurniture[];
  maxSlots: number;
  isEditing: boolean;
  selectedFurnitureToPlace: FurnitureId | null;
  onSelectSlot: (slotIndex: number) => void;
  isNightOrSunset: boolean;
}

const HotSpringModel: React.FC = () => {
  const waterRef = useRef<THREE.Mesh>(null);
  const yuzuGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (waterRef.current) {
      waterRef.current.position.y = 0.22 + Math.sin(t * 2.2) * 0.015;
    }
    if (yuzuGroupRef.current) {
      yuzuGroupRef.current.children.forEach((child, idx) => {
        child.position.y = 0.25 + Math.sin(t * 2.5 + idx * 1.7) * 0.025;
        child.rotation.z = Math.sin(t * 1.5 + idx) * 0.15;
      });
    }
  });

  return (
    <group>
      {/* Cypress Wooden Tub Base */}
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.35, 1.42, 0.32, 24]} />
        <meshStandardMaterial color="#b47b48" roughness={0.65} />
      </mesh>
      {/* Inner Dark Basin */}
      <mesh position={[0, 0.18, 0]} receiveShadow>
        <cylinderGeometry args={[1.18, 1.15, 0.31, 24]} />
        <meshStandardMaterial color="#5c3a21" roughness={0.8} />
      </mesh>
      {/* Warm Steaming Turquoise Water */}
      <mesh ref={waterRef} position={[0, 0.22, 0]}>
        <cylinderGeometry args={[1.15, 1.15, 0.18, 24]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.25}
          transparent
          opacity={0.82}
          roughness={0.15}
        />
      </mesh>
      {/* Decorative Stones on Rim */}
      {[
        [1.1, 0.28, 0.6, 0.28],
        [1.22, 0.22, -0.35, 0.22],
        [-1.15, 0.25, -0.5, 0.26],
        [-0.95, 0.2, 0.8, 0.2],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow receiveShadow>
          <dodecahedronGeometry args={[r, 1]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#64748b' : '#94a3b8'} roughness={0.75} />
        </mesh>
      ))}
      {/* Floating Yuzu Oranges in Hot Spring */}
      <group ref={yuzuGroupRef}>
        {[
          [-0.45, 0.25, -0.3],
          [0.5, 0.25, 0.35],
          [-0.1, 0.25, 0.55],
        ].map(([x, y, z], i) => (
          <group key={i} position={[x, y, z]}>
            <mesh castShadow>
              <sphereGeometry args={[0.11, 14, 14]} />
              <meshStandardMaterial color="#fb923c" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.11, 0]}>
              <boxGeometry args={[0.05, 0.03, 0.03]} />
              <meshStandardMaterial color="#22c55e" />
            </mesh>
          </group>
        ))}
      </group>
      {/* Rising Warm Steam Sparkles */}
      <Sparkles
        count={18}
        scale={[1.8, 1.4, 1.8]}
        position={[0, 0.85, 0]}
        size={2.5}
        speed={0.45}
        opacity={0.55}
        color="#f8fafc"
      />
    </group>
  );
};

const SakuraTreeModel: React.FC = () => {
  const canopyRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (canopyRef.current) {
      canopyRef.current.rotation.z = Math.sin(t * 1.1) * 0.025;
      canopyRef.current.rotation.x = Math.cos(t * 0.9) * 0.02;
    }
  });

  return (
    <group>
      {/* Tree Trunk */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.36, 1.5, 10]} />
        <meshStandardMaterial color="#6b4423" roughness={0.85} />
      </mesh>
      {/* Side Branch */}
      <mesh position={[0.35, 1.25, 0.1]} rotation={[0, 0, -0.6]} castShadow>
        <cylinderGeometry args={[0.1, 0.16, 0.8, 8]} />
        <meshStandardMaterial color="#6b4423" roughness={0.85} />
      </mesh>
      {/* Sakura Pink Cloud Canopy */}
      <group ref={canopyRef} position={[0, 1.75, 0]}>
        <mesh position={[0, 0.15, 0]} castShadow>
          <dodecahedronGeometry args={[0.95, 1]} />
          <meshStandardMaterial color="#f9a8d4" roughness={0.5} />
        </mesh>
        <mesh position={[0.65, -0.1, 0.25]} castShadow>
          <dodecahedronGeometry args={[0.68, 1]} />
          <meshStandardMaterial color="#fbcfe8" roughness={0.5} />
        </mesh>
        <mesh position={[-0.6, -0.05, -0.2]} castShadow>
          <dodecahedronGeometry args={[0.72, 1]} />
          <meshStandardMaterial color="#f472b6" roughness={0.5} />
        </mesh>
        <mesh position={[0.1, 0.0, -0.65]} castShadow>
          <dodecahedronGeometry args={[0.65, 1]} />
          <meshStandardMaterial color="#f9a8d4" roughness={0.5} />
        </mesh>
      </group>
      {/* Falling Sakura Petals */}
      <Sparkles
        count={20}
        scale={[2.2, 2.2, 2.2]}
        position={[0, 1.2, 0]}
        size={2.8}
        speed={0.35}
        color="#fbcfe8"
      />
    </group>
  );
};

const DangoStallModel: React.FC<{ isLit: boolean }> = ({ isLit }) => {
  return (
    <group>
      {/* Red Bench / Counter */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.5, 0.85]} />
        <meshStandardMaterial color="#b45309" roughness={0.7} />
      </mesh>
      {/* Red Cloth Cover */}
      <mesh position={[0, 0.61, 0]} castShadow>
        <boxGeometry args={[1.56, 0.06, 0.9]} />
        <meshStandardMaterial color="#dc2626" roughness={0.5} />
      </mesh>
      {/* Plate of 3-Color Dango */}
      <group position={[-0.32, 0.67, 0.1]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.25, 0.2, 0.04, 16]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[-0.1, 0.07, 0]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial color="#f472b6" />
        </mesh>
        <mesh position={[0, 0.07, 0]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.1, 0.07, 0]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial color="#84cc16" />
        </mesh>
      </group>
      {/* Matcha Teacup */}
      <mesh position={[0.35, 0.72, 0.1]} castShadow>
        <cylinderGeometry args={[0.1, 0.08, 0.16, 14]} />
        <meshStandardMaterial color="#15803d" roughness={0.4} />
      </mesh>
      {/* Umbrella Pole */}
      <mesh position={[0.45, 1.15, -0.25]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2.1, 10]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      {/* Japanese Red Umbrella Top */}
      <mesh position={[0.45, 2.15, -0.25]} castShadow>
        <coneGeometry args={[1.25, 0.55, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.45} />
      </mesh>
      {/* Hanging Paper Lantern */}
      <mesh position={[-0.2, 1.72, -0.25]} castShadow>
        <sphereGeometry args={[0.16, 14, 14]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#f59e0b"
          emissiveIntensity={isLit ? 1.5 : 0.4}
        />
      </mesh>
    </group>
  );
};

const CushionModel: React.FC = () => {
  return (
    <group>
      {/* Tatami Straw Mat */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[1.6, 0.08, 1.6]} />
        <meshStandardMaterial color="#d9f99d" roughness={0.8} />
      </mesh>
      {/* Plump Round Cozy Cushion */}
      <mesh position={[0, 0.18, 0]} scale={[1, 0.42, 1]} castShadow receiveShadow>
        <sphereGeometry args={[0.68, 20, 16]} />
        <meshStandardMaterial color="#fb7185" roughness={0.55} />
      </mesh>
      {/* Center Button Stitch */}
      <mesh position={[0, 0.34, 0]}>
        <sphereGeometry args={[0.11, 12, 12]} />
        <meshStandardMaterial color="#fef08a" />
      </mesh>
    </group>
  );
};

const LanternModel: React.FC<{ isLit: boolean }> = ({ isLit }) => {
  return (
    <group>
      {/* Stone Base */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.38, 0.48, 0.24, 8]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.85} />
      </mesh>
      {/* Stone Pillar */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.65, 8]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.85} />
      </mesh>
      {/* Glowing Light Chamber */}
      <mesh position={[0, 1.02, 0]}>
        <boxGeometry args={[0.36, 0.34, 0.36]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#f59e0b"
          emissiveIntensity={isLit ? 2.2 : 0.6}
        />
      </mesh>
      {/* Pagoda Roof */}
      <mesh position={[0, 1.32, 0]} castShadow>
        <coneGeometry args={[0.58, 0.35, 6]} />
        <meshStandardMaterial color="#64748b" roughness={0.75} />
      </mesh>
      {/* Moss Accent */}
      <mesh position={[0.18, 1.38, 0.12]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#4ade80" roughness={0.9} />
      </mesh>
      {isLit && (
        <pointLight
          position={[0, 1.05, 0]}
          color="#fbbf24"
          intensity={2.2}
          distance={5.5}
        />
      )}
    </group>
  );
};

const StudyDeskModel: React.FC<{ isLit: boolean }> = ({ isLit }) => {
  return (
    <group>
      {/* Cozy Floor Mat */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[1.05, 1.05, 0.05, 24]} />
        <meshStandardMaterial color="#fde68a" roughness={0.8} />
      </mesh>
      {/* Wooden Low Desk Top */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.35, 0.08, 0.85]} />
        <meshStandardMaterial color="#92400e" roughness={0.6} />
      </mesh>
      {/* Desk Legs */}
      {[
        [-0.55, 0.2, -0.32],
        [0.55, 0.2, -0.32],
        [-0.55, 0.2, 0.32],
        [0.55, 0.2, 0.32],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <boxGeometry args={[0.09, 0.4, 0.09]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
      ))}
      {/* Open Book on Desk */}
      <mesh position={[-0.15, 0.48, 0.05]} rotation={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.45, 0.04, 0.34]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      {/* Stack of Books */}
      <mesh position={[0.38, 0.5, -0.12]} rotation={[0, -0.25, 0]} castShadow>
        <boxGeometry args={[0.32, 0.12, 0.26]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      {/* Cute Study Desk Lamp */}
      <group position={[-0.45, 0.46, -0.2]}>
        <mesh position={[0, 0.16, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.08, 0.32, 10]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0.06, 0.32, 0]} rotation={[0, 0, -0.4]}>
          <coneGeometry args={[0.14, 0.18, 12]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#f59e0b"
            emissiveIntensity={isLit ? 1.8 : 0.5}
          />
        </mesh>
      </group>
    </group>
  );
};

export const Furniture3D: React.FC<Furniture3DProps> = ({
  placedFurniture,
  maxSlots,
  isEditing,
  selectedFurnitureToPlace,
  onSelectSlot,
  isNightOrSunset,
}) => {
  return (
    <group>
      {FURNITURE_SLOTS.slice(0, maxSlots).map((coords, slotIndex) => {
        const placed = placedFurniture.find((p) => p.slotIndex === slotIndex);
        const info = placed ? FURNITURE_CATALOG[placed.furnitureId] : null;

        return (
          <group key={slotIndex} position={coords}>
            {/* Render actual 3D Furniture if placed */}
            {placed && (
              <group
                onClick={(e) => {
                  if (isEditing) {
                    e.stopPropagation();
                    onSelectSlot(slotIndex);
                  }
                }}
              >
                {placed.furnitureId === 'hotspring' && <HotSpringModel />}
                {placed.furnitureId === 'sakura_tree' && <SakuraTreeModel />}
                {placed.furnitureId === 'dango_stall' && <DangoStallModel isLit={isNightOrSunset} />}
                {placed.furnitureId === 'cushion' && <CushionModel />}
                {placed.furnitureId === 'lantern' && <LanternModel isLit={isNightOrSunset} />}
                {placed.furnitureId === 'study_desk' && <StudyDeskModel isLit={isNightOrSunset} />}
              </group>
            )}

            {/* Interactive Slot Ring when in Furniture Editing Mode */}
            {isEditing && (
              <group
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSlot(slotIndex);
                }}
              >
                <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[1.1, 1.32, 32]} />
                  <meshBasicMaterial
                    color={placed ? '#fbbf24' : '#38bdf8'}
                    transparent
                    opacity={0.85}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[1.1, 32]} />
                  <meshBasicMaterial
                    color={placed ? '#fef08a' : '#bae6fd'}
                    transparent
                    opacity={0.25}
                  />
                </mesh>
                <Html position={[0, 1.35, 0]} center distanceFactor={14}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSlot(slotIndex);
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap transition transform hover:scale-105 ${
                      placed
                        ? selectedFurnitureToPlace
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-rose-500/90 text-white'
                        : 'bg-sky-500 text-slate-950'
                    }`}
                  >
                    {placed
                      ? selectedFurnitureToPlace
                        ? `替换为 ${FURNITURE_CATALOG[selectedFurnitureToPlace].emoji}`
                        : `收起 ${info?.emoji}${info?.name}`
                      : selectedFurnitureToPlace
                      ? `+ 放置 ${FURNITURE_CATALOG[selectedFurnitureToPlace].emoji}${FURNITURE_CATALOG[selectedFurnitureToPlace].name}`
                      : `空景观位 #${slotIndex + 1}`}
                  </button>
                </Html>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};
