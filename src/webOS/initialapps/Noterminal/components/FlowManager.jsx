// FlowManager.jsx
// Manages flow between terminal I/O and apps, tracks the active app’s command prefix,
// ensures the terminal view is always scrolled to the bottom, keeps the scrollbar visible,
// and now supports scrolling by mouse wheel without dragging the window.

/* ====================================================
   Area 1: Imports
   ==================================================== */
// 1.1: React, hooks, and component imports
import React, { useRef, useState, useEffect } from 'react';
import TerminalInput from './TerminalInput';
import TerminalOutput from './TerminalOutput';
// 1.2: Apps list import
import { apps } from './AppsList';

/* ====================================================
   Area 2: State, Refs & Effects
   ==================================================== */
function FlowManager({ fontSize, fontColor, fontFamily, backgroundColor, onInputFocus }) {
  // 2.1: Refs for output, active app, and scroll container
  const outputRef = useRef(null);
  const activeAppRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // 2.2: State for active app, autocomplete, and current app command prefix
  const [activeApp, setActiveApp] = useState(null);
  const [autocompleteCommands, setAutocompleteCommands] = useState([]);
  const [currentAppCommand, setCurrentAppCommand] = useState('');

  // 2.3: Auto-scroll effect to keep terminal view at bottom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const observer = new MutationObserver(() => {
      container.scrollTop = container.scrollHeight;
    });
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // 2.4: Wheel handler to scroll terminal and prevent window dragging
  const handleWheel = (e) => {
    e.stopPropagation();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop += e.deltaY;
    }
  };

/* ====================================================
   Area 3: Handlers
   ==================================================== */
  // 3.1: Determine which component matches a command
  const getAppComponentForCommand = (command) => {
    const normalized = command.trim().toLowerCase();
    for (const app of apps) {
      if (app.commands.map(cmd => cmd.toLowerCase()).includes(normalized)) {
        return app.component;
      }
    }
    return null;
  };

  // 3.2: Process submitted command: launch app or forward input
  const handleCommandSubmit = (command) => {
    if (activeApp && activeAppRef.current?.processInput) {
      activeAppRef.current.processInput(command);
    } else {
      const AppComponent = getAppComponentForCommand(command);
      if (AppComponent) {
        setActiveApp(() => AppComponent);
        setCurrentAppCommand(command);
        outputRef.current?.writeln(`Launching app: ${command}`);
      } else {
        outputRef.current?.writeln(`noterminal: command not found: "${command}"`);
        outputRef.current?.writeln(`Type "help" to see the commands`);
      }
    }
    // Legacy fallback scroll
    setTimeout(() => {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }, 0);
  };

  // 3.3: Handle Ctrl+C: exit active app and clear prefix
  const handleCtrlC = () => {
    if (activeApp) {
      outputRef.current?.writeln('^C');
      setActiveApp(null);
      setCurrentAppCommand('');
    }
  };

  // 3.4: Get dynamic suggestions from active app if available
  const getDynamicAutocompleteSuggestions = (input) => {
    return activeAppRef.current?.getAutocompleteSuggestions
      ? activeAppRef.current.getAutocompleteSuggestions(input)
      : [];
  };

/* ====================================================
   Area 4: Render
   ==================================================== */
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
        onWheel={handleWheel}                              // ← enable wheel scrolling
        style={{
          overflowY: 'auto',                               // changed from 'scroll' to 'auto'
          height: '100%',
        }}
      >
        <TerminalOutput ref={outputRef} />
        {activeApp &&
          React.createElement(activeApp, {
            ref: activeAppRef,
            output: outputRef,
            setAutocompleteCommands,
          })}
        <TerminalInput
          onCommandSubmit={handleCommandSubmit}
          onCtrlC={handleCtrlC}
          onInputFocus={onInputFocus}
          fontSize={fontSize}
          fontFamily={fontFamily}
          fontColor={fontColor}
          autocompleteCommands={autocompleteCommands}
          getDynamicAutocompleteSuggestions={getDynamicAutocompleteSuggestions}
          promptText={currentAppCommand}
        />
      </div>
    </div>
  );
}

export default FlowManager;
