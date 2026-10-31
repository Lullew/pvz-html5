// 应用入口
import { Game } from './core/Game.js';

const canvas = document.getElementById('game');
const game = new Game(canvas);
// 调试钩子：浏览器控制台可通过 window.__game 检查状态
window.__game = game;
