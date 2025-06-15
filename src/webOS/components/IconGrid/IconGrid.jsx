// src/components/IconGrid/IconGrid.jsx

import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppsContext } from '../../contexts/AppsContext/AppsContext.jsx';
import DesktopIcon from '../DesktopIcon/DesktopIcon.jsx';
import { useStateManager } from '../../stores/StateManager/StateManager';
import {
  TOP_MARGIN,
  LEFT_MARGIN,
  RIGHT_MARGIN,
  BOTTOM_MARGIN,
  HOLD_THRESHOLD  // still imported but unused for groups
} from '../../configs/DesktopIconConfig/DesktopIconConfig.jsx';
import './IconGrid.css';
import { FocusWrapper } from '../../contexts/FocusControl/FocusControl.jsx';
import { useLogger } from '../Logger/Logger.jsx';

function IconGrid({ onOpenApp }) {
  const { apps } = useContext(AppsContext);
  const { log, enabled } = useLogger('IconGrid');
  const desktopApps = apps.filter((cfg) => !cfg.indock);

  // dynamic config
  const { state } = useStateManager();
  const desktopCfg = state.groups.desktop;
  const gridGap = parseInt(desktopCfg.gridGap, 10) || 30;
  const iconWidth = parseInt(desktopCfg.iconWidth, 10) || 64;
  const iconHeight = parseInt(desktopCfg.iconHeight, 10) || 64;
  const gridSize = iconHeight;
  const cellSize = gridSize + gridGap;

  // keep each icon’s grid coords
  const primaryGridRef = useRef(
    desktopApps.reduce((map, cfg) => {
      const priority = cfg.priority > 0 ? cfg.priority : 1;
      map[cfg.id] = { col: 0, row: priority - 1 };
      return map;
    }, {})
  );

  // compute pixel positions
  const computePositions = () => {
    const p = {};
    for (const [id, { col, row }] of Object.entries(primaryGridRef.current)) {
      p[id] = {
        x: LEFT_MARGIN + col * cellSize,
        y: TOP_MARGIN  + row * cellSize
      };
    }
    return p;
  };

  const [iconPositions, setIconPositions] = useState(computePositions());
  const iconPositionsRef = useRef(iconPositions);
  useEffect(() => { iconPositionsRef.current = iconPositions }, [iconPositions]);

  // selection state
  const [selectedIcons, setSelectedIcons] = useState([]);
  const suppressNextClickRef = useRef(false);
  const [suppressIconClick, setSuppressIconClick] = useState(false);

  // selection‐box
  const [selectionBox, setSelectionBox] = useState(null);

  // group‐drag snapshots
  const groupOriginalPositionsRef = useRef({});

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

  // ── Selection‐box logic ────────────────────────────────────────────
  const handleSelectionMouseDown = (e) => {
    if (e.button !== 0) return;
    const startX = e.clientX, startY = e.clientY;
    setSelectionBox({ x: startX, y: startY, width: 0, height: 0 });

    const handleMouseMove = (mv) => {
      const cx = mv.clientX, cy = mv.clientY;
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

      const endX = up.clientX, endY = up.clientY;
      const rectX = Math.min(startX, endX),
            rectY = Math.min(startY, endY),
            rectW = Math.abs(endX - startX),
            rectH = Math.abs(endY - startY);

      const hits = desktopApps
        .filter((cfg) => {
          const pos = iconPositionsRef.current[cfg.id];
          return (
            rectX < pos.x + iconWidth &&
            rectX + rectW > pos.x &&
            rectY < pos.y + iconHeight &&
            rectY + rectH > pos.y
          );
        })
        .map((cfg) => cfg.id);

      if (enabled) log('userInteraction', `Selected icons: [${hits.join(', ')}]`);
      setSelectedIcons(hits);
      setSelectionBox(null);
      suppressNextClickRef.current = true;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // ── Single-icon drag → snaps grid coords ─────────────────────────
  const handlePositionChange = (id, pos) => {
    const col = Math.round((pos.x - LEFT_MARGIN) / cellSize);
    const row = Math.round((pos.y - TOP_MARGIN)  / cellSize);
    primaryGridRef.current[id] = { col, row };
    const newPos = {
      x: LEFT_MARGIN + col * cellSize,
      y: TOP_MARGIN  + row * cellSize
    };
    setIconPositions((prev) => ({ ...prev, [id]: newPos }));
  };

  // ── Group‐drag logic → starts immediately for multiple selection ──
  const handleGroupMouseDown = (e, id) => {
    if (selectedIcons.length <= 1) return;
    e.preventDefault();

    // snapshot start positions
    const startX = e.clientX, startY = e.clientY;
    groupOriginalPositionsRef.current = {};
    selectedIcons.forEach((sid) => {
      groupOriginalPositionsRef.current[sid] = {
        ...iconPositionsRef.current[sid]
      };
    });

    // container bounds
    const { width, height } = containerRef.current.getBoundingClientRect();
    const maxX = width  - RIGHT_MARGIN  - gridSize;
    const maxY = height - BOTTOM_MARGIN - gridSize;

    // drag handler
    const handleMove = (mv) => {
      mv.preventDefault();
      const cx = mv.touches ? mv.touches[0].clientX : mv.clientX;
      const cy = mv.touches ? mv.touches[0].clientY : mv.clientY;
      const dx = cx - startX, dy = cy - startY;

      selectedIcons.forEach((sid) => {
        const orig = groupOriginalPositionsRef.current[sid];
        let nx = orig.x + dx, ny = orig.y + dy;
        nx = Math.max(LEFT_MARGIN, Math.min(maxX, nx));
        ny = Math.max(TOP_MARGIN,  Math.min(maxY, ny));
        const el = document.getElementById(`desktop-icon-${sid}`);
        if (el) {
          el.style.transition = 'none';
          el.style.left      = `${nx}px`;
          el.style.top       = `${ny}px`;
        }
      });
    };

    // drop/snapping
    const handleEnd = (upEvt) => {
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
      const dx = cx - startX, dy = cy - startY;

      selectedIcons.forEach((sid) => {
        const orig = groupOriginalPositionsRef.current[sid];
        const movedX = orig.x + dx;
        const movedY = orig.y + dy;
        // compute grid cell
        const col = Math.round((movedX - LEFT_MARGIN) / cellSize);
        const row = Math.round((movedY - TOP_MARGIN)  / cellSize);
        // clamp into bounds
        const maxCols = Math.floor((containerRef.current.clientWidth  - LEFT_MARGIN - RIGHT_MARGIN)  / cellSize);
        const maxRows = Math.floor((containerRef.current.clientHeight - TOP_MARGIN  - BOTTOM_MARGIN) / cellSize);
        const fx = LEFT_MARGIN + Math.max(0, Math.min(col, maxCols)) * cellSize;
        const fy = TOP_MARGIN  + Math.max(0, Math.min(row, maxRows)) * cellSize;

        const el = document.getElementById(`desktop-icon-${sid}`);
        if (el) {
          el.style.transition = 'left 0.2s ease, top 0.2s ease';
          void el.offsetWidth;
          el.style.left = `${fx}px`;
          el.style.top  = `${fy}px`;

          const onTrans = () => {
            el.removeEventListener('transitionend', onTrans);
            primaryGridRef.current[sid] = {
              col: Math.round((fx - LEFT_MARGIN) / cellSize),
              row: Math.round((fy - TOP_MARGIN)  / cellSize)
            };
            setIconPositions((prev) => ({
              ...prev,
              [sid]: { x: fx, y: fy }
            }));
          };
          el.addEventListener('transitionend', onTrans);
        }
      });
    };

    // start dragging right away
    window.addEventListener('mousemove',    handleMove);
    window.addEventListener('mouseup',      handleEnd);
    window.addEventListener('touchmove',    handleMove, { passive: false });
    window.addEventListener('touchend',     handleEnd);
  };

  // ── Recompute pixel positions on resize ───────────────────────────
  useEffect(() => {
    const handleResize = () => {
      setIconPositions(computePositions());
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [gridGap, gridSize]);

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
            onPositionChange={(pos) => handlePositionChange(cfg.id, pos)}
          />
        ))}
        {selectionBox && (
          <div
            className="selection-rectangle"
            style={{
              left:   selectionBox.x,
              top:    selectionBox.y,
              width:  selectionBox.width,
              height: selectionBox.height
            }}
          />
        )}
      </div>
    </FocusWrapper>
  );
}

export default IconGrid;
