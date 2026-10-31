// 固定步长累加器：逻辑始终以 1/60 秒更新，渲染帧率不影响游戏速度
export class Time {
  constructor(step = 1 / 60) {
    this.step = step;
    this.accumulator = 0;
    this.lastTime = 0;
    this.elapsed = 0;
    this.fps = 0;
    this.frameCount = 0;
    this.fpsTimer = 0;
  }

  // 每帧由 rAF 调用，tick 为固定步长回调
  update(rafTime, tick) {
    if (!this.lastTime) this.lastTime = rafTime;
    let frameTime = (rafTime - this.lastTime) / 1000;
    this.lastTime = rafTime;
    // 切后台等极端帧时长钳制，避免追帧死循环
    if (frameTime > 0.25) frameTime = 0.25;

    this.accumulator += frameTime;
    while (this.accumulator >= this.step) {
      tick(this.step);
      this.elapsed += this.step;
      this.accumulator -= this.step;
    }

    this.frameCount += 1;
    this.fpsTimer += frameTime;
    if (this.fpsTimer >= 0.5) {
      this.fps = Math.round(this.frameCount / this.fpsTimer);
      this.frameCount = 0;
      this.fpsTimer = 0;
    }
  }

  reset() {
    this.accumulator = 0;
    this.lastTime = 0;
    this.elapsed = 0;
  }
}
