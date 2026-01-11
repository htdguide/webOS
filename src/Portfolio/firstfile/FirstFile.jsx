/**
 * This component renders a fullscreen Matrix-style screen.
 * Areas:
 * - 1. Imports
 * - 2. Component layout
 * - 3. Export
 *
 * Styling and CRT effects are defined in FirstFile.css
 */

// =========================
// Part 1: Imports
// =========================
// 1.1: React
import React from "react";

// 1.2: Component styles
import "./FirstFile.css";

// =========================
// Part 2: Component
// =========================
// 2.1: Fullscreen CRT Matrix screen
const FirstFile = () => {
  return (
    <div className="matrix-screen">
      {/* 2.2: CRT wrapper – effects apply to all children */}
      <div className="crt syncJitter">
        {/* 2.3: Top-left text */}
        <div className="matrix-text">Wake Up Neo</div>
      </div>

      {/* 2.4: Noise overlay */}
      <div className="noise" />
    </div>
  );
};

// =========================
// Part 3: Export
// =========================
// 3.1: Default export
export default FirstFile;
