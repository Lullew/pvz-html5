// 子弹系统：倒序更新，回收期间不跳过实体
export class ProjectileSystem {
  update(dt, game) {
    const list = game.projectiles;
    for (let i = list.length - 1; i >= 0; i -= 1) {
      list[i].update(dt, game);
    }
  }
}
