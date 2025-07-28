// src/context/TweakpaneContext.jsx

import { createContext } from 'react';

/**
 * Creates a React Context to hold and provide a single instance of Tweakpane.
 * This allows any component in the application to access the same debug panel
 * without passing it down through props.
 *
 * The initial value is `null` because the pane will only be created
 * in the top-level component (App.jsx) when in debug mode.
 */
export const TweakpaneContext = createContext(null);