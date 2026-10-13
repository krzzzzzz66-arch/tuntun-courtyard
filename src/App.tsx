import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  CloudSun,
  Sunset,
  Moon,
  CloudRain,
  Gift,
  Heart,
  Users,
  Compass,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ACCESSORY_CATALOG,
  AccessoryId,
  AmbientSoundId,
  AnimalInstance,
  COURTYARD_LEVELS,
  DroppedSnack,
  FloatingFeedback,
  FURNITURE_CATALOG,
  FurnitureId,
  HomeworkTask,
  PlacedFurniture,
  SNACK_CATALOG,
  SnackId,
  SPECIES_CATALOG,
  SpeciesId,
  TreasureDrop,
  VARIANT_CATALOG,
  VariantId,
  WeatherId,
} from './types/game';
import { CourtyardScene } from './components/CourtyardScene';
import { FocusWidget } from './components/FocusWidget';
import { GameModals, ActiveModalType } from './components/GameModals';
import { soundEngine } from './utils/audio';

const STORAGE_KEY = 'tuntun_courtyard_save_v1';

const DEFAULT_ANIMALS: AnimalInstance[] = [
  {
    id: 'a1',
    name: '圆圆',
    species: 'capybara',
    variant: 'normal',
    accessory: 'yuzu',
    affection: 4,
    level: 1,
    inCourtyard: true,
    bornAt: Date.now(),
  },
  {
    id: 'a2',
    name: '大橘',
    species: 'cat',
    variant: 'sakura',
    accessory: 'glasses',
    affection: 3,
    level: 1,
    inCourtyard: true,
    bornAt: Date.now(),
  },
  {
    id: 'a3',
    name: '呱呱',
    species: 'frog',
    variant: 'normal',
    accessory: 'none',
    affection: 3,
    level: 1,
    inCourtyard: true,
    bornAt: Date.now(),
  },
];

const DEFAULT_FURNITURE: PlacedFurniture[] = [
  { slotIndex: 0, furnitureId: 'hotspring' },
  { slotIndex: 1, furnitureId: 'sakura_tree' },
];

export const App: React.FC = () => {
  // Game State
  const [acorns, setAcorns] = useState<number>(150);
  const [scholarTickets, setScholarTickets] = useState<number>(1);
  const [courtyardLevel, setCourtyardLevel] = useState<number>(1);
  const [animals, setAnimals] = useState<AnimalInstance[]>(DEFAULT_ANIMALS);
  const [unlockedAccessories, setUnlockedAccessories] = useState<AccessoryId[]>([
    'none',
    'yuzu',
    'glasses',
  ]);
  const [ownedFurniture, setOwnedFurniture] = useState<Record<FurnitureId, number>>({
    hotspring: 1,
    sakura_tree: 1,
    dango_stall: 0,
    cushion: 0,
    lantern: 0,
    study_desk: 0,
  });
  const [placedFurniture, setPlacedFurniture] = useState<PlacedFurniture[]>(DEFAULT_FURNITURE);

  // Environment & Audio
  const [weather, setWeather] = useState<WeatherId>('sunny');
  const [ambientSound, setAmbientSound] = useState<AmbientSoundId>('off');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Live in-game interactive objects
  const [droppedSnacks, setDroppedSnacks] = useState<DroppedSnack[]>([]);
  const [treasures, setTreasures] = useState<TreasureDrop[]>([]);
  const [activeSnackBrush, setActiveSnackBrush] = useState<SnackId | null>(null);
  const [floaters, setFloaters] = useState<FloatingFeedback[]>([]);

  // Study Focus Mode
  const [isFocusing, setIsFocusing] = useState<boolean>(false);
  const [focusModeType, setFocusModeType] = useState<'countdown' | 'stopwatch'>('countdown');
  const [focusSeconds, setFocusSeconds] = useState<number>(0);
  const [targetDuration, setTargetDuration] = useState<number>(25 * 60);
  const [homeworkTasks, setHomeworkTasks] = useState<HomeworkTask[]>([
    { id: 't1', text: '完成数学作业第3页', completed: false },
    { id: 't2', text: '背诵英语课文5分钟', completed: false },
  ]);

  // Modals & Furniture Placement UI
  const [activeModal, setActiveModal] = useState<ActiveModalType>('none');
  const [isEditingFurniture, setIsEditingFurniture] = useState<boolean>(false);
  const [selectedFurnitureToPlace, setSelectedFurnitureToPlace] = useState<FurnitureId | null>(null);
  const [lastUnboxedMessage, setLastUnboxedMessage] = useState<string | null>(null);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const [isBottomDockCollapsed, setIsBottomDockCollapsed] = useState<boolean>(false);

  const acornsRef = useRef(acorns);
  acornsRef.current = acorns;

  // 1. Load from localStorage & compute offline idle rewards
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (typeof data.acorns === 'number') setAcorns(data.acorns);
        if (typeof data.scholarTickets === 'number') setScholarTickets(data.scholarTickets);
        if (typeof data.courtyardLevel === 'number') setCourtyardLevel(data.courtyardLevel);
        if (Array.isArray(data.animals) && data.animals.length > 0) setAnimals(data.animals);
        if (Array.isArray(data.unlockedAccessories)) setUnlockedAccessories(data.unlockedAccessories);
        if (data.ownedFurniture) setOwnedFurniture(data.ownedFurniture);
        if (Array.isArray(data.placedFurniture)) setPlacedFurniture(data.placedFurniture);
        if (Array.isArray(data.homeworkTasks)) setHomeworkTasks(data.homeworkTasks);

        // Offline earnings
        if (data.lastSavedAt) {
          const elapsedSec = Math.floor((Date.now() - data.lastSavedAt) / 1000);
          if (elapsedSec >= 40) {
            const cappedSec = Math.min(elapsedSec, 3600 * 8); // cap at 8h
            const offlineAcorns = Math.floor((cappedSec / 6) * 4);
            setAcorns((prev) => prev + offlineAcorns);
            setOfflineNotice(
              `欢迎回来！你离开的 ${(cappedSec / 60).toFixed(0)} 分钟里，小动物们为你拾取了 ${offlineAcorns} 颗橡果 🌰！`
            );
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // 2. Auto-save to localStorage
  useEffect(() => {
    const timer = setInterval(() => {
      const payload = {
        acorns,
        scholarTickets,
        courtyardLevel,
        animals,
        unlockedAccessories,
        ownedFurniture,
        placedFurniture,
        homeworkTasks,
        lastSavedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }, 4000);
    return () => clearInterval(timer);
  }, [
    acorns,
    scholarTickets,
    courtyardLevel,
    animals,
    unlockedAccessories,
    ownedFurniture,
    placedFurniture,
    homeworkTasks,
  ]);

  // 3. Passive Idle Acorns Ticker (every 4 seconds)
  useEffect(() => {
    const ticker = setInterval(() => {
      const activeAnimals = animals.filter((a) => a.inCourtyard);
      if (activeAnimals.length === 0) return;

      let sumIncome = 0;
      activeAnimals.forEach((a) => {
        const s = SPECIES_CATALOG[a.species];
        const v = VARIANT_CATALOG[a.variant];
        const acc = ACCESSORY_CATALOG[a.accessory];
        const animalIncome = s.baseIncome * v.incomeMultiplier + acc.bonusIncome;
        sumIncome += animalIncome;
      });

      // Furniture bonus percentage
      let fBoostPct = 0;
      placedFurniture.forEach((pf) => {
        fBoostPct += FURNITURE_CATALOG[pf.furnitureId].incomeBoostPct;
      });

      const totalCycleGain = Math.round(
        sumIncome * (1 + fBoostPct / 100) * (isFocusing ? 2.0 : 1.0)
      );

      setAcorns((prev) => prev + totalCycleGain);

      // 18% chance for animals to dig up a golden treasure chest on the courtyard!
      if (Math.random() < 0.18 && treasures.length < 3) {
        const luckyAnimal = activeAnimals[Math.floor(Math.random() * activeAnimals.length)];
        const angle = Math.random() * Math.PI * 2;
        const dist = 1.5 + Math.random() * 2.8;
        const newTreasure: TreasureDrop = {
          id: 'tr_' + Date.now(),
          position: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist],
          acorns: 25 + Math.floor(Math.random() * 45),
          hasTicket: Math.random() < 0.2,
          foundByAnimalName: luckyAnimal.name,
        };
        setTreasures((prev) => [...prev, newTreasure]);
      }
    }, 4000);

    return () => clearInterval(ticker);
  }, [animals, placedFurniture, isFocusing, treasures.length]);

  // 4. Study Focus Mode Timer Ticker
  useEffect(() => {
    if (!isFocusing) return;
    const interval = setInterval(() => {
      setFocusSeconds((prev) => {
        const next = prev + 1;
        if (focusModeType === 'countdown' && next >= targetDuration) {
          // Focus finished successfully!
          handleFinishFocus();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isFocusing, focusModeType, targetDuration]);

  const handleFinishFocus = () => {
    setIsFocusing(false);
    setFocusSeconds(0);
    soundEngine.playFocusComplete();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    // Grant Scholar Blind Box Ticket & big acorn bonus!
    setScholarTickets((prev) => prev + 1);
    setAcorns((prev) => prev + 120);
    setLastUnboxedMessage('🎉 专注写作业完成！获得【学霸限定盲盒券】×1 与 120 颗橡果 🌰！');
    setActiveModal('gacha');
  };

  const handleStartFocus = (mode: 'countdown' | 'stopwatch', durationSec: number) => {
    setFocusModeType(mode);
    setTargetDuration(durationSec);
    setFocusSeconds(0);
    setIsFocusing(true);
    setIsBottomDockCollapsed(true);
  };

  const handleStopFocus = (early: boolean) => {
    if (early) {
      setIsFocusing(false);
      setFocusSeconds(0);
    } else {
      handleFinishFocus();
    }
  };

  // 5. Sound controls
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundEngine.setMuted(nextMute);
  };

  const handleChangeAmbient = (mode: AmbientSoundId) => {
    setAmbientSound(mode);
    soundEngine.setAmbientMode(mode);
  };

  // 6. Tactile 3D Petting squish feedback
  const handlePetAnimal = (animalId: string, worldPos: [number, number, number]) => {
    soundEngine.playSquish();
    setAnimals((prev) =>
      prev.map((a) => {
        if (a.id === animalId) {
          return { ...a, affection: Math.min(10, a.affection + 1) };
        }
        return a;
      })
    );
    // Instant acorn burst
    const bonus = 5 + Math.floor(Math.random() * 8);
    setAcorns((prev) => prev + bonus);

    // Floating heart floater
    const floaterId = 'f_' + Date.now();
    setFloaters((prev) => [
      ...prev,
      {
        id: floaterId,
        text: `❤️ +1 好感度 (+${bonus}🌰)`,
        color: '#f43f5e',
      },
    ]);
    setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== floaterId));
    }, 1200);
  };

  // 7. Toss snack into 3D Courtyard
  const handleTossSnackAt = (pos: [number, number, number]) => {
    if (!activeSnackBrush) return;
    const snackInfo = SNACK_CATALOG[activeSnackBrush];
    if (acorns < snackInfo.cost) return;

    setAcorns((prev) => prev - snackInfo.cost);
    soundEngine.playToss();

    const newSnack: DroppedSnack = {
      id: 'snack_' + Date.now(),
      snackId: activeSnackBrush,
      position: [pos[0], 0, pos[2]],
      createdAt: Date.now(),
    };
    setDroppedSnacks((prev) => [...prev, newSnack]);
  };

  // 8. Animal eats snack
  const handleConsumeSnack = (snackId: string, animalId: string) => {
    const found = droppedSnacks.find((s) => s.id === snackId);
    if (!found) return;
    const snackInfo = SNACK_CATALOG[found.snackId];

    soundEngine.playCoin();
    setDroppedSnacks((prev) => prev.filter((s) => s.id !== snackId));

    setAnimals((prev) =>
      prev.map((a) => {
        if (a.id === animalId) {
          return {
            ...a,
            affection: Math.min(10, a.affection + snackInfo.affectionGain),
          };
        }
        return a;
      })
    );
    setAcorns((prev) => prev + snackInfo.acornBurst);
  };

  // 9. Claim dug-up 3D treasure chest
  const handleClaimTreasure = (treasureId: string) => {
    const found = treasures.find((t) => t.id === treasureId);
    if (!found) return;
    soundEngine.playCoin();
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });

    setAcorns((prev) => prev + found.acorns);
    if (found.hasTicket) {
      setScholarTickets((prev) => prev + 1);
    }
    setTreasures((prev) => prev.filter((t) => t.id !== treasureId));

    const floaterId = 'f_tr_' + Date.now();
    setFloaters((prev) => [
      ...prev,
      {
        id: floaterId,
        text: `🎁 开宝获得 +${found.acorns} 橡果${found.hasTicket ? ' +1 盲盒券!' : ''}`,
        color: '#f59e0b',
      },
    ]);
    setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== floaterId));
    }, 1500);
  };

  // 10. Open Blind Box (Gacha)
  const handleOpenBlindBox = (type: 'normal' | 'scholar') => {
    soundEngine.playGacha();
    confetti({ particleCount: 65, spread: 60, origin: { y: 0.5 } });

    if (type === 'normal') {
      setAcorns((prev) => prev - 90);
    } else {
      if (scholarTickets > 0) {
        setScholarTickets((prev) => prev - 1);
      } else {
        setAcorns((prev) => prev - 260);
      }
    }

    // Decide loot: 65% new/extra animal, 35% new accessory
    const roll = Math.random();
    if (roll < 0.65) {
      const allSpecies: SpeciesId[] = ['capybara', 'cat', 'shiba', 'frog', 'duck', 'redpanda'];
      const chosenSpecies = allSpecies[Math.floor(Math.random() * allSpecies.length)];

      let variant: VariantId = 'normal';
      if (type === 'scholar') {
        const rareWeights: VariantId[] = ['gold', 'starlight', 'crystal', 'sakura', 'matcha'];
        variant = rareWeights[Math.floor(Math.random() * rareWeights.length)];
      } else {
        if (Math.random() < 0.35) {
          variant = Math.random() < 0.5 ? 'sakura' : 'matcha';
        }
      }

      const randomAcc: AccessoryId =
        unlockedAccessories[Math.floor(Math.random() * unlockedAccessories.length)];
      const sInfo = SPECIES_CATALOG[chosenSpecies];
      const vInfo = VARIANT_CATALOG[variant];

      const newAnimal: AnimalInstance = {
        id: 'a_' + Date.now(),
        name: `${sInfo.name}${animals.length + 1}号`,
        species: chosenSpecies,
        variant,
        accessory: randomAcc,
        affection: 2,
        level: 1,
        inCourtyard: animals.filter((a) => a.inCourtyard).length < COURTYARD_LEVELS[courtyardLevel - 1].maxAnimals,
        bornAt: Date.now(),
      };

      setAnimals((prev) => [...prev, newAnimal]);
      setLastUnboxedMessage(`🎊 恭喜开出：【${vInfo.name} · ${sInfo.name}】(${vInfo.badge})！`);
    } else {
      const allAccs: AccessoryId[] = [
        'yuzu',
        'glasses',
        'sakura_crown',
        'straw_hat',
        'frog_hat',
        'crown',
        'bachelor_cap',
      ];
      const unownedAccs = allAccs.filter((a) => !unlockedAccessories.includes(a));
      const chosenAcc =
        unownedAccs.length > 0
          ? unownedAccs[Math.floor(Math.random() * unownedAccs.length)]
          : allAccs[Math.floor(Math.random() * allAccs.length)];

      if (!unlockedAccessories.includes(chosenAcc)) {
        setUnlockedAccessories((prev) => [...prev, chosenAcc]);
      }
      const accInfo = ACCESSORY_CATALOG[chosenAcc];
      setLastUnboxedMessage(`✨ 恭喜获得配饰：【${accInfo.emoji} ${accInfo.name}】！可在动物衣橱中自由穿戴。`);
    }
  };

  // 11. Breed two animals
  const handleBreed = (pAId: string, pBId: string) => {
    const a = animals.find((x) => x.id === pAId);
    const b = animals.find((x) => x.id === pBId);
    if (!a || !b) return;

    soundEngine.playGacha();
    confetti({ particleCount: 75, spread: 65, origin: { y: 0.55 } });
    setAcorns((prev) => prev - 60);

    // Consume 2 affection points
    setAnimals((prev) =>
      prev.map((x) => {
        if (x.id === pAId || x.id === pBId) {
          return { ...x, affection: Math.max(0, x.affection - 2) };
        }
        return x;
      })
    );

    // Baby inherits species from either parent
    const childSpecies = Math.random() < 0.5 ? a.species : b.species;

    // Mutation roll:
    let childVariant: VariantId = Math.random() < 0.5 ? a.variant : b.variant;
    const mutateRoll = Math.random();
    if (mutateRoll < 0.45) {
      const rareList: VariantId[] = ['sakura', 'matcha', 'gold', 'starlight', 'crystal'];
      childVariant = rareList[Math.floor(Math.random() * rareList.length)];
    }

    const sInfo = SPECIES_CATALOG[childSpecies];
    const vInfo = VARIANT_CATALOG[childVariant];

    const baby: AnimalInstance = {
      id: 'baby_' + Date.now(),
      name: `小${sInfo.name}`,
      species: childSpecies,
      variant: childVariant,
      accessory: a.accessory !== 'none' ? a.accessory : 'none',
      affection: 2,
      level: 1,
      inCourtyard: animals.filter((x) => x.inCourtyard).length < COURTYARD_LEVELS[courtyardLevel - 1].maxAnimals,
      bornAt: Date.now(),
    };

    setAnimals((prev) => [...prev, baby]);
    setLastUnboxedMessage(
      `💕 孵化成功！诞生了一只圆滚滚的【${vInfo.name} · ${sInfo.name}】(${vInfo.badge})！`
    );
  };

  // 12. Furniture placement
  const handleSelectFurnitureSlot = (slotIndex: number) => {
    if (selectedFurnitureToPlace) {
      // Place or replace
      setPlacedFurniture((prev) => {
        const filtered = prev.filter((p) => p.slotIndex !== slotIndex);
        return [...filtered, { slotIndex, furnitureId: selectedFurnitureToPlace }];
      });
      setSelectedFurnitureToPlace(null);
      setIsEditingFurniture(false);
      soundEngine.playCoin();
    } else {
      // Remove placed furniture if clicked without selection
      setPlacedFurniture((prev) => prev.filter((p) => p.slotIndex !== slotIndex));
      soundEngine.playSquish();
    }
  };

  const handleBuyFurniture = (fId: FurnitureId) => {
    const f = FURNITURE_CATALOG[fId];
    if (acorns < f.cost) return;
    setAcorns((prev) => prev - f.cost);
    setOwnedFurniture((prev) => ({
      ...prev,
      [fId]: (prev[fId] || 0) + 1,
    }));
    soundEngine.playCoin();
  };

  const handleUpgradeCourtyard = () => {
    const nextLevel = COURTYARD_LEVELS[courtyardLevel];
    if (!nextLevel || acorns < nextLevel.upgradeCost) return;
    setAcorns((prev) => prev - nextLevel.upgradeCost);
    setCourtyardLevel((prev) => prev + 1);
    soundEngine.playGacha();
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none font-sans">
      {/* 3D Courtyard Scene Canvas */}
      <CourtyardScene
        courtyardLevel={courtyardLevel}
        weather={weather}
        animals={animals}
        placedFurniture={placedFurniture}
        droppedSnacks={droppedSnacks}
        treasures={treasures}
        isFocusing={isFocusing}
        isEditingFurniture={isEditingFurniture}
        selectedFurnitureToPlace={selectedFurnitureToPlace}
        activeSnackBrush={activeSnackBrush}
        onPetAnimal={handlePetAnimal}
        onConsumeSnack={handleConsumeSnack}
        onTossSnackAt={handleTossSnackAt}
        onClaimTreasure={handleClaimTreasure}
        onSelectFurnitureSlot={handleSelectFurnitureSlot}
      />

      {/* Floating Petting / Reward Feedback Pills */}
      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
        {floaters.map((fl) => (
          <div
            key={fl.id}
            className="animate-float-up px-3.5 py-1.5 rounded-full bg-slate-900/90 text-sm font-bold shadow-2xl border border-white/20"
            style={{ color: fl.color }}
          >
            {fl.text}
          </div>
        ))}
      </div>

      {/* TOP HEADER HUD */}
      <div className="absolute top-3 inset-x-3 z-20 flex items-start justify-between gap-3 pointer-events-none">
        {/* Left: Resource Badges & Courtyard Level */}
        <div className="pointer-events-auto flex items-center gap-2 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/15 text-white shadow-lg flex items-center gap-2">
            <span className="text-base">🌰</span>
            <span className="font-extrabold text-sm text-amber-300 font-mono">
              {acorns.toLocaleString()}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-2xl bg-indigo-950/80 backdrop-blur-xl border border-indigo-400/30 text-white shadow-lg flex items-center gap-1.5">
            <span className="text-base">🎟️</span>
            <span className="font-bold text-xs text-indigo-200">
              {scholarTickets} 盲盒券
            </span>
          </div>

          <button
            onClick={() => setActiveModal('furniture')}
            className="px-3 py-1.5 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900/90 backdrop-blur-xl border border-emerald-400/30 text-emerald-200 shadow-lg text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>🏮</span>
            <span>{COURTYARD_LEVELS[courtyardLevel - 1].name}</span>
          </button>
        </div>

        {/* Right: Weather & Audio Atmosphere Switcher */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-xl border border-white/15 p-1 rounded-2xl shadow-lg">
          {/* Weather Buttons */}
          <button
            onClick={() => setWeather('sunny')}
            title="春日晴樱"
            className={`p-1.5 rounded-xl transition ${
              weather === 'sunny' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <CloudSun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeather('sunset')}
            title="黄昏暖霞"
            className={`p-1.5 rounded-xl transition ${
              weather === 'sunset' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Sunset className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeather('night')}
            title="夏夜萤火"
            className={`p-1.5 rounded-xl transition ${
              weather === 'night' ? 'bg-indigo-400 text-slate-950 shadow' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeather('rain')}
            title="听雨温泉"
            className={`p-1.5 rounded-xl transition ${
              weather === 'rain' ? 'bg-sky-400 text-slate-950 shadow' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <CloudRain className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-white/15 mx-0.5" />

          {/* White Noise Ambient Selector */}
          <button
            onClick={() =>
              handleChangeAmbient(
                ambientSound === 'off' ? 'rain' : ambientSound === 'rain' ? 'hotspring' : 'off'
              )
            }
            title={`陪读白噪音: ${
              ambientSound === 'off' ? '已关闭' : ambientSound === 'rain' ? '细雨声' : '温泉溪流'
            }`}
            className={`px-2 py-1 rounded-xl text-xs font-semibold transition ${
              ambientSound !== 'off'
                ? 'bg-emerald-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:bg-white/10'
            }`}
          >
            {ambientSound === 'off' ? '🎵 白噪音' : ambientSound === 'rain' ? '🌧️ 细雨' : '♨️ 汤泉'}
          </button>

          {/* Master Mute Toggle */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? '点击取消静音' : '点击静音'}
            className="p-1.5 rounded-xl text-slate-300 hover:bg-white/10 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* TOP LEFT: Homework Study Focus Widget */}
      <div className="absolute top-16 left-3 z-20 pointer-events-auto">
        <FocusWidget
          isFocusing={isFocusing}
          focusModeType={focusModeType}
          focusSeconds={focusSeconds}
          targetDuration={targetDuration}
          homeworkTasks={homeworkTasks}
          onStartFocus={handleStartFocus}
          onStopFocus={handleStopFocus}
          onAddTask={(text) =>
            setHomeworkTasks((prev) => [...prev, { id: 't_' + Date.now(), text, completed: false }])
          }
          onToggleTask={(id) => {
            setHomeworkTasks((prev) =>
              prev.map((t) => {
                if (t.id === id) {
                  const nextCompleted = !t.completed;
                  if (nextCompleted) {
                    soundEngine.playCoin();
                    setAcorns((a) => a + 35);
                  }
                  return { ...t, completed: nextCompleted };
                }
                return t;
              })
            );
          }}
          onDeleteTask={(id) => setHomeworkTasks((prev) => prev.filter((t) => t.id !== id))}
        />
      </div>

      {/* PLACEMENT HINT BANNER */}
      {isEditingFurniture && (
        <div className="absolute top-16 inset-x-0 z-20 flex justify-center pointer-events-none">
          <div className="pointer-events-auto px-4 py-2 rounded-2xl bg-sky-500/90 text-slate-950 font-bold text-xs shadow-xl flex items-center gap-3">
            <span>
              {selectedFurnitureToPlace
                ? `点击庭院中的圆环槽位放置：${FURNITURE_CATALOG[selectedFurnitureToPlace].emoji} ${FURNITURE_CATALOG[selectedFurnitureToPlace].name}`
                : '布置模式：点击已有景观可收起，或在下方选择家具摆放'}
            </span>
            <button
              onClick={() => {
                setIsEditingFurniture(false);
                setSelectedFurnitureToPlace(null);
              }}
              className="px-2 py-0.5 rounded-lg bg-slate-950 text-white font-bold"
            >
              完成退出
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM ACTION DOCK */}
      <div className="absolute bottom-3 inset-x-3 z-20 flex flex-col items-center pointer-events-none gap-2">
        {/* Snack Toss Tray */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/80 backdrop-blur-xl border border-white/15 px-3 py-1.5 rounded-2xl shadow-xl">
          <span className="text-xs font-bold text-amber-300 mr-1">投喂零食:</span>
          {(['yuzu_fruit', 'dried_fish', 'matcha_dango'] as SnackId[]).map((sId) => {
            const snack = SNACK_CATALOG[sId];
            const isSelected = activeSnackBrush === sId;
            return (
              <button
                key={sId}
                onClick={() => setActiveSnackBrush(isSelected ? null : sId)}
                title={`${snack.name} (${snack.cost}🌰) - 扔进院子小动物会抢着吃！`}
                className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 transition ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-extrabold shadow'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <span>{snack.emoji}</span>
                <span>{snack.name}</span>
                <span className="text-[10px] opacity-80">{snack.cost}🌰</span>
              </button>
            );
          })}
          {activeSnackBrush && (
            <span className="text-[11px] text-emerald-300 ml-1">
              👈 点击庭院任意草地即可抛投！
            </span>
          )}
        </div>

        {/* Main Dock Buttons (Can be collapsed for clean study view) */}
        <div className="pointer-events-auto flex items-center gap-2">
          {!isBottomDockCollapsed ? (
            <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-2xl border border-white/15 p-1.5 rounded-2xl shadow-2xl">
              <button
                onClick={() => setActiveModal('gacha')}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:opacity-95 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow"
              >
                <Gift className="w-4 h-4" />
                <span>惊喜盲盒</span>
              </button>

              <button
                onClick={() => setActiveModal('breed')}
                className="px-3 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/30 text-pink-200 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Heart className="w-4 h-4" />
                <span>爱心繁衍</span>
              </button>

              <button
                onClick={() => setActiveModal('roster')}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Users className="w-4 h-4" />
                <span>动物衣橱</span>
              </button>

              <button
                onClick={() => setActiveModal('furniture')}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Compass className="w-4 h-4" />
                <span>庭院造景</span>
              </button>

              <button
                onClick={() => setActiveModal('codex')}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <BookOpen className="w-4 h-4" />
                <span>图鉴存档</span>
              </button>

              <button
                onClick={() => setIsBottomDockCollapsed(true)}
                title="收起菜单，享受纯净庭院"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsBottomDockCollapsed(false)}
              className="px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-slate-200 text-xs font-bold hover:bg-slate-900 flex items-center gap-1.5 shadow-lg"
            >
              <ChevronUp className="w-4 h-4" />
              <span>展开游戏菜单</span>
            </button>
          )}
        </div>
      </div>

      {/* Offline Earnings Welcome Modal */}
      {offlineNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-400/40 p-6 text-center shadow-2xl text-white animate-pop-in">
            <div className="text-4xl mb-3">🧺</div>
            <h3 className="font-extrabold text-base text-amber-300">小动物为你守候庭院</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">{offlineNotice}</p>
            <button
              onClick={() => {
                soundEngine.playCoin();
                setOfflineNotice(null);
              }}
              className="mt-5 w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-lg transition"
            >
              开心收下 🌰
            </button>
          </div>
        </div>
      )}

      {/* Sub-Modals (Gacha, Breed, Wardrobe, Furniture, Codex) */}
      <GameModals
        activeModal={activeModal}
        onClose={() => setActiveModal('none')}
        acorns={acorns}
        scholarTickets={scholarTickets}
        animals={animals}
        unlockedAccessories={unlockedAccessories}
        ownedFurniture={ownedFurniture}
        placedFurniture={placedFurniture}
        courtyardLevel={courtyardLevel}
        lastUnboxedMessage={lastUnboxedMessage}
        onOpenBlindBox={handleOpenBlindBox}
        onBreedAnimals={handleBreed}
        onEquipAccessory={(aId, acc) =>
          setAnimals((prev) =>
            prev.map((a) => (a.id === aId ? { ...a, accessory: acc } : a))
          )
        }
        onToggleInCourtyard={(aId) =>
          setAnimals((prev) =>
            prev.map((a) => (a.id === aId ? { ...a, inCourtyard: !a.inCourtyard } : a))
          )
        }
        onBuyFurniture={handleBuyFurniture}
        onStartPlacingFurniture={(fId) => {
          setSelectedFurnitureToPlace(fId);
          setIsEditingFurniture(true);
        }}
        onUpgradeCourtyard={handleUpgradeCourtyard}
        onResetSave={() => {
          localStorage.removeItem(STORAGE_KEY);
          window.location.reload();
        }}
      />
    </div>
  );
};

export default App;
