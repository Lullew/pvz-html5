// 战斗系统：突破检测、失败判定、死亡实体清理、网格维护
import { GRID, MOWER_CFG } from '../config/balance.js';

export class CombatSystem {
  update(dt, game) {
    // 1. 僵尸越过左边界：触发小推车或判定失败
    for (const z of game.zombies) {
      if (!z.alive) continue;
      if (z.x < GRID.originX - MOWER_CFG.triggerLine) {
        const mower = game.mowers[z.row];
        if (mower.available) {
          mower.trigger(game);
        } else if (mower.state === 'gone') {
          game.fail();
        }
      }
    }

    // 2. 清理死亡僵尸并回池
    for (let i = game.zombies.length - 1; i >= 0; i -= 1) {
      const z = game.zombies[i];
      if (z.alive) continue;
      game.burst(z.x, z.y, '#9bb38c', 12);
      game.audio.play('groan');
      game.pools.zombie.release(z);
      game.zombies.splice(i, 1);
    }

    // 3. 清理死亡植物并清空占用格
    for (let i = game.plantList.length - 1; i >= 0; i -= 1) {
      const p = game.plantList[i];
      if (p.alive) continue;
      if (p.cfg.behavior !== 'bomb' && p.cfg.behavior !== 'mine') {
        game.burst(p.x, p.y, p.cfg.palette.body, 10);
      }
      if (game.plantGrid[p.row][p.col] === p) {
        game.plantGrid[p.row][p.col] = null;
      }
      game.plantList.splice(i, 1);
    }
  }
}
