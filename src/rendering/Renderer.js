// 场景渲染：背景、分层实体、镜头震动
import { GRID, VIEW } from '../config/balance.js';
import {
  drawBoss,
  drawMower,
  drawParticle,
  drawPlant,
  drawProjectile,
  drawSunToken,
  drawTelegraph,
  drawZombie,
} from './SpriteFactory.js';

export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  drawBackground() {
    const ctx = this.ctx;
    // 整体底色
    ctx.fillStyle = '#6b4a2e';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    // 顶部 UI 背板
    ctx.fillStyle = '#4a3520';
    ctx.fillRect(0, 0, VIEW.width, VIEW.hudHeight);

    // 左侧推车区
    ctx.fillStyle = '#8a6a44';
    ctx.fillRect(0, GRID.originY, GRID.originX, GRID.rows * GRID.cell);
    // 右侧泥土区
    ctx.fillStyle = '#7a5636';
    ctx.fillRect(
      GRID.originX + GRID.cols * GRID.cell,
      GRID.originY,
      VIEW.width - GRID.originX - GRID.cols * GRID.cell,
      GRID.rows * GRID.cell
    );

    // 草坪条纹
    for (let r = 0; r < GRID.rows; r += 1) {
      ctx.fillStyle = r % 2 === 0 ? '#8fc24e' : '#7fb242';
      ctx.fillRect(
        GRID.originX,
        GRID.originY + r * GRID.cell,
        GRID.cols * GRID.cell,
        GRID.cell
      );
      // 列分隔线
      for (let c = 0; c <= GRID.cols; c += 1) {
        ctx.strokeStyle = 'rgba(255,255,255,.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(GRID.originX + c * GRID.cell, GRID.originY + r * GRID.cell);
        ctx.lineTo(
          GRID.originX + c * GRID.cell,
          GRID.originY + (r + 1) * GRID.cell
        );
        ctx.stroke();
      }
    }
  }

  render(game) {
    const ctx = this.ctx;
    const t = game.time.elapsed;
    ctx.clearRect(0, 0, VIEW.width, VIEW.height);
    this.drawBackground();

    ctx.save();
    ctx.translate(game.camera.offsetX, game.camera.offsetY);

    for (const mower of game.mowers) drawMower(ctx, mower, t);
    for (const plant of game.plantList) drawPlant(ctx, plant, t);
    for (const token of game.sunTokens) drawSunToken(ctx, token, t);
    if (game.boss) drawBoss(ctx, game.boss, t);
    for (const zombie of game.zombies) drawZombie(ctx, zombie, t);
    for (const proj of game.projectiles) drawProjectile(ctx, proj);
    for (const tel of game.telegraphs) drawTelegraph(ctx, tel, t);
    for (const particle of game.particles) drawParticle(ctx, particle);

    ctx.restore();
  }
}
