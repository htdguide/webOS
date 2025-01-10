import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import DraggableWindow from './DraggableWindow';
import './Draggable.css';

const script = document.createElement('script');

function App() {
  const [sortingWindowOpen, setSortingWindowOpen] = useState(false);
  const [wasmScriptLoaded, setWasmScriptLoaded] = useState(false);
  const canvasRef = useRef(null);

  const loadWasmScript = () => {
    if (wasmScriptLoaded) return;

    script.src = '/wasm/sorting_algorithms.js';
    script.async = true;
    script.onload = () => {
      console.log('WASM script loaded successfully.');
      setWasmScriptLoaded(true);
    };
    document.body.appendChild(script);
  };

  const openSortingWindow = () => {
    if (sortingWindowOpen) return;

    if (window.Module && window.Module._cancelLoop) {
      window.Module._cancelLoop();
    }

    setSortingWindowOpen(true);

    if (!wasmScriptLoaded) {
      loadWasmScript();
    }
  };

  const closeSortingWindow = () => {
    if (window.Module && window.Module._cancelLoop) {
      window.Module._cancelLoop();
    }
    setSortingWindowOpen(false);
  };

  const initializeWasm = (retryCount = 0) => {
    if (!canvasRef.current || !window.Module) return;

    const canvas = canvasRef.current;

    // Ensure the canvas is ready
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    console.log('Canvas initialized for WASM:', {
      width: canvas.width,
      height: canvas.height,
      clientWidth: canvas.clientWidth,
      clientHeight: canvas.clientHeight,
    });

    // Add a dummy event listener to ensure the canvas is "active"
    canvas.addEventListener('click', () => {}, { once: true });

    try {
      // Assign the canvas to Emscripten and initialize the WASM application
      window.Module.canvas = canvas;

      if (window.Module._initializeWindow) {
        window.Module._initializeWindow();
      }
    } catch (err) {
      console.error('Error during WASM initialization:', err);

      // Retry initialization if the error is due to `_glfwInit`
      if (retryCount < 3) {
        console.log(`Retrying WASM initialization (attempt ${retryCount + 1})...`);
        setTimeout(() => initializeWasm(retryCount + 1), 200); // Retry after 200ms
      }
    }
  };

  useEffect(() => {
    if (sortingWindowOpen && wasmScriptLoaded) {
      setTimeout(() => initializeWasm(), 100); // Slight delay ensures DOM readiness
    }
  }, [sortingWindowOpen, wasmScriptLoaded]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="container text-center my-5">
          <h1>htdguide's playground</h1>
          <p className="lead">Practice and share new skills</p>
        </div>

        <div className="container">
          <nav>
            <ul className="nav justify-content-center">
              <li className="nav-item">
                <a href="http://htdguide.com/" className="nav-link">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a href="https://www.linkedin.com/in/htdguide/" className="nav-link">
                  LinkedIn
                </a>
              </li>
              <li className="nav-item">
                <a href="https://github.com/htdguide" className="nav-link">
                  Github
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <button className="btn btn-primary" onClick={openSortingWindow}>
          Sorting Algorithms
        </button>

        {sortingWindowOpen && (
          <DraggableWindow
            wasmWidth={400}
            wasmHeight={500}
            onClose={closeSortingWindow}
          >
            <canvas
              ref={canvasRef}
              id="canvas"
              className="emscripten"
              tabIndex="-1"
              style={{
                width: '400px',
                height: '500px',
                backgroundColor: '#000',
                display: 'block',
              }}
            />
          </DraggableWindow>
        )}
      </header>
    </div>
  );
}

export default App;
