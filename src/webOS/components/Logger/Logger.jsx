// src/stores/Logger/logger.jsx

import { useStateManager } from "../../stores/StateManager/StateManager";

/**
 * Custom hook that returns a logging function for a given component name.
 * The returned `log` function will:
 *   1) Read `developer.logsenabled` from StateManager.
 *   2) If logs are enabled ("true"), format the current time as [HH:MM:SS | Component]
 *      and print the message to console.
 *
 * Usage in a component:
 *   const log = useLogger("MyComponent");
 *   log("Some message here");
 */
export const useLogger = (componentName) => {
  // Grab the entire state, so we can check developer.logsenabled
  const { state } = useStateManager();

  // Determine if logging is enabled (the JSON value is a string "true"/"false")
  const logsEnabled =
    state &&
    state.groups &&
    state.groups.developer &&
    state.groups.developer.logsenabled === "true";

  /**
   * log(message: string):
   *   If logsEnabled is true, prints:
   *     [HH:MM:SS | componentName] message
   */
  const log = (message) => {
    if (!logsEnabled) return;

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const timestamp = `${hh}:${mm}:${ss}`;

    console.log(`[${timestamp} | ${componentName}] ${message}`);
  };

  return log;
};
