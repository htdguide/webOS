// src/stores/Logger/Logger.jsx

import { useStateManager } from "../../stores/StateManager/StateManager";

/**
 * registeredComponents:
 *   An object mapping componentName → Set of groupNames that have been logged at least once.
 *
 * mutedComponents:
 *   A Set of componentNames that are currently muted.
 *
 * mutedGroups:
 *   An object mapping componentName → Set of groupNames that are currently muted under that component.
 */
const registeredComponents = {};
const mutedComponents = new Set();
const mutedGroups = {};

/**
 * useLogger(componentName):
 *   - Reads `developer.logsenabled` from StateManager to decide if logging is globally enabled.
 *   - Returns:
 *       { log, enabled }
 *     where:
 *       log(groupName: string, message: string):
 *         • If global logsEnabled is false, does nothing.
 *         • If this componentName is muted, does nothing.
 *         • If this groupName under componentName is muted, does nothing.
 *         • Otherwise, registers componentName and groupName into registeredComponents,
 *           retrieves current time, and prints:
 *             [HH:MM:SS] componentName groupName | message
 *       enabled: boolean flag, true iff `developer.logsenabled === "true"`.
 */
export const useLogger = (componentName) => {
  const { state } = useStateManager();

  const logsEnabled =
    state &&
    state.groups &&
    state.groups.developer &&
    state.groups.developer.logsenabled === "true";

  // Initialize registration sets/maps if necessary
  if (!registeredComponents[componentName]) {
    registeredComponents[componentName] = new Set();
  }
  if (!mutedGroups[componentName]) {
    mutedGroups[componentName] = new Set();
  }

  const log = (groupName, message) => {
    if (!logsEnabled) return;
    if (mutedComponents.has(componentName)) return;
    if (mutedGroups[componentName].has(groupName)) return;

    // Register this component and group
    registeredComponents[componentName].add(groupName);

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const timestamp = `${hh}:${mm}:${ss}`;

    console.log(`[${timestamp}] ${componentName} ${groupName} | ${message}`);
  };

  return { log, enabled: logsEnabled };
};

/** Helper functions for the Logger terminal app **/

/**
 * getRegisteredComponents():
 *   Returns an array of component names that have invoked useLogger at least once.
 */
export const getRegisteredComponents = () => {
  return Object.keys(registeredComponents);
};

/**
 * getRegisteredGroups(componentName: string):
 *   Returns an array of group names that have been used by the given component.
 *   If the component hasn’t been registered or has no groups, returns an empty array.
 */
export const getRegisteredGroups = (componentName) => {
  if (registeredComponents[componentName]) {
    return Array.from(registeredComponents[componentName]);
  }
  return [];
};

/**
 * isComponentMuted(componentName: string):
 *   Returns true if the component is currently muted.
 */
export const isComponentMuted = (componentName) => {
  return mutedComponents.has(componentName);
};

/**
 * isGroupMuted(componentName: string, groupName: string):
 *   Returns true if the specific group under the component is currently muted.
 */
export const isGroupMuted = (componentName, groupName) => {
  return mutedGroups[componentName]?.has(groupName) || false;
};

/**
 * muteComponent(componentName: string):
 *   Mutes all logs for the given component name.
 */
export const muteComponent = (componentName) => {
  mutedComponents.add(componentName);
};

/**
 * unmuteComponent(componentName: string):
 *   Unmutes the given component name.
 */
export const unmuteComponent = (componentName) => {
  mutedComponents.delete(componentName);
};

/**
 * muteGroup(componentName: string, groupName: string):
 *   Mutes only the specified group under the given component.
 */
export const muteGroup = (componentName, groupName) => {
  if (!mutedGroups[componentName]) {
    mutedGroups[componentName] = new Set();
  }
  mutedGroups[componentName].add(groupName);
};

/**
 * unmuteGroup(componentName: string, groupName: string):
 *   Unmutes only the specified group under the given component.
 */
export const unmuteGroup = (componentName, groupName) => {
  mutedGroups[componentName]?.delete(groupName);
};

/**
 * getMutedComponents():
 *   Returns an array of the currently muted component names.
 */
export const getMutedComponents = () => {
  return Array.from(mutedComponents);
};

/**
 * getMutedGroups(componentName: string):
 *   Returns an array of currently muted groups under the given component.
 */
export const getMutedGroups = (componentName) => {
  if (mutedGroups[componentName]) {
    return Array.from(mutedGroups[componentName]);
  }
  return [];
};
