// TerminalInput.jsx
// This file handles the command input for the terminal.
// Changes include:
// 1. Command History: Users can navigate through previously entered commands using the up/down arrow keys.
// 2. Autocomplete: When the user presses Tab, the input is autocompleted from the provided list of commands.
//    The Tab key cycles through suggestions if there are multiple matches.

import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useDraggableWindow } from '../../../components/DraggableWindow/DraggableWindowProvider';
import '../Noterminal.css';

function TerminalInput({
  onCommandSubmit,
  onCtrlC,
  onInputFocus,
  fontSize,
  fontFamily,
  fontColor,
  autocompleteCommands, // Array of available commands for autocomplete.
}) {
  // Current command input state.
  const [currentInput, setCurrentInput] = useState('');
  // Command history to store previous commands.
  const [commandHistory, setCommandHistory] = useState([]);
  // History index for navigation (null means not currently browsing history).
  const [historyIndex, setHistoryIndex] = useState(null);
  // Index for cycling through autocomplete suggestions.
  const [autocompleteIndex, setAutocompleteIndex] = useState(0);

  const inputRef = useRef(null);
  const dummyRef = useRef(null);
  const promptRef = useRef(null);
  const [cursorLeft, setCursorLeft] = useState(10);
  const [cursorWidth, setCursorWidth] = useState(7);

  // Get the focused state from our draggable window provider.
  const { isWindowFocused } = useDraggableWindow();

  // When the window is focused, force focus the input.
  useEffect(() => {
    if (isWindowFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isWindowFocused]);

  // Initially focus the input when the component mounts.
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Update the caret (cursor) position based on the current input and caret index.
  const updateCaretIndex = () => {
    if (inputRef.current && promptRef.current) {
      const textToMeasure = currentInput.slice(0, inputRef.current.selectionStart);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      context.font = `${fontSize} ${fontFamily}`;
      const textWidth = context.measureText(textToMeasure).width;
      const scrollLeft = inputRef.current.scrollLeft || 0;
      const promptWidth = promptRef.current.offsetWidth;
      const promptMarginRight = 5;
      setCursorLeft(promptWidth + promptMarginRight + (textWidth - scrollLeft));
    }
  };

  // Update the cursor width based on a dummy element.
  useLayoutEffect(() => {
    if (dummyRef.current) {
      setCursorWidth(dummyRef.current.offsetWidth);
    }
  }, [fontSize, fontFamily]);

  const handleKeyDown = (e) => {
    // Handle Ctrl+C to exit an active app.
    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      if (onCtrlC) onCtrlC();
      setCurrentInput('');
      setHistoryIndex(null);
      return;
    }
    // Handle ArrowUp for command history navigation.
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        // If not browsing history, start with the last command.
        let newIndex = historyIndex === null ? commandHistory.length - 1 : historyIndex - 1;
        if (newIndex < 0) newIndex = 0;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
      return;
    }
    // Handle ArrowDown for command history navigation.
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        if (historyIndex === null) {
          return;
        } else if (historyIndex < commandHistory.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        } else {
          // If at the latest history item, clear the input.
          setHistoryIndex(null);
          setCurrentInput('');
        }
      }
      return;
    }
    // Handle Tab key for autocomplete.
    if (e.key === 'Tab') {
      e.preventDefault();
      // Filter suggestions based on the current input (case-insensitive).
      const suggestions = autocompleteCommands.filter((cmd) =>
        cmd.toLowerCase().startsWith(currentInput.toLowerCase())
      );
      if (suggestions.length > 0) {
        // Cycle through suggestions using autocompleteIndex.
        const suggestion = suggestions[autocompleteIndex % suggestions.length];
        setCurrentInput(suggestion);
        setAutocompleteIndex(autocompleteIndex + 1);
        updateCaretIndex();
      }
      return;
    }
    // On Enter, submit the command.
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentInput.trim()) {
        onCommandSubmit(currentInput);
        // Add the submitted command to history.
        setCommandHistory([...commandHistory, currentInput]);
      }
      setCurrentInput('');
      setHistoryIndex(null);
      setAutocompleteIndex(0);
      return;
    }
  };

  // Update the caret position on selection changes.
  const handleSelect = () => {
    updateCaretIndex();
  };

  const handleKeyUp = () => {
    updateCaretIndex();
  };

  return (
    <div className="terminal-input-wrapper">
      <span ref={promptRef} className="terminal-prompt" style={{ color: fontColor }}>
        {'>'}
      </span>
      <input
        ref={inputRef}
        type="text"
        className="terminal-input"
        value={currentInput}
        onChange={(e) => {
          setCurrentInput(e.target.value);
          // Reset autocomplete index when the user types.
          setAutocompleteIndex(0);
          updateCaretIndex();
        }}
        onFocus={() => {
          if (onInputFocus) onInputFocus();
        }}
        onSelect={handleSelect}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        autoFocus
        style={{ caretColor: 'transparent' }}
      />
      {/* Dummy element for measuring the width of "M" */}
      <span
        ref={dummyRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          visibility: 'hidden',
          whiteSpace: 'pre',
          fontSize,
          fontFamily,
        }}
      >
        M
      </span>
      {/* Custom blinking cursor */}
      <div
        className="terminal-cursor"
        style={{
          position: 'absolute',
          left: cursorLeft,
          top: 1,
          width: cursorWidth,
          height: fontSize,
          backgroundColor: '#888888',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

export default TerminalInput;
