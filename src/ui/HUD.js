// 抬头显示：阳光计数、卡牌栏、波次进度、暂停按钮、横幅/提示/种植预览
import { GRID, VIEW } from '../config/balance.js';
import { CardBar } from './CardBar.js';

export class HUD {
  constructor() {
    this.cardBar = new CardBar();
  }

  get pauseRect() {
    return { x: VIEW.width - 52, y: 14, w: 40, h: 40 };
  }

  hitPause(x, y) {
    const r = this.pauseRect;
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

  drawSunCounter(ctx, game) {
    ctx.fillStyle = '#f3e6c4';
    ctx.fillRect(10, 10, 88, 56);
    ctx.strokeStyle = '#7a5a30';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 88, 56);
    ctx.fillStyle = '#ffd34d';
    ctx.beginPath();
    ctx.arc(32, 38, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffc926';
    ctx.beginPath();
    ctx.arc(32, 38, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a2a18';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(String(game.sun), 52, 46);
  }

  drawWaveProgress(ctx, game) {
    const x = 524;
    const y = 22;
    ctx.fillStyle = '#f3e6c4';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('波次', x, y + 2);
    const barX = x + 40;
    const barW = 200;
    ctx.fillStyle = '#2c2418';
    ctx.fillRect(barX, y - 10, barW, 14);
    const progress = game.waveSystem.progress;
    ctx.fillStyle = '#7fc242';
    ctx.fillRect(barX + 2, y - 8, (barW - 4) * progress, 10);
    // 旗帜刻度
    ctx.fillStyle = '#e0352f';
    ctx.font = '14px sans-serif';
    for (let i = 1; i <= game.waveSystem.totalWaves; i += 1) {
      const fx = barX + (barW * i) / game.waveSystem.totalWaves;
      ctx.fillText('⚑', fx - 6, y + 2);
    }
  }

  drawPauseButton(ctx) {
    const r = this.pauseRect;
    ctx.fillStyle = '#f3e6c4';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = '#7a5a30';
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = '#3a2a18';
    ctx.fillRect(r.x + 12, r.y + 10, 6, 20);
    ctx.fillRect(r.x + 23, r.y + 10, 6, 20);
  }

  drawPlantPreview(ctx, game) {
    const cell = game.hoverCell;
    if (!cell || !game.selectedCard) return;
    const x = GRID.originX + cell.col * GRID.cell;
    const y = GRID.originY + cell.row * GRID.cell;
    const occupied = game.plantGrid[cell.row][cell.col];
    const cfg = game.selectedPlantCfg;
    const ok = !occupied && game.sun >= cfg.cost && (game.cardCooldowns[cfg.id] || 0) <= 0;
    ctx.fillStyle = ok ? 'rgba(120,220,90,.35)' : 'rgba(230,70,60,.35)';
    ctx.fillRect(x, y, GRID.cell, GRID.cell);
    ctx.strokeStyle = ok ? '#5fbf3a' : '#c0392b';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 2, y + 2, GRID.cell - 4, GRID.cell - 4);
  }

  drawBanner(ctx, game) {
    if (game.bannerState.timer <= 0) return;
    const alpha = Math.min(1, game.bannerState.timer);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.fillRect(0, 200, VIEW.width, 64);
    ctx.fillStyle = '#ffd34d';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(game.bannerState.text, VIEW.width / 2, 244);
    ctx.restore();
  }

  drawToast(ctx, game) {
    if (game.toast.timer <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, game.toast.timer);
    ctx.fillStyle = 'rgba(0,0,0,.7)';
    const w = 180;
    ctx.fillRect(VIEW.width / 2 - w / 2, VIEW.hudHeight + 12, w, 34);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(game.toast.text, VIEW.width / 2, VIEW.hudHeight + 34);
    ctx.restore();
  }

  draw(ctx, game) {
    this.drawSunCounter(ctx, game);
    this.cardBar.draw(ctx, game);
    this.drawWaveProgress(ctx, game);
    this.drawPauseButton(ctx);
    this.drawPlantPreview(ctx, game);
    this.drawBanner(ctx, game);
    this.drawToast(ctx, game);
  }
}
