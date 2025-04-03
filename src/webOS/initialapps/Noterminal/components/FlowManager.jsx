// FlowManager.jsx
// This file manages the flow between terminal output, input, and launching apps.
// Changes include adding an autocompleteCommands state that holds the current list of
// available commands. The active app (if any) is passed a function (setAutocompleteCommands)
// so it can dynamically update the autocomplete suggestions.

import React, { useRef, useState } from 'react';
import TerminalInput from './TerminalInput';
import TerminalOutput from './TerminalOutput';
import { apps } from './AppsList';

function FlowManager({ fontSize, fontColor, fontFamily, backgroundColor, onInputFocus }) {
  const outputRef = useRef(null);
  const [activeApp, setActiveApp] = useState(null);
  const activeAppRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // State for autocomplete commands.
  // Active apps can update this list dynamically to offer context-sensitive suggestions.
  const [autocompleteCommands, setAutocompleteCommands] = useState([]);

  // Check if the command matches any app command.
  const getAppComponentForCommand = (command) => {
    const normalized = command.trim().toLowerCase();
    for (const app of apps) {
      if (app.commands.map((cmd) => cmd.toLowerCase()).includes(normalized)) {
        return app.component;
      }
    }
    return null;
  };

  const handleCommandSubmit = (command) => {
    if (activeApp && activeAppRef.current && activeAppRef.current.processInput) {
      // Forward input to the active app.
      activeAppRef.current.processInput(command);
    } else {
      const AppComponent = getAppComponentForCommand(command);
      if (AppComponent) {
        setActiveApp(() => AppComponent);
        if (outputRef.current) {
          outputRef.current.writeln(`Launching app: ${command}`);
        }
      } else {
        if (outputRef.current) {
          outputRef.current.writeln(`noterminal: command not found: "${command}"`);
        }
      }
    }
    // After processing, scroll to the bottom of the terminal.
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }, 0);
  };

  const handleCtrlC = () => {
    if (activeApp) {
      if (outputRef.current) {
        outputRef.current.writeln('^C');
      }
      setActiveApp(null);
    }
  };

  return (
    <div
      className="terminal"
      style={{
        fontSize,
        color: fontColor,
        fontFamily,
        backgroundColor,
        width: '100%',
        height: '100%',
      }}
    >
      <div
        className="terminal-scroll"
        ref={scrollContainerRef}
        style={{ overflow: 'auto', height: '100%' }}
      >
        <TerminalOutput ref={outputRef} />
        {activeApp &&
          // Pass the setAutocompleteCommands function to the active app so it can update the autocomplete list.
          React.createElement(activeApp, { ref: activeAppRef, output: outputRef, setAutocompleteCommands })}
        <TerminalInput
          onCommandSubmit={handleCommandSubmit}
          onCtrlC={handleCtrlC}
          onInputFocus={onInputFocus}
          fontSize={fontSize}
          fontFamily={fontFamily}
          fontColor={fontColor}
          autocompleteCommands={autocompleteCommands}
        />
      </div>
    </div>
  );
}

export default FlowManager;
