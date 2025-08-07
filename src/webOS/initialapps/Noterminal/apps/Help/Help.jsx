// src/apps/Help/Help.jsx

/* ====================================================
   Area 1: Imports & Utilities
   ==================================================== */

// 1.1: React imports for component, refs, and effects
import React, { forwardRef, useImperativeHandle, useEffect } from "react";

// 1.2: Import the apps registry to list their commands/descriptions
import { apps } from "../../components/AppsList";

/* ====================================================
   Area 2: Component Definition
   ==================================================== */

const Help = forwardRef(({ output, setAutocompleteCommands }, ref) => {
  // 2.1: Helper to write a line to the terminal
  const writeln = (msg = "") => {
    if (output?.current?.writeln) {
      output.current.writeln(msg);
    }
  };

  // 2.2: On mount, list all registered commands with descriptions
  useEffect(() => {
    writeln("");
    writeln("Available Commands:");
    writeln("-------------------");
    apps.forEach(({ commands, description }) => {
      const cmdList = Array.isArray(commands) ? commands.join(", ") : commands;
      writeln(`  • ${cmdList}`);
      writeln(`      ${description}`);
    });
    writeln("");
  }, []);

  // 2.3: Stub for processing further input (no-op)
  const processInput = (input) => {
    // No additional commands beyond initial help listing
  };

  // 2.4: Stub for autocomplete suggestions (none needed)
  const getAutocompleteSuggestions = () => {
    return [];
  };

  // 2.5: Expose methods to the terminal host
  useImperativeHandle(ref, () => ({
    processInput,
    getAutocompleteSuggestions,
  }));

  // 2.6: Render minimal placeholder UI
  return (
    <div className="help-app">
      <h3>Use CTRL + C to exit an app</h3>
    </div>
  );
});

/* ====================================================
   Area 3: Export
   ==================================================== */

// 3.1: Export the component as default
export default Help;
