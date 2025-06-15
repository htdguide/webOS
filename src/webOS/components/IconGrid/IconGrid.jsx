// src/components/IconGrid/IconGrid.jsx

import React, { useState, useContext, useEffect, useRef } from "react";
import { AppsContext } from "../../contexts/AppsContext/AppsContext.jsx";
import DesktopIcon from "../DesktopIcon/DesktopIcon.jsx";
import {
  GRID_GAP,
  TOP_MARGIN,
  LEFT_MARGIN,
  RIGHT_MARGIN,
  BOTTOM_MARGIN,
  GRID_SIZE
} from "../../configs/DesktopIconConfig/DesktopIconConfig.jsx";
import "./IconGrid.css";
import { FocusWrapper } from "../../contexts/FocusControl/FocusControl.jsx";
import { useLogger } from "../Logger/Logger.jsx";

/**
 * Compute (x,y) from priority.
 */
function getPositionFromPriority(priority) {
  const safe = priority > 0 ? priority : 1;
  const cell = GRID_SIZE + GRID_GAP;
  return {
    x: LEFT_MARGIN,
    y: TOP_MARGIN + (safe - 1) * cell
  };
}

function IconGrid({ onOpenApp }) {
  const { apps } = useContext(AppsContext);
  const { log, enabled } = useLogger("IconGrid");

  // Only desktop apps
  const desktopApps = apps.filter((cfg) => !cfg.indock);

  // 1) Build initial primary positions once
  const primaryPositionsRef = useRef(
    desktopApps.reduce((map, cfg) => {
      map[cfg.id] = getPositionFromPriority(cfg.priority);
      return map;
    }, {})
  );

  // 2) This is what we actually render (could be primary or secondary)
  const [iconPositions, setIconPositions] = useState(
    primaryPositionsRef.current
  );

  // 3) Mirror state into a ref so our resize handler always sees fresh data
  const iconPositionsRef = useRef(iconPositions);
  useEffect(() => {
    iconPositionsRef.current = iconPositions;
  }, [iconPositions]);

  const [selectedIcon, setSelectedIcon] = useState(null);
  const containerRef = useRef(null);

  const handleWallpaperClick = () => {
    if (enabled) log("userInteraction", "Wallpaper clicked → deselect");
    setSelectedIcon(null);
  };
  const handleIconClick = (id) => {
    if (enabled) log("userInteraction", `Icon clicked → ${id}`);
    setSelectedIcon(id);
  };
  const handleIconDoubleClick = (id) => {
    if (enabled) log("userInteraction", `Icon dbl-click → open ${id}`);
    onOpenApp(id);
  };

  // 4) Attach resize listener only once
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;
      const { width, height } = container.getBoundingClientRect();
      const cell = GRID_SIZE + GRID_GAP;

      const cols = Math.max(
        1,
        Math.floor((width - LEFT_MARGIN - RIGHT_MARGIN + GRID_GAP) / cell)
      );
      const rows = Math.max(
        1,
        Math.floor((height - TOP_MARGIN - BOTTOM_MARGIN + GRID_GAP) / cell)
      );

      const occupied = new Set();
      const newPositions = {};

      // A) Restore any primary positions now in view & free
      desktopApps.forEach((cfg) => {
        const id = cfg.id;
        const prim = primaryPositionsRef.current[id];
        const c0 = Math.round((prim.x - LEFT_MARGIN) / cell);
        const r0 = Math.round((prim.y - TOP_MARGIN) / cell);
        if (r0 >= 0 && r0 < rows && c0 >= 0 && c0 < cols) {
          const key = `${r0},${c0}`;
          if (!occupied.has(key)) {
            occupied.add(key);
            newPositions[id] = { x: prim.x, y: prim.y };
          }
        }
      });

      // B) Give a secondary spot to any off-screen primaries (column-major)
      desktopApps.forEach((cfg) => {
        const id = cfg.id;
        if (newPositions[id]) return; // already placed
        const prim = primaryPositionsRef.current[id];
        const c = Math.round((prim.x - LEFT_MARGIN) / cell);
        const r = Math.round((prim.y - TOP_MARGIN) / cell);
        const offScreen = r < 0 || r >= rows || c < 0 || c >= cols;
        if (offScreen) {
          outer: for (let cc = 0; cc < cols; cc++) {
            for (let rr = 0; rr < rows; rr++) {
              const key = `${rr},${cc}`;
              if (!occupied.has(key)) {
                occupied.add(key);
                newPositions[id] = {
                  x: LEFT_MARGIN + cc * cell,
                  y: TOP_MARGIN + rr * cell
                };
                break outer;
              }
            }
          }
        }
      });

      // C) Any untouched icons go back to their primary
      desktopApps.forEach((cfg) => {
        const id = cfg.id;
        if (!newPositions[id]) {
          newPositions[id] = { ...primaryPositionsRef.current[id] };
        }
      });

      // D) Commit _once_
      setIconPositions((_) => newPositions);
    };

    window.addEventListener("resize", handleResize);
    handleResize();  // run on mount
    return () => window.removeEventListener("resize", handleResize);
  }, []);  // <<— no iconPositions dependency!

  if (enabled) log("render", `Rendering ${desktopApps.length} icons`);

  return (
    <FocusWrapper name="IconGrid">
      <div
        ref={containerRef}
        className="desktop-content"
        onClick={handleWallpaperClick}
      >
        {desktopApps.map((cfg) => (
          <DesktopIcon
            key={cfg.id}
            name={cfg.name}
            icon={cfg.icon}
            isSelected={selectedIcon === cfg.id}
            onClick={() => handleIconClick(cfg.id)}
            onDoubleClick={() => handleIconDoubleClick(cfg.id)}
            position={iconPositions[cfg.id]}
            onPositionChange={(pos) => {
              // when user drags: update primary + display immediately
              primaryPositionsRef.current[cfg.id] = pos;
              setIconPositions((prev) => ({
                ...prev,
                [cfg.id]: pos
              }));
            }}
          />
        ))}
      </div>
    </FocusWrapper>
  );
}

export default IconGrid;
