import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { Modal, Button } from 'react-bootstrap'; // Import React Bootstrap components

function App() {
  const [showModal, setShowModal] = useState(false);

  const handleModalClose = () => setShowModal(false);
  const handleModalShow = () => setShowModal(true);

  useEffect(() => {
    // Load the WASM-related JavaScript file dynamically when modal is shown
    if (showModal) {
      const existingScript = document.querySelector('script[src="/wasm/sorting_algorithms.js"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = '/wasm/sorting_algorithms.js'; // Path to your WASM JS file
        script.async = true;
        script.onload = () => {
          console.log("WASM script loaded successfully.");

          // Ensure the canvas is available before initializing WebAssembly
          const canvasElement = document.getElementById('canvas');
          if (canvasElement) {
            console.log("Canvas element is available.");
            // Initialize the WASM module here, ensuring it works with the canvas
            if (window.Module) {
              window.Module.canvas = canvasElement;
            }
          }
        };
        document.body.appendChild(script);
      }

      return () => {
        // Cleanup the script tag when modal is closed
        const scriptToRemove = document.querySelector('script[src="/wasm/sorting_algorithms.js"]');
        if (scriptToRemove) {
          document.body.removeChild(scriptToRemove);
        }
      };
    }
  }, [showModal]);

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
                <a href="#" className="nav-link">Home</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">LinkedIn</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">Github</a>
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
              <canvas className="emscripten" id="canvas" tabIndex="-1"></canvas>
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
