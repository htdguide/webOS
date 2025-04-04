// wasmModule.jsx
import React, { useEffect } from 'react';

/**
 * WasmModule Component:
 * -----------------------
 * This component initializes the global `window.Module` object required by your WASM apps.
 * It patches legacy properties that the SM64 WASM build expects:
 *
 *   - Module.arguments → uses an internal storage (arguments_)
 *   - Module.thisProgram → uses an internal storage (thisProgram_)
 *   - Module.quit → uses an internal storage (quit_)
 *
 * Wrap your app (or the WASM-dependent parts) with this component (as in your main.jsx)
 * so that all WASM apps have access to the properly configured Module.
 */
function WasmModule({ children }) {
  useEffect(() => {
    // Initialize the global Module object once on mount.
    window.Module = {
      preRun: [],
      postRun: [],
      print: function () {
        // Optional logging: uncomment if needed.
        // console.log.apply(console, arguments);
      },
      printErr: function () {
        // Optional error logging: uncomment if needed.
        // console.error.apply(console, arguments);
      },
      // Patch for Module.arguments: forwards to an internal storage property.
      arguments_: [],
      get arguments() {
        return this.arguments_;
      },
      set arguments(val) {
        this.arguments_ = val;
      },
      // Patch for Module.thisProgram: forwards to an internal storage property.
      thisProgram_: '',
      get thisProgram() {
        return this.thisProgram_;
      },
      set thisProgram(val) {
        this.thisProgram_ = val;
      },
      // Patch for Module.quit: forwards to an internal storage property.
      quit_: function () {},
      get quit() {
        return this.quit_;
      },
      set quit(val) {
        this.quit_ = val;
      },
      // The canvas will be attached by each individual WASM app.
      canvas: null,
      setStatus: function () {
        // Optional: implement status updates if needed.
      },
    };
  }, []); // Run only once on mount.

  return <>{children}</>;
}

export default WasmModule;
