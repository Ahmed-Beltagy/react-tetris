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
console.log('Initial theme state calculated:', initialState); // Add this log

const theme = (state = initialState, action) => { // Use default parameter for initial state
  // No need for explicit undefined check when using default parameter

  switch (action.type) {
    case SET_THEME: {
      console.log('[Reducer theme] Received SET_THEME action. Payload:', action.data);
      const newTheme = action.data === ThemeDark ? ThemeDark : ThemeLight;
      console.log('[Reducer theme] Calculated newTheme:', newTheme, 'Current state:', state);
      try {
        localStorage.setItem(ThemeStorageKey, newTheme);
        console.log('[Reducer theme] Saved to localStorage:', newTheme);
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
