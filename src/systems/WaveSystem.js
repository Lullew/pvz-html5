// 波次系统：按配置刷怪、波次间隔、Boss 波生成、完成判定
export class WaveSystem {
  reset(level, game) {
    this.level = level;
    this.waveIndex = 0;
    this.waveTime = 0;
    this.spawnCursor = 0;
    this.state = 'active'; // active | gap | done
    this.gapTimer = 0;
    this.bossSpawned = false;
    this.announceWave(game);
  }

  get wave() {
    return this.level.waves[this.waveIndex];
  }

  get totalWaves() {
    return this.level.waves.length;
  }

  // 0..1 总进度，供 HUD 波次条使用
  get progress() {
    if (this.state === 'done') return 1;
    const base = this.waveIndex / this.totalWaves;
    let inner = 0;
    if (this.wave && this.wave.spawns.length) {
      inner = this.spawnCursor / this.wave.spawns.length / this.totalWaves;
    } else if (this.wave && this.wave.boss && game_boss) {
      inner = (1 - game_boss.hp / game_boss.maxHp) / this.totalWaves;
    }
    return Math.min(1, base + inner);
  }

  announceWave(game) {
    if (this.wave.boss) {
      game.banner('最终波 · Boss 战');
    } else if (this.wave.flag) {
      game.banner(`第 ${this.waveIndex + 1} 波 · 一大波僵尸来袭`);
    } else {
      game.banner(`第 ${this.waveIndex + 1} 波`);
    }
  }

  startNextWave(game) {
    this.waveIndex += 1;
    this.waveTime = 0;
    this.spawnCursor = 0;
    this.bossSpawned = false;
    this.state = 'active';
    this.announceWave(game);
  }

  update(dt, game) {
    if (this.state === 'done') return;

    if (this.state === 'gap') {
      this.gapTimer -= dt;
      if (this.gapTimer <= 0) this.startNextWave(game);
      return;
    }

    this.waveTime += dt;

    // 普通刷怪
    const spawns = this.wave.spawns;
    while (
      this.spawnCursor < spawns.length &&
      spawns[this.spawnCursor].time <= this.waveTime
    ) {
      const spec = spawns[this.spawnCursor];
      const row = spec.row ?? Math.floor(Math.random() * 5);
      game.spawnZombie(spec.type, row);
      this.spawnCursor += 1;
    }

    // Boss 波：生成 Boss
    if (this.wave.boss && !this.bossSpawned) {
      this.bossSpawned = true;
      game.spawnBoss();
    }

    // 波次完成判定
    const allSpawned = this.spawnCursor >= spawns.length;
    const fieldClear = game.zombies.length === 0;
    const bossClear = !this.wave.boss || !game.boss;
    if (allSpawned && fieldClear && bossClear) {
      if (this.waveIndex >= this.totalWaves - 1) {
        this.state = 'done';
        game.victory();
      } else {
        this.state = 'gap';
        this.gapTimer = this.level.waveGap;
      }
    }
  }
}

// Boss 进度引用，由 Game 在读取 progress 前注入
let game_boss = null;
export function bindProgressBoss(boss) {
  game_boss = boss;
}
