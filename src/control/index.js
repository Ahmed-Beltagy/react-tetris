import store from '../store';
import todo from './todo';

const keyboard = {
  37: 'left',
  38: 'rotate',
  39: 'right',
  40: 'down',
  32: 'space',
  83: 's', // Assuming s is music toggle? Check your todo/s.js
  82: 'r', // Assuming r is reset? Check your todo/r.js
  80: 'p', // Assuming p is pause? Check your todo/p.js
};

let keydownActive;

// Convert string keys to numbers for comparison
const boardKeys = Object.keys(keyboard).map(e => parseInt(e, 10));

const keyDown = (e) => {
  // Use e.keyCode directly as it's already a number
  if (e.metaKey === true || boardKeys.indexOf(e.keyCode) === -1) {
    return;
  }
  const type = keyboard[e.keyCode];
  // Prevent repeated calls for the same key press
  if (type === keydownActive) {
    return;
  }
  keydownActive = type;
  todo[type].down(store); // Call the corresponding down handler
};

const keyUp = (e) => {
  // Use e.keyCode directly
  if (e.metaKey === true || boardKeys.indexOf(e.keyCode) === -1) {
    return;
  }
  const type = keyboard[e.keyCode];
  if (!type || !todo[type] || !todo[type].up) { // Check if handler exists
    console.warn(`No up handler for key type: ${type}`);
    return;
  }
  // Reset keydownActive only if the released key was the active one
  if (type === keydownActive) {
    keydownActive = '';
  }
  todo[type].up(store); // Call the corresponding up handler
};

document.addEventListener('keydown', keyDown, true);
document.addEventListener('keyup', keyUp, true);

