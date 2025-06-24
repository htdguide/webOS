import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import defaultInitialStates from './initialstates.json';

const LOCAL_STORAGE_KEY = 'stateManagerCache';

// Create a context for the state manager.
const StateManagerContext = createContext();

/**
 * StateManagerProvider wraps your application (or parts of it) to provide
 * a persistent state context. It loads state from localStorage if available,
 * and updates localStorage on every state change.
 */
export const StateManagerProvider = ({ children, initialState }) => {
  // Determine initial state: load from localStorage or fall back to default.
  const loadStoredState = () => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored state:', e);
      }
    }
    // Use provided initialState or default states with debug off.
    return initialState || { groups: { ...defaultInitialStates }, debug: false };
  };

  // Save the initial state in a ref for later reset.
  const initialStateRef = useRef(loadStoredState());

  const [state, setState] = useState(loadStoredState());

  // Persist the state to localStorage on every change.
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  /* -----------------------------
     Group-level Operations
  ----------------------------- */
  const addStateGroup = (groupName) => {
    setState(prevState => {
      if (prevState.groups.hasOwnProperty(groupName)) {
        console.warn(`State group "${groupName}" already exists.`);
        return prevState;
      }
      const newGroups = { ...prevState.groups, [groupName]: {} };
      return { ...prevState, groups: newGroups };
    });
  };

  const deleteStateGroup = (groupName) => {
    setState(prevState => {
      if (!prevState.groups.hasOwnProperty(groupName)) {
        console.warn(`State group "${groupName}" does not exist.`);
        return prevState;
      }
      const { [groupName]: removed, ...remainingGroups } = prevState.groups;
      return { ...prevState, groups: remainingGroups };
    });
  };

  const editStateGroupName = (oldGroupName, newGroupName) => {
    setState(prevState => {
      if (!prevState.groups.hasOwnProperty(oldGroupName)) {
        console.warn(`State group "${oldGroupName}" does not exist.`);
        return prevState;
      }
      if (prevState.groups.hasOwnProperty(newGroupName)) {
        console.warn(`State group "${newGroupName}" already exists.`);
        return prevState;
      }
      const { [oldGroupName]: groupData, ...rest } = prevState.groups;
      const newGroups = { ...rest, [newGroupName]: groupData };
      return { ...prevState, groups: newGroups };
    });
  };

  const moveState = (fromGroup, stateName, toGroup) => {
    setState(prevState => {
      if (!prevState.groups.hasOwnProperty(fromGroup)) {
        console.warn(`Source group "${fromGroup}" does not exist.`);
        return prevState;
      }
      if (!prevState.groups.hasOwnProperty(toGroup)) {
        console.warn(`Target group "${toGroup}" does not exist.`);
        return prevState;
      }
      if (!prevState.groups[fromGroup].hasOwnProperty(stateName)) {
        console.warn(`State "${stateName}" does not exist in group "${fromGroup}".`);
        return prevState;
      }
      if (prevState.groups[toGroup].hasOwnProperty(stateName)) {
        console.warn(`State "${stateName}" already exists in group "${toGroup}".`);
        return prevState;
      }
      const stateValue = prevState.groups[fromGroup][stateName];
      const { [stateName]: removed, ...sourceRest } = prevState.groups[fromGroup];
      const newFromGroup = sourceRest;
      const newToGroup = { ...prevState.groups[toGroup], [stateName]: stateValue };
      return {
        ...prevState,
        groups: {
          ...prevState.groups,
          [fromGroup]: newFromGroup,
          [toGroup]: newToGroup,
        },
      };
    });
  };

  /* -----------------------------
     State-level Operations (within a group)
  ----------------------------- */
  const addState = (group, stateName, value) => {
    setState(prevState => {
      if (!prevState.groups.hasOwnProperty(group)) {
        console.warn(`State group "${group}" does not exist.`);
        return prevState;
      }
      if (prevState.groups[group].hasOwnProperty(stateName)) {
        console.warn(`State "${stateName}" already exists in group "${group}".`);
        return prevState;
      }
      const newGroup = { ...prevState.groups[group], [stateName]: value };
      return { ...prevState, groups: { ...prevState.groups, [group]: newGroup } };
    });
  };

  const deleteState = (group, stateName) => {
    setState(prevState => {
      if (!prevState.groups.hasOwnProperty(group)) {
        console.warn(`State group "${group}" does not exist.`);
        return prevState;
      }
      if (!prevState.groups[group].hasOwnProperty(stateName)) {
        console.warn(`State "${stateName}" does not exist in group "${group}".`);
        return prevState;
      }
      const { [stateName]: removed, ...newGroup } = prevState.groups[group];
      return { ...prevState, groups: { ...prevState.groups, [group]: newGroup } };
    });
  };

  const editStateValue = (group, stateName, newValue) => {
    setState(prevState => {
      if (!prevState.groups.hasOwnProperty(group)) {
        console.warn(`State group "${group}" does not exist.`);
        return prevState;
      }
      if (!prevState.groups[group].hasOwnProperty(stateName)) {
        console.warn(`State "${stateName}" does not exist in group "${group}".`);
        return prevState;
      }
      const newGroup = { ...prevState.groups[group], [stateName]: newValue };
      return { ...prevState, groups: { ...prevState.groups, [group]: newGroup } };
    });
  };

  const editStateName = (group, oldStateName, newStateName) => {
    setState(prevState => {
      if (!prevState.groups.hasOwnProperty(group)) {
        console.warn(`State group "${group}" does not exist.`);
        return prevState;
      }
      if (!prevState.groups[group].hasOwnProperty(oldStateName)) {
        console.warn(`State "${oldStateName}" does not exist in group "${group}".`);
        return prevState;
      }
      if (prevState.groups[group].hasOwnProperty(newStateName)) {
        console.warn(`State "${newStateName}" already exists in group "${group}".`);
        return prevState;
      }
      const { [oldStateName]: value, ...rest } = prevState.groups[group];
      const newGroup = { ...rest, [newStateName]: value };
      return { ...prevState, groups: { ...prevState.groups, [group]: newGroup } };
    });
  };

  const resetStates = () => {
    setState(prevState => {
      return { ...initialStateRef.current, debug: prevState.debug };
    });
  };

  /* -----------------------------
     Debug Operations
  ----------------------------- */
  const setDebug = (isDebug) => {
    setState(prevState => ({ ...prevState, debug: isDebug }));
    console.log(`Debug mode set to ${isDebug}`);
  };

  const toggleDebug = () => {
    setState(prevState => {
      const newDebug = !prevState.debug;
      console.log(`Debug mode toggled to ${newDebug}`);
      return { ...prevState, debug: newDebug };
    });
  };

  /**
   * refreshState forces a re-render by updating the state with a shallow copy.
   * This can be useful if you need to trigger a refresh in components consuming the state.
   */
  const refreshState = () => {
    setState(prevState => ({ ...prevState }));
  };

  // Bundle state and operations into context value.
  const contextValue = {
    state,
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
    refreshState, // <-- New function to force a refresh.
  };

  return (
    <StateManagerContext.Provider value={contextValue}>
      {children}
    </StateManagerContext.Provider>
  );
};

/**
 * Custom hook to access the state manager context.
 */
export const useStateManager = () => {
  const context = useContext(StateManagerContext);
  if (!context) {
    throw new Error('useStateManager must be used within a StateManagerProvider');
  }
  return context;
};
