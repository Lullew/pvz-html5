// 调试覆盖层：网格、碰撞箱、波次/阳光/Boss 计时、对象池统计
import { GRID, VIEW } from '../config/balance.js';

function strokeBox(ctx, box, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(box.x, box.y, box.w, box.h);
  ctx.restore();
}

export class DebugOverlay {
  drawGrid(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,.4)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= GRID.cols; c += 1) {
      const x = GRID.originX + c * GRID.cell;
      ctx.beginPath();
      ctx.moveTo(x, GRID.originY);
      ctx.lineTo(x, GRID.originY + GRID.rows * GRID.cell);
      ctx.stroke();
    }
    for (let r = 0; r <= GRID.rows; r += 1) {
      const y = GRID.originY + r * GRID.cell;
      ctx.beginPath();
      ctx.moveTo(GRID.originX, y);
      ctx.lineTo(GRID.originX + GRID.cols * GRID.cell, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  draw(ctx, game) {
    this.drawGrid(ctx);
    for (const p of game.plantList) strokeBox(ctx, p.box, '#2ef56b');
    for (const z of game.zombies) strokeBox(ctx, z.box, '#ff5a5a');
    for (const p of game.projectiles) strokeBox(ctx, p.box, '#ffd34d');
    for (const m of game.mowers) {
      if (m.state !== 'gone') strokeBox(ctx, m.box, '#58b8ff');
    }
    if (game.boss) strokeBox(ctx, game.boss.box, '#d66bff');

    const m = game.modifiers;
    const lines = [
      `FPS: ${game.time.fps}`,
      `增幅: ${m.buffName} 难度系数: x${m.difficulty}${m.isFinal ? ' [最终决战]' : ''}`,
      `倍率 僵尸血x${m.zombieHpMul} 僵尸速x${m.zombieSpeedMul.toFixed(2)} 植物伤x${m.plantDamageMul} 攻速x${m.plantFireRateMul.toFixed(2)} 植物血x${m.plantHpMul.toFixed(1)}`,
      `波次: ${game.waveSystem.waveIndex + 1}/${game.waveSystem.totalWaves} 状态: ${game.waveSystem.state} 计时: ${game.waveSystem.waveTime.toFixed(1)}`,
      `天降阳光计时: ${game.sunSystem.timer.toFixed(1)}/${game.sunSystem.interval}s  单枚价值: ${m.sunValue}`,
      `阳光: ${game.sun}  植物: ${game.plantList.length}  僵尸: ${game.zombies.length}`,
    ];
    if (game.boss) {
      const b = game.boss;
      lines.push(
        `Boss 阶段: ${b.phase + 1} 状态: ${b.state}/${b.subState} HP: ${Math.ceil(b.hp)}`,
        `冷却: ${Object.entries(b.cooldowns)
          .map(([k, v]) => `${k}:${Math.max(0, v).toFixed(1)}`)
          .join('  ')}`
      );
    }
    lines.push(
      `池 子弹:${game.pools.projectile.size} 阳光:${game.pools.sun.size} 粒子:${game.pools.particle.size} 僵尸:${game.pools.zombie.size}`
    );

    ctx.save();
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    const boxH = lines.length * 16 + 8;
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.fillRect(6, VIEW.height - boxH - 6, 620, boxH);
    ctx.fillStyle = '#bfe8a0';
    lines.forEach((line, i) => {
      ctx.fillText(line, 12, VIEW.height - boxH + 16 + i * 16);
    });
    ctx.restore();
  }
}
