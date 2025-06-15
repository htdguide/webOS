// src/components/IconGrid/IconGrid.jsx

import React, {
  useState,
  useContext,
  useEffect,
  useRef
} from "react";
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
 * Helper to convert a priority number into an (x,y) position on the desktop.
 * Uses GRID_SIZE and GRID_GAP to space icons out relative to the desktop content.
 */
function getPositionFromPriority(priority) {
  const safePriority = priority && priority > 0 ? priority : 1;
  const effectiveCellSize = GRID_SIZE + GRID_GAP;
  const x = LEFT_MARGIN;
  const y = TOP_MARGIN + (safePriority - 1) * effectiveCellSize;
  return { x, y };
}

function IconGrid({ onOpenApp }) {
  const { apps } = useContext(AppsContext);
  const { log, enabled } = useLogger("IconGrid");

  // Only desktop apps
  const desktopApps = apps.filter((iconConfig) => !iconConfig.indock);

  // Build the initial (original) positions map
  const buildInitialPositions = () => {
    const map = {};
    desktopApps.forEach((iconConfig) => {
      map[iconConfig.id] = getPositionFromPriority(
        iconConfig.priority
      );
    });
    return map;
  };

  // originalPositionsRef.current never changes
  const originalPositionsRef = useRef(buildInitialPositions());

  // iconPositions: { [iconId]: {x,y} }
  const [iconPositions, setIconPositions] = useState(
    originalPositionsRef.current
  );

  const [selectedIcon, setSelectedIcon] = useState(null);
  const containerRef = useRef(null);

  const handleWallpaperClick = () => {
    if (enabled)
      log(
        "userInteraction",
        "Wallpaper clicked: deselecting any selected icon"
      );
    setSelectedIcon(null);
  };

  const handleIconClick = (iconId) => {
    if (enabled)
      log(
        "userInteraction",
        `Icon clicked: ${iconId}`
      );
    setSelectedIcon(iconId);
  };

  const handleIconDoubleClick = (iconId) => {
    if (enabled)
      log(
        "userInteraction",
        `Icon double-clicked: ${iconId} (opening app)`
      );
    onOpenApp(iconId);
  };

  // On window resize: restore old positions if spot is free, then
  // move any truly off-screen icons into the first available cell.
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const cell = GRID_SIZE + GRID_GAP;

      // Compute how many cols/rows fit
      const cols = Math.max(
        1,
        Math.floor((rect.width - LEFT_MARGIN - RIGHT_MARGIN + GRID_GAP) / cell)
      );
      const rows = Math.max(
        1,
        Math.floor((rect.height - TOP_MARGIN - BOTTOM_MARGIN + GRID_GAP) / cell)
      );

      // 1) Mark occupied cells by current positions (that are on-screen)
      const occupied = new Set();
      Object.entries(iconPositions).forEach(([id, pos]) => {
        const c = Math.round((pos.x - LEFT_MARGIN) / cell);
        const r = Math.round((pos.y - TOP_MARGIN) / cell);
        if (r >= 0 && r < rows && c >= 0 && c < cols) {
          occupied.add(`${r},${c}`);
        }
      });

      const updates = {};

      // 2) Restore icons whose original spot is back on-screen & free
      Object.entries(originalPositionsRef.current).forEach(
        ([id, origPos]) => {
          const c0 = Math.round((origPos.x - LEFT_MARGIN) / cell);
          const r0 = Math.round((origPos.y - TOP_MARGIN) / cell);
          const currentlyAtOrig =
            iconPositions[id].x === origPos.x &&
            iconPositions[id].y === origPos.y;
          const inView = r0 >= 0 && r0 < rows && c0 >= 0 && c0 < cols;
          const free = !occupied.has(`${r0},${c0}`);
          if (inView && free && !currentlyAtOrig) {
            occupied.add(`${r0},${c0}`);
            updates[id] = { x: origPos.x, y: origPos.y };
          }
        }
      );

      // 3) Move any icons still off-screen into the first free cell,
      //    scanning **column-major** (fill down each column).
      Object.entries(iconPositions).forEach(([id, pos]) => {
        if (updates[id]) return; // already restored
        const c = Math.round((pos.x - LEFT_MARGIN) / cell);
        const r = Math.round((pos.y - TOP_MARGIN) / cell);
        const offScreen = r < 0 || r >= rows || c < 0 || c >= cols;
        if (offScreen) {
          outer: for (let cc = 0; cc < cols; cc++) {
            for (let rr = 0; rr < rows; rr++) {
              const key = `${rr},${cc}`;
              if (!occupied.has(key)) {
                occupied.add(key);
                updates[id] = {
                  x: LEFT_MARGIN + cc * cell,
                  y: TOP_MARGIN + rr * cell
                };
                break outer;
              }
            }
          }
        }
      });

      // Apply batched updates, if any
      if (Object.keys(updates).length > 0) {
        setIconPositions((prev) => {
          const next = { ...prev };
          Object.entries(updates).forEach(([id, np]) => {
            next[id] = np;
          });
          return next;
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // run once on mount
    return () => window.removeEventListener("resize", handleResize);
  }, [iconPositions]);

  if (enabled)
    log(
      "render",
      `Rendering ${desktopApps.length} desktop icons`
    );

  return (
    <FocusWrapper name="IconGrid">
      <div
        ref={containerRef}
        className="desktop-content"
        onClick={handleWallpaperClick}
      >
        {desktopApps.map((iconConfig) => (
          <DesktopIcon
            key={iconConfig.id}
            name={iconConfig.name}
            icon={iconConfig.icon}
            isSelected={selectedIcon === iconConfig.id}
            onClick={() => handleIconClick(iconConfig.id)}
            onDoubleClick={() =>
              handleIconDoubleClick(iconConfig.id)
            }
            position={iconPositions[iconConfig.id]}
            onPositionChange={(pos) =>
              setIconPositions((prev) => ({
                ...prev,
                [iconConfig.id]: pos
              }))
            }
          />
        ))}
      </div>
    </FocusWrapper>
  );
}

export default IconGrid;
