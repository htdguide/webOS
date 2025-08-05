/**
 * StateManager.jsx
 *
 * This file provides a React context for grouping and persisting UI state.
 * On load it flattens any nested “Dynamic” sub-objects into top-level keys,
 * records which keys are dynamic, and ensures they always reset to defaults
 * on a full page refresh. All state-manipulation APIs (add, delete, edit, rename,
 * move, reset, debug, refresh) operate on this flattened shape.
 *
 * Topics:
 * 1. Imports & Constants
 * 2. Flatten & Load Logic
 * 3. State Initialization
 * 4. Group-level Operations
 * 5. State-level Operations
 * 6. Debug & Refresh Operations
 * 7. Context & Hook Exports
 */

//////////////////////////////////////////
// 1. Imports & Constants
//////////////////////////////////////////
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef
} from 'react';
import defaultInitialStates from './initialstates.json';

const LOCAL_STORAGE_KEY = 'stateManagerCache';

//////////////////////////////////////////
// 2. Flatten & Load Logic
//////////////////////////////////////////

/** 
 * Take nested groups with optional `Dynamic` sub-objects and:
 *  - Pull all keys in `Dynamic` up to top level
 *  - Return both the flattened groups and a map of which keys were dynamic
 */
const flattenDefaults = (nested) => {
  const flat = {};
  const dynamicMap = {};
  Object.entries(nested).forEach(([group, defs]) => {
    const dynDefs = defs.Dynamic || {};
    dynamicMap[group] = Object.keys(dynDefs);
    flat[group] = {
      // include non-dynamic entries...
      ...Object.entries(defs)
        .filter(([k]) => k !== 'Dynamic')
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}),
      // ...then dynamic defaults at top level
      ...dynDefs
    };
  });
  return { flat, dynamicMap };
};

/**
 * Load state from localStorage if present, else fall back to defaults.
 * Always re-apply default values for dynamic keys on load.
 */
const loadStoredState = () => {
  // prepare flattened defaults + dynamic-key map
  const { flat: defaultFlat, dynamicMap } = flattenDefaults(defaultInitialStates);

  const storedJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedJSON) {
    try {
      const parsed = JSON.parse(storedJSON);
      const rawGroups = parsed.groups || {};
      // flatten what was stored
      const flattenedStored = {};
      Object.keys(defaultFlat).forEach(group => {
        const raw = rawGroups[group] || {};
        // if someone had nested Dynamic in storage, ignore it here:
        const { Dynamic: _ignore, ...others } = raw;
        flattenedStored[group] = { ...others };
      });
      // re-inject default dynamic values
      const finalGroups = {};
      Object.entries(defaultFlat).forEach(([group, defs]) => {
        const dynKeys = dynamicMap[group];
        // copy stored non-dynamic, then default dynamic
        finalGroups[group] = {
          ...flattenedStored[group],
          ...dynKeys.reduce((acc, k) => ({ ...acc, [k]: defs[k] }), {})
        };
      });
      return {
        groups: finalGroups,
        debug: typeof parsed.debug === 'boolean' ? parsed.debug : false
      };
    } catch (e) {
      console.error('Error parsing stored state:', e);
    }
  }

  // no storage → use defaults (flat) with debug off
  return { groups: defaultFlat, debug: false };
};

//////////////////////////////////////////
// 3. State Initialization
//////////////////////////////////////////
const StateManagerContext = createContext();

export const StateManagerProvider = ({ children }) => {
  // initial load & dynamic-map
  const initial = loadStoredState();
  const initialStateRef = useRef(initial);
  // extract dynamic keys for consumers
  const { dynamicMap } = flattenDefaults(defaultInitialStates);
  const dynamicStatesRef = useRef(dynamicMap);

  const [state, setState] = useState(initial);

  // persist on every change (dynamic keys always reset on fresh load)
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  //////////////////////////////////////////
  // 4. Group-level Operations
  //////////////////////////////////////////
  const addStateGroup = (groupName) => {
    setState(prev => {
      if (prev.groups[groupName]) {
        console.warn(`State group "${groupName}" already exists.`);
        return prev;
      }
      return {
        ...prev,
        groups: { ...prev.groups, [groupName]: {} }
      };
    });
  };

  const deleteStateGroup = (groupName) => {
    setState(prev => {
      if (!prev.groups[groupName]) {
        console.warn(`State group "${groupName}" does not exist.`);
        return prev;
      }
      const { [groupName]: _, ...rest } = prev.groups;
      return { ...prev, groups: rest };
    });
  };

  const editStateGroupName = (oldName, newName) => {
    setState(prev => {
      if (!prev.groups[oldName] || prev.groups[newName]) {
        console.warn(`Invalid rename from "${oldName}" to "${newName}".`);
        return prev;
      }
      const { [oldName]: groupData, ...others } = prev.groups;
      return {
        ...prev,
        groups: { ...others, [newName]: groupData }
      };
    });
  };

  const moveState = (fromGroup, stateName, toGroup) => {
    setState(prev => {
      const from = prev.groups[fromGroup];
      const to   = prev.groups[toGroup];
      if (!from || !to || from[stateName] === undefined || to[stateName] !== undefined) {
        console.warn(`Cannot move "${stateName}" from "${fromGroup}" to "${toGroup}".`);
        return prev;
      }
      const { [stateName]: val, ...restFrom } = from;
      return {
        ...prev,
        groups: {
          ...prev.groups,
          [fromGroup]: restFrom,
          [toGroup]:   { ...to, [stateName]: val }
        }
      };
    });
  };

  //////////////////////////////////////////
  // 5. State-level Operations
  //////////////////////////////////////////
  const addState = (group, name, value) => {
    setState(prev => {
      const g = prev.groups[group];
      if (!g || g[name] !== undefined) {
        console.warn(`Cannot add "${name}" to "${group}".`);
        return prev;
      }
      return {
        ...prev,
        groups: { ...prev.groups, [group]: { ...g, [name]: value } }
      };
    });
  };

  const deleteState = (group, name) => {
    setState(prev => {
      const g = prev.groups[group];
      if (!g || g[name] === undefined) {
        console.warn(`Cannot delete "${name}" from "${group}".`);
        return prev;
      }
      const { [name]: _, ...rest } = g;
      return {
        ...prev,
        groups: { ...prev.groups, [group]: rest }
      };
    });
  };

  const editStateValue = (group, name, newValue) => {
    setState(prev => {
      const g = prev.groups[group];
      if (!g || g[name] === undefined) {
        console.warn(`Cannot edit "${name}" in "${group}".`);
        return prev;
      }
      return {
        ...prev,
        groups: { ...prev.groups, [group]: { ...g, [name]: newValue } }
      };
    });
  };

  const editStateName = (group, oldName, newName) => {
    setState(prev => {
      const g = prev.groups[group];
      if (!g || g[oldName] === undefined || g[newName] !== undefined) {
        console.warn(`Cannot rename "${oldName}" to "${newName}" in "${group}".`);
        return prev;
      }
      const { [oldName]: val, ...rest } = g;
      return {
        ...prev,
        groups: { ...prev.groups, [group]: { ...rest, [newName]: val } }
      };
    });
  };

  //////////////////////////////////////////
  // 6. Debug & Refresh Operations
  //////////////////////////////////////////
  const resetStates = () => {
    // restore to initial load (which had defaults for dynamic keys)
    setState(prev => ({
      ...initialStateRef.current,
      debug: prev.debug
    }));
  };

  const setDebug = (flag) => {
    setState(prev => ({ ...prev, debug: flag }));
    console.log(`Debug mode set to ${flag}`);
  };

  const toggleDebug = () => {
    setState(prev => {
      const d = !prev.debug;
      console.log(`Debug mode toggled to ${d}`);
      return { ...prev, debug: d };
    });
  };

  /** force a re-render without changing values */
  const refreshState = () => {
    setState(prev => ({ ...prev }));
  };

  //////////////////////////////////////////
  // 7. Context & Hook Exports
  //////////////////////////////////////////
  const contextValue = {
    state,
    dynamicStates: dynamicStatesRef.current,
    addStateGroup,
    deleteStateGroup,
    editStateGroupName,
    moveState,
    addState,
    deleteState,
    editStateValue,
    editStateName,
    resetStates,
    setDebug,
    toggleDebug,
    refreshState
  };

  return (
    <StateManagerContext.Provider value={contextValue}>
      {children}
    </StateManagerContext.Provider>
  );
};

/**
 * Custom hook: use inside a StateManagerProvider to access state + API.
 */
export const useStateManager = () => {
  const ctx = useContext(StateManagerContext);
  if (!ctx) {
    throw new Error('useStateManager must be used within a StateManagerProvider');
  }
  return ctx;
};
