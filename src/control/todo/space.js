import event from '../../unit/event';
import actions from '../../actions';
import states from '../states';
// Remove unused imports: want, music

const down = (store) => {
  store.dispatch(actions.keyboard.drop(true));
  event.down({
    key: 'space',
    once: true,
    callback: () => {
      const state = store.getState();
      if (state.get('lock')) {
        return; // Don't drop if locked
      }

      const cur = state.get('cur');
      if (cur !== null) { // If there is a current piece
        if (state.get('pause')) {
          states.pause(false); // Unpause if paused
          return; // Don't drop on the same key press that unpauses
        }
        // Call the dedicated drop function in states.js
        states.drop();
      } else {
        // If no current piece, start the game
        states.start();
      }
    },
  });
};

const up = (store) => {
  store.dispatch(actions.keyboard.drop(false));
  event.up({
    key: 'space',
  });
};

export default {
  down,
  up,
};
