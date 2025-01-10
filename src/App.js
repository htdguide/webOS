import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';
import "./App.css";

const script = document.createElement('script');
var isCanvasClosed = false;

function App() {
  const [showModal, setShowModal] = useState(false);
  const [wasmScriptLoaded, setWasmScriptLoaded] = useState(false);

  const handleModalClose = () => {
    setShowModal(false);
    window.Module._cancelLoop();
    isCanvasClosed = true;
  };

  const load = () => {
    window.Module._initializeWindow();
  }

  const handleModalShow = () => {
    setShowModal(true);
    if (!wasmScriptLoaded) {
      loadWasmScript(); // Load the WASM script only once
    }
  };

  const loadWasmScript = () => {
    script.src = '/wasm/sorting_algorithms.js'; // Path to your WASM JS file
    script.async = true;
    script.onload = () => {
      console.log("WASM script loaded successfully.");
      setWasmScriptLoaded(true); // Mark the script as loaded
      reassignCanvas(); // Initialize the WebAssembly after loading
    };
    document.body.appendChild(script);
  };

  const reassignCanvas = () => {
    const canvasElement = document.getElementById('canvas');
    if (canvasElement && window.Module) {
      console.log("Reassigning canvas to WASM module.");
      // Set the canvas dimensions
      canvasElement.width = window.innerWidth;
      canvasElement.height = 510;
      window.Module.canvas = canvasElement; // Reassign the canvas
    }
  };

  useEffect(() => {
    if (showModal && wasmScriptLoaded) {
      reassignCanvas(); // Reassign the canvas when the modal is opened
      document.body.appendChild(script);
      console.log("useeffect");
      if (isCanvasClosed) load();
    }
  }, [showModal, wasmScriptLoaded]);


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

        {/* Modal Trigger Button */}
        <Button variant="primary" onClick={handleModalShow}>
          Sorting Algorithms
        </Button>

        {/* Modal */}
        <Modal show={showModal} onHide={handleModalClose} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Sorting Program</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <div id="canvas-container" style={{ width: '100%', height: '510px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
          <canvas className="emscripten" id="canvas" tabIndex="-1" style={{ maxWidth: '100%', maxHeight: '100%' }}></canvas>
          </div>

            <p className="lead my-2">C++ practice with the help of raylib library compiled into WebAssembly by emscripten to run in a browser! [Supports touchscreen!]</p>
            <Button variant="primary" onClick={() => window.open('https://github.com/htdguide/Sorting-Algorithms', '_blank')}>
              Github Repo
            </Button>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </header>
    </div>
  );
}

export default App;
