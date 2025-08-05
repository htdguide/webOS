/**
 * StateEditor.jsx
 *
 * This file implements a custom terminal-like React component for editing
 * persistent application state via the StateManager context. It supports
 * listing, selecting, creating, renaming, moving, and deleting both state groups
 * and individual states, with visual indication of which states are dynamic.
 *
 * Topics:
 * 1. Imports & Context Hook
 * 2. Component Setup & Refs
 * 3. Terminal I/O Helpers
 * 4. Command Processing (with Dynamic flags)
 * 5. Autocomplete Suggestions
 * 6. Ref Exposure & Lifecycle Effects
 * 7. Render UI Display (with Dynamic markers)
 */

//////////////////////////////////////////
// 1. Imports & Context Hook
//////////////////////////////////////////
import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect
} from 'react';
// Import the context hook (now exposes `dynamicStates`)
import { useStateManager } from '../../../../stores/StateManager/StateManager';

//////////////////////////////////////////
// 2. Component Setup & Refs
//////////////////////////////////////////
const StateEditor = forwardRef(({ output, setAutocompleteCommands }, ref) => {
  // Destructure state, operations, and dynamicStates from context
  const {
    state,
    dynamicStates,
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

  // null = group mode; string = selected group
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Show welcome only once
  useEffect(() => {
    if (output?.current?.writeln) {
      output.current.writeln('Welcome to State Editor Terminal.');
      output.current.writeln('');
      output.current.writeln('Type "help" to list available commands.');
      output.current.writeln('');
    }
  }, [output]);

  //////////////////////////////////////////
  // 3. Terminal I/O Helpers
  //////////////////////////////////////////
  const writeln = (msg = '') => {
    if (output?.current?.writeln) {
      output.current.writeln(msg);
    }
  };

  //////////////////////////////////////////
  // 4. Command Processing (with Dynamic flags)
  //////////////////////////////////////////
  const processInput = (input) => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const tokens = trimmed.split(/\s+/);
    const command = tokens[0].toLowerCase();

    // HELP
    if (command === 'help') {
      const boxWidth = 70;
      const border = `+${'-'.repeat(boxWidth - 2)}+`;
      const pad = (text = '') => {
        const t = text.slice(0, boxWidth - 4);
        return `| ${t}${' '.repeat(boxWidth - 4 - t.length)} |`;
      };
      const lines = [
        border,
        pad('Available Commands'),
        border,
        pad('  Group Mode'),
        pad('    • list               : List all state groups.'),
        pad('    • select <name>      : Select a state group.'),
        pad('    • create <name>      : Create a new state group.'),
        pad('    • delete <name>      : Delete a state group.'),
        pad('    • rename <old> <new> : Rename a state group.'),
        pad(''),
        pad(selectedGroup
          ? `  State Mode (Group: ${selectedGroup})`
          : '  State Mode (no group selected)'),
        pad('    • list                     : List states in this group.'),
        pad('    • select <name>            : Switch to another group.'),
        pad('    • back                     : Return to group mode.'),
        pad('    • create <name> <value>    : Create a new state.'),
        pad('    • delete <name>            : Delete a state.'),
        pad('    • rename <old> <new>       : Rename a state.'),
        pad('    • edit <name> <newValue>   : Edit a state’s value.'),
        pad('    • move <name> <target>     : Move a state.'),
        pad(''),
        pad('  Other Commands'),
        pad('    • reset              : Reset all states.'),
        pad('    • toggle debug       : Toggle debug mode.'),
        pad('    • set debug <on/off> : Set debug mode.'),
        pad(''),
        border
      ];
      lines.forEach(l => writeln(l));
      writeln('');
      return;
    }

    // LIST
    if (command === 'list') {
      writeln('');
      if (!selectedGroup) {
        // Group mode
        const groups = Object.keys(state.groups);
        if (groups.length === 0) {
          writeln('No state groups found.');
        } else {
          writeln('State Groups:');
          groups.forEach(g => writeln(`  • ${g}`));
        }
      } else {
        // State mode
        const groupStates = state.groups[selectedGroup] || {};
        const dynKeys = dynamicStates[selectedGroup] || [];
        if (Object.keys(groupStates).length === 0) {
          writeln(`No states found in group "${selectedGroup}".`);
        } else {
          writeln(`States in group "${selectedGroup}":`);
          Object.entries(groupStates).forEach(([key, val]) => {
            const flag = dynKeys.includes(key) ? ' [Dynamic]' : '';
            writeln(`  • ${key}: ${JSON.stringify(val)}${flag}`);
          });
        }
      }
      writeln('');
      return;
    }

    // SELECT
    if (command === 'select') {
      writeln('');
      if (tokens.length < 2) {
        writeln('Usage: select <groupName>');
      } else {
        const grp = tokens[1];
        if (state.groups[grp]) {
          setSelectedGroup(grp);
          writeln(`Selected group "${grp}".`);
        } else {
          writeln(`Group "${grp}" does not exist.`);
        }
      }
      writeln('');
      return;
    }

    // BACK
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

    // CREATE
    if (command === 'create') {
      writeln('');
      if (!selectedGroup) {
        if (tokens.length < 2) {
          writeln('Usage: create <groupName>');
        } else {
          addStateGroup(tokens[1]);
          writeln(`Created group "${tokens[1]}".`);
        }
      } else {
        if (tokens.length < 3) {
          writeln('Usage in state mode: create <stateName> <value>');
        } else {
          const [ , name, ...rest ] = tokens;
          const value = rest.join(' ');
          addState(selectedGroup, name, value);
          writeln(
            `Created state "${name}" with value "${value}" in group "${selectedGroup}".`
          );
        }
      }
      writeln('');
      return;
    }

    // DELETE
    if (command === 'delete') {
      writeln('');
      if (!selectedGroup) {
        if (tokens.length < 2) {
          writeln('Usage: delete <groupName>');
        } else {
          deleteStateGroup(tokens[1]);
          writeln(`Deleted group "${tokens[1]}".`);
          if (selectedGroup === tokens[1]) setSelectedGroup(null);
        }
      } else {
        if (tokens.length < 2) {
          writeln('Usage in state mode: delete <stateName>');
        } else {
          deleteState(selectedGroup, tokens[1]);
          writeln(`Deleted state "${tokens[1]}" from "${selectedGroup}".`);
        }
      }
      writeln('');
      return;
    }

    // RENAME
    if (command === 'rename') {
      writeln('');
      if (tokens.length < 3) {
        writeln('Usage: rename <oldName> <newName>');
      } else {
        const [ , oldName, newName ] = tokens;
        if (!selectedGroup) {
          editStateGroupName(oldName, newName);
          writeln(`Renamed group "${oldName}" → "${newName}".`);
          if (selectedGroup === oldName) setSelectedGroup(newName);
        } else {
          editStateName(selectedGroup, oldName, newName);
          writeln(
            `Renamed state "${oldName}" → "${newName}" in group "${selectedGroup}".`
          );
        }
      }
      writeln('');
      return;
    }

    // EDIT
    if (command === 'edit') {
      writeln('');
      if (!selectedGroup) {
        writeln('“edit” is only available in state mode.');
      } else if (tokens.length < 3) {
        writeln('Usage in state mode: edit <stateName> <newValue>');
      } else {
        const [ , name, ...rest ] = tokens;
        const newVal = rest.join(' ');
        editStateValue(selectedGroup, name, newVal);
        writeln(
          `Updated state "${name}" → "${newVal}" in group "${selectedGroup}".`
        );
      }
      writeln('');
      return;
    }

    // MOVE
    if (command === 'move') {
      writeln('');
      if (!selectedGroup) {
        writeln('“move” is only available in state mode.');
      } else if (tokens.length < 3) {
        writeln('Usage in state mode: move <stateName> <targetGroup>');
      } else {
        moveState(selectedGroup, tokens[1], tokens[2]);
        writeln(
          `Moved state "${tokens[1]}" from "${selectedGroup}" → "${tokens[2]}".`
        );
      }
      writeln('');
      return;
    }

    // RESET
    if (command === 'reset') {
      writeln('');
      resetStates();
      writeln('All states have been reset to their initial configuration.');
      setSelectedGroup(null);
      writeln('');
      return;
    }

    // TOGGLE DEBUG
    if (command === 'toggle' && tokens[1]?.toLowerCase() === 'debug') {
      writeln('');
      toggleDebug();
      writeln('Toggled debug mode.');
      writeln('');
      return;
    }

    // SET DEBUG
    if (command === 'set' && tokens[1]?.toLowerCase() === 'debug') {
      writeln('');
      const v = tokens[2]?.toLowerCase();
      if (v === 'on' || v === 'true') {
        setDebug(true);
        writeln('Debug mode set to ON.');
      } else if (v === 'off' || v === 'false') {
        setDebug(false);
        writeln('Debug mode set to OFF.');
      } else {
        writeln('Invalid value for debug. Use "on" or "off".');
      }
      writeln('');
      return;
    }

    // UNKNOWN
    writeln('');
    writeln('Unknown command.');
    writeln('Type "help" to list available commands.');
    writeln('');
  };

  //////////////////////////////////////////
  // 5. Autocomplete Suggestions
  //////////////////////////////////////////
  const getAutocompleteSuggestions = (input) => {
    const groupCmds = [
      'list','select','create','delete','rename',
      'reset','toggle debug','set debug','help'
    ];
    const stateCmds = [
      'list','select','back','create','delete','rename',
      'edit','move','reset','toggle debug','set debug','help'
    ];

    const cmds = !selectedGroup ? groupCmds : stateCmds;
    const tokens = input.trim().split(/\s+/);

    if (tokens.length === 1) {
      return cmds.filter(c => c.startsWith(tokens[0].toLowerCase()));
    }
    const cmd = tokens[0].toLowerCase();
    const partial = tokens[tokens.length - 1].toLowerCase();
    switch (cmd) {
      case 'select':
      case 'delete':
        return Object.keys(state.groups)
          .filter(n => n.toLowerCase().startsWith(partial));
      case 'rename':
        if (tokens.length === 2) {
          const items = !selectedGroup
            ? Object.keys(state.groups)
            : Object.keys(state.groups[selectedGroup] || {});
          return items.filter(n => n.toLowerCase().startsWith(partial));
        }
        return [];
      case 'edit':
        if (!selectedGroup) return [];
        return Object.keys(state.groups[selectedGroup] || {})
          .filter(n => n.toLowerCase().startsWith(partial));
      case 'move':
        if (!selectedGroup) return [];
        if (tokens.length === 2) {
          return Object.keys(state.groups[selectedGroup] || {})
            .filter(n => n.toLowerCase().startsWith(partial));
        }
        if (tokens.length === 3) {
          return Object.keys(state.groups)
            .filter(n => n.toLowerCase().startsWith(partial));
        }
        return [];
      default:
        return [];
    }
  };

  //////////////////////////////////////////
  // 6. Ref Exposure & Lifecycle Effects
  //////////////////////////////////////////
  useImperativeHandle(ref, () => ({
    processInput,
    getAutocompleteSuggestions,
  }));

  useEffect(() => {
    if (setAutocompleteCommands) {
      setAutocompleteCommands(
        !selectedGroup
          ? ['list','select','create','delete','rename','reset','toggle debug','set debug','help']
          : ['list','select','back','create','delete','rename','edit','move','reset','toggle debug','set debug','help']
      );
    }
    return () => {
      if (setAutocompleteCommands) {
        setAutocompleteCommands([]);
      }
    };
  }, [selectedGroup, setAutocompleteCommands]);

  //////////////////////////////////////////
  // 7. Render UI Display (with Dynamic markers)
  //////////////////////////////////////////
  return (
    <div className="state-editor">
      <h3>State Editor Terminal</h3>
      <div className="state-editor-display">
        {!selectedGroup ? (
          <>
            <h4>Available State Groups</h4>
            <ul>
              {Object.keys(state.groups).map(group => (
                <li key={group}>{group}</li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <h4>States in Group: {selectedGroup}</h4>
            <ul>
              {Object.entries(state.groups[selectedGroup] || {}).map(
                ([key, val]) => {
                  const isDyn = (dynamicStates[selectedGroup] || []).includes(key);
                  return (
                    <li key={key}>
                      {key}: {JSON.stringify(val)}{isDyn ? ' [Dynamic]' : ''}
                    </li>
                  );
                }
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
});

export default StateEditor;
