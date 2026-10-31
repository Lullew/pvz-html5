// 全局平衡常量：所有数值集中在此，逻辑代码不写死数值
export const VIEW = {
  width: 900,
  height: 570,
  hudHeight: 76,
};

// 草坪网格：5 行 9 列，单位像素
export const GRID = {
  rows: 5,
  cols: 9,
  cell: 80,
  originX: 70,
  originY: 85,
};

// 阳光
export const SUN_CFG = {
  value: 25,
  fallTime: 7, // 天降阳光下落秒数
  startY: -30,
  lifetime: 30, // 落地后停留秒数
  collectRadius: 36,
  popRise: 46, // 向日葵产出时上浮距离
};

// 子弹（速度单位：格/秒）
export const PROJECTILE_CFG = {
  speed: 4.2,
  radius: 8,
  peaColor: '#7fc242',
  snowColor: '#8fd8ff',
};

// 冰冻/减速
export const FROST_CFG = {
  factor: 0.5,
  duration: 5,
};

// 小推车
export const MOWER_CFG = {
  offsetX: -54, // 相对网格左边界的初始位置
  speed: 9, // 格/秒
  triggerLine: 14, // 僵尸越过网格左边界多少像素触发
  bossDamage: 500,
};

// 爆炸通用
export const BURST_CFG = {
  particleCount: 26,
};

// 波次之间（清场后）的间隔秒数，按关卡覆盖
export const DEFAULT_WAVE_GAP = 6;

// 难度提示横幅时长
export const BANNER_CFG = {
  duration: 2.2,
};

// 屏幕震动预设
export const SHAKE_CFG = {
  smash: { time: 0.45, magnitude: 9 },
  charge: { time: 0.5, magnitude: 12 },
  bomb: { time: 0.35, magnitude: 7 },
  hit: { time: 0.12, magnitude: 3 },
};

// 网格坐标与世界像素互转
export function cellCenter(row, col) {
  return {
    x: GRID.originX + col * GRID.cell + GRID.cell / 2,
    y: GRID.originY + row * GRID.cell + GRID.cell / 2,
  };
}

export function cellTopLeft(row, col) {
  return {
    x: GRID.originX + col * GRID.cell,
    y: GRID.originY + row * GRID.cell,
  };
}

export function rowCenterY(row) {
  return GRID.originY + row * GRID.cell + GRID.cell / 2;
}
