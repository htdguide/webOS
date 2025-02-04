import React, { useEffect, useRef, useState, useCallback } from 'react';
import DraggableWindow from '../../components/DraggableWindow/DraggableWindow';
import './SortingAlgorithms.css';

function SortingAlgorithms({ onClose }) {
  const [isWindowMounted, setIsWindowMounted] = useState(false); // Track if the window is mounted
  const [wasmScriptLoaded, setWasmScriptLoaded] = useState(false);
  const canvasRef = useRef(null);
  const script = useRef(null);

  const loadWasmScript = useCallback(() => {
    if (wasmScriptLoaded) return;

    script.current = document.createElement('script');
    script.current.src = '/programfiles/wasm/sorting_algorithms.js';
    script.current.async = false;

    script.current.onload = () => {
      console.log('WASM script loaded successfully.');
      setWasmScriptLoaded(true);
    };

    document.body.appendChild(script.current);
  }, [wasmScriptLoaded]);

  useEffect(() => {
    // Only load WASM script after the window is mounted
    if (isWindowMounted) {
      loadWasmScript();
    }
  }, [isWindowMounted, loadWasmScript]);

  useEffect(() => {
    // Initialize WASM only when the script is loaded and canvas is available
    if (wasmScriptLoaded && canvasRef.current) {
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
            console.log('Initializing new WASM loop.');
            window.Module._initializeWindow();
          }
        }
      }, 100); // Delay ensures the canvas is fully rendered
    }
  }, [wasmScriptLoaded]);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      if (window.Module && window.Module._cancelLoop) {
        console.log('Cancelling WASM loop on window close.');
        window.Module._cancelLoop();
      }

      if (script.current) {
        document.body.removeChild(script.current); // Cleanup script element
      }
    };
  }, []);

  return (
    <DraggableWindow
      title="Sorting Algorithms"
      wasmWidth={400}
      wasmHeight={530}
      onClose={onClose}
      onMount={() => setIsWindowMounted(true)} // Set window mounted state
      onUnmount={() => setIsWindowMounted(false)} // Cleanup when window unmounts
    >
      <canvas
        ref={canvasRef}
        id="canvas"
        className="emscripten"
        tabIndex="-1"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#000',
          display: 'block',
        }}
      />
    </DraggableWindow>
  );
}

export default SortingAlgorithms;
