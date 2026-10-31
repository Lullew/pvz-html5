// 小推车：每行一个，触发一次，清线后消失
import { GRID, MOWER_CFG, rowCenterY } from '../config/balance.js';
import { aabb } from '../core/Collision.js';

export class LawnMower {
  constructor(row) {
    this.row = row;
    this.x = GRID.originX + MOWER_CFG.offsetX;
    this.y = rowCenterY(row);
    this.state = 'idle'; // idle | moving | gone
    this.w = 46;
    this.h = 34;
  }

  get available() {
    return this.state === 'idle';
  }

  get box() {
    return { x: this.x, y: this.y - this.h / 2, w: this.w, h: this.h };
  }

  trigger(game) {
    if (this.state !== 'idle') return;
    this.state = 'moving';
    game.audio.play('mower');
  }

  update(dt, game) {
    if (this.state !== 'moving') return;
    this.x += MOWER_CFG.speed * GRID.cell * dt;

    for (const z of game.zombies) {
      if (z.row !== this.row || !z.alive) continue;
      if (aabb(this.box, z.box)) game.killZombie(z);
    }
    // 遇到 Boss：固定伤害后被挡住，不秒杀
    const boss = game.boss;
    if (boss && boss.alive && aabb(this.box, boss.box)) {
      game.damageBoss(MOWER_CFG.bossDamage, false);
      this.state = 'gone';
      return;
    }
    if (this.x > game.view.width + 60) this.state = 'gone';
  }
}
