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

const initialState = getInitialTheme();

const theme = (state = initialState, action) => {
  switch (action.type) {
    case SET_THEME: { // Wrap case in braces to allow lexical declaration
      const newTheme = action.data === ThemeDark ? ThemeDark : ThemeLight; // Ensure valid theme
      try {
        // Save the new theme preference to localStorage
        localStorage.setItem(ThemeStorageKey, newTheme);
      } catch (e) {
        console.error('Could not save theme to localStorage', e); // Use single quotes
      }
      return newTheme;
    }
    default:
      return state;
  }
};

export default theme;
// Add newline at end of file
