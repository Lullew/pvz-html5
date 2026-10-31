// 植物实体：六种行为（向日葵/射手/坚果/寒冰/樱桃炸弹/土豆雷）
import { PLANTS } from '../config/plants.js';
import { GRID, cellCenter, rowCenterY } from '../config/balance.js';
import { aabb } from '../core/Collision.js';

export class Plant {
  constructor(typeId, row, col, game) {
    this.typeId = typeId;
    this.cfg = PLANTS[typeId];
    this.row = row;
    this.col = col;
    const center = cellCenter(row, col);
    this.x = center.x;
    this.y = center.y;
    const mods = game.modifiers;
    this.maxHp = this.cfg.hp * mods.plantHpMul;
    this.hp = this.maxHp;
    this.alive = true;
    this.timer = 0;
    this.nextProduce = this.cfg.params?.firstProduce ?? 0;
    this.fuseTimer = this.cfg.params?.fuse ?? 0;
    this.armTimer = 0;
    this.armed = this.cfg.behavior !== 'mine';
    this.freezeTimer = 0; // 被冰球命中后停火
    this.burnTimer = 0;
    this.burnDps = 0;
    this.firePulse = 0;
  }

  get box() {
    return { x: this.x - 30, y: this.y - 32, w: 60, h: 64 };
  }

  // 坚果受损阶段 0/1/2
  get damageStage() {
    if (this.typeId !== 'wallnut') return 0;
    const ratio = this.hp / this.maxHp;
    if (ratio <= this.cfg.params.damageStage2) return 2;
    if (ratio <= this.cfg.params.damageStage1) return 1;
    return 0;
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }

  hasTargetAhead(game) {
    for (const z of game.zombies) {
      if (z.row === this.row && z.alive && z.x > this.x - 10) return true;
    }
    const boss = game.boss;
    if (
      boss &&
      boss.alive &&
      BOSS_COVER.includes(this.row) &&
      boss.box.x + boss.box.w > this.x
    ) {
      return true;
    }
    return false;
  }

  explode(game) {
    const p = this.cfg.params;
    const damage = p.damage * game.modifiers.plantDamageMul;
    game.areaDamageAt(this.x, this.y, p.radius * GRID.cell, damage);
    game.burst(this.x, this.y, this.cfg.palette.body, 30);
    game.audio.play('explosion');
    game.shakeByName('bomb');
    this.alive = false;
  }

  update(dt, game) {
    if (this.firePulse > 0) this.firePulse -= dt;
    if (this.freezeTimer > 0) this.freezeTimer -= dt;

    // 火球灼烧
    if (this.burnTimer > 0) {
      this.burnTimer -= dt;
      this.takeDamage(this.burnDps * dt);
      if (!this.alive) return;
    }

    const p = this.cfg.params || {};

    switch (this.cfg.behavior) {
      case 'sunflower': {
        this.timer += dt;
        if (this.timer >= this.nextProduce) {
          this.timer = 0;
          this.nextProduce = p.interval;
          game.spawnPlantSun(this.x + 10, this.y - 10, game.modifiers.sunValue);
          game.audio.play('produce');
        }
        break;
      }
      case 'shooter': {
        if (this.freezeTimer > 0) break;
        const effectiveInterval = p.interval / game.modifiers.plantFireRateMul;
        if (this.hasTargetAhead(game)) {
          this.timer += dt;
          if (this.timer >= effectiveInterval) {
            this.timer = 0;
            this.firePulse = 0.15;
            const damage = p.damage * game.modifiers.plantDamageMul;
            game.spawnProjectile(p.projectile, this.row, this.x + 18, damage);
            game.audio.play('shoot');
          }
        } else {
          this.timer = Math.min(this.timer, effectiveInterval);
        }
        break;
      }
      case 'wall':
        break;
      case 'bomb': {
        this.fuseTimer -= dt;
        if (this.fuseTimer <= 0) this.explode(game);
        break;
      }
      case 'mine': {
        if (!this.armed) {
          this.armTimer += dt;
          if (this.armTimer >= p.armTime) this.armed = true;
          break;
        }
        for (const z of game.zombies) {
          if (z.row !== this.row || !z.alive) continue;
          if (aabb(this.box, z.box)) {
            this.explode(game);
            return;
          }
        }
        break;
      }
      default:
        break;
    }
  }
}

import { BOSS_CFG } from '../config/boss.js';
const BOSS_COVER = BOSS_CFG.coverRows;
// 保留行中心引用以匹配模块统一口径
void rowCenterY;
