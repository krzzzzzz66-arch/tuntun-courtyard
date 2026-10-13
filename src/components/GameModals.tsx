import React, { useState } from 'react';
import { X, Sparkles, Heart, Gift, Crown, Check, Compass } from 'lucide-react';
import {
  ACCESSORY_CATALOG,
  AccessoryId,
  AnimalInstance,
  COURTYARD_LEVELS,
  FURNITURE_CATALOG,
  FurnitureId,
  PlacedFurniture,
  SPECIES_CATALOG,
  SpeciesId,
  VARIANT_CATALOG,
  VariantId,
} from '../types/game';

export type ActiveModalType = 'none' | 'gacha' | 'breed' | 'roster' | 'furniture' | 'codex';

interface GameModalsProps {
  activeModal: ActiveModalType;
  onClose: () => void;
  acorns: number;
  scholarTickets: number;
  animals: AnimalInstance[];
  unlockedAccessories: AccessoryId[];
  ownedFurniture: Record<FurnitureId, number>;
  placedFurniture: PlacedFurniture[];
  courtyardLevel: number;
  lastUnboxedMessage: string | null;
  onOpenBlindBox: (type: 'normal' | 'scholar') => void;
  onBreedAnimals: (parentAId: string, parentBId: string) => void;
  onEquipAccessory: (animalId: string, acc: AccessoryId) => void;
  onToggleInCourtyard: (animalId: string) => void;
  onBuyFurniture: (fId: FurnitureId) => void;
  onStartPlacingFurniture: (fId: FurnitureId) => void;
  onUpgradeCourtyard: () => void;
  onResetSave: () => void;
}

export const GameModals: React.FC<GameModalsProps> = ({
  activeModal,
  onClose,
  acorns,
  scholarTickets,
  animals,
  unlockedAccessories,
  ownedFurniture,
  placedFurniture,
  courtyardLevel,
  lastUnboxedMessage,
  onOpenBlindBox,
  onBreedAnimals,
  onEquipAccessory,
  onToggleInCourtyard,
  onBuyFurniture,
  onStartPlacingFurniture,
  onUpgradeCourtyard,
  onResetSave,
}) => {
  const [parentA, setParentA] = useState<string>('');
  const [parentB, setParentB] = useState<string>('');

  if (activeModal === 'none') return null;

  const levelInfo = COURTYARD_LEVELS[courtyardLevel - 1] || COURTYARD_LEVELS[0];
  const nextLevelInfo = COURTYARD_LEVELS[courtyardLevel] || null;
  const activeCount = animals.filter((a) => a.inCourtyard).length;
  const breedableAnimals = animals.filter((a) => a.affection >= 3);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-pop-in">
      <div className="relative w-full max-w-2xl max-h-[82vh] flex flex-col rounded-3xl bg-slate-900/95 border border-white/15 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/50">
          <div className="flex items-center gap-2 font-extrabold text-base">
            {activeModal === 'gacha' && <>🎁 庭院惊喜盲盒屋</>}
            {activeModal === 'breed' && <>💕 爱心繁衍变异木屋</>}
            {activeModal === 'roster' && <>🦫 圆滚滚动物名册与衣橱 ({activeCount}/{levelInfo.maxAnimals} 在院中)</>}
            {activeModal === 'furniture' && <>🏮 3D 庭院造景与扩建</>}
            {activeModal === 'codex' && <>📖 变异图鉴与存档管理</>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {lastUnboxedMessage && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-pink-500/25 to-indigo-500/25 border border-amber-400/50 text-amber-200 text-sm font-bold flex items-center gap-2 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
              <span>{lastUnboxedMessage}</span>
            </div>
          )}

          {/* 1. GACHA MODAL */}
          {activeModal === 'gacha' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col justify-between">
                <div>
                  <div className="text-3xl mb-2">📦</div>
                  <h4 className="font-bold text-base text-amber-300">森之橡果盲盒</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    使用平时挂机和摸头攒下的橡果抽取！可开出全品种圆滚滚小动物、可爱小配饰，并有概率直接变异出【樱花果冻 / 宇治抹茶】形态！
                  </p>
                </div>
                <button
                  onClick={() => onOpenBlindBox('normal')}
                  disabled={acorns < 90}
                  className="mt-5 w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-extrabold text-sm transition"
                >
                  开启盲盒 (消耗 90 🌰)
                </button>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-indigo-900/60 to-purple-900/50 border border-indigo-400/30 p-5 flex flex-col justify-between">
                <div>
                  <div className="text-3xl mb-2">🎓</div>
                  <h4 className="font-bold text-base text-indigo-200">学霸限定传奇盲盒</h4>
                  <p className="text-xs text-indigo-100/80 mt-1 leading-relaxed">
                    完成写作业专注或消耗橡果开启！超高概率获得【黄金招财 / 星空幻梦 / 冰晶琉璃】传说神兽，以及限定【状元博士帽 / 迷你金皇冠】！
                  </p>
                </div>
                <div className="mt-5 space-y-2">
                  <button
                    onClick={() => onOpenBlindBox('scholar')}
                    disabled={scholarTickets < 1 && acorns < 260}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-400 to-amber-300 hover:opacity-95 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 text-slate-950 font-extrabold text-sm transition"
                  >
                    {scholarTickets > 0
                      ? `使用学霸盲盒券开启 (剩余 ${scholarTickets} 🎟️)`
                      : '豪华开启 (消耗 260 🌰)'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. BREED MODAL */}
          {activeModal === 'breed' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-400/25 text-xs text-pink-100 leading-relaxed">
                💡 <strong>奇妙繁衍法则：</strong>在庭院里摸摸头或投喂零食，让小动物好感度达到 <strong>3颗心 (❤️≥3)</strong> 即可结伴繁衍！高阶父母更容易孕育出【黄金招财、星空幻梦、冰晶琉璃】等稀有变异宝宝！
              </div>

              {breedableAnimals.length < 2 ? (
                <div className="text-center py-8 text-slate-300 text-sm">
                  当前满 3 颗好感心的小动物不足 2 只（目前 {breedableAnimals.length} 只）。
                  <br />
                  快去庭院里多戳一戳小动物或者扔几个三色团子吧！
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-pink-300 mb-1.5">选择亲代小动物 A</label>
                      <select
                        value={parentA}
                        onChange={(e) => setParentA(e.target.value)}
                        className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="">-- 请选择 --</option>
                        {breedableAnimals.map((a) => (
                          <option key={a.id} value={a.id} disabled={a.id === parentB}>
                            {SPECIES_CATALOG[a.species].emoji} {a.name} [{VARIANT_CATALOG[a.variant].name}] (❤️{a.affection})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-pink-300 mb-1.5">选择亲代小动物 B</label>
                      <select
                        value={parentB}
                        onChange={(e) => setParentB(e.target.value)}
                        className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="">-- 请选择 --</option>
                        {breedableAnimals.map((a) => (
                          <option key={a.id} value={a.id} disabled={a.id === parentA}>
                            {SPECIES_CATALOG[a.species].emoji} {a.name} [{VARIANT_CATALOG[a.variant].name}] (❤️{a.affection})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (parentA && parentB && parentA !== parentB) {
                        onBreedAnimals(parentA, parentB);
                      }
                    }}
                    disabled={!parentA || !parentB || parentA === parentB || acorns < 60}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-400 hover:to-rose-300 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                    <span>开始爱心繁衍孵化 (消耗 60 🌰 + 双方各2点好感)</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* 3. ROSTER & WARDROBE MODAL */}
          {activeModal === 'roster' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {animals.map((animal) => {
                const sInfo = SPECIES_CATALOG[animal.species];
                const vInfo = VARIANT_CATALOG[animal.variant];
                const income = Math.round(
                  sInfo.baseIncome * vInfo.incomeMultiplier +
                    ACCESSORY_CATALOG[animal.accessory].bonusIncome
                );

                return (
                  <div
                    key={animal.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="text-2xl w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                          {sInfo.emoji}
                        </div>
                        <div>
                          <div className="font-bold text-sm flex items-center gap-1.5">
                            <span>{animal.name}</span>
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
                              {vInfo.name}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            ❤️ 好感 {animal.affection}/10 · 产出 +{income}🌰/周期
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleInCourtyard(animal.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          animal.inCourtyard
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {animal.inCourtyard ? '在庭院中' : '休息中'}
                      </button>
                    </div>

                    {/* Accessory Selector */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/5">
                      <span className="text-[11px] text-slate-400 mr-1">戴配饰:</span>
                      {unlockedAccessories.map((accId) => {
                        const acc = ACCESSORY_CATALOG[accId];
                        const isSelected = animal.accessory === accId;
                        return (
                          <button
                            key={accId}
                            onClick={() => onEquipAccessory(animal.id, accId)}
                            title={`${acc.name} (+${acc.bonusIncome}产出)`}
                            className={`px-2 py-0.5 rounded-lg text-xs border transition ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                                : 'bg-slate-950/60 text-slate-300 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            {acc.emoji} {acc.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. FURNITURE & UPGRADE MODAL */}
          {activeModal === 'furniture' && (
            <div className="space-y-5">
              {/* Courtyard Expansion Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-400/30 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-extrabold text-emerald-300 flex items-center gap-1.5">
                    <Crown className="w-4 h-4" /> 当前规模：{levelInfo.name}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {nextLevelInfo
                      ? `下一级【${nextLevelInfo.name}】：上限提升至 ${nextLevelInfo.maxAnimals} 只动物、${nextLevelInfo.maxSlots} 个景观位！`
                      : '已达到最高级云端蓬莱仙境！'}
                  </p>
                </div>
                {nextLevelInfo && (
                  <button
                    onClick={onUpgradeCourtyard}
                    disabled={acorns < nextLevelInfo.upgradeCost}
                    className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-extrabold text-xs shrink-0 transition"
                  >
                    扩建庭院 ({nextLevelInfo.upgradeCost} 🌰)
                  </button>
                )}
              </div>

              {/* Furniture List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(Object.keys(FURNITURE_CATALOG) as FurnitureId[]).map((fId) => {
                  const f = FURNITURE_CATALOG[fId];
                  const ownedCount = ownedFurniture[fId] || 0;
                  const placedCount = placedFurniture.filter((p) => p.furnitureId === fId).length;
                  const availableToPlace = ownedCount - placedCount;

                  return (
                    <div
                      key={fId}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm flex items-center gap-1.5">
                            <span className="text-xl">{f.emoji}</span> {f.name}
                          </span>
                          <span className="text-xs text-emerald-300 font-semibold">
                            庭院加成 +{f.incomeBoostPct}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{f.description}</p>
                        <div className="text-[11px] text-slate-400 mt-1.5">
                          已拥有: {ownedCount} 件 (已摆出 {placedCount} 件)
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => onBuyFurniture(fId)}
                          disabled={acorns < f.cost}
                          className="flex-1 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-xs transition"
                        >
                          购买 ({f.cost} 🌰)
                        </button>
                        {availableToPlace > 0 && (
                          <button
                            onClick={() => {
                              onStartPlacingFurniture(fId);
                              onClose();
                            }}
                            className="flex-1 py-1.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition"
                          >
                            <Compass className="w-3.5 h-3.5" /> 去庭院摆放
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. CODEX & SAVE MODAL */}
          {activeModal === 'codex' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold text-amber-300 mb-2">🌟 稀有变异形态图鉴</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {(Object.keys(VARIANT_CATALOG) as VariantId[]).map((vId) => {
                    const v = VARIANT_CATALOG[vId];
                    const unlocked = animals.some((a) => a.variant === vId);
                    return (
                      <div
                        key={vId}
                        className={`p-3 rounded-xl border text-xs ${
                          unlocked
                            ? 'bg-amber-400/10 border-amber-400/40 text-white'
                            : 'bg-slate-950/50 border-white/5 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{v.name}</span>
                          <span className="text-[10px] text-amber-300">{v.badge}</span>
                        </div>
                        <div className="text-[11px] mt-1 opacity-80">
                          产出倍率: ×{v.incomeMultiplier}
                        </div>
                        <div className="mt-1.5 text-[10px] flex items-center gap-1">
                          {unlocked ? (
                            <span className="text-emerald-300 flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> 已收集
                            </span>
                          ) : (
                            <span>未解锁（盲盒或繁衍获取）</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-amber-300 mb-2">🐾 物种收集进度</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {(Object.keys(SPECIES_CATALOG) as SpeciesId[]).map((sId) => {
                    const s = SPECIES_CATALOG[sId];
                    const count = animals.filter((a) => a.species === sId).length;
                    return (
                      <div
                        key={sId}
                        className={`p-2.5 rounded-xl border text-center ${
                          count > 0
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-slate-950/50 border-white/5 text-slate-500'
                        }`}
                      >
                        <div className="text-2xl">{s.emoji}</div>
                        <div className="text-xs font-bold mt-1">{s.name}</div>
                        <div className="text-[10px] text-amber-300 mt-0.5">拥有 {count} 只</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  游戏进度已自动保存在浏览器本地存储 (支持离线收益结算)。
                </span>
                <button
                  onClick={onResetSave}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 text-xs font-semibold transition"
                >
                  重置初始存档
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
