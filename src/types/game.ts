export type SpeciesId = 'capybara' | 'cat' | 'shiba' | 'frog' | 'duck' | 'redpanda';

export type VariantId = 'normal' | 'sakura' | 'matcha' | 'gold' | 'starlight' | 'crystal';

export type AccessoryId =
  | 'none'
  | 'yuzu'
  | 'glasses'
  | 'sakura_crown'
  | 'straw_hat'
  | 'frog_hat'
  | 'crown'
  | 'bachelor_cap';

export type FurnitureId =
  | 'hotspring'
  | 'sakura_tree'
  | 'dango_stall'
  | 'cushion'
  | 'lantern'
  | 'study_desk';

export type WeatherId = 'sunny' | 'sunset' | 'night' | 'rain';

export type AmbientSoundId = 'off' | 'rain' | 'hotspring';

export type SnackId = 'yuzu_fruit' | 'dried_fish' | 'matcha_dango';

export interface SpeciesInfo {
  id: SpeciesId;
  name: string;
  emoji: string;
  description: string;
  baseIncome: number; // acorns per 5 seconds
  baseColor: string;
  bellyColor: string;
  favoriteFurniture: FurnitureId;
}

export interface VariantInfo {
  id: VariantId;
  name: string;
  badge: string;
  rarity: 1 | 2 | 3 | 4;
  incomeMultiplier: number;
  colorOverride?: string;
  emissiveColor?: string;
  metalness?: number;
  roughness?: number;
  transmission?: boolean;
  description: string;
}

export interface AccessoryInfo {
  id: AccessoryId;
  name: string;
  emoji: string;
  rarity: 1 | 2 | 3;
  bonusIncome: number;
  description: string;
}

export interface FurnitureInfo {
  id: FurnitureId;
  name: string;
  emoji: string;
  cost: number;
  incomeBoostPct: number;
  description: string;
  interactionText: string;
}

export interface SnackInfo {
  id: SnackId;
  name: string;
  emoji: string;
  cost: number;
  affectionGain: number;
  acornBurst: number;
  color: string;
  description: string;
}

export interface AnimalInstance {
  id: string;
  name: string;
  species: SpeciesId;
  variant: VariantId;
  accessory: AccessoryId;
  affection: number; // 0 to 10 (at >= 3 can breed)
  level: number;
  inCourtyard: boolean;
  bornAt: number;
}

export interface PlacedFurniture {
  slotIndex: number;
  furnitureId: FurnitureId;
}

export interface DroppedSnack {
  id: string;
  snackId: SnackId;
  position: [number, number, number];
  createdAt: number;
}

export interface TreasureDrop {
  id: string;
  position: [number, number, number];
  acorns: number;
  hasTicket: boolean;
  foundByAnimalName: string;
}

export interface HomeworkTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface FloatingFeedback {
  id: string;
  text: string;
  subtext?: string;
  color: string;
}

export interface CourtyardLevelInfo {
  level: number;
  name: string;
  maxAnimals: number;
  maxSlots: number;
  islandRadius: number;
  upgradeCost: number;
  description: string;
}

export const SPECIES_CATALOG: Record<SpeciesId, SpeciesInfo> = {
  capybara: {
    id: 'capybara',
    name: '卡皮巴拉',
    emoji: '🦫',
    description: '情绪极度稳定的圆滚滚水豚，最喜欢泡在热气腾腾的柚子温泉里发呆。',
    baseIncome: 4,
    baseColor: '#b57c4a',
    bellyColor: '#d6a577',
    favoriteFurniture: 'hotspring',
  },
  cat: {
    id: 'cat',
    name: '蜜柑圆肥猫',
    emoji: '🐱',
    description: '圆成一个球的橘白小肥猫，写作业时会在软垫上发出治愈的呼噜声。',
    baseIncome: 4,
    baseColor: '#f59e0b',
    bellyColor: '#fef3c7',
    favoriteFurniture: 'cushion',
  },
  shiba: {
    id: 'shiba',
    name: '元气豆柴犬',
    emoji: '🐕',
    description: '长着白色豆豆眉和卷尾巴的圆润小柴犬，最擅长在院子里挖出隐藏宝箱！',
    baseIncome: 5,
    baseColor: '#d97706',
    bellyColor: '#fffbeb',
    favoriteFurniture: 'study_desk',
  },
  frog: {
    id: 'frog',
    name: '青团小雨蛙',
    emoji: '🐸',
    description: '软糯像青团一样的圆肚小蛙，鼓着粉红腮红，最爱雨天和温泉水汽。',
    baseIncome: 4,
    baseColor: '#4ade80',
    bellyColor: '#dcfce7',
    favoriteFurniture: 'hotspring',
  },
  duck: {
    id: 'duck',
    name: '糯米团小鸭',
    emoji: '🦆',
    description: '白白胖胖、走起路来一摇一摆的糯米团子鸭，最喜欢在茶摊旁等团子吃。',
    baseIncome: 5,
    baseColor: '#fffbeb',
    bellyColor: '#fef9c3',
    favoriteFurniture: 'dango_stall',
  },
  redpanda: {
    id: 'redpanda',
    name: '栗子小熊猫',
    emoji: '🦊',
    description: '拖着蓬松条纹大尾巴的圆脸小熊猫，喜欢趴在樱花树下陪你一起读书。',
    baseIncome: 6,
    baseColor: '#ea580c',
    bellyColor: '#ffedd5',
    favoriteFurniture: 'sakura_tree',
  },
};

export const VARIANT_CATALOG: Record<VariantId, VariantInfo> = {
  normal: {
    id: 'normal',
    name: '原色自然',
    badge: '★ 普通',
    rarity: 1,
    incomeMultiplier: 1.0,
    description: '最淳朴自然的毛色，温暖治愈。',
  },
  sakura: {
    id: 'sakura',
    name: '樱花果冻',
    badge: '★★ 稀有',
    rarity: 2,
    incomeMultiplier: 1.5,
    colorOverride: '#f472b6',
    emissiveColor: '#fbcfe8',
    roughness: 0.2,
    transmission: true,
    description: '如同春日樱花果冻般粉嫩通透的变异形态，自带甜蜜气息！',
  },
  matcha: {
    id: 'matcha',
    name: '宇治抹茶',
    badge: '★★ 稀有',
    rarity: 2,
    incomeMultiplier: 1.5,
    colorOverride: '#84cc16',
    emissiveColor: '#d9f99d',
    roughness: 0.35,
    description: '散发着淡淡宇治抹茶清香的翠绿配色，看一眼就能缓解视疲劳。',
  },
  gold: {
    id: 'gold',
    name: '黄金招财',
    badge: '★★★ 史诗',
    rarity: 3,
    incomeMultiplier: 2.2,
    colorOverride: '#fbbf24',
    emissiveColor: '#f59e0b',
    metalness: 0.75,
    roughness: 0.18,
    description: '金光闪闪的招财瑞兽形态！不仅颜值华丽，橡果产出更是翻倍增长！',
  },
  starlight: {
    id: 'starlight',
    name: '星空幻梦',
    badge: '★★★★ 传说',
    rarity: 4,
    incomeMultiplier: 3.0,
    colorOverride: '#6366f1',
    emissiveColor: '#818cf8',
    metalness: 0.4,
    roughness: 0.15,
    description: '披着银河星尘的梦幻神兽，周身环绕着闪烁星光粒子！',
  },
  crystal: {
    id: 'crystal',
    name: '冰晶琉璃',
    badge: '★★★★ 传说',
    rarity: 4,
    incomeMultiplier: 3.2,
    colorOverride: '#38bdf8',
    emissiveColor: '#7dd3fc',
    metalness: 0.2,
    roughness: 0.08,
    transmission: true,
    description: '晶莹剔透如极地冰晶琉璃般的罕见变异，是庭院里最闪耀的奇迹！',
  },
};

export const ACCESSORY_CATALOG: Record<AccessoryId, AccessoryInfo> = {
  none: {
    id: 'none',
    name: '不戴配饰',
    emoji: '✨',
    rarity: 1,
    bonusIncome: 0,
    description: '露出圆滚滚的脑袋，自然可爱。',
  },
  yuzu: {
    id: 'yuzu',
    name: '温泉小甜橙',
    emoji: '🍊',
    rarity: 1,
    bonusIncome: 2,
    description: '稳稳顶在头顶的饱满小甜橙，卡皮巴拉的灵魂本体！',
  },
  glasses: {
    id: 'glasses',
    name: '学霸圆框镜',
    emoji: '👓',
    rarity: 1,
    bonusIncome: 2,
    description: '戴上立刻知识渊博！陪你写作业时全员都会自动戴上它。',
  },
  sakura_crown: {
    id: 'sakura_crown',
    name: '春日樱花环',
    emoji: '🌸',
    rarity: 2,
    bonusIncome: 4,
    description: '用新鲜樱花编织的小花环，仙气飘飘。',
  },
  straw_hat: {
    id: 'straw_hat',
    name: '田园小草帽',
    emoji: '👒',
    rarity: 2,
    bonusIncome: 4,
    description: '遮阳又休闲的编织小草帽，充满夏日度假感。',
  },
  frog_hat: {
    id: 'frog_hat',
    name: '青蛙荷叶帽',
    emoji: '🍀',
    rarity: 2,
    bonusIncome: 5,
    description: '碧绿的荷叶小帽子，雨天也不会淋湿脑袋。',
  },
  crown: {
    id: 'crown',
    name: '迷你金皇冠',
    emoji: '👑',
    rarity: 3,
    bonusIncome: 8,
    description: '镶嵌红宝石的纯金迷你皇冠，庭院小霸主专属！',
  },
  bachelor_cap: {
    id: 'bachelor_cap',
    name: '状元博士帽',
    emoji: '🎓',
    rarity: 3,
    bonusIncome: 10,
    description: '学霸盲盒限定流苏博士帽，祝你逢考必过、下笔有神！',
  },
};

export const FURNITURE_CATALOG: Record<FurnitureId, FurnitureInfo> = {
  hotspring: {
    id: 'hotspring',
    name: '桧木柚子温泉',
    emoji: '♨️',
    cost: 80,
    incomeBoostPct: 20,
    description: '热气腾腾的露天温泉，漂浮着清香柚子，小动物们最爱跳进去泡澡！',
    interactionText: '正在舒服地泡柚子温泉 ♨️',
  },
  sakura_tree: {
    id: 'sakura_tree',
    name: '千年落樱树',
    emoji: '🌸',
    cost: 100,
    incomeBoostPct: 20,
    description: '粉云般盛开的樱花树，花瓣随风飘落，小动物喜欢在树荫下乘凉打盹。',
    interactionText: '正在樱花树下发呆赏花 🌸',
  },
  dango_stall: {
    id: 'dango_stall',
    name: '抹茶团子茶屋',
    emoji: '🍡',
    cost: 140,
    incomeBoostPct: 25,
    description: '撑着红纸伞的日式茶点摊，摆满三色花见团子与热抹茶。',
    interactionText: '正在茶屋偷吃三色团子 🍡',
  },
  cushion: {
    id: 'cushion',
    name: '暖阳软垫猫窝',
    emoji: '🛋️',
    cost: 70,
    incomeBoostPct: 15,
    description: '松软厚实的和风坐垫，任何圆滚滚动物走过去都会忍不住趴下呼呼大睡。',
    interactionText: '正趴在软垫上呼呼大睡 💤',
  },
  lantern: {
    id: 'lantern',
    name: '青苔石灯笼',
    emoji: '🏮',
    cost: 90,
    incomeBoostPct: 18,
    description: '古朴的日式庭院石灯笼，黄昏与夜晚会亮起温暖柔和的橘色灯光。',
    interactionText: '正在好奇地打量石灯笼 🏮',
  },
  study_desk: {
    id: 'study_desk',
    name: '陪读小书案',
    emoji: '📚',
    cost: 120,
    incomeBoostPct: 25,
    description: '放着迷你书本与小台灯的原木矮桌，写作业时小动物会围坐在这里陪你苦读！',
    interactionText: '正在认真研读《如何更圆润》 📖',
  },
};

export const SNACK_CATALOG: Record<SnackId, SnackInfo> = {
  yuzu_fruit: {
    id: 'yuzu_fruit',
    name: '黄金甜柚',
    emoji: '🍊',
    cost: 15,
    affectionGain: 1,
    acornBurst: 22,
    color: '#fb923c',
    description: '扔进院子里会吸引附近的小动物屁颠屁颠跑过来围抢，增加好感并爆出橡果！',
  },
  dried_fish: {
    id: 'dried_fish',
    name: '香烤小鱼干',
    emoji: '🐟',
    cost: 30,
    affectionGain: 2,
    acornBurst: 45,
    color: '#f59e0b',
    description: '鲜香扑鼻的烤小鱼干，小动物吃掉后好感度 +2，并掉落丰厚橡果！',
  },
  matcha_dango: {
    id: 'matcha_dango',
    name: '特制三色团子',
    emoji: '🍡',
    cost: 55,
    affectionGain: 3,
    acornBurst: 85,
    color: '#f472b6',
    description: '超豪华的三色糯米团子，能让小动物瞬间好感度暴涨 +3（直接满足繁衍条件）！',
  },
};

export const COURTYARD_LEVELS: CourtyardLevelInfo[] = [
  {
    level: 1,
    name: 'Lv.1 苔痕小院',
    maxAnimals: 5,
    maxSlots: 4,
    islandRadius: 5.5,
    upgradeCost: 0,
    description: '温馨静谧的初心庭院，可容纳 5 只小动物与 4 处景观。',
  },
  {
    level: 2,
    name: 'Lv.2 落樱庭院',
    maxAnimals: 8,
    maxSlots: 6,
    islandRadius: 6.8,
    upgradeCost: 350,
    description: '扩建后的宽敞庭院，新增石板步道，可容纳 8 只小动物与 6 处景观！',
  },
  {
    level: 3,
    name: 'Lv.3 汤泉名苑',
    maxAnimals: 11,
    maxSlots: 8,
    islandRadius: 8.0,
    upgradeCost: 900,
    description: '远近闻名的治愈汤泉名苑，可容纳 11 只小动物与 8 处景观！',
  },
  {
    level: 4,
    name: 'Lv.4 云端蓬莱境',
    maxAnimals: 15,
    maxSlots: 10,
    islandRadius: 9.2,
    upgradeCost: 2200,
    description: '终极浮空仙境庭院，可同时容纳 15 只圆滚滚神兽与 10 处豪华景观！',
  },
];

// Predefined furniture slot coordinates on the 3D island (ring layout)
export const FURNITURE_SLOTS: [number, number, number][] = [
  [-2.6, 0, -2.2], // Slot 0 (Lv1)
  [2.6, 0, -2.2],  // Slot 1 (Lv1)
  [-2.8, 0, 1.8],  // Slot 2 (Lv1)
  [2.8, 0, 1.8],   // Slot 3 (Lv1)
  [0, 0, -3.8],    // Slot 4 (Lv2)
  [-4.2, 0, -0.2], // Slot 5 (Lv2)
  [4.2, 0, -0.2],  // Slot 6 (Lv3)
  [0, 0, 3.8],     // Slot 7 (Lv3)
  [-4.4, 0, -3.5], // Slot 8 (Lv4)
  [4.4, 0, 3.5],   // Slot 9 (Lv4)
];
