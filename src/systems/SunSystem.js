// 天降阳光：按关卡间隔在草坪随机位置生成
import { GRID } from '../config/balance.js';

export class SunSystem {
  reset(interval) {
    this.interval = interval;
    this.timer = 0;
  }

  update(dt, game) {
    this.timer += dt;
    if (this.timer < this.interval) return;
    this.timer = 0;

    const col = Math.floor(Math.random() * GRID.cols);
    const row = Math.floor(Math.random() * GRID.rows);
    const x = GRID.originX + col * GRID.cell + GRID.cell / 2 + (Math.random() * 30 - 15);
    const targetY = GRID.originY + row * GRID.cell + GRID.cell / 2 + (Math.random() * 20 - 10);
    game.spawnSkySun(x, targetY);
  }
}
