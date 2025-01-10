import React, { useState, useEffect, useRef } from 'react';
import "./App.css";
import DraggableWindow from './DraggableWindow';  // Our macOS-like window
import './Draggable.css';

const script = document.createElement('script');

function App() {
  const [sortingWindowOpen, setSortingWindowOpen] = useState(false);
  const [wasmScriptLoaded, setWasmScriptLoaded] = useState(false);
  const [scriptAppended, setScriptAppended] = useState(false);

  const canvasRef = useRef(null);

  // Load WASM script once
  const loadWasmScript = () => {
    if (scriptAppended) return; // only load once
    script.src = '/wasm/sorting_algorithms.js'; 
    script.async = true;
    script.onload = () => {
      console.log("WASM script loaded successfully.");
      setWasmScriptLoaded(true);
    };
    document.body.appendChild(script);
    setScriptAppended(true);
  };

  // Called when user clicks "Sorting Algorithms" button
  const openSortingWindow = () => {
    // If already open, do nothing
    if (sortingWindowOpen) return;

    // Cancel existing loop if any
    if (window.Module && window.Module._cancelLoop) {
      window.Module._cancelLoop();
    }

    // Open the draggable window
    setSortingWindowOpen(true);

    // If script not yet loaded, load it
    if (!wasmScriptLoaded) {
      loadWasmScript();
    }
  };

  // Close the window
  const closeSortingWindow = () => {
    // Cancel the WASM loop
    if (window.Module && window.Module._cancelLoop) {
      window.Module._cancelLoop();
    }
    setSortingWindowOpen(false);
  };

  // The crucial part: when the window is open AND the script is loaded, 
  // assign the canvas to Module and call _initializeWindow().
  useEffect(() => {
    if (sortingWindowOpen && wasmScriptLoaded && canvasRef.current) {
      // Delay slightly so the canvas is definitely in DOM
      setTimeout(() => {
        if (window.Module) {
          // Re-assign the canvas
          window.Module.canvas = canvasRef.current;
          // Re-init the sorting window
          if (window.Module._initializeWindow) {
            window.Module._initializeWindow();
          }
        }
      }, 50);
    }
  }, [sortingWindowOpen, wasmScriptLoaded]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="container text-center my-5">
          <h1>htdguide's playground</h1>
          <p className="lead">This place here to practice and share new skills</p>
        </div>

        <div className="container">
          <nav>
            <ul className="nav justify-content-center">
              <li className="nav-item">
                <a href="http://htdguide.com/" className="nav-link">Home</a>
              </li>
              <li className="nav-item">
                <a href="https://www.linkedin.com/in/htdguide/" className="nav-link">LinkedIn</a>
              </li>
              <li className="nav-item">
                <a href="https://github.com/htdguide" className="nav-link">Github</a>
              </li>
            </ul>
          </nav>
        </div>

        <button className="btn btn-primary" onClick={openSortingWindow}>
          Sorting Algorithms
        </button>

        {sortingWindowOpen && (
          <DraggableWindow onClose={closeSortingWindow}>
            {/* This <canvas> is used by WASM */}
            <canvas
              ref={canvasRef}
              id="canvas"
              className="emscripten"
              tabIndex="-1"
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                backgroundColor: '#000',
              }}
            />
          </DraggableWindow>
        )}
      </header>
    </div>
  );
}

export default App;
