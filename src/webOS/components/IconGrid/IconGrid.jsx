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
  GRID_SIZE,
  ICON_WIDTH,
  ICON_HEIGHT,
  HOLD_THRESHOLD
} from "../../configs/DesktopIconConfig/DesktopIconConfig.jsx";
import "./IconGrid.css";
import { FocusWrapper } from "../../contexts/FocusControl/FocusControl.jsx";
import { useLogger } from "../Logger/Logger.jsx";

/** Compute (x,y) from priority */
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

  // Primary positions (only updated by drag)
  const primaryPositionsRef = useRef(
    desktopApps.reduce((map, cfg) => {
      map[cfg.id] = getPositionFromPriority(cfg.priority);
      return map;
    }, {})
  );

  // Actual rendered positions
  const [iconPositions, setIconPositions] = useState(
    primaryPositionsRef.current
  );
  const iconPositionsRef = useRef(iconPositions);
  useEffect(() => {
    iconPositionsRef.current = iconPositions;
  }, [iconPositions]);

  // Which icons are selected
  const [selectedIcons, setSelectedIcons] = useState([]);
  // Prevent the *very next* background-click from clearing selection
  const suppressNextClickRef = useRef(false);
  // Prevent the *next* single-icon click after a group drag
  const [suppressIconClick, setSuppressIconClick] = useState(false);

  // Rectangle during drag-select
  const [selectionBox, setSelectionBox] = useState(null);

  // For group-drag snapshots
  const groupOriginalPositionsRef = useRef({});
  const groupHoldTimerRef = useRef(null);

  const containerRef = useRef(null);

  const handleWallpaperClick = () => {
    if (enabled) log("userInteraction", "Wallpaper clicked → deselect all");
    setSelectedIcons([]);
  };
  const handleIconClick = (id) => {
    if (enabled) log("userInteraction", `Icon clicked → select ${id}`);
    setSelectedIcons([id]);
  };
  const handleIconDoubleClick = (id) => {
    if (enabled) log("userInteraction", `Icon dbl-click → open ${id}`);
    onOpenApp(id);
  };

  // ───────────────────────────────────────────────────────────────────────
  // Draw translucent box, then on mouseup pick all overlapping icons
  // ───────────────────────────────────────────────────────────────────────
  const handleSelectionMouseDown = (e) => {
    if (e.button !== 0) return;
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
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      const endX = up.clientX;
      const endY = up.clientY;
      const rectX = Math.min(startX, endX);
      const rectY = Math.min(startY, endY);
      const rectW = Math.abs(endX - startX);
      const rectH = Math.abs(endY - startY);

      // Pixel-based hit-test
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

      if (enabled)
        log("userInteraction", `Selected icons: [${hits.join(", ")}]`);
      setSelectedIcons(hits);
      setSelectionBox(null);

      // don’t immediately clear them
      suppressNextClickRef.current = true;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // ───────────────────────────────────────────────────────────────────────
  // Hold on any selected icon → group-drag all of them
  // ───────────────────────────────────────────────────────────────────────
  const handleGroupMouseDown = (e, id) => {
    if (selectedIcons.length <= 1) return;
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;

    // snapshot
    groupOriginalPositionsRef.current = {};
    selectedIcons.forEach((sid) => {
      groupOriginalPositionsRef.current[sid] = {
        ...iconPositionsRef.current[sid]
      };
    });

    // cancel if user moves/up too early
    if (groupHoldTimerRef.current) clearTimeout(groupHoldTimerRef.current);
    const cancelHold = () => {
      clearTimeout(groupHoldTimerRef.current);
      window.removeEventListener("mousemove", cancelHold);
      window.removeEventListener("mouseup", cancelHold);
    };
    window.addEventListener("mousemove", cancelHold);
    window.addEventListener("mouseup", cancelHold);

    groupHoldTimerRef.current = setTimeout(() => {
      window.removeEventListener("mousemove", cancelHold);
      window.removeEventListener("mouseup", cancelHold);

      const { width, height } =
        containerRef.current.getBoundingClientRect();
      const cell = GRID_SIZE + GRID_GAP;
      const maxX = width - RIGHT_MARGIN - GRID_SIZE;
      const maxY = height - BOTTOM_MARGIN - GRID_SIZE;

      const handleMove = (mv) => {
        mv.preventDefault();
        const cx = mv.touches
          ? mv.touches[0].clientX
          : mv.clientX;
        const cy = mv.touches
          ? mv.touches[0].clientY
          : mv.clientY;
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
            el.style.transition = "none";
            el.style.left = `${nx}px`;
            el.style.top = `${ny}px`;
          }
        });
      };

      const handleEnd = (upEvt) => {
        // prevent that stray click from resetting selection
        setSuppressIconClick(true);

        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleEnd);
        window.removeEventListener("touchmove", handleMove);
        window.removeEventListener("touchend", handleEnd);

        const cx = upEvt.changedTouches
          ? upEvt.changedTouches[0].clientX
          : upEvt.clientX;
        const cy = upEvt.changedTouches
          ? upEvt.changedTouches[0].clientY
          : upEvt.clientY;
        const dx = cx - startX;
        const dy = cy - startY;

        selectedIcons.forEach((sid) => {
          const orig = groupOriginalPositionsRef.current[sid];
          const movedX = orig.x + dx;
          const movedY = orig.y + dy;
          const snappedX =
            LEFT_MARGIN +
            Math.round((movedX - LEFT_MARGIN) / cell) * cell;
          const snappedY =
            TOP_MARGIN +
            Math.round((movedY - TOP_MARGIN) / cell) * cell;
          const fx = Math.max(LEFT_MARGIN, Math.min(maxX, snappedX));
          const fy =
            Math.max(TOP_MARGIN, Math.min(maxY, snappedY));

          const el = document.getElementById(`desktop-icon-${sid}`);
          if (el) {
            el.style.transition = "left 0.2s ease, top 0.2s ease";
            el.offsetWidth; // force reflow
            el.style.left = `${fx}px`;
            el.style.top = `${fy}px`;

            const onTrans = () => {
              el.removeEventListener("transitionend", onTrans);
              primaryPositionsRef.current[sid] = { x: fx, y: fy };
              setIconPositions((prev) => ({
                ...prev,
                [sid]: { x: fx, y: fy }
              }));
            };
            el.addEventListener("transitionend", onTrans);
          }
        });
      };

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleMove, {
        passive: false
      });
      window.addEventListener("touchend", handleEnd);
    }, HOLD_THRESHOLD);
  };

  // your existing resize logic here…
  useEffect(() => {
    const handleResize = () => {
      /* … */
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (enabled) log("render", `Rendering ${desktopApps.length} icons`);

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
            onGroupMouseDown={(e) =>
              handleGroupMouseDown(e, cfg.id)
            }
            disableClick={suppressIconClick}
            clearDisableClick={() =>
              setSuppressIconClick(false)
            }
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
