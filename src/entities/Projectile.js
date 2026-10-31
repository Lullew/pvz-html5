// 豌豆 / 冰豌豆，由对象池管理
import { GRID, PROJECTILE_CFG, rowCenterY } from '../config/balance.js';
import { aabb } from '../core/Collision.js';

export class Projectile {
  constructor() {
    this.active = false;
  }

  reset(kind, row, x, damage) {
    this.active = true;
    this.kind = kind;
    this.row = row;
    this.x = x;
    this.y = rowCenterY(row) - 6;
    this.damage = damage;
    this.frost = kind === 'snowpea';
    this.w = PROJECTILE_CFG.radius * 2;
    this.h = PROJECTILE_CFG.radius * 2;
  }

  get box() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  update(dt, game) {
    this.x += PROJECTILE_CFG.speed * GRID.cell * dt;
    if (this.x > game.view.width + 40) {
      game.recycleProjectile(this);
      return;
    }
    // 命中普通僵尸
    for (const z of game.zombies) {
      if (z.row !== this.row || !z.alive) continue;
      if (aabb(this.box, z.box)) {
        game.damageZombie(z, this.damage, this.frost);
        game.recycleProjectile(this);
        return;
      }
    }
    // 命中 Boss（碰撞箱覆盖中间两行）
    const boss = game.boss;
    if (boss && boss.alive && BOSS_ROWS.includes(this.row) && aabb(this.box, boss.box)) {
      game.damageBoss(this.damage, this.frost);
      game.recycleProjectile(this);
    }
  }
}

// Boss 覆盖的行，与 BOSS_CFG.coverRows 保持一致
import { BOSS_CFG } from '../config/boss.js';
const BOSS_ROWS = BOSS_CFG.coverRows;
