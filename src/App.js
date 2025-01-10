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

  useEffect(() => {
    if (sortingWindowOpen && wasmScriptLoaded && canvasRef.current) {
      setTimeout(() => {
        if (window.Module) {
          const canvas = canvasRef.current;
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;

          console.log('Canvas initialized for WASM:', {
            width: canvas.width,
            height: canvas.height,
            clientWidth: canvas.clientWidth,
            clientHeight: canvas.clientHeight,
          });

          window.Module.canvas = canvas;

          if (window.Module._initializeWindow) {
            window.Module._initializeWindow();
          }
        }
      }, 100);
    }
  }, [sortingWindowOpen, wasmScriptLoaded]);

  return (
    <div className="App">
      {/* macOS-style Menu Bar */}
      <div className="menu-bar">
        <div className="menu-left">
          <a href="/" className="menu-item">Home</a>
          <a href="https://www.linkedin.com/in/htdguide/" className="menu-item">LinkedIn</a>
          <a href="https://github.com/htdguide" className="menu-item">GitHub</a>
        </div>
        <div className="menu-right">
          <button className="sorting-button" onClick={openSortingWindow}>
            Sorting Algorithms
          </button>
          <span className="menu-username">htdguide</span>
        </div>
      </div>

      {/* Fullscreen Video Background */}
      <div className="video-background">
        <video
          autoPlay
          muted
          loop
          id="background-video"
          playsInline
        >
          <source src="/wallpaper/SequoiaSunrise.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>

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
    </div>
  );
}

export default App;
