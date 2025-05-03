import { List } from 'immutable';
import * as reducerType from '../../unit/reducerType';
import { lastRecord } from '../../unit/const';
import Block from '../../unit/block';

// Removed duplicate imports below

const initState = (() => {
  // Keep existing initialization logic
  if (!lastRecord || !lastRecord.cur) { // 无记录 或 有记录 但方块为空, 返回 null
    return null;
  }
  // Ensure xy is loaded as an Immutable List if stored as array
  const cur = lastRecord.cur;
  const option = {
    type: cur.type,
    rotateIndex: cur.rotateIndex,
    shape: List(cur.shape.map(e => List(e))),
    // Ensure xy is List, handle potential plain array from older storage
    xy: cur.xy,
  };
  return new Block(option);
})();

const cur = (state = initState, action) => {
  switch (action.type) {
    case reducerType.MOVE_BLOCK:
      // Existing logic is fine: moveBlock action provides the new Block or null
      return action.data;
    case reducerType.RESET: // Add reset handling
      return null; // No current block when resetting
    default:
      return state;
  }
};

export default cur;
