// 通用对象池，避免频繁创建/销毁导致的 GC 抖动
export class ObjectPool {
  constructor(factory, resetFn, initialSize = 0) {
    this.factory = factory;
    this.resetFn = resetFn;
    this.free = [];
    this.active = 0;
    for (let i = 0; i < initialSize; i += 1) {
      this.free.push(this.factory());
    }
  }

  acquire(...args) {
    const obj = this.free.pop() || this.factory();
    this.resetFn(obj, ...args);
    this.active += 1;
    return obj;
  }

  release(obj) {
    if (obj === null || obj === undefined) return;
    this.free.push(obj);
    this.active = Math.max(0, this.active - 1);
  }

  get size() {
    return this.free.length + this.active;
  }
}
