// localStorage 存档：关卡解锁与音效设置
const KEY = 'lawn_defense_save_v1';

const DEFAULTS = {
  unlocked: 1,
  muted: false,
};

const MAX_LEVEL = 15;

export class SaveManager {
  constructor() {
    this.data = { ...DEFAULTS };
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) this.data = { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      this.data = { ...DEFAULTS };
    }
  }

  save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.data));
    } catch {
      // 隐私模式等场景下静默失败，不影响游戏
    }
  }

  getUnlocked() {
    return this.data.unlocked;
  }

  unlock(level) {
    if (level > this.data.unlocked) {
      this.data.unlocked = Math.min(MAX_LEVEL, level);
      this.save();
    }
  }

  isMuted() {
    return this.data.muted;
  }

  setMuted(muted) {
    this.data.muted = muted;
    this.save();
  }
}
