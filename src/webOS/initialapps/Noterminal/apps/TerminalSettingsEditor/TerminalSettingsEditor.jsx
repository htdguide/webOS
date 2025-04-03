// TerminalSettingsEditor.jsx
// This component allows the user to update terminal settings via a form.
// It also supports command input via the terminal. When active, it updates
// the autocomplete suggestions (using the setAutocompleteCommands prop) so that
// users can quickly access commands like "help" and "update".

import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useTerminalSettings } from '../../../../contexts/TerminalSettingsContext/TerminalSettingsProvider';
import './TerminalSettingsEditor.css';

const TerminalSettingsEditor = forwardRef(({ output, setAutocompleteCommands }, ref) => {
  const {
    fontSize,
    setFontSize,
    fontColor,
    setFontColor,
    fontFamily,
    setFontFamily,
    backgroundColor,
    setBackgroundColor,
  } = useTerminalSettings();

  // Local state for the form inputs.
  const [localFontSize, setLocalFontSize] = useState(fontSize);
  const [localFontColor, setLocalFontColor] = useState(fontColor);
  const [localFontFamily, setLocalFontFamily] = useState(fontFamily);
  const [localBackgroundColor, setLocalBackgroundColor] = useState(backgroundColor);

  // When this app is active, update the terminal's autocomplete commands.
  useEffect(() => {
    if (setAutocompleteCommands) {
      // Define available commands for autocomplete for this app.
      setAutocompleteCommands(['help', 'update']);
    }
    // Clean up: clear autocomplete commands when this app unmounts.
    return () => {
      if (setAutocompleteCommands) {
        setAutocompleteCommands([]);
      }
    };
  }, [setAutocompleteCommands]);

  // Handle form submission to update terminal settings.
  const handleSubmit = (e) => {
    e.preventDefault();
    setFontSize(localFontSize);
    setFontColor(localFontColor);
    setFontFamily(localFontFamily);
    setBackgroundColor(localBackgroundColor);
    if (output && output.current && output.current.writeln) {
      output.current.writeln('Terminal settings updated.');
    }
  };

  // processInput is used for text commands while the app is active.
  // For example, typing "help" outputs a list of available fonts and commands.
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

  // Expose processInput function via ref so the parent (FlowManager) can call it.
  useImperativeHandle(ref, () => ({
    processInput,
  }));

  return (
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
  );
});

export default TerminalSettingsEditor;
