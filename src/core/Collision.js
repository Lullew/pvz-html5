// AABB 与网格判定
export function aabb(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function pointInRect(px, py, rect) {
  return (
    px >= rect.x &&
    px <= rect.x + rect.w &&
    py >= rect.y &&
    py <= rect.y + rect.h
  );
}

export function pointInCircle(px, py, cx, cy, r) {
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= r * r;
}

// 世界坐标 -> 网格行列，不在草坪内返回 null
export function worldToGrid(px, py, grid) {
  const col = Math.floor((px - grid.originX) / grid.cell);
  const row = Math.floor((py - grid.originY) / grid.cell);
  if (col < 0 || col >= grid.cols || row < 0 || row >= grid.cols) return null;
  return { row, col };
}

// 以某格为中心、半径 radius（格）内的所有格子
export function cellsInRadius(row, col, radius, grid) {
  const result = [];
  for (let r = 0; r < grid.rows; r += 1) {
    for (let c = 0; c < grid.cols; c += 1) {
      if (Math.abs(r - row) <= radius && Math.abs(c - col) <= radius) {
        result.push({ row: r, col: c });
      }
    }
  }
  return result;
}
