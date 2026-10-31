// 统一鼠标/触摸/键盘输入，输出逻辑分辨率坐标
export class Input {
  constructor(canvas, viewWidth, viewHeight) {
    this.canvas = canvas;
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.queue = []; // 本帧指针事件，Game 消费后清空
    this.keys = new Set();
    this.pointer = { x: 0, y: 0, inside: false };

    canvas.addEventListener('pointerdown', (e) => this.onPointer(e, 'down'));
    canvas.addEventListener('pointermove', (e) => this.onPointer(e, 'move'));
    canvas.addEventListener('pointerup', (e) => this.onPointer(e, 'up'));
    canvas.addEventListener('pointercancel', () => {
      this.queue.length = 0;
    });
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      this.queue.push({ kind: 'key', key: e.key.toLowerCase() });
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
  }

  toLogical(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.viewWidth / rect.width;
    const scaleY = this.viewHeight / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  onPointer(e, kind) {
    const p = this.toLogical(e);
    this.pointer.x = p.x;
    this.pointer.y = p.y;
    this.pointer.inside = true;
    this.queue.push({ kind, x: p.x, y: p.y });
  }

  consume() {
    const events = this.queue.slice();
    this.queue.length = 0;
    return events;
  }
}
