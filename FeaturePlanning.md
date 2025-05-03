# Feature Planning: Tetris Enhancements

This document outlines the planning for two new features to be added to the React Tetris project: Ghost Piece and Hold Piece.

## Feature 1: Ghost Piece (Piece Shadow)

### User Story

*   **As a player, I want to see a faint outline or shadow of the current falling tetromino at the bottom of the playfield, indicating exactly where it would land if I were to drop it instantly, so that I can position and drop pieces more accurately and quickly, especially at higher speeds.**

### Technical Requirements

1.  **Landing Position Calculation:**
    *   Implement a function that takes the current piece (`cur`) and the current board state (`matrix`) as input.
    *   This function will simulate the piece falling one step at a time, using the existing collision detection logic (`want()` function), until it finds the lowest possible valid Y-coordinate (row index) where the piece can rest without overlapping existing blocks or going out of bounds.
    *   The function should return a representation of the piece (shape, type, rotation) at this final landing position (specifically the calculated `xy` coordinates).
2.  **Integration with Rendering:**
    *   The calculated ghost piece data (position and shape) needs to be made available to the `Matrix` component during its render cycle. This could be done by:
        *   Calculating it within the `Matrix` component itself based on props (`cur`, `matrix`).
        *   Passing it down as a separate prop, calculated in a parent component or selector.
3.  **Rendering Logic:**
    *   Modify the `Matrix` component's rendering logic.
    *   Iterate through the cells occupied by the calculated ghost piece.
    *   For each cell of the ghost piece, if the corresponding cell on the main `matrix` is empty (value 0), render a distinct visual indicator for the ghost piece.
    *   Ensure the ghost piece rendering does *not* overwrite the rendering of the actual falling piece (`cur`) or already locked pieces on the board.
4.  **Styling:**
    *   Define CSS styles for the ghost piece blocks. This could be:
        *   A semi-transparent version of the piece's color.
        *   An outline/border style.
        *   A specific neutral color (e.g., light gray).
    *   The style should be distinct but not visually distracting.

### Files May Need Change

*   `src/unit/index.js` or `src/control/states.js`: To add the landing position calculation logic (e.g., a new function `calculateGhostPosition(cur, matrix)`).
*   `src/components/matrix/index.js`: To incorporate the calculation (if done here) and implement the rendering logic for the ghost piece cells.
*   `src/components/matrix/index.css` (or associated styled-component/CSS module): To add the CSS rules for styling the ghost piece blocks.
*   `src/containers/index.js` (or relevant container): Potentially, if the calculation is done higher up and passed as props.

### Potential Challenges

*   **Performance:** The landing calculation involves simulating a drop. While likely fast enough, ensure it doesn't introduce noticeable lag, especially if called frequently during rendering.
*   **Rendering Complexity:** Correctly merging the ghost piece visualization with the existing matrix rendering logic, ensuring proper layering and avoiding visual glitches where the ghost and active piece overlap.
*   **Visual Design:** Choosing a ghost piece style that is clear and helpful across different themes/color schemes without being overly distracting.

---

## Feature 2: Hold Piece

### User Story

*   **As a player, I want to press a designated 'Hold' key (e.g., Shift or C) to swap the currently falling tetromino with one stored in a 'Hold' area. If the Hold area is empty, the current piece moves there, and the next piece from the queue starts falling. I should only be able to perform this swap once per falling piece, so I can strategically save useful pieces for later or temporarily set aside difficult ones.**

### Technical Requirements

1.  **State Management (Redux):**
    *   Add a new state slice `heldPiece` (reducer: `src/reducers/heldPiece/index.js`) to store the *type* of the piece in the hold area (e.g., 'I', 'L', 'T', or `null` if empty). Initial state: `null`.
    *   Add a new state slice `canSwap` (reducer: `src/reducers/canSwap/index.js`) to store a boolean flag indicating if the hold action is currently allowed. Initial state: `true`.
2.  **Actions:**
    *   Define a new action type `HOLD_PIECE` in `src/actions/index.js`.
    *   Define a new action type `SET_CAN_SWAP` in `src/actions/index.js`.
    *   Define a keyboard-specific action `KEY_HOLD` in `src/actions/keyboard.js`.
3.  **Reducers:**
    *   Implement the `heldPiece` reducer: On `HOLD_PIECE`, it updates the stored type based on the current `cur` piece and the previous `heldPiece` state.
    *   Implement the `canSwap` reducer: Sets to `false` on `HOLD_PIECE`, sets to `true` via `SET_CAN_SWAP` action.
    *   Modify the `cur` reducer: On `HOLD_PIECE`, it should either become `null` (if hold was empty, triggering next piece) or become a new `Block` instance based on the previously held piece type.
    *   Modify the `next` reducer (potentially): If holding when the reserve is empty, the game needs to pull the *next* piece from the queue to become the new `cur`. Ensure this interaction is handled correctly.
4.  **Game Logic / Control:**
    *   Implement a new key handler (e.g., `src/control/todo/hold.js`) for the designated Hold key.
    *   This handler checks if `getState().get('canSwap')` is `true`.
    *   If true, it dispatches the `HOLD_PIECE` action.
    *   Modify the game logic where a piece locks and the next piece is spawned (`src/control/states.js` - likely within `nextAround` or related logic): Dispatch `actions.setCanSwap(true)` at this point.
5.  **UI Component:**
    *   Create a new React component `src/components/hold/index.js`.
    *   This component will display the tetromino shape corresponding to the `heldPiece` type stored in the Redux state (similar to the `Next` component).
    *   Style the component appropriately (e.g., using CSS in `src/components/hold/index.css`).
    *   Integrate this `Hold` component into the main UI layout in `src/containers/index.js`.

### Files May Need Change

*   `src/reducers/index.js`: To add the new `heldPiece` and `canSwap` reducers.
*   `src/reducers/`: Add new directories/files `heldPiece/index.js` and `canSwap/index.js`.
*   `src/reducers/cur/index.js`: Modify to handle the `HOLD_PIECE` action logic.
*   `src/reducers/next/index.js`: Potentially modify depending on how the next piece is handled after a hold action.
*   `src/actions/index.js`: Add `HOLD_PIECE`, `SET_CAN_SWAP` action types and creators.
*   `src/actions/keyboard.js`: Add `KEY_HOLD` action type and creator.
*   `src/control/states.js`: Modify piece locking/spawning logic to dispatch `SET_CAN_SWAP(true)`. Handle the logic flow for swapping (getting next piece if hold was empty).
*   `src/control/todo/`: Add a new file like `hold.js` for the key press/release handler.
*   `src/control/index.js`: Register the new hold key handler.
*   `src/components/`: Add new directory/files for the `Hold` component (`Hold/index.js`, `Hold/index.css`).
*   `src/containers/index.js`: Import and render the `Hold` component, connecting it to the `heldPiece` state.
*   `src/unit/const.js` (or key mapping config): Define the key code/name for the Hold action.

### Potential Challenges

*   **State Transition Complexity:** Ensuring the state updates correctly across `cur`, `heldPiece`, `next`, and `canSwap` during the swap operation is critical. Edge cases like holding the very first piece or rapid key presses need careful handling.
*   **Game Flow Integration:** Precisely timing the `SET_CAN_SWAP(true)` dispatch is important – it should happen only after the *current* piece has locked and the *next* piece cycle is truly beginning.
*   **Interaction with `next`:** Defining the exact behavior when the hold area is empty: does the piece currently shown in the "Next" display immediately become the falling piece, or does the game pull a new "Next" piece as well? (Standard behavior is usually the former).
