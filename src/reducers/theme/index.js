import { SET_THEME, ThemeLight, ThemeDark, ThemeStorageKey } from '../../unit/const'; // Adjust path if needed

// Function to get initial theme from localStorage or default to light
const getInitialTheme = () => {
  try {
    const storedTheme = localStorage.getItem(ThemeStorageKey);
    if (storedTheme === ThemeLight || storedTheme === ThemeDark) {
      return storedTheme;
    }
  } catch (e) {
    console.error('Could not read theme from localStorage', e); // Use single quotes
  }
  return ThemeLight; // Default theme
};

const initialState = getInitialTheme(); // Calculate initial state once

const theme = (state, action) => { // Remove default parameter assignment from here
  // Explicitly handle the initial state when state is undefined
  if (state === undefined) {
    return initialState; // Return the calculated initial state during initialization
  }

  switch (action.type) {
    case SET_THEME: {
      const newTheme = action.data === ThemeDark ? ThemeDark : ThemeLight;
      try {
        localStorage.setItem(ThemeStorageKey, newTheme);
      } catch (e) {
        console.error('Could not save theme to localStorage', e);
      }
      // Only return new state if it actually changed
      return newTheme !== state ? newTheme : state;
    }
    default:
      // For any other action, explicitly return the existing state
      return state;
  }
};

export default theme;
// Add newline at end of file
