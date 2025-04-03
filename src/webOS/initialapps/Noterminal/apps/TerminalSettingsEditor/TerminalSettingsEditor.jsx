// TerminalSettingsEditor.jsx
// This component allows the user to update terminal settings via a form and
// supports command input for autocomplete commands such as "help" and "update".

import React, { useState, forwardRef, useImperativeHandle, useEffect, useMemo } from 'react';
import './TerminalSettingsEditor.css';
// Import the StateManager hook directly.
import { useStateManager } from '../../../../stores/StateManager/StateManager';

const TerminalSettingsEditor = forwardRef(({ output, setAutocompleteCommands }, ref) => {
  const { state, editStateValue } = useStateManager();
  // Extract terminal settings from the state. If missing, fallback to defaults.
  const terminalSettings = state.groups.terminalSettings || {
    fontSize: '12px',
    fontColor: '#000000',
    fontFamily: 'monospace',
    backgroundColor: '#FFFFFF',
  };

  // Local state for the form inputs.
  const [localFontSize, setLocalFontSize] = useState(terminalSettings.fontSize);
  const [localFontColor, setLocalFontColor] = useState(terminalSettings.fontColor);
  const [localFontFamily, setLocalFontFamily] = useState(terminalSettings.fontFamily);
  const [localBackgroundColor, setLocalBackgroundColor] = useState(terminalSettings.backgroundColor);

  // When this component is active, update the terminal's autocomplete commands.
  useEffect(() => {
    if (setAutocompleteCommands) {
      setAutocompleteCommands(['help', 'update']);
    }
    return () => {
      if (setAutocompleteCommands) {
        setAutocompleteCommands([]);
      }
    };
  }, [setAutocompleteCommands]);

  // Handle form submission to update terminal settings.
  const handleSubmit = (e) => {
    e.preventDefault();
    // Update the terminalSettings group via editStateValue.
    editStateValue("terminalSettings", "fontSize", localFontSize);
    editStateValue("terminalSettings", "fontColor", localFontColor);
    editStateValue("terminalSettings", "fontFamily", localFontFamily);
    editStateValue("terminalSettings", "backgroundColor", localBackgroundColor);
    if (output && output.current && output.current.writeln) {
      output.current.writeln('Terminal settings updated.');
    }
  };

  // processInput handles text commands while this app is active.
  const processInput = (input) => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed === 'help') {
      if (output && output.current && output.current.writeln) {
        output.current.writeln('Available fonts: monospace, Courier New, Consolas, Lucida Console, Andale Mono.');
        output.current.writeln('Type "update" to use the form for updating settings.');
        output.current.writeln('Press CTRL + C to exit.');
      }
    } else if (trimmed === 'update') {
      if (output && output.current && output.current.writeln) {
        output.current.writeln('Use the form below to update terminal settings.');
      }
    } else {
      if (output && output.current && output.current.writeln) {
        output.current.writeln('TerminalSettingsEditor is active. Use the form below to update settings. Type "help" for available commands.');
      }
    }
  };

  // Expose processInput via ref so that the parent component can call it.
  useImperativeHandle(ref, () => ({
    processInput,
  }));

  // Memoize the rendered component to avoid unnecessary re-renders.
  return useMemo(() => (
    <div className="terminal-settings-editor">
      <h3>Terminal Settings Editor</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Font Size:</label>
          <input
            type="text"
            value={localFontSize}
            onChange={(e) => setLocalFontSize(e.target.value)}
            placeholder="e.g. 12px"
          />
        </div>
        <div className="form-row">
          <label>Font Color:</label>
          <input
            type="color"
            value={localFontColor}
            onChange={(e) => setLocalFontColor(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label>Font Family:</label>
          <input
            type="text"
            value={localFontFamily}
            onChange={(e) => setLocalFontFamily(e.target.value)}
            placeholder="e.g. monospace"
          />
        </div>
        <div className="form-row">
          <label>Background Color:</label>
          <input
            type="color"
            value={localBackgroundColor}
            onChange={(e) => setLocalBackgroundColor(e.target.value)}
          />
        </div>
        <button type="submit">Update Settings</button>
      </form>
      <p>Type "help" for a list of available fonts.</p>
    </div>
  ), [localFontSize, localFontColor, localFontFamily, localBackgroundColor, output, setAutocompleteCommands]);
});

export default TerminalSettingsEditor;
