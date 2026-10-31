// 全部实体自绘造型：纯 Canvas 路径，无外部图片/版权素材
export function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// ---------------- 阳光币 ----------------
export function drawSunToken(ctx, token, t) {
  const x = token.x;
  const y = token.y;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(t * 0.8);
  for (let i = 0; i < 8; i += 1) {
    ctx.save();
    ctx.rotate((i / 8) * Math.PI * 2);
    ctx.fillStyle = '#ffd83d';
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(5, -26);
    ctx.lineTo(-5, -26);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.rotate(-t * 0.8);
  ctx.fillStyle = '#ffdf5e';
  circle(ctx, 0, 0, 17);
  ctx.fillStyle = '#ffc926';
  circle(ctx, 0, 0, 12);
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  circle(ctx, -5, -5, 4);
  ctx.restore();
}

// ---------------- 子弹 ----------------
export function drawProjectile(ctx, p) {
  ctx.fillStyle = p.kind === 'snowpea' ? '#8fd8ff' : '#7fc242';
  circle(ctx, p.x + 8, p.y + 8, 8);
  ctx.fillStyle = p.kind === 'snowpea' ? '#d6f3ff' : '#c7ec9a';
  circle(ctx, p.x + 5, p.y + 5, 3);
}

// ---------------- 植物 ----------------
export function drawPlant(ctx, plant, t) {
  const { x, y } = plant;
  const palette = plant.cfg.palette;
  ctx.save();
  switch (plant.typeId) {
    case 'sunflower': {
      ctx.translate(x, y);
      ctx.rotate(Math.sin(t * 2 + plant.row) * 0.05);
      ctx.fillStyle = palette.stem;
      ctx.fillRect(-4, 8, 8, 26);
      ctx.fillStyle = palette.stem;
      ctx.beginPath();
      ctx.ellipse(-12, 22, 10, 5, -0.5, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 8; i += 1) {
        ctx.save();
        ctx.rotate((i / 8) * Math.PI * 2);
        ctx.fillStyle = palette.body;
        ctx.beginPath();
        ctx.ellipse(0, -19, 6, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = palette.face;
      circle(ctx, 0, 0, 14);
      ctx.fillStyle = '#fff';
      circle(ctx, -5, -3, 3.5);
      circle(ctx, 5, -3, 3.5);
      ctx.fillStyle = '#222';
      circle(ctx, -4, -3, 1.8);
      circle(ctx, 6, -3, 1.8);
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 3, 5, 0.1, Math.PI - 0.1);
      ctx.stroke();
      break;
    }
    case 'peashooter':
    case 'snowpea': {
      const pulse = plant.firePulse > 0 ? 2 : 0;
      ctx.translate(x, y);
      ctx.fillStyle = palette.stem;
      ctx.fillRect(-4, 8, 8, 26);
      ctx.beginPath();
      ctx.ellipse(-11, 22, 9, 5, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = palette.body;
      circle(ctx, -2 + pulse, -4, 20);
      ctx.fillStyle = palette.rim;
      circle(ctx, -8 + pulse, 2, 12);
      ctx.fillStyle = palette.body;
      roundRect(ctx, 12 + pulse, -9, 16, 12, 5);
      ctx.fill();
      ctx.fillStyle = '#fff';
      circle(ctx, 4 + pulse, -10, 5);
      ctx.fillStyle = '#222';
      circle(ctx, 6 + pulse, -10, 2.4);
      if (plant.typeId === 'snowpea') {
        ctx.fillStyle = '#d6f3ff';
        ctx.beginPath();
        ctx.moveTo(-6, -26);
        ctx.lineTo(-2, -32);
        ctx.lineTo(2, -26);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'wallnut': {
      ctx.translate(x, y);
      ctx.fillStyle = palette.body;
      ctx.beginPath();
      ctx.ellipse(0, 2, 28, 32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.08)';
      ctx.beginPath();
      ctx.ellipse(8, 10, 12, 18, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      circle(ctx, -8, -6, 4.5);
      circle(ctx, 8, -6, 4.5);
      ctx.fillStyle = '#222';
      circle(ctx, -7, -6, 2.2);
      circle(ctx, 9, -6, 2.2);
      ctx.strokeStyle = palette.dark;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 8, 6, 0.2, Math.PI - 0.2);
      ctx.stroke();
      if (plant.damageStage >= 1) {
        ctx.strokeStyle = palette.dark;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(14, -18);
        ctx.lineTo(8, -6);
        ctx.lineTo(14, 4);
        ctx.stroke();
      }
      if (plant.damageStage >= 2) {
        ctx.beginPath();
        ctx.moveTo(-16, -14);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-14, 14);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 26);
        ctx.lineTo(4, 16);
        ctx.stroke();
      }
      break;
    }
    case 'cherrybomb': {
      const fuse = plant.fuseTimer / plant.cfg.params.fuse;
      const shake = fuse < 0.4 ? Math.sin(t * 40) * 2 : 0;
      ctx.translate(x + shake, y);
      ctx.fillStyle = palette.leaf;
      ctx.beginPath();
      ctx.ellipse(-4, -20, 12, 5, -0.4, 0, Math.PI * 2);
      ctx.ellipse(8, -22, 10, 4, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5a3c20';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, -16);
      ctx.quadraticCurveTo(0, -28, 10, -16);
      ctx.stroke();
      ctx.fillStyle = palette.body;
      circle(ctx, -10, 6, 16);
      circle(ctx, 11, 10, 15);
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      circle(ctx, -15, 0, 5);
      circle(ctx, 6, 4, 4);
      ctx.fillStyle = '#fff';
      circle(ctx, -12, 4, 3);
      circle(ctx, 9, 8, 3);
      ctx.fillStyle = '#222';
      circle(ctx, -11, 4, 1.5);
      circle(ctx, 10, 8, 1.5);
      break;
    }
    case 'potatomine': {
      ctx.translate(x, y);
      if (!plant.armed) {
        ctx.fillStyle = '#8a6a44';
        ctx.beginPath();
        ctx.ellipse(0, 18, 22, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = palette.dark;
        circle(ctx, -4, 12, 5);
        circle(ctx, 6, 14, 4);
        break;
      }
      ctx.fillStyle = palette.body;
      ctx.beginPath();
      ctx.ellipse(0, 8, 22, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = palette.spike;
      roundRect(ctx, -6, -14, 12, 10, 3);
      ctx.fill();
      ctx.fillStyle = '#e0352f';
      circle(ctx, 0, -10, 3.5);
      ctx.fillStyle = '#fff';
      circle(ctx, -7, 6, 3);
      circle(ctx, 7, 6, 3);
      ctx.fillStyle = '#222';
      circle(ctx, -6, 6, 1.5);
      circle(ctx, 8, 6, 1.5);
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

// ---------------- 僵尸 ----------------
export function drawZombie(ctx, z, t) {
  const x = z.x;
  const y = z.y;
  const palette = z.cfg.palette;
  const walk = Math.sin(t * 6 + z.row) * (z.state === 'walking' ? 1 : 0.3);
  const eat = z.state === 'eating' ? Math.sin(t * 12) * 3 : 0;

  ctx.save();
  // 腿
  ctx.fillStyle = '#4a4a55';
  ctx.fillRect(x - 10 + walk * 4, y + 14, 8, 20);
  ctx.fillRect(x + 2 - walk * 4, y + 14, 8, 20);
  // 躯干
  ctx.fillStyle = palette.shirt;
  roundRect(ctx, x - 14, y - 12, 28, 28, 6);
  ctx.fill();
  // 前伸手臂
  ctx.fillStyle = palette.skin;
  ctx.fillRect(x + 8 + eat, y - 8, 20, 7);
  ctx.fillRect(x + 8 + eat, y + 2, 20, 7);
  // 头
  ctx.fillStyle = palette.skin;
  circle(ctx, x - 2, y - 24, 13);
  ctx.fillStyle = '#222';
  circle(ctx, -6, y - 26, 2.2);
  circle(ctx, x + 2, y - 26, 2.2);
  ctx.fillStyle = '#3a2a1e';
  ctx.beginPath();
  ctx.ellipse(x - 2, y - 19, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // 撑杆
  if (z.cfg.canPoleVault && !z.poleJumped) {
    ctx.strokeStyle = palette.pole;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 22, y + 30);
    ctx.lineTo(x + 26, y - 40);
    ctx.stroke();
  }
  // 护甲
  if (!z.armorGone && z.cfg.armor === 'cone') {
    ctx.fillStyle = palette.cone;
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 32);
    ctx.lineTo(x + 8, y - 32);
    ctx.lineTo(x - 2, y - 52);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.fillRect(x - 8, y - 38, 12, 3);
  }
  if (!z.armorGone && z.cfg.armor === 'bucket') {
    ctx.fillStyle = palette.bucket;
    roundRect(ctx, x - 14, y - 40, 24, 18, 3);
    ctx.fill();
    ctx.strokeStyle = '#6c787f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x - 2, y - 40, 8, Math.PI, 0);
    ctx.stroke();
  }
  // 减速覆盖
  if (z.slowTimer > 0) {
    ctx.fillStyle = 'rgba(110,190,255,.32)';
    roundRect(ctx, x - 16, y - 42, 34, 76, 8);
    ctx.fill();
  }
  // 受伤闪白
  if (z.hurtFlash > 0) {
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    roundRect(ctx, x - 16, y - 42, 34, 76, 8);
    ctx.fill();
  }
  ctx.restore();
}

// ---------------- 小推车 ----------------
export function drawMower(ctx, m, t) {
  if (m.state === 'gone') return;
  const x = m.x;
  const y = m.y;
  ctx.save();
  ctx.translate(x, y);
  const spin = m.state === 'moving' ? t * 20 : 0;
  ctx.fillStyle = '#d44a3a';
  roundRect(ctx, 0, -14, 38, 20, 5);
  ctx.fill();
  ctx.fillStyle = '#b0b8bf';
  ctx.beginPath();
  ctx.arc(36, -4, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7d858c';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i += 1) {
    ctx.save();
    ctx.translate(36, -4);
    ctx.rotate(spin + (i / 4) * Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(7, 0);
    ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = '#3a3a42';
  circle(ctx, 8, 8, 6);
  circle(ctx, 28, 8, 6);
  ctx.restore();
}

// ---------------- Boss ----------------
export function drawBoss(ctx, boss, t) {
  const b = boss.box;
  ctx.save();
  if (boss.state === 'dying') {
    ctx.translate(b.x + b.w / 2, b.y + b.h);
    ctx.rotate(0.35 * (1 - boss.stateTimer / boss.cfg.dyingTime));
    ctx.translate(-(b.x + b.w / 2), -(b.y + b.h));
  }
  const warn =
    boss.subState === 'warn'
      ? 0.4 + Math.sin(t * 18) * 0.25
      : 0;
  // 腿
  ctx.fillStyle = '#4a3b5c';
  roundRect(ctx, b.x + 24, b.y + b.h - 34, 34, 34, 8);
  ctx.fill();
  roundRect(ctx, b.x + b.w - 58, b.y + b.h - 34, 34, 34, 8);
  ctx.fill();
  // 身体
  ctx.fillStyle = warn ? '#8a5a8a' : '#6b4f86';
  roundRect(ctx, b.x + 8, b.y + 34, b.w - 16, b.h - 66, 14);
  ctx.fill();
  // 控制面板
  ctx.fillStyle = '#2c2438';
  roundRect(ctx, b.x + 40, b.y + 60, b.w - 80, 40, 8);
  ctx.fill();
  ctx.fillStyle = boss.phase === 2 ? '#ff4d4d' : '#ffd34d';
  circle(ctx, b.x + 56, b.y + 80, 6);
  circle(ctx, b.x + b.w - 56, b.y + 80, 6);
  // 机械臂
  ctx.fillStyle = '#54406e';
  const armRaise = boss.state === 'summon' ? -14 : 0;
  roundRect(ctx, b.x - 10, b.y + 46 + armRaise, 24, 54, 8);
  ctx.fill();
  roundRect(ctx, b.x + b.w - 14, b.y + 46 + armRaise, 24, 54, 8);
  ctx.fill();
  // 头部
  ctx.fillStyle = '#5b4478';
  roundRect(ctx, b.x + 26, b.y + 6, b.w - 52, 40, 10);
  ctx.fill();
  // 眼睛横条
  ctx.fillStyle = boss.phase === 2 ? '#ff3b3b' : '#ffcf4d';
  roundRect(ctx, b.x + 40, b.y + 20, b.w - 80, 10, 4);
  ctx.fill();
  // 阶段裂纹
  if (boss.phase >= 1) {
    ctx.strokeStyle = '#2c2438';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(b.x + 30, b.y + 60);
    ctx.lineTo(b.x + 48, b.y + 90);
    ctx.lineTo(b.x + 38, b.y + 120);
    ctx.stroke();
  }
  if (boss.phase >= 2) {
    ctx.beginPath();
    ctx.moveTo(b.x + b.w - 30, b.y + 56);
    ctx.lineTo(b.x + b.w - 46, b.y + 88);
    ctx.lineTo(b.x + b.w - 34, b.y + 124);
    ctx.stroke();
  }
  // 转换白闪
  if (boss.state === 'transition') {
    ctx.fillStyle = `rgba(255,255,255,${0.25 + Math.sin(t * 16) * 0.2})`;
    roundRect(ctx, b.x, b.y, b.w, b.h, 14);
    ctx.fill();
  }
  if (boss.hurtFlash > 0) {
    ctx.fillStyle = 'rgba(255,255,255,.45)';
    roundRect(ctx, b.x, b.y, b.w, b.h, 14);
    ctx.fill();
  }
  ctx.restore();
}

// ---------------- 预警区域 ----------------
export function drawTelegraph(ctx, tel, t) {
  const pulse = 0.25 + Math.sin(t * 16) * 0.18;
  ctx.save();
  ctx.fillStyle = tel.color;
  ctx.globalAlpha = pulse;
  ctx.fillRect(tel.x, tel.y, tel.w, tel.h);
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = tel.color;
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 6]);
  ctx.strokeRect(tel.x + 2, tel.y + 2, tel.w - 4, tel.h - 4);
  ctx.restore();
}

// ---------------- 粒子 ----------------
export function drawParticle(ctx, p) {
  ctx.save();
  ctx.globalAlpha = p.alpha;
  ctx.fillStyle = p.color;
  circle(ctx, p.x, p.y, p.size);
  ctx.restore();
}
