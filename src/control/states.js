import { List } from 'immutable';
import store from '../store';
import { want, isClear, isOver } from '../unit/';
import actions from '../actions';                                                                                                                              
import { speeds, blankLine, blankMatrix, clearPoints, eachLines } from '../unit/const';                                                                                                       
import { music } from '../unit/music';                                                                                                                                                        


const getStartMatrix = (startLines) => { // 生成startLines
  const getLine = (min, max) => { // 返回标亮个数在min~max之间一行方块, (包含边界)
    const count = parseInt((((max - min) + 1) * Math.random()) + min, 10);
    const line = [];
    for (let i = 0; i < count; i++) { // 插入高亮
      line.push(1);
    }
    for (let i = 0, len = 10 - count; i < len; i++) { // 在随机位置插入灰色
      const index = parseInt(((line.length + 1) * Math.random()), 10);
      line.splice(index, 0, 0);
    }

    return List(line);
  };
  let startMatrix = List([]);

  for (let i = 0; i < startLines; i++) {
    if (i <= 2) { // 0-3
      startMatrix = startMatrix.push(getLine(5, 8));
    } else if (i <= 6) { // 4-6
      startMatrix = startMatrix.push(getLine(4, 9));
    } else { // 7-9
      startMatrix = startMatrix.push(getLine(3, 9));
    }
  }
  for (let i = 0, len = 20 - startLines; i < len; i++) { // 插入上部分的灰色
    startMatrix = startMatrix.unshift(List(blankLine));
  }
  return startMatrix;
};

const states = {
  // 自动下落setTimeout变量
  fallInterval: null,

  // 游戏开始
  start: () => {
    if (music.start) {
      music.start();
    }
    const state = store.getState();
    states.dispatchPoints(0);
    store.dispatch(actions.speedRun(state.get('speedStart')));
    const startLines = state.get('startLines');
    const startMatrix = getStartMatrix(startLines);
    store.dispatch(actions.matrix(startMatrix));
    store.dispatch(actions.moveBlock({ type: state.get('next') }));
    store.dispatch(actions.nextBlock());
    states.auto();
  },

  // 自动下落
  auto: (timeout) => {
    const out = (timeout < 0 ? 0 : timeout);
    let state = store.getState();
    let cur = state.get('cur');
    const fall = () => {
      state = store.getState();
      cur = state.get('cur');
      const next = cur.fall();
      if (want(next, state.get('matrix'))) {
        store.dispatch(actions.moveBlock(next));
        states.fallInterval = setTimeout(fall, speeds[state.get('speedRun') - 1]);
      } else {
        let matrix = state.get('matrix');
        const shape = cur && cur.shape;
        const xy = cur && cur.xy;
        shape.forEach((m, k1) => (
          m.forEach((n, k2) => {
            if (n && xy.get(0) + k1 >= 0) { // 竖坐标可以为负
              let line = matrix.get(xy.get(0) + k1);
              line = line.set(xy.get(1) + k2, 1);
              matrix = matrix.set(xy.get(0) + k1, line);
            }
          })
        ));
        states.nextAround(matrix);
      }
    };
    clearTimeout(states.fallInterval);
    states.fallInterval = setTimeout(fall,
      out === undefined ? speeds[state.get('speedRun') - 1] : out);
  },

  // 一个方块结束, 触发下一个 (Piece locks, trigger next)
  nextAround: (matrix, stopDownTrigger) => {
    clearTimeout(states.fallInterval);
    store.dispatch(actions.lock(true));
    store.dispatch(actions.matrix(matrix));

    if (typeof stopDownTrigger === 'function') {
      stopDownTrigger();
    }

    // Calculate points *before* checking for clear/over
    const addPoints = (store.getState().get('points') + 10) +
      ((store.getState().get('speedRun') - 1) * 2); // 速度越快, 得分越高
    states.dispatchPoints(addPoints);

    if (isClear(matrix)) {
      if (music.clear) {
        music.clear();
      }
      return;
    }

    // Check for game over *first* based on the newly locked piece matrix
    if (isOver(matrix)) {
      if (music.gameover) {
        music.gameover();
      }
      states.overStart();
      return;
    }

    // Check for line clears *after* checking game over
    const clearCheck = isClear(matrix); // isClear should return the lines to clear or false/null
    if (clearCheck) { // Check if lines were cleared (isClear should return the lines array)
      if (music.clear) {
        music.clear();
      }
      // The clearLines function (or animation handler) should handle the rest:
      // - Animate line clear
      // - Calculate points for clearing
      // - Add new blank lines
      // - Spawn next piece
      // - Set canSwap(true) *after* clear animation and *before* next piece starts falling
      // For now, let's assume isClear triggers the visual and the clearLines state reducer handles the matrix update via animation component
      store.dispatch(actions.clearLines(true)); // Signal that lines need clearing (Matrix component handles animation)
      // The Matrix component's clear animation completion should trigger the final steps (points, speed, next piece, canSwap)
      // OR, if no animation, call a function here like handleLineClear(matrix, clearCheck.lines)
      return; // Stop processing here, let clear logic handle the next piece
    }

    // Use setTimeout to allow the UI to render the locked piece before the next one appears
    setTimeout(() => {
      store.dispatch(actions.lock(false));
      store.dispatch(actions.moveBlock({ type: store.getState().get('next') }));
      store.dispatch(actions.nextBlock());
      states.auto();
    }, 100);
  },

  // 页面焦点变换
  focus: (isFocus) => {
    store.dispatch(actions.focus(isFocus));
    if (!isFocus) {
      clearTimeout(states.fallInterval);
      return;
    }
    const state = store.getState();
    if (state.get('cur') && !state.get('reset') && !state.get('pause')) {
      states.auto();
    }
  },

  // 暂停
  pause: (isPause) => {
    store.dispatch(actions.pause(isPause));
    if (isPause) {
      clearTimeout(states.fallInterval);
      return;
    }
    states.auto();
  },

  // 消除行 - This might be deprecated if finalizeClear handles the logic post-animation
  // Or it could just trigger the animation start
  clearLines: (matrix, lines) => { // This function name might be confusing now
    const state = store.getState();
    let newMatrix = matrix;
    lines.forEach(n => {
      newMatrix = newMatrix.splice(n, 1);
      newMatrix = newMatrix.unshift(List(blankLine));
    });
    store.dispatch(actions.matrix(newMatrix));
    store.dispatch(actions.moveBlock({ type: state.get('next') }));
    store.dispatch(actions.nextBlock());
    states.auto();
    store.dispatch(actions.lock(false));
    const clearLines = state.get('clearLines') + lines.length;
    store.dispatch(actions.clearLines(clearLines)); // 更新消除行

    const addPoints = store.getState().get('points') +
      clearPoints[lines.length - 1]; // 一次消除的行越多, 加分越多
    states.dispatchPoints(addPoints);

    const speedAdd = Math.floor(clearLines / eachLines); // 消除行数, 增加对应速度
    let speedNow = state.get('speedStart') + speedAdd;
    speedNow = speedNow > 6 ? 6 : speedNow;
    store.dispatch(actions.speedRun(speedNow));
  },

  // 游戏结束, 触发动画
  overStart: () => {
    clearTimeout(states.fallInterval);
    store.dispatch(actions.lock(true));
    store.dispatch(actions.reset(true));
    store.dispatch(actions.pause(false));
  },

  // 游戏结束动画完成
  overEnd: () => {
    store.dispatch(actions.matrix(blankMatrix));
    store.dispatch(actions.moveBlock({ reset: true }));
    store.dispatch(actions.reset(false));
    store.dispatch(actions.lock(false));
    store.dispatch(actions.clearLines(0));
  },

  // 写入分数
  dispatchPoints: (point) => { // 写入分数, 同时判断是否创造最高分
    store.dispatch(actions.points(point));
    if (point > 0 && point > store.getState().get('max')) {
      store.dispatch(actions.max(point));
    }
  },

  // Hard Drop Action
  drop: () => {
    const state = store.getState();
    const cur = state.get('cur');
    if (!cur || state.get('pause')) {
      return; // No piece to drop or game paused
    }

    const matrix = state.get('matrix');
    const currentY = cur.xy.get(0); // Start from current Y
    const currentX = cur.xy.get(1); // X doesn't change

    // Calculate final Y position using want()
    let finalY = currentY;
    while (
      want(
        // Use a temporary object for the check, consistent with calculateGhostPosition
        { shape: cur.shape, xy: List([finalY + 1, currentX]) },
        matrix
      )
    ) {
      finalY++;
    }

    // Create the final piece state object for matrix update
    const finalPiece = {
      shape: cur.shape,
      xy: List([finalY, currentX]), // Use the calculated final Y
    };

    // Update the matrix with the final piece position
    let newMatrix = matrix;
    const shape = finalPiece.shape;
    const xy = finalPiece.xy;
    shape.forEach((m, k1) => (
      m.forEach((n, k2) => {
        if (n && xy.get(0) + k1 >= 0) { // Ensure Y is within bounds (>= 0)
          let line = newMatrix.get(xy.get(0) + k1);
          // Ensure line exists and X is within bounds before setting
          if (line && xy.get(1) + k2 >= 0 && xy.get(1) + k2 < 10) {
            line = line.set(xy.get(1) + k2, 1); // Use 1 for locked piece value
            newMatrix = newMatrix.set(xy.get(0) + k1, line);
          }
        }
      })
    ));

    // Play sound only if the piece actually moved
    if (finalY !== currentY && music.fall) {
      music.fall();
    }

    // Stop existing fall timer and trigger the next cycle immediately
    clearTimeout(states.fallInterval); // Important: Stop the auto-fall timer
    states.nextAround(newMatrix); // Pass the updated matrix to lock piece and continue

    // Optional: Add points for the drop based on distance
    // const dropDistance = finalY - currentY;
    // if (dropDistance > 0) {
    //   states.dispatchPoints(store.getState().get('points') + dropDistance); // Add 1 point per row dropped
    // }
  },
};

export default states;
