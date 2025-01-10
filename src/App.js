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
      console.log("WASM script loaded successfully.");
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

  useEffect(() => {
    if (sortingWindowOpen && wasmScriptLoaded && canvasRef.current) {
      setTimeout(() => {
        if (window.Module) {
          window.Module.canvas = canvasRef.current;
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
          <DraggableWindow
            wasmWidth={400} // Native WASM resolution
            wasmHeight={535}
            onClose={closeSortingWindow}
          >
            {/* Canvas pinned to top-left */}
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
