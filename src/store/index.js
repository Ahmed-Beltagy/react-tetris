import { createStore } from 'redux';
import rootReducer from '../reducers';

// Temporarily remove the DevTools enhancer to isolate the issue
const store = createStore(rootReducer);
// const store = createStore(rootReducer, window.devToolsExtension && window.devToolsExtension()); // Original line

export default store;
