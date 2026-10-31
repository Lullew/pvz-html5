// 植物配置：阳光消耗、卡牌冷却、生命值、行为参数
export const PLANTS = {
  sunflower: {
    id: 'sunflower',
    name: '向日葵',
    cost: 50,
    cooldown: 7.5,
    hp: 300,
    behavior: 'sunflower',
    params: { firstProduce: 8, interval: 24, value: 25 },
    palette: { body: '#ffd34d', face: '#8a5a24', stem: '#4f9e3b' },
  },
  peashooter: {
    id: 'peashooter',
    name: '豌豆射手',
    cost: 100,
    cooldown: 7.5,
    hp: 300,
    behavior: 'shooter',
    params: { interval: 1.4, damage: 20, projectile: 'pea' },
    palette: { body: '#66bb47', rim: '#3f852c', stem: '#3f852c' },
  },
  wallnut: {
    id: 'wallnut',
    name: '坚果墙',
    cost: 50,
    cooldown: 30,
    hp: 4000,
    behavior: 'wall',
    params: { damageStage1: 0.66, damageStage2: 0.33 },
    palette: { body: '#c98a4b', dark: '#8a5a2b' },
  },
  snowpea: {
    id: 'snowpea',
    name: '寒冰射手',
    cost: 175,
    cooldown: 7.5,
    hp: 300,
    behavior: 'shooter',
    params: { interval: 1.4, damage: 20, projectile: 'snowpea' },
    palette: { body: '#5db7d6', rim: '#357f9c', stem: '#3f852c' },
  },
  cherrybomb: {
    id: 'cherrybomb',
    name: '樱桃炸弹',
    cost: 150,
    cooldown: 50,
    hp: 1,
    behavior: 'bomb',
    params: { fuse: 1.2, damage: 1800, radius: 1.5 }, // 半径单位：格
    palette: { body: '#e0352f', dark: '#9c1f1c', leaf: '#4f9e3b' },
  },
  potatomine: {
    id: 'potatomine',
    name: '土豆雷',
    cost: 25,
    cooldown: 30,
    hp: 300,
    behavior: 'mine',
    params: { armTime: 14, damage: 1800, radius: 1 },
    palette: { body: '#d8b46a', dark: '#9c7c3c', spike: '#b0b0b0' },
  },
};

// 卡牌栏顺序
export const PLANT_ORDER = [
  'sunflower',
  'peashooter',
  'wallnut',
  'snowpea',
  'cherrybomb',
  'potatomine',
];
