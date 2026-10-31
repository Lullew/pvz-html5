// 僵王博士：大型 Boss 配置（非 AI 大语言模型）
import { getModifiers } from './buffs.js';

export const BOSS_CFG = {
  id: 'boss',
  name: '僵王博士',
  hp: 8000,
  widthCells: 2, // 碰撞箱宽 2 格
  heightCells: 2, // 高 2 格（覆盖中间两行）
  coverRows: [1, 2],
  creepSpeed: 0.05, // 空闲时缓慢左移，单位格/秒
  minCol: 6, // 左边界列，永不触碰小推车线
  enterCol: 8.4, // 入场目标位置（列坐标，可为小数）
  transitionTime: 2.5,
  transitionReduction: 0.5, // 转换期减伤 50%
  dyingTime: 2,
  summonCap: 10, // 场上普通僵尸总数上限
  // 阶段阈值（血量比例），数组下标即阶段号
  phases: [
    { threshold: 1.0, skills: ['summon', 'iceball'] },
    { threshold: 0.66, skills: ['summon', 'iceball', 'fireball', 'smash'] },
    { threshold: 0.33, skills: ['summon', 'iceball', 'fireball', 'smash', 'charge'] },
  ],
  skills: {
    summon: {
      // 每个阶段独立冷却与召唤数量区间
      cooldown: [20, 16, 12],
      countMin: [2, 3, 3],
      countMax: [3, 4, 5],
      pool: [
        ['normal', 'normal', 'cone'],
        ['normal', 'cone', 'bucket', 'pole'],
        ['normal', 'cone', 'bucket', 'pole', 'pole'],
      ],
    },
    iceball: {
      cooldown: 12,
      warnTime: 1.5,
      freezeRows: 3, // 命中行植物停火秒数
    },
    fireball: {
      cooldown: 10,
      warnTime: 1.5,
      burnTime: 4,
      burnDps: 200,
    },
    smash: {
      cooldown: 15,
      warnTime: 2,
      targetCol: 7,
    },
    charge: {
      cooldown: 18,
      warnTime: 1.2,
      actionTime: 1.4,
      destroyCols: 2,
    },
  },
};

// 按关卡生成 Boss 配置：血量随难度翻倍，终极 Boss 再强化
export function makeBossConfig(n) {
  const m = getModifiers(n);
  const cfg = structuredClone(BOSS_CFG);
  cfg.level = n;
  cfg.isFinal = m.isFinal;
  cfg.hp = Math.round(
    BOSS_CFG.hp * m.zombieHpMul * (m.isFinal ? 3 : 1)
  );
  cfg.summonCap = Math.min(20, 8 + n);
  const cdMul = m.cardCooldownMul * (m.isFinal ? 0.8 : 1);
  for (const key of Object.keys(cfg.skills)) {
    const skill = cfg.skills[key];
    if (Array.isArray(skill.cooldown)) {
      skill.cooldown = skill.cooldown.map((v) => Number((v * cdMul).toFixed(2)));
    } else {
      skill.cooldown = Number((skill.cooldown * cdMul).toFixed(2));
    }
  }
  return cfg;
}
