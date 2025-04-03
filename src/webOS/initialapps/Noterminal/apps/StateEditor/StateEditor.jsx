// StateEditor.jsx
// This component provides a terminal-like interface for managing state groups and states.
// It processes various commands for group mode (when no group is selected) and state mode
// (when a group is selected). It now integrates with autocomplete by setting the available
// commands via the setAutocompleteCommands prop, and it displays the help hint only once upon opening.

import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
// Import the context hook to access state groups and operations.
import { useStateManager } from '../../../../stores/StateManager/StateManager';
// Import CSS styles for the editor (adjust these as needed).
// import './StateEditor.css';

const StateEditor = forwardRef(({ output, setAutocompleteCommands }, ref) => {
  // Destructure state and operations from the state manager context.
  const {
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
    toggleDebug,
    setDebug,
  } = useStateManager();

  // Local state tracks the currently selected group.
  // When null, we are in group mode; otherwise, we're in state mode.
  const [selectedGroup, setSelectedGroup] = useState(null);

  // useEffect to show "Type help for a list of commands." only once when the app opens.
  useEffect(() => {
    if (output && output.current && output.current.writeln) {
      output.current.writeln('Type "help" for a list of commands.');
    }
  }, [output]);

  /**
   * Helper function to write a line to the terminal output.
   */
  const writeln = (msg) => {
    if (output && output.current && output.current.writeln) {
      output.current.writeln(msg);
    }
  };

  /**
   * processInput parses a text command and executes the corresponding operation.
   * It automatically detects whether we're in group mode (selectedGroup is null)
   * or state mode (selectedGroup is set) and interprets commands accordingly.
   */
  const processInput = (input) => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const tokens = trimmed.split(/\s+/);
    const command = tokens[0].toLowerCase();

    // HELP: Show available commands based on the current mode.
    if (command === 'help') {
      writeln('Available Commands:');
      writeln('');
      if (!selectedGroup) {
        // Group mode help.
        writeln('--- Group Mode ---');
        writeln('list               : List all state groups.');
        writeln('select <name>      : Select a group.');
        writeln('create <name>      : Create a new group.');
        writeln('delete <name>      : Delete a group.');
        writeln('rename <old> <new> : Rename a group.');
        writeln('');
      } else {
        // State mode help.
        writeln(`--- State Mode (Group: ${selectedGroup}) ---`);
        writeln('list                     : List states in the selected group.');
        writeln('select <name>            : Switch to a different group.');
        writeln('back                     : Exit state mode (return to group mode).');
        writeln('create <name> <value>    : Create a new state.');
        writeln('delete <name>            : Delete a state.');
        writeln('rename <old> <new>       : Rename a state.');
        writeln('edit <name> <newValue>   : Edit a state\'s value.');
        writeln('move <name> <target>     : Move a state to another group.');
        writeln('');
      }
      writeln('--- Other Commands ---');
      writeln('reset              : Reset all states to initial configuration.');
      writeln('toggle debug       : Toggle debug mode.');
      writeln('set debug <on/off> : Set debug mode explicitly.');
      writeln('');
      return;
    }

    // LIST: List groups or states depending on mode.
    if (command === 'list') {
      if (!selectedGroup) {
        // Group mode: list all groups.
        const groupNames = Object.keys(state.groups);
        writeln('State Groups: ' + groupNames.join(', '));
      } else {
        // State mode: list states in the selected group.
        const groupStates = state.groups[selectedGroup];
        if (groupStates) {
          const stateEntries = Object.entries(groupStates).map(
            ([key, value]) => `${key}: ${JSON.stringify(value)}`
          );
          writeln(`States in group "${selectedGroup}": ${stateEntries.join(', ')}`);
        } else {
          writeln(`Group "${selectedGroup}" does not exist.`);
        }
      }
      return;
    }

    // SELECT: In both modes, 'select <name>' selects (or switches) a group.
    if (command === 'select') {
      if (tokens.length < 2) {
        writeln('Usage: select <groupName>');
        return;
      }
      const groupName = tokens[1];
      if (state.groups.hasOwnProperty(groupName)) {
        setSelectedGroup(groupName);
        writeln(`Successfully selected group "${groupName}".`);
      } else {
        writeln(`Group "${groupName}" does not exist.`);
      }
      return;
    }

    // BACK: Only available in state mode.
    if (command === 'back') {
      if (!selectedGroup) {
        writeln('Already in group mode.');
      } else {
        writeln(`Successfully exited group "${selectedGroup}".`);
        setSelectedGroup(null);
      }
      return;
    }

    // CREATE: Behavior depends on the current mode.
    if (command === 'create') {
      if (!selectedGroup) {
        // In group mode, create a new group.
        if (tokens.length < 2) {
          writeln('Usage: create <groupName>');
          return;
        }
        const groupName = tokens[1];
        addStateGroup(groupName);
        writeln(`Successfully created group "${groupName}".`);
      } else {
        // In state mode, create a new state.
        if (tokens.length < 3) {
          writeln('Usage in state mode: create <stateName> <value>');
          return;
        }
        const stateName = tokens[1];
        const value = tokens.slice(2).join(' ');
        addState(selectedGroup, stateName, value);
        writeln(`Successfully created state "${stateName}" with value "${value}" in group "${selectedGroup}".`);
      }
      return;
    }

    // DELETE: Behavior depends on the current mode.
    if (command === 'delete') {
      if (!selectedGroup) {
        // In group mode, delete a group.
        if (tokens.length < 2) {
          writeln('Usage: delete <groupName>');
          return;
        }
        const groupName = tokens[1];
        deleteStateGroup(groupName);
        writeln(`Successfully deleted group "${groupName}".`);
        if (selectedGroup === groupName) setSelectedGroup(null);
      } else {
        // In state mode, delete a state.
        if (tokens.length < 2) {
          writeln('Usage in state mode: delete <stateName>');
          return;
        }
        const stateName = tokens[1];
        deleteState(selectedGroup, stateName);
        writeln(`Successfully deleted state "${stateName}" from group "${selectedGroup}".`);
      }
      return;
    }

    // RENAME: Works for groups in group mode or states in state mode.
    if (command === 'rename') {
      if (tokens.length < 3) {
        writeln('Usage: rename <oldName> <newName>');
        return;
      }
      const oldName = tokens[1];
      const newName = tokens[2];
      if (!selectedGroup) {
        // Rename a group.
        editStateGroupName(oldName, newName);
        writeln(`Successfully renamed group "${oldName}" to "${newName}".`);
        if (selectedGroup === oldName) setSelectedGroup(newName);
      } else {
        // Rename a state in the selected group.
        editStateName(selectedGroup, oldName, newName);
        writeln(`Successfully renamed state "${oldName}" to "${newName}" in group "${selectedGroup}".`);
      }
      return;
    }

    // EDIT: Only applicable in state mode.
    if (command === 'edit') {
      if (!selectedGroup) {
        writeln('Edit command only available in state mode.');
        return;
      }
      if (tokens.length < 3) {
        writeln('Usage in state mode: edit <stateName> <newValue>');
        return;
      }
      const stateName = tokens[1];
      const newValue = tokens.slice(2).join(' ');
      editStateValue(selectedGroup, stateName, newValue);
      writeln(`Successfully updated state "${stateName}" to "${newValue}" in group "${selectedGroup}".`);
      return;
    }

    // MOVE: Only applicable in state mode.
    if (command === 'move') {
      if (!selectedGroup) {
        writeln('Move command only available in state mode.');
        return;
      }
      if (tokens.length < 3) {
        writeln('Usage in state mode: move <stateName> <targetGroup>');
        return;
      }
      const stateName = tokens[1];
      const targetGroup = tokens[2];
      moveState(selectedGroup, stateName, targetGroup);
      writeln(`Successfully moved state "${stateName}" from group "${selectedGroup}" to group "${targetGroup}".`);
      return;
    }

    // RESET: Reset all states (works in both modes).
    if (command === 'reset') {
      resetStates();
      writeln('Successfully reset all states to their initial configuration.');
      setSelectedGroup(null);
      return;
    }

    // TOGGLE DEBUG: Toggle debug mode.
    if (command === 'toggle' && tokens[1] && tokens[1].toLowerCase() === 'debug') {
      toggleDebug();
      writeln('Successfully toggled debug mode.');
      return;
    }

    // SET DEBUG: Set debug mode explicitly.
    if (command === 'set' && tokens[1] && tokens[1].toLowerCase() === 'debug' && tokens[2]) {
      const value = tokens[2].toLowerCase();
      if (value === 'on' || value === 'true') {
        setDebug(true);
        writeln('Successfully set debug mode to ON.');
      } else if (value === 'off' || value === 'false') {
        setDebug(false);
        writeln('Successfully set debug mode to OFF.');
      } else {
        writeln('Invalid value for debug. Use "on" or "off".');
      }
      return;
    }

    // Unknown command.
    writeln('Unknown command. Type "help" for a list of available commands.');
  };

  // Expose the processInput function to parent components via ref.
  useImperativeHandle(ref, () => ({
    processInput,
  }));

  // Set autocomplete commands based on the current mode.
  // When in group mode (no group selected), a certain list of commands is provided.
  // When in state mode, additional commands (e.g., 'back', 'edit', 'move') are available.
  useEffect(() => {
    if (setAutocompleteCommands) {
      if (!selectedGroup) {
        setAutocompleteCommands([
          'list',
          'select',
          'create',
          'delete',
          'rename',
          'reset',
          'toggle debug',
          'set debug',
          'help',
        ]);
      } else {
        setAutocompleteCommands([
          'list',
          'select',
          'back',
          'create',
          'delete',
          'rename',
          'edit',
          'move',
          'reset',
          'toggle debug',
          'set debug',
          'help',
        ]);
      }
    }
  }, [selectedGroup, setAutocompleteCommands]);

  // Clear autocomplete commands when this component unmounts.
  useEffect(() => {
    return () => {
      if (setAutocompleteCommands) {
        setAutocompleteCommands([]);
      }
    };
  }, [setAutocompleteCommands]);

  return (
    <div className="state-editor">
      <h3>State Editor Terminal</h3>
      <div className="state-editor-display">
        {!selectedGroup ? (
          <>
            <h4>Available State Groups</h4>
            <ul>
              {Object.keys(state.groups).map((group) => (
                <li key={group}>{group}</li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <h4>States in Group: {selectedGroup}</h4>
            <ul>
              {Object.entries(state.groups[selectedGroup]).map(([key, value]) => (
                <li key={key}>
                  {key}: {JSON.stringify(value)}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
});

export default StateEditor;
