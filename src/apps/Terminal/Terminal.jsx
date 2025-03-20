import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import './Terminal.css';
import { useDraggableWindow } from '../../components/DraggableWindow/DraggableWindowProvider';
import { useTerminalSettings } from '../../contexts/TerminalSettingsContext/TerminalSettingsProvider';

function Terminal({ onClose }) {
  const [history, setHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [caretIndex, setCaretIndex] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const { openDraggableWindow, closeDraggableWindow, hideLoading } = useDraggableWindow();
  const inputRef = useRef(null);
  const dummyRef = useRef(null);
  const promptRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [cursorLeft, setCursorLeft] = useState(10);
  const [cursorWidth, setCursorWidth] = useState(7);
  const [windowSize, setWindowSize] = useState({ width: 600, height: 400 });

  const { fontSize, fontColor, fontFamily, backgroundColor } = useTerminalSettings();

  // Update caret index based on the input's selection.
  const updateCaretIndex = () => {
    if (inputRef.current) {
      let newIndex = inputRef.current.selectionStart;
      if (newIndex > currentInput.length) {
        newIndex = currentInput.length;
      }
      setCaretIndex(newIndex);
    }
  };

  // Scroll the entire terminal content to the bottom.
  const scrollContentToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  // Handle manual scrolling.
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight < scrollHeight - 5) {
      setAutoScroll(false);
    } else {
      setAutoScroll(true);
    }
  };

  // Measure the text width up to the caret.
  useLayoutEffect(() => {
    if (inputRef.current && promptRef.current) {
      const textToMeasure = currentInput.slice(0, caretIndex);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      context.font = `${fontSize} ${fontFamily}`;
      const textWidth = context.measureText(textToMeasure).width;
      const scrollLeft = inputRef.current.scrollLeft || 0;
      const promptWidth = promptRef.current.offsetWidth;
      // Add the prompt's right margin (5px as in CSS) to position the cursor correctly.
      const promptMarginRight = 5;
      setCursorLeft(promptWidth + promptMarginRight + (textWidth - scrollLeft));
    }
  }, [currentInput, caretIndex, fontSize, fontFamily]);

  // Update the cursor width based on a dummy element measuring "M".
  useEffect(() => {
    if (dummyRef.current) {
      setCursorWidth(dummyRef.current.offsetWidth);
    }
  }, [fontSize, fontFamily]);

  // Handle key events.
  const handleKeyDown = (e) => {
    setAutoScroll(true);
    // For 'Enter', process command and clear input.
    if (e.key === 'Enter') {
      e.preventDefault();
      processCommand(currentInput);
      setCurrentInput('');
      setCaretIndex(0);
    }
  };

  const handleSelect = () => {
    updateCaretIndex();
  };

  const handleKeyUp = () => {
    updateCaretIndex();
  };

  // Process command: add non-empty commands to history.
  const processCommand = (command) => {
    if (!command.trim()) return;
    setHistory(prevHistory => [...prevHistory, command]);
  };

  // Auto-scroll when history changes if auto-scroll is enabled.
  useEffect(() => {
    if (scrollContainerRef.current && autoScroll) {
      // Delay scrolling to ensure the new history line is rendered.
      setTimeout(() => {
        scrollContentToBottom();
      }, 0);
    }
  }, [history, autoScroll]);

  const terminalContent = (
    <div
      className="terminal"
      style={{
        fontSize,
        color: fontColor,
        fontFamily,
        backgroundColor,
      }}
    >
      <div className="terminal-scroll" ref={scrollContainerRef} onScroll={handleScroll}>
        <div className="terminal-history">
          {history.map((line, index) => (
            <div key={index} className="terminal-line">{line}</div>
          ))}
        </div>
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
              updateCaretIndex();
            }}
            onFocus={() => {
              setAutoScroll(true);
              scrollContentToBottom();
            }}
            onSelect={handleSelect}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            autoFocus
            style={{ caretColor: 'transparent' }} // Hide default caret.
          />
          {/* Dummy element for measuring "M" */}
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
              backgroundColor: "#888888",
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    openDraggableWindow({
      title: 'Terminal',
      windowWidth: windowSize.width,
      windowHeight: windowSize.height,
      minWindowWidth: 300,
      minWindowHeight: 200,
      content: terminalContent,
      onClose,
      onMount: () => {
        if (hideLoading) hideLoading();
        if (inputRef.current) inputRef.current.focus();
      },
      onUnmount: () => {
        console.log('Terminal draggable window unmounted.');
      },
      onResize: (width, height) => {
        setWindowSize({ width, height });
      },
    });

    return () => {
      closeDraggableWindow();
    };
  }, [openDraggableWindow, closeDraggableWindow, onClose, terminalContent, hideLoading]);

  return null;
}

export default Terminal;
