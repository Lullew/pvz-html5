// 游戏核心：状态机、实体容器、系统调度、输入分发、服务方法
import {
  VIEW,
  GRID,
  SUN_CFG,
  SHAKE_CFG,
  BANNER_CFG,
} from '../config/balance.js';
import { LEVELS } from '../config/levels.js';
import { PLANTS, PLANT_ORDER } from '../config/plants.js';
import { getModifiers, TOTAL_LEVELS } from '../config/buffs.js';
import { makeBossConfig } from '../config/boss.js';
import { Time } from './Time.js';
import { StateMachine } from './StateMachine.js';
import { Input } from './Input.js';
import { EventBus } from './EventBus.js';
import { ObjectPool } from './ObjectPool.js';
import { Camera } from './Camera.js';
import { pointInCircle, worldToGrid } from '../Collision.js';
import { Projectile } from '../entities/Projectile.js';
import { SunToken } from '../entities/SunToken.js';
import { Particle } from '../entities/Particle.js';
import { Zombie } from '../entities/Zombie.js';
import { Plant } from '../entities/Plant.js';
import { LawnMower } from '../entities/LawnMower.js';
import { Boss } from '../entities/Boss.js';
import { Renderer } from '../rendering/Renderer.js';
import { HUD } from '../ui/HUD.js';
import { Overlays } from '../ui/Overlays.js';
import { AudioManager } from '../audio/AudioManager.js';
import { SaveManager } from '../save/SaveManager.js';
import { DebugOverlay } from '../debug/DebugOverlay.js';
import { WaveSystem, bindProgressBoss } from '../systems/WaveSystem.js';
import { SunSystem } from '../systems/SunSystem.js';
import { ProjectileSystem } from '../systems/ProjectileSystem.js';
import { MowerSystem } from '../systems/MowerSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';

const TRANSITIONS = {
  MENU: ['LEVEL_SELECT', 'PLAYING'],
  LEVEL_SELECT: ['MENU', 'PLAYING'],
  PLAYING: ['PAUSED', 'VICTORY', 'DEFEAT'],
  PAUSED: ['PLAYING', 'LEVEL_SELECT', 'MENU'],
  VICTORY: ['PLAYING', 'MENU', 'LEVEL_SELECT'],
  DEFEAT: ['PLAYING', 'MENU', 'LEVEL_SELECT'],
};

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.view = VIEW;

    this.save = new SaveManager();
    this.audio = new AudioManager(this.save);
    this.input = new Input(canvas, VIEW.width, VIEW.height);
    this.time = new Time();
    this.camera = new Camera();
    this.bus = new EventBus();
    this.fsm = new StateMachine('MENU', TRANSITIONS);

    this.pools = {
      projectile: new ObjectPool(
        () => new Projectile(),
        (p, kind, row, x, damage) => p.reset(kind, row, x, damage)
      ),
      sun: new ObjectPool(
        () => new SunToken(),
        (s) => {
          s.active = false;
        }
      ),
      particle: new ObjectPool(
        () => new Particle(),
        (p, x, y, color, opts) => p.reset(x, y, color, opts)
      ),
      zombie: new ObjectPool(
        () => new Zombie(),
        (z, type, row, x) => z.reset(type, row, x)
      ),
    };

    this.renderer = new Renderer(this.ctx);
    this.hud = new HUD();
    this.overlays = new Overlays();
    this.debugView = new DebugOverlay();
    this.waveSystem = new WaveSystem();
    this.sunSystem = new SunSystem();
    this.projectileSystem = new ProjectileSystem();
    this.mowerSystem = new MowerSystem();
    this.combatSystem = new CombatSystem();

    this.debug = new URLSearchParams(window.location.search).has('debug');
    this.levelId = 0;
    this.boss = null;
    this.hoverCell = null;

    // 菜单状态下 Renderer 也会遍历容器，先给默认空值
    this.sun = 0;
    this.selectedCard = null;
    this.plantGrid = Array.from({ length: GRID.rows }, () =>
      Array(GRID.cols).fill(null)
    );
    this.plantList = [];
    this.zombies = [];
    this.projectiles = [];
    this.sunTokens = [];
    this.particles = [];
    this.telegraphs = [];
    this.mowers = [];
    this.cardCooldowns = {};
    for (const id of PLANT_ORDER) this.cardCooldowns[id] = 0;
    this.toast = { text: '', timer: 0 };
    this.bannerState = { text: '', timer: 0 };
    this.modifiers = getModifiers(1);

    requestAnimationFrame(this.loop);
  }

  get state() {
    return this.fsm.current;
  }

  get selectedPlantCfg() {
    return PLANTS[this.selectedCard];
  }

  // ---------------- 关卡生命周期 ----------------
  startLevel(levelId) {
    const level = LEVELS[levelId - 1];
    this.levelId = levelId;
    this.level = level;
    this.modifiers = getModifiers(levelId);
    this.sun = level.initialSun;
    this.plantGrid = Array.from({ length: GRID.rows }, () =>
      Array(GRID.cols).fill(null)
    );
    this.plantList = [];
    this.zombies = [];
    this.projectiles = [];
    this.sunTokens = [];
    this.particles = [];
    this.telegraphs = [];
    this.mowers = Array.from({ length: GRID.rows }, (_, r) => new LawnMower(r));
    this.boss = null;
    bindProgressBoss(null);
    this.selectedCard = null;
    this.cardCooldowns = {};
    for (const id of PLANT_ORDER) this.cardCooldowns[id] = 0;
    this.toast = { text: '', timer: 0 };
    this.bannerState = { text: '', timer: 0 };
    this.hoverCell = null;
    this.waveSystem.reset(level, this);
    this.sunSystem.reset(level.skySunInterval);
    this.time.reset();
    this.showBanner(
      this.modifiers.isFinal
        ? `最终决战 · ${this.modifiers.buffName}`
        : `第 ${levelId} 关 · 增幅：${this.modifiers.buffName}`
    );
    this.fsm.change('PLAYING');
  }

  // ---------------- 实体服务 ----------------
  spawnZombie(type, row, x) {
    const z = this.pools.zombie.acquire(type, row, x);
    this.applyZombieModifiers(z);
    this.zombies.push(z);
  }

  applyZombieModifiers(z) {
    const m = this.modifiers;
    z.modifiers = m;
    z.hp *= m.zombieHpMul;
    z.armor *= m.zombieHpMul;
    z.maxArmor = z.armor;
  }

  spawnBoss() {
    this.boss = new Boss(this, makeBossConfig(this.levelId));
    bindProgressBoss(this.boss);
  }

  spawnProjectile(kind, row, x, damage) {
    const p = this.pools.projectile.acquire(kind, row, x, damage);
    this.projectiles.push(p);
  }

  recycleProjectile(p) {
    const i = this.projectiles.indexOf(p);
    if (i >= 0) this.projectiles.splice(i, 1);
    p.active = false;
    this.pools.projectile.release(p);
  }

  spawnSkySun(x, targetY) {
    const s = this.pools.sun.acquire();
    s.resetSky(x, targetY, this.modifiers.sunValue);
    this.sunTokens.push(s);
  }

  spawnPlantSun(x, y, value) {
    const s = this.pools.sun.acquire();
    s.resetPlant(x, y, value);
    this.sunTokens.push(s);
  }

  recycleSun(s) {
    const i = this.sunTokens.indexOf(s);
    if (i >= 0) this.sunTokens.splice(i, 1);
    s.active = false;
    this.pools.sun.release(s);
  }

  damageZombie(z, amount, frost) {
    z.takeDamage(amount, frost);
  }

  killZombie(z) {
    z.alive = false;
  }

  damageBoss(amount) {
    if (this.boss && this.boss.alive) this.boss.takeDamage(amount);
  }

  onBossDead() {
    bindProgressBoss(null);
    for (const z of this.zombies) z.alive = false;
    this.boss = null;
  }

  // 圆形范围伤害：僵尸按中心距离，Boss 按圆与矩形最近点
  areaDamageAt(x, y, radius, damage) {
    for (const z of this.zombies) {
      if (!z.alive) continue;
      if (Math.hypot(z.x - x, z.y - y) <= radius) {
        z.takeDamage(damage, false);
      }
    }
    const b = this.boss;
    if (b && b.alive) {
      const nx = Math.max(b.box.x, Math.min(x, b.box.x + b.box.w));
      const ny = Math.max(b.box.y, Math.min(y, b.box.y + b.box.h));
      if (Math.hypot(x - nx, y - ny) <= radius) b.takeDamage(damage);
    }
  }

  burst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const p = this.pools.particle.acquire(x, y, color);
      this.particles.push(p);
    }
  }

  addTelegraph(rect, timer, color) {
    this.telegraphs.push({ ...rect, timer, total: timer, color });
  }

  shakeByName(name) {
    const preset = SHAKE_CFG[name];
    if (preset) this.camera.shake(preset.time, preset.magnitude);
  }

  showBanner(text) {
    this.bannerState = { text, timer: BANNER_CFG.duration };
  }

  // 兼容 Boss 中调用的命名
  banner(text) {
    this.showBanner(text);
  }

  showToast(text) {
    this.toast = { text, timer: 1.4 };
  }

  // ---------------- 结算 ----------------
  victory() {
    if (this.levelId < TOTAL_LEVELS) this.save.unlock(this.levelId + 1);
    this.fsm.change('VICTORY');
  }

  fail() {
    this.fsm.change('DEFEAT');
  }

  resume() {
    this.fsm.change('PLAYING');
  }

  // ---------------- 种植 ----------------
  toggleCard(id) {
    this.selectedCard = this.selectedCard === id ? null : id;
    this.audio.play('button');
  }

  tryPlant(row, col) {
    const id = this.selectedCard;
    const cfg = PLANTS[id];
    if (this.plantGrid[row][col]) {
      this.showToast('该格已有植物');
    } else if (this.cardCooldowns[id] > 0) {
      this.showToast('植物冷却中');
    } else if (this.sun < cfg.cost) {
      this.showToast('阳光不足');
    } else {
      const plant = new Plant(id, row, col, this);
      this.plantGrid[row][col] = plant;
      this.plantList.push(plant);
      this.sun -= cfg.cost;
      this.cardCooldowns[id] = cfg.cooldown * this.modifiers.cardCooldownMul;
      this.selectedCard = null;
      this.audio.play('button');
    }
  }

  // ---------------- 覆盖层动作 ----------------
  handleOverlayAction(id) {
    this.audio.play('button');
    switch (id) {
      case 'start':
        this.startLevel(1);
        break;
      case 'select':
        this.fsm.change('LEVEL_SELECT');
        break;
      case 'back':
        this.fsm.change('MENU');
        break;
      default:
        if (/^level(\d+)$/.test(id)) {
          this.startLevel(Number(id.slice(5)));
        }
        break;
      case 'resume':
        this.resume();
        break;
      case 'restart':
      case 'replay':
        this.startLevel(this.levelId);
        break;
      case 'next':
        this.startLevel(this.levelId + 1);
        break;
      case 'menu':
        this.fsm.change('MENU');
        break;
      case 'mute':
        this.audio.toggleMute();
        break;
    }
  }

  // ---------------- 输入 ----------------
  updateHover(x, y) {
    this.hoverCell = this.fsm.is('PLAYING') ? worldToGrid(x, y, GRID) : null;
  }

  handleInput() {
    const events = this.input.consume();
    for (const e of events) {
      if (e.kind === 'key') {
        if (e.key === 'escape') {
          if (this.fsm.is('PLAYING')) this.fsm.change('PAUSED');
          else if (this.fsm.is('PAUSED')) this.resume();
        } else if (e.key === '`' || e.key === '~') {
          this.debug = !this.debug;
        } else if (/^[1-6]$/.test(e.key) && this.fsm.is('PLAYING')) {
          this.toggleCard(PLANT_ORDER[Number(e.key) - 1]);
        }
        continue;
      }

      if (e.kind === 'move') {
        this.updateHover(e.x, e.y);
        continue;
      }
      if (e.kind !== 'down') continue;

      this.audio.unlock();

      if (!this.fsm.is('PLAYING')) {
        const id = this.overlays.hitTest(e.x, e.y);
        if (id) this.handleOverlayAction(id);
        continue;
      }

      if (this.hud.hitPause(e.x, e.y)) {
        this.fsm.change('PAUSED');
        continue;
      }

      // 收集阳光（上层优先）
      let collected = false;
      for (let i = this.sunTokens.length - 1; i >= 0; i -= 1) {
        const s = this.sunTokens[i];
        if (pointInCircle(e.x, e.y, s.x, s.y, SUN_CFG.collectRadius)) {
          this.sun += s.value;
          this.audio.play('sun');
          this.recycleSun(s);
          collected = true;
          break;
        }
      }
      if (collected) continue;

      const cardId = this.hud.cardBar.hitTest(e.x, e.y);
      if (cardId) {
        this.toggleCard(cardId);
        continue;
      }

      const cell = worldToGrid(e.x, e.y, GRID);
      if (cell) {
        if (this.selectedCard) this.tryPlant(cell.row, cell.col);
      } else {
        this.selectedCard = null;
      }
    }
  }

  // ---------------- 逻辑更新 ----------------
  tick(dt) {
    if (!this.fsm.is('PLAYING')) {
      this.camera.update(dt);
      return;
    }

    this.sunSystem.update(dt, this);
    this.waveSystem.update(dt, this);

    for (const p of [...this.plantList]) p.update(dt, this);
    for (const z of [...this.zombies]) z.update(dt, this);

    this.projectileSystem.update(dt, this);
    for (const s of [...this.sunTokens]) s.update(dt, this);
    this.mowerSystem.update(dt, this);
    if (this.boss) this.boss.update(dt, this);

    for (let i = this.telegraphs.length - 1; i >= 0; i -= 1) {
      const t = this.telegraphs[i];
      t.timer -= dt;
      if (t.timer <= 0) this.telegraphs.splice(i, 1);
    }

    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.update(dt);
      if (!p.active) {
        this.particles.splice(i, 1);
        this.pools.particle.release(p);
      }
    }

    this.combatSystem.update(dt, this);

    for (const id of PLANT_ORDER) {
      if (this.cardCooldowns[id] > 0) {
        this.cardCooldowns[id] = Math.max(0, this.cardCooldowns[id] - dt);
      }
    }
    if (this.bannerState.timer > 0) this.bannerState.timer -= dt;
    if (this.toast.timer > 0) this.toast.timer -= dt;
    this.camera.update(dt);
  }

  // ---------------- 主循环 ----------------
  loop = (rafTime) => {
    this.handleInput();
    this.time.update(rafTime, (dt) => this.tick(dt));

    this.renderer.render(this);
    if (this.fsm.is('PLAYING') || this.fsm.is('PAUSED')) {
      this.hud.draw(this.ctx, this);
    }
    if (!this.fsm.is('PLAYING')) this.overlays.draw(this.ctx, this);
    if (this.debug && this.fsm.is('PLAYING')) {
      this.debugView.draw(this.ctx, this);
    }
    requestAnimationFrame(this.loop);
  }
}
