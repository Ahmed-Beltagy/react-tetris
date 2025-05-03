import { List } from 'immutable';
import { blockType, StorageKey } from './const';

const hiddenProperty = (() => { // document[hiddenProperty] 可以判断页面是否失焦
  let names = [
    'hidden',
    'webkitHidden',
    'mozHidden',
    'msHidden',
  ];
  names = names.filter((e) => (e in document));
  return names.length > 0 ? names[0] : false;
})();

const visibilityChangeEvent = (() => {
  if (!hiddenProperty) {
    return false;
  }
  return hiddenProperty.replace(/hidden/i, 'visibilitychange'); // 如果属性有前缀, 相应的事件也有前缀
})();

const isFocus = () => {
  if (!hiddenProperty) { // 如果不存在该特性, 认为一直聚焦
    return true;
  }
  return !document[hiddenProperty];
};

const unit = {
  getNextType() { // 随机获取下一个方块类型
    const len = blockType.length;
    return blockType[Math.floor(Math.random() * len)];
  },
  want(next, matrix) { // Checks if the piece 'next' can be placed on the 'matrix'
    const xy = next.xy; // [row, col]
    const shape = next.shape;

    // Iterate through each cell in the piece's shape
    return shape.every((m, k1) => { // k1 = relative row offset
      return m.every((n, k2) => { // k2 = relative col offset
        if (!n) {
          // If this part of the shape is empty (0), it's always valid.
          return true;
        }

        // Calculate the absolute coordinates on the matrix
        const nextY = xy.get(0) + k1; // Absolute row
        const nextX = xy.get(1) + k2; // Absolute column

        // Check boundaries
        if (nextX < 0 || nextX >= 10) { // Check horizontal bounds (0 <= column < 10)
          return false;
        }
        if (nextY >= 20) { // Check bottom bound (row < 20)
          return false;
        }
        if (nextY < 0) {
          // Allow blocks to be above the top boundary (row < 0) initially.
          // These blocks are considered valid (e.g., during spawning or rotation near the top).
          return true;
        }

        // Check collision with existing blocks on the matrix
        if (matrix.get(nextY).get(nextX)) { // If matrix cell is already occupied (value is not 0)
          return false; // Collision detected
        }

        // If all checks pass for this block part, it's valid so far.
        return true;
      });
    });
  },
  isClear(matrix) { // Checks if any lines are complete and clearable
    const clearLines = [];
    matrix.forEach((m, k) => {
      if (m.every(n => !!n)) {
        clearLines.push(k);
      }
    });
    if (clearLines.length === 0) {
      return false;
    }
    return clearLines;
  },
  isOver(matrix) { // 游戏是否结束, 第一行落下方块为依据
    return matrix.get(0).some(n => !!n);
  },

  // New function to calculate ghost piece position
  calculateGhostPosition(cur, matrix) {
    if (!cur) {
      return null; // No current piece, no ghost
    }

    // Start from the current piece's position
    let ghostY = cur.xy.get(0); // Current Row (Y)
    const currentX = cur.xy.get(1); // Current Column (X) - this doesn't change

    // Keep moving down (increasing Y) as long as the position is valid
    // We use 'this.want' which expects an object with 'shape' and 'xy' (as an Immutable List)
    while (
      this.want(
        // Create a temporary object for the check, avoiding cur.set()
        {
          shape: cur.shape, // Use the shape from the current piece
          xy: List([ghostY + 1, currentX]), // Create a new Immutable List for the potential position
        },
        matrix
      )
    ) {
      ghostY++; // Move down one row
    }

    // Return the last valid position found [Row, Column]
    return List([ghostY, currentX]);
  },

  subscribeRecord(store) { // 将状态记录到 localStorage
    store.subscribe(() => {
      let data = store.getState().toJS();
      if (data.lock) { // 当状态为锁定, 不记录
        return;
      }
      data = JSON.stringify(data);
      data = encodeURIComponent(data);
      if (window.btoa) {
        data = btoa(data);
      }
      localStorage.setItem(StorageKey, data);
    });
  },
  isMobile() { // 判断是否为移动端
    const ua = navigator.userAgent;
    const android = /Android (\d+\.\d+)/.test(ua);
    const iphone = ua.indexOf('iPhone') > -1;
    const ipod = ua.indexOf('iPod') > -1;
    const ipad = ua.indexOf('iPad') > -1;
    const nokiaN = ua.indexOf('NokiaN') > -1;
    return android || iphone || ipod || ipad || nokiaN;
  },
  visibilityChangeEvent,
  isFocus,
};

module.exports = unit;
