// src/components/IconGrid/IconGrid.jsx

import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppsContext } from '../../contexts/AppsContext/AppsContext.jsx';
import DesktopIcon from '../DesktopIcon/DesktopIcon.jsx';
import {
  GRID_GAP,
  TOP_MARGIN,
  LEFT_MARGIN,
  RIGHT_MARGIN,
  BOTTOM_MARGIN,
  GRID_SIZE,
  ICON_WIDTH,
  ICON_HEIGHT,
  HOLD_THRESHOLD
} from '../../configs/DesktopIconConfig/DesktopIconConfig.jsx';
import './IconGrid.css';
import { FocusWrapper } from '../../contexts/FocusControl/FocusControl.jsx';
import { useLogger } from '../Logger/Logger.jsx';

/** Compute default (x,y) from priority */
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
  const { log, enabled } = useLogger('IconGrid');
  const desktopApps = apps.filter((cfg) => !cfg.indock);

  // 1) Primary positions (only updated by drag)
  const primaryPositionsRef = useRef(
    desktopApps.reduce((map, cfg) => {
      map[cfg.id] = getPositionFromPriority(cfg.priority);
      return map;
    }, {})
  );

  // 2) Rendered positions
  const [iconPositions, setIconPositions] = useState(
    primaryPositionsRef.current
  );
  const iconPositionsRef = useRef(iconPositions);
  useEffect(() => {
    iconPositionsRef.current = iconPositions;
  }, [iconPositions]);

  // 3) Selection state
  const [selectedIcons, setSelectedIcons] = useState([]);
  const suppressNextClickRef = useRef(false);
  const [suppressIconClick, setSuppressIconClick] = useState(false);

  // 4) Drag‐select box
  const [selectionBox, setSelectionBox] = useState(null);

  // 5) Group‐drag helpers
  const groupOriginalPositionsRef = useRef({});
  const groupHoldTimerRef = useRef(null);

  const containerRef = useRef(null);

  const handleWallpaperClick = () => {
    if (enabled) log('userInteraction', 'Wallpaper clicked → deselect all');
    setSelectedIcons([]);
  };

  const handleIconClick = (id) => {
    if (enabled) log('userInteraction', `Icon clicked → select ${id}`);
    setSelectedIcons([id]);
  };

  const handleIconDoubleClick = (id) => {
    if (enabled) log('userInteraction', `Icon dbl-click → open ${id}`);
    onOpenApp(id);
  };

  // ───────────────────────────────────────────────────────────────────────
  // Draw translucent selection box, then on mouse‐up pick all overlapping icons
  // ───────────────────────────────────────────────────────────────────────
  const handleSelectionMouseDown = (e) => {
    if (e.button !== 0) return; // left button only

    const startX = e.clientX;
    const startY = e.clientY;
    setSelectionBox({ x: startX, y: startY, width: 0, height: 0 });

    const handleMouseMove = (mv) => {
      const cx = mv.clientX;
      const cy = mv.clientY;
      setSelectionBox({
        x: Math.min(startX, cx),
        y: Math.min(startY, cy),
        width: Math.abs(cx - startX),
        height: Math.abs(cy - startY)
      });
    };

    const handleMouseUp = (up) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      const endX = up.clientX;
      const endY = up.clientY;
      const rectX = Math.min(startX, endX);
      const rectY = Math.min(startY, endY);
      const rectW = Math.abs(endX - startX);
      const rectH = Math.abs(endY - startY);

      // Pixel‐based hit test
      const hits = desktopApps
        .filter((cfg) => {
          const pos = iconPositionsRef.current[cfg.id];
          return (
            rectX < pos.x + ICON_WIDTH &&
            rectX + rectW > pos.x &&
            rectY < pos.y + ICON_HEIGHT &&
            rectY + rectH > pos.y
          );
        })
        .map((cfg) => cfg.id);

      if (enabled) log('userInteraction', `Selected icons: [${hits.join(', ')}]`);
      setSelectedIcons(hits);
      setSelectionBox(null);

      // Prevent this mouse‐up from immediately deselecting
      suppressNextClickRef.current = true;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // ───────────────────────────────────────────────────────────────────────
  // Hold on any selected icon → group‐drag all of them
  // ───────────────────────────────────────────────────────────────────────
  const handleGroupMouseDown = (e, id) => {
    if (selectedIcons.length <= 1) return;
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;

    // Snapshot originals
    groupOriginalPositionsRef.current = {};
    selectedIcons.forEach((sid) => {
      groupOriginalPositionsRef.current[sid] = {
        ...iconPositionsRef.current[sid]
      };
    });

    // Cancel if moved/up too early
    if (groupHoldTimerRef.current) clearTimeout(groupHoldTimerRef.current);
    const cancelHold = () => {
      clearTimeout(groupHoldTimerRef.current);
      window.removeEventListener('mousemove', cancelHold);
      window.removeEventListener('mouseup', cancelHold);
    };
    window.addEventListener('mousemove', cancelHold);
    window.addEventListener('mouseup', cancelHold);

    // Start hold timer
    groupHoldTimerRef.current = setTimeout(() => {
      window.removeEventListener('mousemove', cancelHold);
      window.removeEventListener('mouseup', cancelHold);

      const { width, height } = containerRef.current.getBoundingClientRect();
      const cell = GRID_SIZE + GRID_GAP;
      const maxX = width - RIGHT_MARGIN - GRID_SIZE;
      const maxY = height - BOTTOM_MARGIN - GRID_SIZE;

      const handleMove = (mv) => {
        mv.preventDefault();
        const cx = mv.touches ? mv.touches[0].clientX : mv.clientX;
        const cy = mv.touches ? mv.touches[0].clientY : mv.clientY;
        const dx = cx - startX;
        const dy = cy - startY;

        selectedIcons.forEach((sid) => {
          const orig = groupOriginalPositionsRef.current[sid];
          let nx = orig.x + dx;
          let ny = orig.y + dy;
          nx = Math.max(LEFT_MARGIN, Math.min(maxX, nx));
          ny = Math.max(TOP_MARGIN, Math.min(maxY, ny));
          const el = document.getElementById(`desktop-icon-${sid}`);
          if (el) {
            el.style.transition = 'none';
            el.style.left = `${nx}px`;
            el.style.top = `${ny}px`;
          }
        });
      };

      const handleEnd = (upEvt) => {
        // Keep the whole group selected afterwards
        setSuppressIconClick(true);

        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);

        const cx = upEvt.changedTouches
          ? upEvt.changedTouches[0].clientX
          : upEvt.clientX;
        const cy = upEvt.changedTouches
          ? upEvt.changedTouches[0].clientY
          : upEvt.clientY;
        const dx = cx - startX;
        const dy = cy - startY;
        const cellSize = GRID_SIZE + GRID_GAP;

        selectedIcons.forEach((sid) => {
          const orig = groupOriginalPositionsRef.current[sid];
          const movedX = orig.x + dx;
          const movedY = orig.y + dy;
          const snappedX =
            LEFT_MARGIN +
            Math.round((movedX - LEFT_MARGIN) / cellSize) * cellSize;
          const snappedY =
            TOP_MARGIN +
            Math.round((movedY - TOP_MARGIN) / cellSize) * cellSize;
          const fx = Math.max(LEFT_MARGIN, Math.min(maxX, snappedX));
          const fy = Math.max(TOP_MARGIN, Math.min(maxY, snappedY));

          const el = document.getElementById(`desktop-icon-${sid}`);
          if (el) {
            el.style.transition = 'left 0.2s ease, top 0.2s ease';
            el.offsetWidth; // force reflow
            el.style.left = `${fx}px`;
            el.style.top = `${fy}px`;
            const onTrans = () => {
              el.removeEventListener('transitionend', onTrans);
              primaryPositionsRef.current[sid] = { x: fx, y: fy };
              setIconPositions((prev) => ({
                ...prev,
                [sid]: { x: fx, y: fy }
              }));
            };
            el.addEventListener('transitionend', onTrans);
          }
        });
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }, HOLD_THRESHOLD);
  };

  // ───────────────────────────────────────────────────────────────────────
  // Auto-rearrange on resize (restores icons into visible grid cells)
  // ───────────────────────────────────────────────────────────────────────
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

      // A) Keep primaries in-view
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

      // B) Slot off-screen onto first free cell
      desktopApps.forEach((cfg) => {
        const id = cfg.id;
        if (newPositions[id]) return;
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

      // C) Anything else back to its primary
      desktopApps.forEach((cfg) => {
        const id = cfg.id;
        if (!newPositions[id]) {
          newPositions[id] = { ...primaryPositionsRef.current[id] };
        }
      });

      // D) Commit
      setIconPositions(() => newPositions);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // on mount
    return () => window.removeEventListener('resize', handleResize);
  }, []); // no iconPositions dependency

  if (enabled) log('render', `Rendering ${desktopApps.length} icons`);

  return (
    <FocusWrapper name="IconGrid">
      <div
        ref={containerRef}
        className="desktop-content"
        onClick={(e) => {
          if (suppressNextClickRef.current) {
            suppressNextClickRef.current = false;
            return;
          }
          handleWallpaperClick();
        }}
        onMouseDown={(e) => {
          if (e.target === containerRef.current) {
            handleSelectionMouseDown(e);
          }
        }}
      >
        {desktopApps.map((cfg) => (
          <DesktopIcon
            key={cfg.id}
            id={cfg.id}
            name={cfg.name}
            icon={cfg.icon}
            isSelected={selectedIcons.includes(cfg.id)}
            selectedCount={selectedIcons.length}
            onClick={() => handleIconClick(cfg.id)}
            onDoubleClick={() => handleIconDoubleClick(cfg.id)}
            onGroupMouseDown={(e) => handleGroupMouseDown(e, cfg.id)}
            disableClick={suppressIconClick}
            clearDisableClick={() => setSuppressIconClick(false)}
            position={iconPositions[cfg.id]}
            onPositionChange={(pos) => {
              primaryPositionsRef.current[cfg.id] = pos;
              setIconPositions((prev) => ({
                ...prev,
                [cfg.id]: pos
              }));
            }}
          />
        ))}
        {selectionBox && (
          <div
            className="selection-rectangle"
            style={{
              left: selectionBox.x,
              top: selectionBox.y,
              width: selectionBox.width,
              height: selectionBox.height
            }}
          />
        )}
      </div>
    </FocusWrapper>
  );
}

export default IconGrid;
