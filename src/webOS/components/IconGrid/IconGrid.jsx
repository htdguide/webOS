import React, { useState, useContext, useEffect, useRef } from 'react';
import { useDraggableWindow } from '../../components/DraggableWindow/DraggableWindowWrap.jsx';
import { AppsContext } from '../../contexts/AppsContext/AppsContext.jsx';
import DesktopIcon from '../DesktopIcon/DesktopIcon.jsx';
import { useStateManager } from '../../stores/StateManager/StateManager';
import { useLogger } from '../Logger/Logger.jsx';
import './IconGrid.css';
import { FocusWrapper } from '../../contexts/FocusControl/FocusControl.jsx';

function IconGrid({ onOpenApp }) {
  const { wrapId } = useDraggableWindow();
  const { apps } = useContext(AppsContext);
  const { log, enabled } = useLogger(`IconGrid[${wrapId}]`);
  const desktopApps = apps.filter((cfg) => !cfg.indock);

  const { state } = useStateManager();
  const desktopCfg = state.groups.desktop;

  // sizing & grid
  const gridGap    = parseInt(desktopCfg.gridGap,    10) || 30;
  const iconWidth  = parseInt(desktopCfg.iconWidth,  10) || 64;
  const iconHeight = parseInt(desktopCfg.iconHeight, 10) || 64;
  const gridSize   = iconHeight;
  const cellSize   = gridSize + gridGap;

  // margins
  const topMargin    = parseInt(desktopCfg.topMargin,    10) || 40;
  const leftMargin   = parseInt(desktopCfg.leftMargin,   10) || 20;
  const rightMargin  = parseInt(desktopCfg.rightMargin,  10) || 20;
  const bottomMargin = parseInt(desktopCfg.bottomMargin, 10) || 100;

  // keep each icon’s grid coords
  const primaryGridRef = useRef(
    desktopApps.reduce((map, cfg) => {
      const priority = cfg.priority > 0 ? cfg.priority : 1;
      map[cfg.id] = { col: 0, row: priority - 1 };
      return map;
    }, {})
  );

  // compute pixel positions from grid coords
  const computePositions = () => {
    const p = {};
    for (const [id, { col, row }] of Object.entries(primaryGridRef.current)) {
      p[id] = {
        x: leftMargin + col * cellSize,
        y: topMargin  + row * cellSize
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

  // selection-box
  const [selectionBox, setSelectionBox] = useState(null);

  // group-drag snapshots
  const groupOriginalPositionsRef = useRef({});
  const groupOriginalGridCoordsRef = useRef({});

  const containerRef = useRef(null);

  // Helper: BFS to find nearest free grid cell
  const findNearestFreeCell = (startCol, startRow, occupied, maxCols, maxRows) => {
    const queue = [{ col: startCol, row: startRow }];
    const seen = new Set();
    while (queue.length) {
      const { col, row } = queue.shift();
      const key = `${col},${row}`;
      if (col < 0 || col > maxCols || row < 0 || row > maxRows) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      if (!occupied.has(key)) {
        return { col, row };
      }
      queue.push({ col: col + 1, row });
      queue.push({ col: col - 1, row });
      queue.push({ col, row: row + 1 });
      queue.push({ col, row: row - 1 });
    }
    // fallback
    return { col: 0, row: 0 };
  };

  // ── Handlers ─────────────────────────────────────────────────────

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

  // selection-box logic
  const handleSelectionMouseDown = (e) => {
    if (e.button !== 0) return;
    const startX = e.clientX, startY = e.clientY;
    setSelectionBox({ x: startX, y: startY, width: 0, height: 0 });

    const onMouseMove = (mv) => {
      const cx = mv.clientX, cy = mv.clientY;
      setSelectionBox({
        x: Math.min(startX, cx),
        y: Math.min(startY, cy),
        width: Math.abs(cx - startX),
        height: Math.abs(cy - startY)
      });
    };

    const onMouseUp = (up) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

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

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // single-icon drag → snaps grid coords, prevents overlap
  const handlePositionChange = (id, pos) => {
    const orig = primaryGridRef.current[id];
    const targetCol = Math.round((pos.x - leftMargin) / cellSize);
    const targetRow = Math.round((pos.y - topMargin)  / cellSize);

    const collision = Object.entries(primaryGridRef.current).some(
      ([otherId, { col, row }]) =>
        otherId !== id && col === targetCol && row === targetRow
    );

    if (collision) {
      // revert
      setIconPositions((prev) => ({
        ...prev,
        [id]: {
          x: leftMargin + orig.col * cellSize,
          y: topMargin  + orig.row * cellSize
        }
      }));
    } else {
      // commit
      primaryGridRef.current[id] = { col: targetCol, row: targetRow };
      setIconPositions((prev) => ({
        ...prev,
        [id]: {
          x: leftMargin + targetCol * cellSize,
          y: topMargin  + targetRow * cellSize
        }
      }));
    }
  };

  // group-drag logic → snaps, prevents overlap
  const handleGroupMouseDown = (e, id) => {
    if (selectedIcons.length <= 1) return;
    e.preventDefault();

    const startX = e.clientX, startY = e.clientY;
    groupOriginalPositionsRef.current = {};
    groupOriginalGridCoordsRef.current = {};

    selectedIcons.forEach((sid) => {
      groupOriginalPositionsRef.current[sid] = {
        ...iconPositionsRef.current[sid]
      };
      groupOriginalGridCoordsRef.current[sid] = {
        ...primaryGridRef.current[sid]
      };
    });

    const { width, height } = containerRef.current.getBoundingClientRect();
    const maxX = width  - rightMargin  - gridSize;
    const maxY = height - bottomMargin - gridSize;

    const onMove = (mv) => {
      mv.preventDefault();
      const cx = mv.touches ? mv.touches[0].clientX : mv.clientX;
      const cy = mv.touches ? mv.touches[0].clientY : mv.clientY;
      const dx = cx - startX, dy = cy - startY;

      selectedIcons.forEach((sid) => {
        const orig = groupOriginalPositionsRef.current[sid];
        let nx = orig.x + dx, ny = orig.y + dy;
        nx = Math.max(leftMargin, Math.min(maxX, nx));
        ny = Math.max(topMargin,  Math.min(maxY, ny));
        const el = document.getElementById(`desktop-icon-${wrapId}-${sid}`);
        if (el) {
          el.style.transition = 'none';
          el.style.left      = `${nx}px`;
          el.style.top       = `${ny}px`;
        }
      });
    };

    const onEnd = (upEvt) => {
      setSuppressIconClick(true);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);

      const cx = upEvt.changedTouches
        ? upEvt.changedTouches[0].clientX
        : upEvt.clientX;
      const cy = upEvt.changedTouches
        ? upEvt.changedTouches[0].clientY
        : upEvt.clientY;
      const dx = cx - startX, dy = cy - startY;

      // occupancy of non-selected icons
      const occupied = new Set();
      desktopApps.forEach((cfg) => {
        if (!selectedIcons.includes(cfg.id)) {
          const { col, row } = primaryGridRef.current[cfg.id];
          occupied.add(`${col},${row}`);
        }
      });

      const { clientWidth: cw, clientHeight: ch } = containerRef.current;
      const maxCols = Math.floor((cw - leftMargin - rightMargin) / cellSize);
      const maxRows = Math.floor((ch - topMargin - bottomMargin) / cellSize);

      selectedIcons.forEach((sid) => {
        const origPos  = groupOriginalPositionsRef.current[sid];
        const origGrid = groupOriginalGridCoordsRef.current[sid];
        const movedX = origPos.x + dx;
        const movedY = origPos.y + dy;
        let col = Math.round((movedX - leftMargin) / cellSize);
        let row = Math.round((movedY - topMargin)  / cellSize);

        // clamp
        col = Math.max(0, Math.min(col, maxCols));
        row = Math.max(0, Math.min(row, maxRows));

        // collision
        let key = `${col},${row}`;
        if (occupied.has(key)) {
          const free = findNearestFreeCell(col, row, occupied, maxCols, maxRows);
          col = free.col;
          row = free.row;
          key = `${col},${row}`;
        }
        occupied.add(key);

        primaryGridRef.current[sid] = { col, row };
        const fx = leftMargin + col * cellSize;
        const fy = topMargin  + row * cellSize;
        const el = document.getElementById(`desktop-icon-${wrapId}-${sid}`);
        if (el) {
          el.style.transition = 'left 0.2s ease, top 0.2s ease';
          void el.offsetWidth;
          el.style.left = `${fx}px`;
          el.style.top  = `${fy}px`;
          const onTrans = () => {
            el.removeEventListener('transitionend', onTrans);
            setIconPositions((prev) => ({
              ...prev,
              [sid]: { x: fx, y: fy }
            }));
          };
          el.addEventListener('transitionend', onTrans);
        }
      });
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  };

  // ── Recompute on resize ──────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { clientWidth: width, clientHeight: height } = containerRef.current;
      const maxCols = Math.floor((width - leftMargin - rightMargin) / cellSize);
      const maxRows = Math.floor((height - topMargin - bottomMargin) / cellSize);

      // occupied set for in-bounds
      const occupied = new Set();
      const outOfBounds = [];
      Object.entries(primaryGridRef.current).forEach(([id, { col, row }]) => {
        if (col >= 0 && col <= maxCols && row >= 0 && row <= maxRows) {
          occupied.add(`${col},${row}`);
        } else {
          outOfBounds.push([id, { col, row }]);
        }
      });

      const newPositions = {};
      // in-bounds
      Object.entries(primaryGridRef.current).forEach(([id, { col, row }]) => {
        if (occupied.has(`${col},${row}`)) {
          newPositions[id] = {
            x: leftMargin + col * cellSize,
            y: topMargin  + row * cellSize
          };
        }
      });

      // clamp OOB
      outOfBounds.forEach(([id, { col, row }]) => {
        const clampCol = Math.max(0, Math.min(col, maxCols));
        const clampRow = Math.max(0, Math.min(row, maxRows));
        const free = findNearestFreeCell(clampCol, clampRow, occupied, maxCols, maxRows);
        occupied.add(`${free.col},${free.row}`);
        newPositions[id] = {
          x: leftMargin + free.col * cellSize,
          y: topMargin  + free.row * cellSize
        };
      });

      setIconPositions(newPositions);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [
    gridGap, gridSize,
    topMargin, leftMargin, rightMargin, bottomMargin,
    wrapId
  ]);

  if (enabled) log('render', `Rendering ${desktopApps.length} icons in wrap ${wrapId}`);

  return (
    <FocusWrapper key={wrapId} name={`IconGrid-${wrapId}`}>
      <div
        id={`icon-grid-container-${wrapId}`}
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
            key={`${wrapId}-${cfg.id}`}
            wrapId={wrapId}
            id={cfg.id}
            name={cfg.name}
            icon={cfg.icon}
            available={cfg.available}              
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
