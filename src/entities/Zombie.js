// 僵尸实体：行走/啃食/护甲/减速/撑杆跳，由对象池管理
import { ZOMBIES } from '../config/zombies.js';
import { GRID, FROST_CFG, rowCenterY } from '../config/balance.js';
import { aabb } from '../core/Collision.js';

export class Zombie {
  constructor() {
    this.alive = false;
  }

  reset(typeId, row, x) {
    this.typeId = typeId;
    this.cfg = ZOMBIES[typeId];
    this.row = row;
    this.hp = this.cfg.hp;
    this.armor = this.cfg.armorHp || 0;
    this.maxArmor = this.cfg.armorHp || 0;
    this.x = x ?? GRID.originX + GRID.cols * GRID.cell + 46;
    this.baseSpeed = this.cfg.speed;
    this.alive = true;
    this.slowTimer = 0;
    this.state = 'walking';
    this.attackTimer = 0;
    this.target = null;
    this.poleJumped = false;
    this.vaulting = 0;
    this.hurtFlash = 0;
    this.armorGone = this.armor <= 0;
  }

  get y() {
    return rowCenterY(this.row);
  }

  get box() {
    return { x: this.x - 20, y: this.y - 40, w: 40, h: 70 };
  }

  get currentSpeed() {
    let speed = this.poleJumped ? this.cfg.postJumpSpeed : this.baseSpeed;
    speed *= this.modifiers ? this.modifiers.zombieSpeedMul : 1;
    if (this.slowTimer > 0) {
      speed *= this.modifiers ? this.modifiers.frostFactor : FROST_CFG.factor;
    }
    return speed;
  }

  takeDamage(amount, frost = false) {
    if (frost) {
      this.slowTimer = this.modifiers
        ? this.modifiers.frostDuration
        : FROST_CFG.duration;
    }
    let rest = amount;
    if (this.armor > 0) {
      const absorbed = Math.min(this.armor, rest);
      this.armor -= absorbed;
      rest -= absorbed;
      if (this.armor <= 0) this.armorGone = true;
    }
    if (rest > 0) this.hp -= rest;
    this.hurtFlash = 0.12;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }

  update(dt, game) {
    if (this.hurtFlash > 0) this.hurtFlash -= dt;
    if (this.slowTimer > 0) this.slowTimer -= dt;

    // 撑杆跳跃中：快速越过，不啃食
    if (this.vaulting > 0) {
      this.vaulting -= dt;
      this.x += this.baseSpeed * GRID.cell * 2.2 * dt;
      if (this.vaulting <= 0) {
        this.poleJumped = true;
        this.target = null;
      }
      return;
    }

    // 寻找接触到的植物
    if (!this.target || !this.target.alive) {
      this.target = null;
      for (const plant of game.plantList) {
        if (plant.row !== this.row || !plant.alive) continue;
        if (aabb(this.box, plant.box)) {
          this.target = plant;
          break;
        }
      }
    }

    if (this.target) {
      // 撑杆僵尸第一次遇植物：起跳越过
      if (this.cfg.canPoleVault && !this.poleJumped) {
        this.vaulting = 0.55;
        game.audio.play('vault');
        return;
      }
      this.state = 'eating';
      this.attackTimer += dt;
      if (this.attackTimer >= this.cfg.attackInterval) {
        this.attackTimer = 0;
        this.target.takeDamage(this.cfg.damage);
        game.audio.play('chomp');
        if (!this.target.alive) this.target = null;
      }
    } else {
      this.state = 'walking';
      this.attackTimer = 0;
      this.x -= this.currentSpeed * GRID.cell * dt;
    }
  }
}
