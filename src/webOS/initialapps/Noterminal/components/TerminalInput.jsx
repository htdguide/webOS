// TerminalInput.jsx
// This file handles the command input for the terminal.
// It includes features like command history, autocomplete, and an instant cursor update using flushSync.
// When the Tab key is pressed, flushSync forces the state update (input value and autocomplete index)
// to occur immediately, eliminating any delay in updating the cursor position.
// Updated to only autocomplete the argument part (leaving the command intact) when appropriate,
// to append a trailing space after a successful autocomplete, and to fix the issue where repeated Tab
// presses on an empty or single-token input were appending multiple words.

import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useDraggableWindow } from '../../../components/DraggableWindow/DraggableWindowWrap';
import { flushSync } from 'react-dom';
import '../Noterminal.css';

function TerminalInput({
  onCommandSubmit,
  onCtrlC,
  onInputFocus,
  fontSize,
  fontFamily,
  fontColor,
  autocompleteCommands, // Static list of commands from the active app.
  getDynamicAutocompleteSuggestions, // Optional function to get dynamic suggestions based on current input.
}) {
  // State for the current command input.
  const [currentInput, setCurrentInput] = useState('');
  // State to store command history.
  const [commandHistory, setCommandHistory] = useState([]);
  // Index for navigating through command history (null means not browsing history).
  const [historyIndex, setHistoryIndex] = useState(null);
  // Index for cycling through autocomplete suggestions.
  const [autocompleteIndex, setAutocompleteIndex] = useState(0);

  const inputRef = useRef(null);
  const dummyRef = useRef(null);
  const promptRef = useRef(null);
  // Ref for the cached canvas element.
  const canvasRef = useRef(null);
  const [cursorLeft, setCursorLeft] = useState(10);
  const [cursorWidth, setCursorWidth] = useState(7);

  // Retrieve the focused state from the draggable window provider.
  const { isWindowFocused } = useDraggableWindow();

  // Initialize the canvas once for measuring text widths.
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
  }, []);

  // Focus the input when the window becomes focused.
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

  // Function to update the caret (cursor) position based on the current input.
  const updateCaretIndex = () => {
    if (inputRef.current && promptRef.current) {
      const textToMeasure = currentInput.slice(0, inputRef.current.selectionStart);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.font = `${fontSize} ${fontFamily}`;
      const textWidth = context.measureText(textToMeasure).width;
      const scrollLeft = inputRef.current.scrollLeft || 0;
      const promptWidth = promptRef.current.offsetWidth;
      const promptMarginRight = 5;
      setCursorLeft(promptWidth + promptMarginRight + (textWidth - scrollLeft));
    }
  };

  // Update the caret width based on a dummy element that measures text width.
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
          setHistoryIndex(null);
          setCurrentInput('');
        }
      }
      return;
    }
    // Handle Tab key for autocomplete.
    if (e.key === 'Tab') {
      e.preventDefault();
      
      // Use trimmed input to determine tokens.
      const trimmedInput = currentInput.trim();
      const tokens = trimmedInput ? trimmedInput.split(/\s+/) : [];
      let prefix = "";
      let lastToken = "";
      
      if (tokens.length === 0) {
        // If input is empty, both prefix and lastToken are empty.
        prefix = "";
        lastToken = "";
      } else if (tokens.length === 1) {
        // Single token: replace the entire input.
        prefix = "";
        lastToken = tokens[0];
      } else {
        // Multiple tokens: preserve everything before the last token.
        const lastTokenText = tokens[tokens.length - 1];
        // Use lastIndexOf to preserve spacing.
        const lastTokenStart = currentInput.lastIndexOf(lastTokenText);
        prefix = currentInput.substring(0, lastTokenStart);
        lastToken = currentInput.substring(lastTokenStart);
      }
      
      // Use dynamic suggestions if provided; otherwise, fallback to static autocompleteCommands.
      const dynamicSuggestions = getDynamicAutocompleteSuggestions
        ? getDynamicAutocompleteSuggestions(currentInput)
        : [];
      const suggestions = dynamicSuggestions.length > 0
        ? dynamicSuggestions
        : autocompleteCommands.filter((cmd) =>
            cmd.toLowerCase().startsWith(lastToken.toLowerCase())
          );
      
      if (suggestions.length > 0) {
        // Cycle through suggestions using the autocompleteIndex.
        const suggestion = suggestions[autocompleteIndex % suggestions.length];
        flushSync(() => {
          // Replace only the last token with the suggestion (plus a trailing space)
          // while preserving the earlier part of the input.
          setCurrentInput(prefix + suggestion + ' ');
          setAutocompleteIndex(autocompleteIndex + 1);
        });
        updateCaretIndex();
      }
      return;
    }
    // On Enter, submit the command.
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentInput.trim()) {
        onCommandSubmit(currentInput);
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
          // Reset the autocomplete index when the user types.
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
      {/* Dummy element for measuring the width of "M" for the cursor width */}
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
