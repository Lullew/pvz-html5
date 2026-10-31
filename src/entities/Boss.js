// 僵王博士：大型 Boss，独立状态机、三阶段、五技能、独立死亡判定；配置由关卡注入
import { GRID } from '../config/balance.js';

export class Boss {
  constructor(game, cfg) {
    this.cfg = cfg;
    this.maxHp = cfg.hp;
    this.hp = cfg.hp;
    this.w = cfg.widthCells * GRID.cell;
    this.h = cfg.heightCells * GRID.cell;
    this.y = GRID.originY + cfg.coverRows[0] * GRID.cell;
    this.x = GRID.originX + GRID.cols * GRID.cell + 30;
    this.enterX = GRID.originX + cfg.enterCol * GRID.cell;
    this.minX = GRID.originX + cfg.minCol * GRID.cell;
    this.phase = 0;
    this.pendingPhase = 0;
    this.state = 'entering';
    this.subState = '';
    this.stateTimer = 0;
    this.currentSkill = null;
    this.cooldowns = {};
    for (const key of Object.keys(cfg.skills)) this.cooldowns[key] = 0;
    this.hurtFlash = 0;
    this.idleTime = 1.2;
  }

  get box() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  get alive() {
    return this.state !== 'dying' && this.state !== 'dead';
  }

  // 植物密度加权选行：植物数 + 坚果血量权重
  pickRow(game) {
    const scores = Array(GRID.rows).fill(0);
    for (const plant of game.plantList) {
      if (!plant.alive) continue;
      scores[plant.row] += 1 + plant.maxHp / 2000;
    }
    const top = Math.max(...scores);
    if (top <= 0) return Math.floor(Math.random() * GRID.rows);
    const candidates = [];
    scores.forEach((s, i) => {
      if (s === top) candidates.push(i);
    });
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  rightmostPlant() {
    let found = null;
    for (const plant of this.game?.plantList || []) {
      if (!plant.alive) continue;
      if (!found || plant.col > found.col) found = plant;
    }
    return found;
  }

  takeDamage(amount) {
    if (!this.alive) return;
    let dmg = amount;
    if (this.state === 'transition') {
      dmg *= 1 - this.cfg.transitionReduction;
    }
    this.hp -= dmg;
    this.hurtFlash = 0.12;
    const ratio = Math.max(0, this.hp / this.maxHp);
    let next = 0;
    if (ratio <= this.cfg.phases[2].threshold) next = 2;
    else if (ratio <= this.cfg.phases[1].threshold) next = 1;
    if (next > this.phase) this.pendingPhase = Math.max(this.pendingPhase, next);
    if (this.hp <= 0) {
      this.hp = 0;
      this.state = 'dying';
      this.stateTimer = this.cfg.dyingTime;
    }
  }

  // ---- 技能流程 ----
  startSkill(game, name) {
    this.currentSkill = name;
    const skill = this.cfg.skills[name];
    if (name === 'summon') {
      this.resolveSummon(game);
      this.subState = 'action';
      this.stateTimer = 0.8;
      this.state = 'summon';
      return;
    }
    this.subState = 'warn';
    this.stateTimer = skill.warnTime;
    this.state = name;
    this.addWarning(game, name);
  }

  addWarning(game, name) {
    const skill = this.cfg.skills[name];
    if (name === 'iceball') {
      const row = this.pickRow(game);
      this.targetRow = row;
      const anchor = game.plantList
        .filter((p) => p.alive && p.row === row)
        .sort((a, b) => b.col - a.col)[0];
      const col = anchor ? anchor.col : 7;
      const x = GRID.originX + Math.max(0, col - 1) * GRID.cell;
      const y = GRID.originY + row * GRID.cell;
      game.addTelegraph(
        { x, y, w: GRID.cell * 3, h: GRID.cell },
        skill.warnTime,
        '#7fd8ff'
      );
    } else if (name === 'fireball') {
      const target = this.rightmostPlant();
      this.targetPlant = target;
      const x = target ? target.box.x : GRID.originX + 7 * GRID.cell;
      const y = target ? target.box.y : GRID.originY + GRID.cell;
      game.addTelegraph(
        { x, y, w: GRID.cell, h: GRID.cell },
        skill.warnTime,
        '#ff7a3d'
      );
    } else if (name === 'smash') {
      const col = skill.targetCol;
      game.addTelegraph(
        {
          x: GRID.originX + col * GRID.cell,
          y: GRID.originY,
          w: GRID.cell,
          h: GRID.rows * GRID.cell,
        },
        skill.warnTime,
        '#ff4d4d'
      );
    } else if (name === 'charge') {
      const row = this.pickRow(game);
      this.targetRow = row;
      game.addTelegraph(
        {
          x: GRID.originX,
          y: GRID.originY + row * GRID.cell,
          w: GRID.cols * GRID.cell,
          h: GRID.cell,
        },
        skill.warnTime,
        '#ffd34d'
      );
    }
  }

  resolveSummon(game) {
    const skill = this.cfg.skills.summon;
    const phase = this.phase;
    const planned =
      skill.countMin[phase] +
      Math.floor(
        Math.random() * (skill.countMax[phase] - skill.countMin[phase] + 1)
      );
    const room = Math.max(0, this.cfg.summonCap - game.zombies.length);
    const count = Math.min(planned, room);
    const pool = skill.pool[phase];
    for (let i = 0; i < count; i += 1) {
      const type = pool[Math.floor(Math.random() * pool.length)];
      const row = Math.floor(Math.random() * GRID.rows);
      game.spawnZombie(type, row, this.x - 10 - i * 14);
    }
    game.audio.play('summon');
  }

  resolveSkill(game) {
    const name = this.currentSkill;
    const skill = this.cfg.skills[name];
    if (name === 'iceball') {
      const row = this.targetRow;
      for (const plant of game.plantList) {
        if (!plant.alive || plant.row !== row) continue;
        if (plant.col >= 6) plant.takeDamage(plant.maxHp);
        plant.freezeTimer = skill.freezeRows;
      }
      game.audio.play('iceball');
    } else if (name === 'fireball') {
      const target = this.targetPlant;
      if (target && target.alive) {
        target.burnTimer = skill.burnTime;
        target.burnDps = skill.burnDps;
      }
      game.audio.play('fireball');
    } else if (name === 'smash') {
      const col = skill.targetCol;
      for (const plant of game.plantList) {
        if (plant.alive && plant.col === col) plant.takeDamage(plant.maxHp);
      }
      game.shakeByName('smash');
      game.audio.play('smash');
    } else if (name === 'charge') {
      const row = this.targetRow;
      const cols = new Set(
        Array.from({ length: GRID.cols }, (_, i) => i)
          .sort((a, b) => b - a)
          .slice(0, skill.destroyCols)
      );
      for (const plant of game.plantList) {
        if (plant.alive && plant.row === row && cols.has(plant.col)) {
          plant.takeDamage(plant.maxHp);
        }
      }
      game.shakeByName('charge');
      game.audio.play('charge');
    }
  }

  finishSkill(game) {
    const skill = this.cfg.skills[this.currentSkill];
    if (this.currentSkill !== 'summon') {
      this.cooldowns[this.currentSkill] = Array.isArray(skill.cooldown)
        ? skill.cooldown[this.phase]
        : skill.cooldown;
    } else {
      this.cooldowns.summon = this.cfg.skills.summon.cooldown[this.phase];
    }
    this.currentSkill = null;
    this.subState = '';
    this.state = 'idle';
    this.idleTime = 1.4;
    if (this.pendingPhase > this.phase) {
      this.phase = this.pendingPhase;
      this.state = 'transition';
      this.stateTimer = this.cfg.transitionTime;
      game.banner(`僵王博士 · 第 ${this.phase + 1} 阶段`);
      game.audio.play('roar');
    }
  }

  update(dt, game) {
    this.game = game;
    if (this.hurtFlash > 0) this.hurtFlash -= dt;

    switch (this.state) {
      case 'entering': {
        this.x -= this.cfg.creepSpeed * GRID.cell * 4 * dt;
        if (this.x <= this.enterX) {
          this.x = this.enterX;
          this.state = 'idle';
          game.banner(this.cfg.isFinal ? '最终决战开始！' : '僵王博士 出现了！');
          game.audio.play('roar');
        }
        break;
      }
      case 'dying': {
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          this.state = 'dead';
          game.onBossDead();
        }
        break;
      }
      case 'transition': {
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          this.state = 'idle';
          this.idleTime = 1;
        }
        break;
      }
      case 'idle': {
        if (this.x > this.minX) {
          this.x -= this.cfg.creepSpeed * GRID.cell * dt;
        }
        this.idleTime -= dt;
        for (const key of Object.keys(this.cooldowns)) {
          if (this.cooldowns[key] > 0) this.cooldowns[key] -= dt;
        }
        if (this.idleTime <= 0) {
          const available = this.cfg.phases[this.phase].skills.filter(
            (key) => this.cooldowns[key] <= 0
          );
          const ready = available.length ? available : ['summon'];
          const name = ready[Math.floor(Math.random() * ready.length)];
          this.startSkill(game, name);
        }
        break;
      }
      default: {
        // 技能状态（summon / iceball / fireball / smash / charge）
        if (this.subState === 'warn') {
          this.stateTimer -= dt;
          if (this.stateTimer <= 0) {
            this.resolveSkill(game);
            this.subState = 'action';
            this.stateTimer =
              this.currentSkill === 'charge'
                ? this.cfg.skills.charge.actionTime
                : 0.7;
          }
        } else {
          this.stateTimer -= dt;
          if (this.stateTimer <= 0) this.finishSkill(game);
        }
        break;
      }
    }
  }
}
