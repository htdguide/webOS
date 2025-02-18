import React, {
  useEffect,
  useRef,
  useState,
  useCallback
} from 'react';
import DraggableWindow from '../../components/DraggableWindow/DraggableWindow';
import './SortingAlgorithms.css';

function SortingAlgorithms({ onClose }) {
  const [isWindowMounted, setIsWindowMounted] = useState(false);
  const [wasmScriptLoaded, setWasmScriptLoaded] = useState(false);
  const canvasRef = useRef(null);
  const script = useRef(null);

  // DraggableWindow ref to call .showLoading() / .hideLoading()
  const draggableWindowRef = useRef(null);

  const loadWasmScript = useCallback(() => {
    if (wasmScriptLoaded) return;

    script.current = document.createElement('script');
    script.current.src = '/programfiles/wasm/sorting_algorithms.js';
    script.current.async = false;

    script.current.onload = () => {
      console.log('WASM script loaded successfully.');
      setWasmScriptLoaded(true);

      // Hide the loading overlay once loaded
      if (draggableWindowRef.current) {
        draggableWindowRef.current.hideLoading();
      }
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

          console.log('Canvas ready for WASM', {
            width: canvas.width,
            height: canvas.height,
            clientWidth: canvas.clientWidth,
            clientHeight: canvas.clientHeight,
          });

          window.Module.canvas = canvas;

          if (window.Module._initializeWindow) {
            console.log('Initializing WASM loop');
            window.Module._initializeWindow();
          }
        }
      }, 100);
    }
  }, [wasmScriptLoaded]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (window.Module && window.Module._cancelLoop) {
        console.log('Cancelling WASM loop on window close.');
        window.Module._cancelLoop();
      }

      if (script.current) {
        document.body.removeChild(script.current);
      }
    };
  }, []);

  return (
    <DraggableWindow
      ref={draggableWindowRef}
      title="Sorting Algorithms"
      wasmWidth={400}
      wasmHeight={530}
      onClose={onClose}
      onMount={() => {
        setIsWindowMounted(true);
        // Show loading screen when the window first mounts
        if (draggableWindowRef.current) {
          draggableWindowRef.current.showLoading();
        }
      }}
      onUnmount={() => setIsWindowMounted(false)}
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
