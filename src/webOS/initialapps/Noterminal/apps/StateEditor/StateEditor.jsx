// src/apps/StateEditor/StateEditor.jsx

import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
// Import the context hook to access state groups and operations.
import { useStateManager } from '../../../../stores/StateManager/StateManager';

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

  // useEffect to show welcome message and hint only once when the app opens.
  useEffect(() => {
    if (output?.current?.writeln) {
      output.current.writeln('Welcome to State Editor Terminal.');
      output.current.writeln('');
      output.current.writeln('Type "help" to list available commands.');
      output.current.writeln('');
    }
  }, [output]);

  /**
   * Helper function to write a line to the terminal output.
   */
  const writeln = (msg = '') => {
    if (output?.current?.writeln) {
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
      const boxWidth = 70;
      // Build top and bottom borders
      const topBorder = `+${'-'.repeat(boxWidth - 2)}+`;
      const bottomBorder = topBorder;

      // Padding helper
      const padLine = (text = '') => {
        const content = text.slice(0, boxWidth - 4);
        const padding = ' '.repeat(boxWidth - 4 - content.length);
        return `| ${content}${padding} |`;
      };

      const lines = [];
      lines.push(topBorder);
      lines.push(padLine('Available Commands'));
      lines.push(topBorder);

      // Group Mode section
      lines.push(padLine('  Group Mode'));
      lines.push(padLine('    • list               : List all state groups.'));
      lines.push(padLine('    • select <name>      : Select a state group.'));
      lines.push(padLine('    • create <name>      : Create a new state group.'));
      lines.push(padLine('    • delete <name>      : Delete a state group.'));
      lines.push(padLine('    • rename <old> <new> : Rename a state group.'));
      lines.push(padLine(''));

      // State Mode section (dynamic header)
      const header = selectedGroup
        ? `  State Mode (Group: ${selectedGroup})`
        : '  State Mode (no group selected)';
      lines.push(padLine(header));
      lines.push(padLine('    • list                     : List states in this group.'));
      lines.push(padLine('    • select <name>            : Switch to another group.'));
      lines.push(padLine('    • back                     : Return to group mode.'));
      lines.push(padLine('    • create <name> <value>    : Create a new state.'));
      lines.push(padLine('    • delete <name>            : Delete a state.'));
      lines.push(padLine('    • rename <old> <new>       : Rename a state.'));
      lines.push(padLine("    • edit <name> <newValue>   : Edit a state's value."));
      lines.push(padLine('    • move <name> <target>     : Move a state.'));
      lines.push(padLine(''));

      // Other Commands section
      lines.push(padLine('  Other Commands'));
      lines.push(padLine('    • reset              : Reset all states.'));
      lines.push(padLine('    • toggle debug       : Toggle debug mode.'));
      lines.push(padLine('    • set debug <on/off> : Set debug mode.'));
      lines.push(bottomBorder);

      lines.forEach((l) => writeln(l));
      writeln('');
      return;
    }

    // LIST: List groups or states depending on mode.
    if (command === 'list') {
      writeln('');
      if (!selectedGroup) {
        // Group mode: list all groups.
        const groupNames = Object.keys(state.groups);
        if (groupNames.length === 0) {
          writeln('No state groups found.');
        } else {
          writeln('State Groups:');
          groupNames.forEach((g) => writeln(`  • ${g}`));
        }
      } else {
        // State mode: list states in the selected group.
        const groupStates = state.groups[selectedGroup];
        if (groupStates && Object.keys(groupStates).length > 0) {
          writeln(`States in group "${selectedGroup}":`);
          Object.entries(groupStates).forEach(([key, value]) =>
            writeln(`  • ${key}: ${JSON.stringify(value)}`)
          );
        } else {
          writeln(`No states found in group "${selectedGroup}".`);
        }
      }
      writeln('');
      return;
    }

    // SELECT: In both modes, 'select <name>' selects (or switches) a group.
    if (command === 'select') {
      writeln('');
      if (tokens.length < 2) {
        writeln('Usage: select <groupName>');
        writeln('');
        return;
      }
      const groupName = tokens[1];
      if (state.groups.hasOwnProperty(groupName)) {
        setSelectedGroup(groupName);
        writeln(`Selected group "${groupName}".`);
      } else {
        writeln(`Group "${groupName}" does not exist.`);
      }
      writeln('');
      return;
    }

    // BACK: Only available in state mode.
    if (command === 'back') {
      writeln('');
      if (!selectedGroup) {
        writeln('Already in group mode.');
      } else {
        writeln(`Exited state mode (was in group "${selectedGroup}").`);
        setSelectedGroup(null);
      }
      writeln('');
      return;
    }

    // CREATE: Behavior depends on the current mode.
    if (command === 'create') {
      writeln('');
      if (!selectedGroup) {
        // In group mode, create a new group.
        if (tokens.length < 2) {
          writeln('Usage: create <groupName>');
          writeln('');
          return;
        }
        const groupName = tokens[1];
        addStateGroup(groupName);
        writeln(`Created group "${groupName}".`);
      } else {
        // In state mode, create a new state.
        if (tokens.length < 3) {
          writeln('Usage in state mode: create <stateName> <value>');
          writeln('');
          return;
        }
        const stateName = tokens[1];
        const value = tokens.slice(2).join(' ');
        addState(selectedGroup, stateName, value);
        writeln(`Created state "${stateName}" with value "${value}" in group "${selectedGroup}".`);
      }
      writeln('');
      return;
    }

    // DELETE: Behavior depends on the current mode.
    if (command === 'delete') {
      writeln('');
      if (!selectedGroup) {
        // In group mode, delete a group.
        if (tokens.length < 2) {
          writeln('Usage: delete <groupName>');
          writeln('');
          return;
        }
        const groupName = tokens[1];
        deleteStateGroup(groupName);
        writeln(`Deleted group "${groupName}".`);
        if (selectedGroup === groupName) setSelectedGroup(null);
      } else {
        // In state mode, delete a state.
        if (tokens.length < 2) {
          writeln('Usage in state mode: delete <stateName>');
          writeln('');
          return;
        }
        const stateName = tokens[1];
        deleteState(selectedGroup, stateName);
        writeln(`Deleted state "${stateName}" from group "${selectedGroup}".`);
      }
      writeln('');
      return;
    }

    // RENAME: Works for groups in group mode or states in state mode.
    if (command === 'rename') {
      writeln('');
      if (tokens.length < 3) {
        writeln('Usage: rename <oldName> <newName>');
        writeln('');
        return;
      }
      const oldName = tokens[1];
      const newName = tokens[2];
      if (!selectedGroup) {
        // Rename a group.
        editStateGroupName(oldName, newName);
        writeln(`Renamed group "${oldName}" → "${newName}".`);
        if (selectedGroup === oldName) setSelectedGroup(newName);
      } else {
        // Rename a state in the selected group.
        editStateName(selectedGroup, oldName, newName);
        writeln(`Renamed state "${oldName}" → "${newName}" in group "${selectedGroup}".`);
      }
      writeln('');
      return;
    }

    // EDIT: Only applicable in state mode.
    if (command === 'edit') {
      writeln('');
      if (!selectedGroup) {
        writeln('“edit” is only available in state mode.');
        writeln('');
        return;
      }
      if (tokens.length < 3) {
        writeln('Usage in state mode: edit <stateName> <newValue>');
        writeln('');
        return;
      }
      const stateName = tokens[1];
      const newValue = tokens.slice(2).join(' ');
      editStateValue(selectedGroup, stateName, newValue);
      writeln(`Updated state "${stateName}" → "${newValue}" in group "${selectedGroup}".`);
      writeln('');
      return;
    }

    // MOVE: Only applicable in state mode.
    if (command === 'move') {
      writeln('');
      if (!selectedGroup) {
        writeln('“move” is only available in state mode.');
        writeln('');
        return;
      }
      if (tokens.length < 3) {
        writeln('Usage in state mode: move <stateName> <targetGroup>');
        writeln('');
        return;
      }
      const stateName = tokens[1];
      const targetGroup = tokens[2];
      moveState(selectedGroup, stateName, targetGroup);
      writeln(`Moved state "${stateName}" from "${selectedGroup}" → "${targetGroup}".`);
      writeln('');
      return;
    }

    // RESET: Reset all states (works in both modes).
    if (command === 'reset') {
      writeln('');
      resetStates();
      writeln('All states have been reset to their initial configuration.');
      setSelectedGroup(null);
      writeln('');
      return;
    }

    // TOGGLE DEBUG: Toggle debug mode.
    if (command === 'toggle' && tokens[1]?.toLowerCase() === 'debug') {
      writeln('');
      toggleDebug();
      writeln('Toggled debug mode.');
      writeln('');
      return;
    }

    // SET DEBUG: Set debug mode explicitly.
    if (command === 'set' && tokens[1]?.toLowerCase() === 'debug' && tokens[2]) {
      writeln('');
      const value = tokens[2].toLowerCase();
      if (value === 'on' || value === 'true') {
        setDebug(true);
        writeln('Debug mode set to ON.');
      } else if (value === 'off' || value === 'false') {
        setDebug(false);
        writeln('Debug mode set to OFF.');
      } else {
        writeln('Invalid value for debug. Use "on" or "off".');
      }
      writeln('');
      return;
    }

    // Unknown command.
    writeln('');
    writeln('Unknown command.');
    writeln('Type "help" to list available commands.');
    writeln('');
  };

  /**
   * getAutocompleteSuggestions dynamically generates suggestions for autocomplete
   * based on the current input. It handles both the completion of command names and,
   * once a valid command is entered, provides suggestions for state group or state names.
   */
  const getAutocompleteSuggestions = (input) => {
    const trimmedInput = input.trim();
    const groupModeCommands = [
      'list',
      'select',
      'create',
      'delete',
      'rename',
      'reset',
      'toggle debug',
      'set debug',
      'help',
    ];
    const stateModeCommands = [
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
    ];

    const staticCommands = !selectedGroup ? groupModeCommands : stateModeCommands;
    const tokens = trimmedInput.split(/\s+/);

    if (tokens.length === 1) {
      const partialCommand = tokens[0].toLowerCase();
      return staticCommands.filter((cmd) => cmd.startsWith(partialCommand));
    }

    const command = tokens[0].toLowerCase();
    const argPartial = tokens[tokens.length - 1].toLowerCase();

    switch (command) {
      case 'select': {
        const groupNames = Object.keys(state.groups);
        return groupNames.filter((name) => name.toLowerCase().startsWith(argPartial));
      }
      case 'delete': {
        if (!selectedGroup) {
          const groupNames = Object.keys(state.groups);
          return groupNames.filter((name) => name.toLowerCase().startsWith(argPartial));
        } else {
          const stateNames = Object.keys(state.groups[selectedGroup] || {});
          return stateNames.filter((name) => name.toLowerCase().startsWith(argPartial));
        }
      }
      case 'rename': {
        if (tokens.length === 2) {
          if (!selectedGroup) {
            const groupNames = Object.keys(state.groups);
            return groupNames.filter((name) => name.toLowerCase().startsWith(argPartial));
          } else {
            const stateNames = Object.keys(state.groups[selectedGroup] || {});
            return stateNames.filter((name) => name.toLowerCase().startsWith(argPartial));
          }
        }
        return [];
      }
      case 'edit': {
        if (!selectedGroup) return [];
        const stateNames = Object.keys(state.groups[selectedGroup] || {});
        return stateNames.filter((name) => name.toLowerCase().startsWith(argPartial));
      }
      case 'move': {
        if (!selectedGroup) return [];
        if (tokens.length === 2) {
          const stateNames = Object.keys(state.groups[selectedGroup] || {});
          return stateNames.filter((name) => name.toLowerCase().startsWith(argPartial));
        } else if (tokens.length === 3) {
          const groupNames = Object.keys(state.groups);
          return groupNames.filter((name) => name.toLowerCase().startsWith(argPartial));
        }
        return [];
      }
      default:
        return [];
    }
  };

  // Expose functions to parent components via ref.
  useImperativeHandle(ref, () => ({
    processInput,
    getAutocompleteSuggestions,
  }));

  // Set static autocomplete commands based on the current mode.
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
