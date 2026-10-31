// 阳光币：天降模式与植物产出模式，由对象池管理
import { SUN_CFG } from '../config/balance.js';

export class SunToken {
  constructor() {
    this.active = false;
  }

  // 天降阳光
  resetSky(x, targetY, value) {
    this.active = true;
    this.fromSky = true;
    this.x = x;
    this.y = SUN_CFG.startY;
    this.targetY = targetY;
    this.value = value;
    this.state = 'falling';
    this.life = SUN_CFG.lifetime;
    this.collected = false;
  }

  // 植物产出阳光
  resetPlant(x, y, value) {
    this.active = true;
    this.fromSky = false;
    this.x = x;
    this.y = y;
    this.targetY = y - SUN_CFG.popRise;
    this.value = value;
    this.state = 'rising';
    this.life = SUN_CFG.lifetime;
    this.collected = false;
  }

  get cx() {
    return this.x;
  }

  get cy() {
    return this.y;
  }

  update(dt, game) {
    if (this.state === 'falling' || this.state === 'rising') {
      const speed = Math.abs(this.targetY - this.y) / (this.fromSky ? 1.6 : 0.7);
      const dir = this.targetY > this.y ? 1 : -1;
      this.y += dir * Math.min(speed * dt, Math.abs(this.targetY - this.y));
      if (Math.abs(this.y - this.targetY) < 0.5) {
        this.y = this.targetY;
        this.state = 'idle';
      }
    } else {
      this.life -= dt;
      if (this.life <= 0) game.recycleSun(this);
    }
  }
}
