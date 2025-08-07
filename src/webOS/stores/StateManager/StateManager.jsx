/**
 * StateManager.jsx
 *
 * This file provides a React context for grouping and persisting UI state.  
 * It flattens nested default states (including “Dynamic” keys), checks both the schema and the app version on load,  
 * and clears the cache & reloads defaults if either has changed, logging the previous→current version on mismatch.
 *
 * Areas & segments:
 * 1. Imports & Constants
 *    1.1 React imports & LOCAL_STORAGE_KEY  
 *    1.2 CURRENT_VERSION from .env  
 * 2. Flatten & Load Logic
 *    2.1 flattenDefaults  
 *    2.2 isStructureSame  
 *    2.3 loadStoredState  
 * 3. State Initialization
 *    3.1 Refs & initial useState  
 *    3.2 Persistence effect  
 * 4. Group-level Operations
 *    4.1 addStateGroup  
 *    4.2 deleteStateGroup  
 *    4.3 editStateGroupName  
 *    4.4 moveState  
 * 5. State-level Operations
 *    5.1 addState  
 *    5.2 deleteState  
 *    5.3 editStateValue  
 *    5.4 editStateName  
 * 6. Debug & Refresh Operations
 *    6.1 resetStates  
 *    6.2 setDebug  
 *    6.3 toggleDebug  
 *    6.4 refreshState  
 * 7. Context & Hook Exports
 *    7.1 StateManagerProvider  
 *    7.2 useStateManager  
 */

//////////////////////////////////////////
// Area 1: Imports & Constants
//////////////////////////////////////////

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef
} from 'react';
import defaultInitialStates from './initialstates.json';

// 1.1: Key under which we store our cache
const LOCAL_STORAGE_KEY = 'stateManagerCache';
// 1.2: Current app version from .env
const CURRENT_VERSION = import.meta.env.VITE_APP_WEBOS_VERSION;

//////////////////////////////////////////
// Area 2: Flatten & Load Logic
//////////////////////////////////////////

/** 
 * 2.1: flattenDefaults — take nested defaults (with optional `Dynamic`) and:
 *      • flatten non-dynamic & dynamic keys into one level  
 *      • build a map of which keys were dynamic  
 */
const flattenDefaults = (nested) => {
  const flat = {};
  const dynamicMap = {};
  Object.entries(nested).forEach(([group, defs]) => {
    const dynDefs = defs.Dynamic || {};
    dynamicMap[group] = Object.keys(dynDefs);
    flat[group] = {
      ...Object.entries(defs)
        .filter(([k]) => k !== 'Dynamic')
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}),
      ...dynDefs
    };
  });
  return { flat, dynamicMap };
};

/** 
 * 2.2: isStructureSame — compare stored vs. default schema:
 *      • group names & non-Dynamic keys must match exactly  
 */
const isStructureSame = (storedGroups, defaultFlat) => {
  const storedNames = Object.keys(storedGroups).sort();
  const defaultNames = Object.keys(defaultFlat).sort();
  if (storedNames.length !== defaultNames.length ||
      !storedNames.every((g, i) => g === defaultNames[i])) {
    return false;
  }
  for (const group of defaultNames) {
    const rawKeys = Object.keys(storedGroups[group] || {});
    const storedKeys = rawKeys.filter(k => k !== 'Dynamic').sort();
    const defaultKeys = Object.keys(defaultFlat[group]).sort();
    if (storedKeys.length !== defaultKeys.length ||
        !storedKeys.every((k, i) => k === defaultKeys[i])) {
      return false;
    }
  }
  return true;
};

/**
 * 2.3: loadStoredState — load from cache or defaults:
 *      • if schema or version mismatch, clear cache & use defaults  
 *      • otherwise, re-inject dynamic defaults and return stored values  
 */
const loadStoredState = () => {
  const { flat: defaultFlat, dynamicMap } = flattenDefaults(defaultInitialStates);
  const storedJSON = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (storedJSON) {
    try {
      const parsed = JSON.parse(storedJSON);
      const rawGroups = parsed.groups || {};

      const schemaOk = isStructureSame(rawGroups, defaultFlat);
      const versionOk = parsed.version === CURRENT_VERSION;

      if (!schemaOk || !versionOk) {
        // 2.3.1: log and clear on mismatch, showing prev→current version
        if (!versionOk) {
          console.warn(
            `webOS version mismatch (${parsed.version} → ${CURRENT_VERSION})` +
            `${schemaOk ? '' : '; schema mismatch'} — clearing cache and reloading defaults.`
          );
        } else {
          console.warn(
            `State schema mismatch — clearing cache and reloading defaults.`
          );
        }
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return { groups: defaultFlat, debug: false };
      }

      // 2.3.2: flatten stored groups (ignore nested Dynamic) & inject dynamic defaults
      const flattenedStored = {};
      Object.keys(defaultFlat).forEach(group => {
        const raw = rawGroups[group] || {};
        const { Dynamic: _ignore, ...others } = raw;
        flattenedStored[group] = { ...others };
      });
      const finalGroups = {};
      Object.entries(defaultFlat).forEach(([group, defs]) => {
        const dynKeys = dynamicMap[group];
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

  // 2.3.3: no cache → return defaults
  return { groups: defaultFlat, debug: false };
};

//////////////////////////////////////////
// Area 3: State Initialization
//////////////////////////////////////////

const StateManagerContext = createContext();

export const StateManagerProvider = ({ children }) => {
  // 3.1: initial load & refs
  const initial = loadStoredState();
  const initialStateRef = useRef(initial);
  const { dynamicMap } = flattenDefaults(defaultInitialStates);
  const dynamicStatesRef = useRef(dynamicMap);

  const [state, setState] = useState(initial);

  // 3.2: persist on every state change (include version)
  useEffect(() => {
    const toStore = { ...state, version: CURRENT_VERSION };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toStore));
  }, [state]);

  //////////////////////////////////////////
  // Area 4: Group-level Operations
  //////////////////////////////////////////

  // 4.1: addStateGroup — create a new group if it doesn’t already exist
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

  // 4.2: deleteStateGroup — remove a group if it exists
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

  // 4.3: editStateGroupName — rename a group if valid
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

  // 4.4: moveState — relocate a state key between two groups
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
  // Area 5: State-level Operations
  //////////////////////////////////////////

  // 5.1: addState — add a new key/value to an existing group
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

  // 5.2: deleteState — remove a key from a group
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

  // 5.3: editStateValue — update a value for a given key
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

  // 5.4: editStateName — rename a key within a group
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
  // Area 6: Debug & Refresh Operations
  //////////////////////////////////////////

  // 6.1: resetStates — revert all groups to their initial load state
  const resetStates = () => {
    setState(prev => ({
      ...initialStateRef.current,
      debug: prev.debug
    }));
  };

  // 6.2: setDebug — explicitly enable or disable debug flag
  const setDebug = (flag) => {
    setState(prev => ({ ...prev, debug: flag }));
    console.log(`Debug mode set to ${flag}`);
  };

  // 6.3: toggleDebug — flip the debug flag
  const toggleDebug = () => {
    setState(prev => {
      const d = !prev.debug;
      console.log(`Debug mode toggled to ${d}`);
      return { ...prev, debug: d };
    });
  };

  // 6.4: refreshState — force a re-render without changing values
  const refreshState = () => {
    setState(prev => ({ ...prev }));
  };

  //////////////////////////////////////////
  // Area 7: Context & Hook Exports
  //////////////////////////////////////////

  // 7.1: provide state + API via React Context
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

// 7.2: custom hook to consume the StateManager context
export const useStateManager = () => {
  const ctx = useContext(StateManagerContext);
  if (!ctx) {
    throw new Error('useStateManager must be used within a StateManagerProvider');
  }
  return ctx;
};
