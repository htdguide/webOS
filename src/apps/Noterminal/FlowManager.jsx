import React, { useRef, useState } from 'react';
import TerminalInput from './TerminalInput';
import TerminalOutput from './TerminalOutput';
import { appsList } from './AppsList';

function FlowManager({ fontSize, fontColor, fontFamily, backgroundColor }) {
  const outputRef = useRef(null);
  const [activeApp, setActiveApp] = useState(null);
  const activeAppRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Check if the command matches an app command.
  const getAppComponentForCommand = (command) => {
    const normalized = command.trim().toLowerCase();
    return appsList[normalized] || null;
  };

  // Handle input submission.
  const handleCommandSubmit = (command) => {
    if (activeApp && activeAppRef.current && activeAppRef.current.processInput) {
      // Forward the input to the active app.
      activeAppRef.current.processInput(command);
    } else {
      // Check if the input should launch an app.
      const AppComponent = getAppComponentForCommand(command);
      if (AppComponent) {
        setActiveApp(() => AppComponent);
        if (outputRef.current) {
          outputRef.current.writeln(`Launching app: ${command}`);
        }
      } else {
        // Normal processing – echo the command.
        if (outputRef.current) {
          outputRef.current.writeln(`You typed: ${command}`);
        }
      }
    }
    // Auto-scroll to the bottom.
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }, 0);
  };

  // Handle ctrl-C to exit an active app.
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
      <div className="terminal-scroll" ref={scrollContainerRef} style={{ overflow: 'auto', height: '100%' }}>
        <TerminalOutput ref={outputRef} />
        {activeApp && React.createElement(activeApp, { ref: activeAppRef, output: outputRef })}
        <TerminalInput
          onCommandSubmit={handleCommandSubmit}
          onCtrlC={handleCtrlC}
          fontSize={fontSize}
          fontFamily={fontFamily}
          fontColor={fontColor}
        />
      </div>
    </div>
  );
}

export default FlowManager;
