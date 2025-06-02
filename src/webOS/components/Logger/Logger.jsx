// src/stores/Logger/Logger.jsx

import { useStateManager } from "../../stores/StateManager/StateManager";
import { useRef } from "react";

/**
 * We’ll assign a unique numeric instance ID to each hook invocation.
 * This ensures that multiple instances of the same componentName
 * get distinct identifiers in the logger.
 */
let nextInstanceId = 1;

/**
 * registeredComponents:
 *   Maps componentId → Set of groupNames that have been logged.
 *
 * mutedComponents:
 *   A Set of componentIds that are fully muted.
 *
 * mutedGroups:
 *   Maps componentId → Set of groupNames that are muted under that component.
 */
const registeredComponents = {};
const mutedComponents = new Set();
const mutedGroups = {};

/**
 * useLogger(componentName: string):
 *   - Generates a unique componentId = `${componentName}-${instanceId}`.
 *   - Reads `developer.logsenabled` from StateManager to decide if logging is globally enabled.
 *   - Returns:
 *       { log, enabled, componentId }
 *     where:
 *       log(groupName: string, message: string):
 *         • No-op if global logging is disabled.
 *         • No-op if this componentId is muted.
 *         • No-op if this groupName under componentId is muted.
 *         • Otherwise:
 *             - Registers componentId and groupName in registeredComponents.
 *             - Prints `[HH:MM:SS] componentId groupName | message` to console.
 *       enabled: boolean, true iff global logging is “true”.
 *       componentId: the unique identifier for this instance.
 */
export const useLogger = (componentName) => {
  const { state } = useStateManager();
  const logsEnabled =
    state &&
    state.groups &&
    state.groups.developer &&
    state.groups.developer.logsenabled === "true";

  // Persist an instanceId across renders
  const instanceRef = useRef(null);
  if (instanceRef.current === null) {
    instanceRef.current = nextInstanceId++;
  }
  const componentId = `${componentName}-${instanceRef.current}`;

  // Initialize registration/muted sets for this componentId
  if (!registeredComponents[componentId]) {
    registeredComponents[componentId] = new Set();
  }
  if (!mutedGroups[componentId]) {
    mutedGroups[componentId] = new Set();
  }

  const log = (groupName, message) => {
    if (!logsEnabled) return;
    if (mutedComponents.has(componentId)) return;
    if (mutedGroups[componentId].has(groupName)) return;

    // Register this group under the componentId
    registeredComponents[componentId].add(groupName);

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const timestamp = `${hh}:${mm}:${ss}`;

    console.log(`[${timestamp}] ${componentId} ${groupName} | ${message}`);
  };

  return { log, enabled: logsEnabled, componentId };
};

/**
 * getRegisteredComponents():
 *   Returns an array of all componentIds that have logged at least once.
 */
export const getRegisteredComponents = () => {
  return Object.keys(registeredComponents);
};

/**
 * getRegisteredGroups(componentId: string):
 *   Returns an array of groupNames logged under the given componentId.
 *   If none exist, returns an empty array.
 */
export const getRegisteredGroups = (componentId) => {
  if (registeredComponents[componentId]) {
    return Array.from(registeredComponents[componentId]);
  }
  return [];
};

/**
 * isComponentMuted(componentId: string):
 *   Returns true if the given componentId is fully muted.
 */
export const isComponentMuted = (componentId) => {
  return mutedComponents.has(componentId);
};

/**
 * isGroupMuted(componentId: string, groupName: string):
 *   Returns true if the specified groupName under componentId is muted.
 */
export const isGroupMuted = (componentId, groupName) => {
  return mutedGroups[componentId]?.has(groupName) || false;
};

/**
 * muteComponent(componentId: string):
 *   Mutes all logs for this component instance.
 */
export const muteComponent = (componentId) => {
  mutedComponents.add(componentId);
};

/**
 * unmuteComponent(componentId: string):
 *   Unmutes this component instance.
 */
export const unmuteComponent = (componentId) => {
  mutedComponents.delete(componentId);
};

/**
 * muteGroup(componentId: string, groupName: string):
 *   Mutes only the specified group under the given component instance.
 */
export const muteGroup = (componentId, groupName) => {
  if (!mutedGroups[componentId]) {
    mutedGroups[componentId] = new Set();
  }
  mutedGroups[componentId].add(groupName);
};

/**
 * unmuteGroup(componentId: string, groupName: string):
 *   Unmutes only the specified group under the given component instance.
 */
export const unmuteGroup = (componentId, groupName) => {
  mutedGroups[componentId]?.delete(groupName);
};

/**
 * getMutedComponents():
 *   Returns an array of componentIds that are fully muted.
 */
export const getMutedComponents = () => {
  return Array.from(mutedComponents);
};

/**
 * getMutedGroups(componentId: string):
 *   Returns an array of names of groups that are muted under the given component instance.
 */
export const getMutedGroups = (componentId) => {
  if (mutedGroups[componentId]) {
    return Array.from(mutedGroups[componentId]);
  }
  return [];
};
