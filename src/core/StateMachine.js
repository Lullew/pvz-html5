// 有限状态机：切换时触发 enter/exit 回调，非法转移直接报错
export class StateMachine {
  constructor(initial, transitions = {}, handlers = {}) {
    this.current = initial;
    this.transitions = transitions;
    this.handlers = handlers;
  }

  can(next) {
    const allowed = this.transitions[this.current];
    return !allowed || allowed.includes('*') || allowed.includes(next);
  }

  change(next, payload) {
    if (next === this.current) return;
    if (!this.can(next)) {
      throw new Error(`非法状态转移: ${this.current} -> ${next}`);
    }
    const prev = this.current;
    this.handlers[`exit:${prev}`]?.(payload);
    this.current = next;
    this.handlers[`enter:${next}`]?.(payload);
  }

  is(state) {
    return this.current === state;
  }
}
