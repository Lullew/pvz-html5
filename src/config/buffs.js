// 15 关难度与增幅矩阵：每关难度系数 2^(n-1)，植物获得同步强力 buff
export const TOTAL_LEVELS = 15;

// 每关主题 buff（仅展示名，实际数值走下面公式，累计生效）
export const BUFF_NAMES = [
  '基础防线',
  '锋利茎叶',
  '急速光合作用',
  '阳光丰收',
  '坚韧树皮',
  '冰霜强化',
  '火药改良',
  '根系网络',
  '机械克星',
  '自然之怒',
  '生命涌流',
  '时空加速',
  '太阳风暴',
  '不败防线',
  '终极进化',
];

// 关卡 n（1..15）的全部生效倍率
export function getModifiers(n) {
  const level = Math.min(TOTAL_LEVELS, Math.max(1, n));
  const difficulty = 2 ** (level - 1);

  return {
    level,
    difficulty,
    buffName: BUFF_NAMES[level - 1],
    isBoss: level % 3 === 0,
    isFinal: level === TOTAL_LEVELS,

    // ---- 僵尸侧（难度翻倍）----
    zombieHpMul: difficulty, // 血量每关 ×2
    zombieSpeedMul: Math.min(2, 1 + 0.07 * (level - 1)), // 速度线性提升，封顶 ×2
    zombieCountMul: 1 + 0.35 * (level - 1), // 数量温和增长
    spawnCap: 24, // 单波刷怪上限，避免屏幕挤爆

    // ---- 植物侧（强力 buff，与难度对冲）----
    plantDamageMul: difficulty, // 伤害同步 ×2，保证需要的命中次数不变
    plantFireRateMul: Math.min(1.8, 1 + 0.06 * (level - 1)), // 攻速最高 +80%
    plantHpMul: 1.5 ** (level - 1), // 植物生命每关 ×1.5
    cardCooldownMul: Math.max(0.4, 1 - 0.04 * (level - 1)), // 卡牌冷却最低缩到 40%

    // ---- 经济 buff ----
    initialSun: 50 + 25 * (level - 1),
    sunValue: 25 + 5 * (level - 1), // 单枚阳光越来越值钱
    skyInterval: Math.max(4, 10 - 0.4 * (level - 1)), // 天降阳光越来越频繁

    // ---- 冰霜 buff ----
    frostFactor: Math.max(0.3, 0.5 - 0.015 * (level - 1)), // 减速更强，最低降到 30%
    frostDuration: Math.min(8, 5 + 0.2 * (level - 1)),
  };
}
