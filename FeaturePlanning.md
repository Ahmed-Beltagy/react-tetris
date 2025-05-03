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

## Feature 2: Dark Mode Theme

### User Story

*   **As a player, I want to be able to toggle between a standard light theme and a dark mode theme for the game interface, so that I can choose the appearance that is more comfortable for my eyes, especially in different lighting conditions.**

### Technical Requirements (Implemented)

1.  **State Management (Redux):**
    *   Added a `theme` state slice (`src/reducers/theme/index.js`) storing the current theme ('light' or 'dark').
    *   Initial state is determined by checking `localStorage` (`REACT_TETRIS_THEME` key) or defaulting to 'light'.
2.  **Actions:**
    *   Defined `SET_THEME` action type in `src/unit/reducerType.js`.
    *   Created `setTheme(theme)` action creator in `src/actions/index.js`.
3.  **Reducer:**
    *   Implemented the `theme` reducer to handle the `SET_THEME` action.
    *   Updates the state with the new theme ('light' or 'dark').
    *   Persists the chosen theme to `localStorage` on change.
4.  **UI Component (Theme Switcher):**
    *   Created `ThemeSwitcher` component (`src/components/themeSwitcher/index.js`).
    *   Displays a button with an icon (☀️/🌙) indicating the current mode and action.
    *   Connects to Redux state (`theme`) via `mapStateToProps`.
    *   Dispatches the `setTheme` action on click via `mapDispatchToProps`.
    *   Styled using CSS Modules (`src/components/themeSwitcher/index.less`), positioned fixed in the top-right corner.
5.  **Applying the Theme:**
    *   The main `App` container (`src/containers/index.js`) connects to the `theme` state.
    *   It dynamically adds a theme-specific CSS Modules class (`style.themeLight` or `style.themeDark`) to the root `div.app` element based on the current theme state.
6.  **Styling (Less with CSS Modules):**
    *   Defined base light theme styles in `src/containers/index.less`.
    *   Added specific dark mode overrides within `src/containers/index.less` targeting `.app.themeDark`. This includes background, text colors, panel colors, and Tetris block colors (moving vs. locked).
    *   Added dark mode overrides for the `ThemeSwitcher` button in `src/components/themeSwitcher/index.less`.
    *   Added dark mode overrides for the keyboard buttons in `src/components/keyboard/button/index.less` using `:global(.themeDark)` descendant selectors.

### Files Changed

*   `src/reducers/index.js`: Added `theme` reducer to `combineReducers`.
*   `src/reducers/theme/index.js`: New file created for the theme reducer logic and localStorage interaction.
*   `src/actions/index.js`: Added `setTheme` action creator and exported it.
*   `src/unit/reducerType.js`: Added `SET_THEME` constant.
*   `src/unit/const.js`: Added `ThemeLight`, `ThemeDark`, `ThemeStorageKey` constants.
*   `src/components/themeSwitcher/index.js`: New file for the switcher component.
*   `src/components/themeSwitcher/index.less`: New file for the switcher component styles.
*   `src/containers/index.js`: Connected to `theme` state, applied theme class to root element.
*   `src/containers/index.less`: Added theme variables, `.themeLight`/`.themeDark` class definitions, and specific dark mode style overrides for various elements (app background, text, panels, blocks).
*   `src/components/keyboard/button/index.less`: Added dark mode style overrides for keyboard buttons.

### Potential Challenges (Observed/Addressed)

*   **CSS Specificity:** Ensuring dark mode styles correctly override base styles, sometimes requiring `:global()` selectors or `!important` during debugging due to CSS Modules and rule ordering.
*   **Styling Consistency:** Manually ensuring all relevant UI elements (text, buttons, backgrounds, blocks) have appropriate colors and contrast in dark mode across different components.
*   **CSS Modules Interaction:** Correctly targeting elements styled in separate component `.less` files from the global theme class applied in the container (e.g., using `:global(.themeDark) .button`).
