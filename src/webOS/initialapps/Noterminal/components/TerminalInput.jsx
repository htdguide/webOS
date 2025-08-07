// TerminalInput.jsx
// Handles terminal input, history, autocomplete, and custom cursor.
// Now displays a dynamic prompt prefix and always keeps the caret visible.
//
// Areas:
// 1: Imports
// 2: Component & State/Refs
// 3: Effects
// 4: Caret Position
// 5: Key Handlers
// 6: Render

/* ====================================================
   Area 1: Imports
   ==================================================== */
// 1.1: React hooks, draggable window context, flushSync, and styles
import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useDraggableWindow } from '../../../components/DraggableWindow/DraggableWindowWrap';
import { flushSync } from 'react-dom';
import '../Noterminal.css';

/* ====================================================
   Area 2: Component & State/Refs
   ==================================================== */
function TerminalInput({
  onCommandSubmit,
  onCtrlC,
  onInputFocus,
  fontSize,
  fontFamily,
  fontColor,
  autocompleteCommands,
  getDynamicAutocompleteSuggestions,
  promptText = '', // NEW: app command shown before '>'
}) {
  // 2.1: State for input value, history, indices, and caret metrics
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(null);
  const [autocompleteIndex, setAutocompleteIndex] = useState(0);
  const [cursorLeft, setCursorLeft] = useState(10);
  const [cursorWidth, setCursorWidth] = useState(7);

  // Refs for DOM nodes and canvas
  const inputRef = useRef(null);
  const dummyRef = useRef(null);
  const promptRef = useRef(null);
  const canvasRef = useRef(null);

  // Draggable window focus state
  const { isWindowFocused } = useDraggableWindow();

  /* ====================================================
     Area 3: Effects
     ==================================================== */
  // 3.1: Create canvas for text measurement
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
  }, []);

  // 3.2: Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 3.3: Refocus input when window becomes focused
  useEffect(() => {
    if (isWindowFocused) {
      inputRef.current?.focus();
    }
  }, [isWindowFocused]);

  /* ====================================================
     Area 4: Caret Position
     ==================================================== */
  // 4.1: Compute cursor position based on text & prompt width
  const updateCaretIndex = () => {
    const inputEl = inputRef.current;
    const promptEl = promptRef.current;
    if (inputEl && promptEl && canvasRef.current) {
      const pos = inputEl.selectionStart ?? 0;
      const text = currentInput.slice(0, pos);
      const ctx = canvasRef.current.getContext('2d');
      ctx.font = `${fontSize} ${fontFamily}`;
      const textWidth = ctx.measureText(text).width;
      const scroll = inputEl.scrollLeft || 0;
      const promptWidth = promptEl.offsetWidth;
      const left = promptWidth + 5 + (textWidth - scroll);
      setCursorLeft(left);

      // 4.3: Ensure the caret remains visible within the input scroll
      const relative = textWidth;
      if (relative < scroll) {
        inputEl.scrollLeft = Math.max(0, relative - 10);
      } else if (relative > scroll + inputEl.clientWidth - 20) {
        inputEl.scrollLeft = relative - inputEl.clientWidth + 20;
      }
    }
  };

  // 4.2: Measure width of a single character for cursor width
  useLayoutEffect(() => {
    if (dummyRef.current) {
      setCursorWidth(dummyRef.current.offsetWidth);
    }
  }, [fontSize, fontFamily]);

  /* ====================================================
     Area 5: Key Handlers
     ==================================================== */
  const handleKeyDown = (e) => {
    // 5.1.a: Ctrl+C to clear or exit
    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      onCtrlC?.();
      setCurrentInput('');
      setHistoryIndex(null);
      return;
    }
    // 5.1.b: Navigate history up
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length) {
        const idx = historyIndex === null
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(idx);
        setCurrentInput(commandHistory[idx]);
      }
      return;
    }
    // 5.1.c: Navigate history down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandHistory.length && historyIndex !== null) {
        if (historyIndex < commandHistory.length - 1) {
          setHistoryIndex(historyIndex + 1);
          setCurrentInput(commandHistory[historyIndex + 1]);
        } else {
          setHistoryIndex(null);
          setCurrentInput('');
        }
      }
      return;
    }
    // 5.1.d: Autocomplete on Tab
    if (e.key === 'Tab') {
      e.preventDefault();
      const trimmed = currentInput.trim();
      const tokens = trimmed ? trimmed.split(/\s+/) : [];
      let prefix = '', lastToken = '';
      if (tokens.length === 1) {
        lastToken = tokens[0];
      } else if (tokens.length > 1) {
        const lt = tokens[tokens.length - 1];
        const pos = currentInput.lastIndexOf(lt);
        prefix = currentInput.substring(0, pos);
        lastToken = currentInput.substring(pos);
      }
      const dyn = getDynamicAutocompleteSuggestions(currentInput) || [];
      const options = dyn.length
        ? dyn
        : autocompleteCommands.filter(c =>
            c.toLowerCase().startsWith(lastToken.toLowerCase())
          );
      if (options.length) {
        const pick = options[autocompleteIndex % options.length];
        flushSync(() => {
          setCurrentInput(prefix + pick + ' ');
          setAutocompleteIndex(autocompleteIndex + 1);
        });
        updateCaretIndex();
      }
      return;
    }
    // 5.1.e: Enter to submit command
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

  // 5.2: Update caret on selection or keyup
  const handleSelect = () => updateCaretIndex();
  const handleKeyUp = () => updateCaretIndex();

  /* ====================================================
     Area 6: Render
     ==================================================== */
  return (
    <div className="terminal-input-wrapper">
      <span
        ref={promptRef}
        className="terminal-prompt"
        style={{ color: fontColor }}
      >
        {promptText ? `${promptText} >` : '>'}
      </span>
      <input
        ref={inputRef}
        type="text"
        className="terminal-input"
        value={currentInput}
        onChange={(e) => {
          setCurrentInput(e.target.value);
          setAutocompleteIndex(0);
          updateCaretIndex();
        }}
        onFocus={() => {
          onInputFocus?.();
          updateCaretIndex();
        }}
        onSelect={handleSelect}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        autoFocus
        style={{ caretColor: 'transparent' }}
      />
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
