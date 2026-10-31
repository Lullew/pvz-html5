// 15 关配置：前 3 关保留手工布局，4-15 关按难度公式程序化生成；数值全部来自 buffs 矩阵
import { getModifiers, TOTAL_LEVELS } from './buffs.js';

// 前 3 关手工刷怪布局（spawn: type/time，row 缺省随机）
const HANDMADE = [
  [
    [
      { type: 'normal', time: 5 },
      { type: 'normal', time: 17 },
      { type: 'normal', time: 29 },
    ],
    [
      { type: 'normal', time: 2 },
      { type: 'normal', time: 10 },
      { type: 'cone', time: 18 },
      { type: 'normal', time: 24 },
      { type: 'normal', time: 30 },
    ],
    [
      { type: 'normal', time: 2 },
      { type: 'normal', time: 8 },
      { type: 'cone', time: 14 },
      { type: 'normal', time: 20 },
      { type: 'normal', time: 26 },
      { type: 'cone', time: 30 },
      { type: 'normal', time: 34 },
    ],
  ],
  [
    [
      { type: 'normal', time: 3 },
      { type: 'normal', time: 9 },
      { type: 'cone', time: 15 },
      { type: 'pole', time: 20 },
      { type: 'normal', time: 25 },
      { type: 'cone', time: 29 },
      { type: 'normal', time: 33 },
    ],
    [
      { type: 'normal', time: 2 },
      { type: 'cone', time: 7 },
      { type: 'normal', time: 12 },
      { type: 'bucket', time: 17 },
      { type: 'normal', time: 22 },
      { type: 'cone', time: 26 },
      { type: 'normal', time: 30 },
      { type: 'normal', time: 34 },
    ],
    [
      { type: 'normal', time: 2 },
      { type: 'pole', time: 6 },
      { type: 'cone', time: 10 },
      { type: 'normal', time: 14 },
      { type: 'bucket', time: 18 },
      { type: 'normal', time: 22 },
      { type: 'pole', time: 25 },
      { type: 'cone', time: 28 },
      { type: 'bucket', time: 31 },
      { type: 'normal', time: 34 },
      { type: 'normal', time: 37 },
      { type: 'cone', time: 40 },
      { type: 'normal', time: 43 },
    ],
  ],
  [
    [
      { type: 'normal', time: 2 },
      { type: 'cone', time: 6 },
      { type: 'normal', time: 10 },
      { type: 'pole', time: 14 },
      { type: 'bucket', time: 18 },
      { type: 'normal', time: 22 },
      { type: 'cone', time: 26 },
      { type: 'normal', time: 30 },
      { type: 'pole', time: 33 },
      { type: 'bucket', time: 36 },
      { type: 'normal', time: 39 },
      { type: 'cone', time: 42 },
      { type: 'normal', time: 45 },
    ],
    [
      { type: 'normal', time: 2 },
      { type: 'pole', time: 5 },
      { type: 'normal', time: 8 },
      { type: 'bucket', time: 12 },
      { type: 'normal', time: 16 },
      { type: 'pole', time: 19 },
      { type: 'normal', time: 22 },
      { type: 'bucket', time: 26 },
      { type: 'normal', time: 30 },
      { type: 'pole', time: 33 },
      { type: 'normal', time: 36 },
      { type: 'bucket', time: 39 },
      { type: 'normal', time: 42 },
      { type: 'pole', time: 45 },
    ],
    [],
  ],
];

const LEVEL_NAMES = [
  '初次防线',
  '铁甲压境',
  '僵王降临',
  '夜幕丛林',
  '荒野围攻',
  '机械再战',
  '腐蚀之地',
  '狂潮走廊',
  '双王对峙',
  '雷霆原野',
  '灰烬花园',
  '命运巨墙',
  '日食草坪',
  '末日前夜',
  '最终决战',
];

function typePool(n) {
  if (n <= 1) return ['normal'];
  if (n <= 3) return ['normal', 'normal', 'cone'];
  if (n <= 5) return ['normal', 'cone', 'cone', 'bucket'];
  if (n <= 8) return ['normal', 'cone', 'bucket', 'pole'];
  return ['normal', 'cone', 'cone', 'bucket', 'bucket', 'pole', 'pole'];
}

function pickType(n) {
  const pool = typePool(n);
  return pool[Math.floor(Math.random() * pool.length)];
}

function bossWave() {
  return { flag: true, boss: true, spawns: [] };
}

function makeWave(n, baseCount, flag) {
  const m = getModifiers(n);
  const count = Math.min(m.spawnCap, Math.round(baseCount * m.zombieCountMul));
  const span = Math.max(8, 32 - n * 1.2);
  const spawns = [];
  for (let i = 0; i < count; i += 1) {
    const time =
      count === 1 ? 2 : Number((2 + (i / (count - 1)) * span).toFixed(1));
    spawns.push({ type: pickType(n), time });
  }
  return { flag, spawns };
}

function buildLevel(n) {
  const m = getModifiers(n);
  let waves;

  if (n <= 3) {
    const flags = [false, true, true];
    waves = HANDMADE[n - 1].map((spawns, i) => ({
      flag: flags[i],
      spawns: spawns.map((s) => ({ ...s })),
    }));
    if (n === 3) waves[2] = bossWave();
  } else if (m.isBoss) {
    waves = [makeWave(n, 4, false), makeWave(n, 6, true), bossWave()];
  } else {
    waves = [
      makeWave(n, 3, false),
      makeWave(n, 5, true),
      makeWave(n, 7, true),
    ];
  }

  return {
    id: n,
    name: `第 ${n} 关 · ${LEVEL_NAMES[n - 1]}`,
    initialSun: m.initialSun,
    skySunInterval: m.skyInterval,
    sunValue: m.sunValue,
    waveGap: Number(Math.max(2, 7 - 0.35 * (n - 1)).toFixed(1)),
    waves,
  };
}

export const LEVELS = Array.from({ length: TOTAL_LEVELS }, (_, i) =>
  buildLevel(i + 1)
);
