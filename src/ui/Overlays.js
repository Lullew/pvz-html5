// 全屏覆盖层：主菜单、关卡选择、暂停、胜利、失败
import { VIEW } from '../config/balance.js';
import { roundRect } from '../rendering/SpriteFactory.js';

const PANEL_W = 440;
const BTN_W = 280;
const BTN_H = 50;
const BTN_GAP = 14;

export class Overlays {
  constructor() {
    this.buttons = [];
  }

  addButton(id, label, x, y, disabled = false) {
    this.buttons.push({
      id,
      label,
      x,
      y,
      w: BTN_W,
      h: BTN_H,
      disabled,
    });
  }

  hitTest(x, y) {
    for (const b of this.buttons) {
      if (b.disabled) continue;
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        return b.id;
      }
    }
    return null;
  }

  buttonRows(ids, startY) {
    const x = VIEW.width / 2 - BTN_W / 2;
    ids.forEach((item, i) => {
      const def = typeof item === 'string' ? { id: item } : item;
      this.addButton(
        def.id,
        def.label,
        x,
        startY + i * (BTN_H + BTN_GAP),
        def.disabled
      );
    });
  }

  buildButtons(game) {
    this.buttons = [];
    const state = game.state;
    const muted = game.audio.muted;
    const muteLabel = muted ? '音效：关' : '音效：开';

    if (state === 'MENU') {
      this.buttonRows(
        [
          { id: 'start', label: '开始游戏' },
          { id: 'select', label: '关卡选择' },
          { id: 'mute', label: muteLabel },
        ],
        230
      );
    } else if (state === 'LEVEL_SELECT') {
      const unlocked = game.save.getUnlocked();
      const gridW = 130;
      const gridH = 42;
      const gridGap = 10;
      const startX = VIEW.width / 2 - (3 * gridW + 2 * gridGap) / 2;
      const startY = 162;
      for (let i = 0; i < 15; i += 1) {
        const r = Math.floor(i / 3);
        const c = i % 3;
        this.buttons.push({
          id: `level${i + 1}`,
          label: `第 ${i + 1} 关`,
          x: startX + c * (gridW + gridGap),
          y: startY + r * (gridH + gridGap),
          w: gridW,
          h: gridH,
          disabled: unlocked < i + 1,
        });
      }
      const backX = VIEW.width / 2 - BTN_W / 2;
      this.buttons.push({
        id: 'back',
        label: '返回主菜单',
        x: backX,
        y: startY + 5 * (gridH + gridGap) + 8,
        w: BTN_W,
        h: BTN_H,
        disabled: false,
      });
    } else if (state === 'PAUSED') {
      this.buttonRows(
        [
          { id: 'resume', label: '继续游戏' },
          { id: 'restart', label: '重新开始' },
          { id: 'select', label: '返回关卡选择' },
          { id: 'mute', label: muteLabel },
        ],
        200
      );
    } else if (state === 'VICTORY') {
      const ids = [];
      if (game.levelId < 15) ids.push({ id: 'next', label: '进入下一关' });
      ids.push({ id: 'replay', label: '再玩一次' });
      ids.push({ id: 'menu', label: '返回主菜单' });
      this.buttonRows(ids, 240);
    } else if (state === 'DEFEAT') {
      this.buttonRows(
        [
          { id: 'restart', label: '重新开始' },
          { id: 'menu', label: '返回主菜单' },
        ],
        250
      );
    }
  }

  titleFor(game) {
    switch (game.state) {
      case 'MENU':
        return '草坪保卫战';
      case 'LEVEL_SELECT':
        return '关卡选择';
      case 'PAUSED':
        return '已暂停';
      case 'VICTORY':
        return game.levelId === 3 ? '全部通关！' : '关卡胜利';
      case 'DEFEAT':
        return '防线失守';
      default:
        return '';
    }
  }

  draw(ctx, game) {
    this.buildButtons(game);
    ctx.save();
    ctx.fillStyle = 'rgba(20,14,8,.72)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);

    const panelH =
      game.state === 'LEVEL_SELECT'
        ? 442
        : 130 + this.buttons.length * (BTN_H + BTN_GAP);
    const panelY = game.state === 'LEVEL_SELECT' ? 96 : 120;
    ctx.fillStyle = '#f3e6c4';
    roundRect(
      ctx,
      VIEW.width / 2 - PANEL_W / 2,
      panelY,
      PANEL_W,
      panelH,
      16
    );
    ctx.fill();
    ctx.strokeStyle = '#7a5a30';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#3a2a18';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.titleFor(game), VIEW.width / 2, panelY + 60);

    if (game.state === 'VICTORY' && game.levelId === 3) {
      ctx.font = '16px sans-serif';
      ctx.fillText('僵王博士已被击败，草坪恢复了和平', VIEW.width / 2, panelY + 92);
    }

    for (const b of this.buttons) {
      ctx.fillStyle = b.disabled ? '#b8b0a0' : b.id === 'mute' ? '#c9a35a' : '#5f9e3c';
      roundRect(ctx, b.x, b.y, b.w, b.h, 10);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(b.label, b.x + b.w / 2, b.y + 32);
    }
    ctx.restore();
  }
}
