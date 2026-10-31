// 小推车系统
export class MowerSystem {
  update(dt, game) {
    for (const mower of game.mowers) {
      mower.update(dt, game);
    }
  }
}
