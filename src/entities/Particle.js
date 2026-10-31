// 粒子：爆炸、命中、死亡特效，由对象池管理
export class Particle {
  constructor() {
    this.active = false;
  }

  reset(x, y, color, opts = {}) {
    this.active = true;
    this.x = x;
    this.y = y;
    const angle = opts.angle ?? Math.random() * Math.PI * 2;
    const speed = opts.speed ?? 40 + Math.random() * 120;
    this.vx = Math.cos(angle) * speed + (opts.vx || 0);
    this.vy = Math.sin(angle) * speed + (opts.vy || 0);
    this.life = opts.life ?? 0.5 + Math.random() * 0.5;
    this.maxLife = this.life;
    this.size = opts.size ?? 3 + Math.random() * 5;
    this.color = color;
    this.gravity = opts.gravity ?? 220;
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
      return;
    }
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  get alpha() {
    return Math.max(0, this.life / this.maxLife);
  }
}
