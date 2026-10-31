// 屏幕震动：按剩余时间衰减，向 Renderer 提供偏移
export class Camera {
  constructor() {
    this.shakeTime = 0;
    this.shakeTotal = 0;
    this.magnitude = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  shake(time, magnitude) {
    // 取较强的一次震动，避免弱震动覆盖强震动
    if (time > this.shakeTime || magnitude > this.magnitude) {
      this.shakeTime = time;
      this.shakeTotal = time;
      this.magnitude = magnitude;
    }
  }

  update(dt) {
    if (this.shakeTime <= 0) {
      this.offsetX = 0;
      this.offsetY = 0;
      return;
    }
    this.shakeTime -= dt;
    const strength = this.magnitude * (this.shakeTime / this.shakeTotal);
    this.offsetX = (Math.random() * 2 - 1) * strength;
    this.offsetY = (Math.random() * 2 - 1) * strength;
    if (this.shakeTime <= 0) {
      this.shakeTime = 0;
      this.offsetX = 0;
      this.offsetY = 0;
    }
  }
}
