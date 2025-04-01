import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useTerminalSettings } from '../../../../contexts/TerminalSettingsContext/TerminalSettingsProvider';
import './TerminalSettingsEditor.css';

const TerminalSettingsEditor = forwardRef(({ output }, ref) => {
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
  // If the user types "help", output a list of available fonts.
  const processInput = (input) => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed === 'help') {
      if (output && output.current && output.current.writeln) {
        output.current.writeln('Available fonts: monospace, Courier New, Consolas, Lucida Console, Andale Mono.');
        output.current.writeln('Press CTRL + C to exit');
      }
    } else {
      if (output && output.current && output.current.writeln) {
        output.current.writeln('TerminalSettingsEditor is active. Use the form below to update settings. Type "help" for commands avaiable.');
      }
    }
  };

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
