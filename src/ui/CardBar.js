// 植物卡牌栏：迷你图标、消耗、冷却遮罩、选中高亮、命中检测
import { PLANTS, PLANT_ORDER } from '../config/plants.js';

const CARD_X = 108;
const CARD_Y = 8;
const CARD_W = 66;
const CARD_H = 60;
const GAP = 4;

function miniIcon(ctx, typeId, x, y) {
  ctx.save();
  ctx.translate(x, y);
  switch (typeId) {
    case 'sunflower':
      ctx.fillStyle = '#ffd34d';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8a5a24';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'peashooter':
      ctx.fillStyle = '#66bb47';
      ctx.beginPath();
      ctx.arc(-2, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(6, -3, 8, 6);
      break;
    case 'wallnut':
      ctx.fillStyle = '#c98a4b';
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'snowpea':
      ctx.fillStyle = '#5db7d6';
      ctx.beginPath();
      ctx.arc(-2, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(6, -3, 8, 6);
      break;
    case 'cherrybomb':
      ctx.fillStyle = '#e0352f';
      ctx.beginPath();
      ctx.arc(-5, 3, 7, 0, Math.PI * 2);
      ctx.arc(5, 3, 7, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'potatomine':
      ctx.fillStyle = '#d8b46a';
      ctx.beginPath();
      ctx.ellipse(0, 3, 10, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e0352f';
      ctx.beginPath();
      ctx.arc(0, -7, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    default:
      break;
  }
  ctx.restore();
}

export class CardBar {
  rectOf(index) {
    return {
      x: CARD_X + index * (CARD_W + GAP),
      y: CARD_Y,
      w: CARD_W,
      h: CARD_H,
    };
  }

  hitTest(x, y) {
    for (let i = 0; i < PLANT_ORDER.length; i += 1) {
      const r = this.rectOf(i);
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        return PLANT_ORDER[i];
      }
    }
    return null;
  }

  draw(ctx, game) {
    for (let i = 0; i < PLANT_ORDER.length; i += 1) {
      const id = PLANT_ORDER[i];
      const cfg = PLANTS[id];
      const r = this.rectOf(i);
      const cd = game.cardCooldowns[id] || 0;
      const affordable = game.sun >= cfg.cost;

      ctx.fillStyle = '#f3e6c4';
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = game.selectedCard === id ? '#ffd34d' : '#7a5a30';
      ctx.lineWidth = game.selectedCard === id ? 3 : 2;
      ctx.strokeRect(r.x, r.y, r.w, r.h);

      miniIcon(ctx, id, r.x + r.w / 2, r.y + 20);

      // 消耗
      ctx.fillStyle = affordable ? '#3a2a18' : '#b03a2e';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(cfg.cost), r.x + r.w / 2, r.y + r.h - 6);

      if (!affordable) {
        ctx.fillStyle = 'rgba(40,30,20,.35)';
        ctx.fillRect(r.x, r.y, r.w, r.h);
      }
      // 冷却遮罩
      if (cd > 0) {
        const ratio = Math.min(1, cd / cfg.cooldown);
        ctx.fillStyle = 'rgba(30,30,30,.6)';
        ctx.fillRect(r.x, r.y, r.w, r.h * ratio);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(cd.toFixed(1), r.x + r.w / 2, r.y + r.h / 2 + 5);
      }
    }
  }
}
