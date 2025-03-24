import React, { useState, forwardRef, useImperativeHandle } from 'react';
import './Noterminal.css';

const TerminalOutput = forwardRef((props, ref) => {
  const [lines, setLines] = useState(['']);

  const write = (text) => {
    setLines((prevLines) => {
      const newLines = [...prevLines];
      newLines[newLines.length - 1] = newLines[newLines.length - 1] + text;
      return newLines;
    });
  };

  const writeln = (text) => {
    setLines((prevLines) => {
      const newLines = [...prevLines];
      newLines[newLines.length - 1] = newLines[newLines.length - 1] + text;
      newLines.push('');
      return newLines;
    });
  };

  useImperativeHandle(ref, () => ({
    write,
    writeln,
  }));

  return (
    <div className="terminal-output">
      {lines.map((line, index) => (
        <div key={index} className="terminal-line">
          {line}
        </div>
      ))}
    </div>
  );
});

export default TerminalOutput;
