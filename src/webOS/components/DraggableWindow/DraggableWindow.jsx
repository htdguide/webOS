/**
 * DraggableWindow.jsx defines a window component that can be dragged, resized,
 * focused, and toggled fullscreen. Windows smoothly scale up when entering
 * fullscreen, and siblings slide out of view to the left.
 *
 * Areas:
 * 1: Imports & Constants (1.1, 1.2)
 * 2: Component Definition & Hooks (2.1 … 2.6)
 * 3: Effects & Handlers (3.1 … 3.7)
 * 4: Imperative API (4.1)
 * 5: Render, Dynamic Z-Index & Fullscreen Sliding (5.1 … 5.7)
 */

// ================================
// Area 1: Imports & Constants
// ================================
// 1.1: Import dependencies
import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useContext,
} from 'react';
import useDraggable from '../../interactions/useDraggable/useDraggable.jsx';
import './DraggableWindow.css';
import { useLogger } from '../Logger/Logger.jsx';
import { useFocus } from '../../contexts/FocusControl/FocusControl.jsx';
import { FullscreenSpace } from '../FullScreenSpace/FullScreenSpace.jsx';
import { useStateManager } from '../../stores/StateManager/StateManager.jsx';

// 1.2: Define corner handles for resizing
const CORNER_HANDLES = ['br', 'tr', 'bl', 'tl'];


// ===================================
// Area 2: Component Definition & Hooks
// ===================================
// 2.1: Define DraggableWindow as forwardRef
const DraggableWindow = forwardRef(
  (
    { wrapId, windowId, title,
      windowWidth, windowHeight,
      minWindowWidth, minWindowHeight,
      maxWindowWidth, maxWindowHeight,
      onClose, onMount, onUnmount, onResize,
      initialX, initialY, iframeSrc, children },
    ref
  ) => {
    // 2.2: Logging and focus tracking
    const { enabled } = useLogger(`DraggableWindow [wrap:${wrapId}]`);
    const { focusedComponent, updateFocus } = useFocus();
    const isFocused = focusedComponent === windowId;

    // 2.3: Fullscreen context — compare against this windowId
    const {
      isFullscreen,
      fullscreenWindowId,
      enterFullscreen,
      exitFullscreen,
    } = useContext(FullscreenSpace);
    const isThisFullscreen = isFullscreen && fullscreenWindowId === windowId;

    // 2.4: StateManager hook for dock visibility
    const { editStateValue } = useStateManager();

    // 2.5: Refs & local size/position state
    const windowRef = useRef(null);
    const iframeRef = useRef(null);
    const parseCoord = (val, def) =>
      val == null
        ? def
        : typeof val === 'number'
        ? val
        : parseInt(val, 10) || def;
    const [currentWidth, setCurrentWidth] = useState(windowWidth);
    const [currentHeight, setCurrentHeight] = useState(windowHeight);
    const [currentX, setCurrentX] = useState(parseCoord(initialX, 8));
    const [currentY, setCurrentY] = useState(
      Math.max(parseCoord(initialY, 10), 34)
    );
    const [isUserDragging, setIsUserDragging] = useState(false);
    const [isUserResizing, setIsUserResizing] = useState(false);
    const [activeResizeHandle, setActiveResizeHandle] = useState(null);
    const [scaleTransform, setScaleTransform] = useState({
      tx: 0, ty: 0, sx: 1, sy: 1,
    });

    // 2.6: Detect when another window (sibling) is fullscreen
    const isOtherFullscreen = isFullscreen && fullscreenWindowId !== windowId;


    // ================================
    // Area 3: Effects & Handlers
    // ================================
    // 3.1: Stop drag/resize when mouse/touch ends
    useEffect(() => {
      const up = () => {
        setIsUserDragging(false);
        setIsUserResizing(false);
        setActiveResizeHandle(null);
      };
      window.addEventListener('mouseup', up);
      window.addEventListener('touchend', up);
      return () => {
        window.removeEventListener('mouseup', up);
        window.removeEventListener('touchend', up);
      };
    }, []);

    // 3.2: Sync size when props change
    useEffect(() => {
      setCurrentWidth(windowWidth);
      setCurrentHeight(windowHeight);
    }, [windowWidth, windowHeight]);

    // 3.3: Hook in draggable/resizable lib
    useDraggable(
      windowRef,
      {
        width: currentWidth,
        height: currentHeight,
        minWidth: minWindowWidth,
        minHeight: minWindowHeight,
        maxWidth: maxWindowWidth,
        maxHeight: maxWindowHeight,
      },
      (w, h) => onResize?.(w, h),
      onUnmount
    );

    // 3.4: On mount → focus + callbacks
    useEffect(() => {
      updateFocus(windowId);
      onMount?.();
      return () => onUnmount?.();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 3.5: Reset transform after exiting fullscreen
    useEffect(() => {
      if (!isThisFullscreen) {
        setTimeout(
          () => setScaleTransform({ tx: 0, ty: 0, sx: 1, sy: 1 }),
          500
        );
      }
    }, [isThisFullscreen]);

    // 3.6: Restore iframe focus when this window is focused
    useEffect(() => {
      if (isFocused && iframeSrc && iframeRef.current) {
        setTimeout(() => {
          try {
            const win = iframeRef.current.contentWindow;
            const canvas = win?.document.getElementById('canvas');
            if (canvas) canvas.focus();
            else win?.focus();
          } catch {
            iframeRef.current.focus();
          }
        }, 0);
      }
    }, [isFocused, iframeSrc, windowId]);

    // 3.7: Mark this window as focused on interaction
    const markFocused = () => updateFocus(windowId);
    const clampedY = Math.max(currentY, 26);


    // ================================
    // Area 4: Imperative API
    // ================================
    // 4.1: Expose imperative methods via ref
    useImperativeHandle(
      ref,
      () => ({
        resizeWindow: (w, h) => {
          setCurrentWidth(w);
          setCurrentHeight(h);
        },
        moveWindow: (x, y) => {
          setCurrentX(x);
          setCurrentY(Math.max(y, 26));
        },
        isFocused,
      }),
      [isFocused]
    );


    // =============================================================
    // Area 5: Render, Dynamic Z-Index & Fullscreen Sliding
    // =============================================================
    // 5.1: Compute classes & z-index
    const noTransition =
      isUserDragging ||
      (isUserResizing && CORNER_HANDLES.includes(activeResizeHandle));
    const className = [
      'draggable-window',
      isFocused && 'focused',
      isThisFullscreen && 'fullscreen',
      isOtherFullscreen && 'other-fullscreen',
      noTransition && 'no-transition',
    ]
      .filter(Boolean)
      .join(' ');
    const dynamicZ = isThisFullscreen ? 1000 : isFocused ? 101 : 100;

    // 5.2: Determine transform & transition
    const transformStyle = isThisFullscreen
      ? `translate(${scaleTransform.tx}px, ${scaleTransform.ty}px) scale(${scaleTransform.sx}, ${scaleTransform.sy})`
      : isOtherFullscreen
        ? 'translateX(-100vw)'
        : 'none';
    const transitionStyle = isOtherFullscreen
      ? 'transform 0.4s cubic-bezier(0.215, 0.61, 0.355, 1)'
      : undefined;

    return (
      <div
        ref={windowRef}
        className={className}
        style={{
          width: `${currentWidth}px`,
          height: `${currentHeight}px`,
          left: `${currentX}px`,
          top: `${clampedY}px`,
          transform: transformStyle,
          transition: transitionStyle,
          zIndex: dynamicZ,
          minWidth:
            minWindowWidth != null
              ? typeof minWindowWidth === 'number'
                ? `${minWindowWidth}px`
                : minWindowWidth
              : undefined,
          minHeight:
            minWindowHeight != null
              ? typeof minWindowHeight === 'number'
                ? `${minWindowHeight}px`
                : minWindowHeight
              : undefined,
          maxWidth:
            maxWindowWidth != null
              ? typeof maxWindowWidth === 'number'
                ? `${maxWindowWidth}px`
                : maxWindowWidth
              : undefined,
          maxHeight:
            maxWindowHeight != null
              ? typeof maxWindowHeight === 'number'
                ? `${maxWindowHeight}px`
                : maxWindowHeight
              : undefined,
        }}
        onClick={markFocused}
        onKeyDown={markFocused}
        onTouchStart={markFocused}
      >
        {/* 5.3: Header */}
        <div
          className="window-header"
          onMouseDown={() => {
            markFocused();
            setIsUserDragging(true);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            markFocused();
            setIsUserDragging(true);
          }}
        >
          <div className="header-left">
            {/* 5.4: Close button */}
            <button
              className="close-button"
              onClick={(e) => {
                e.stopPropagation();
                if (isThisFullscreen) {
                  exitFullscreen();
                  editStateValue('dock', 'dockVisible', 'true');
                }
                onClose?.();
              }}
            />
            {/* 5.5: Fullscreen toggle button */}
            <button
              className="resize-button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isThisFullscreen) {
                  const rect = windowRef.current.getBoundingClientRect();
                  const tx = -rect.left, ty = -rect.top;
                  const sx = window.innerWidth / rect.width;
                  const sy = window.innerHeight / rect.height;
                  setScaleTransform({ tx, ty, sx, sy });
                  setTimeout(() => {
                    enterFullscreen(windowId);
                    editStateValue('dock', 'dockVisible', 'false');
                  }, 0);
                } else {
                  exitFullscreen();
                  editStateValue('dock', 'dockVisible', 'true');
                }
              }}
            />
          </div>
          <div className="header-title">{title}</div>
          <div className="header-right" />
        </div>

        {/* 5.6: Content */}
        <div className="window-content">
          {iframeSrc ? (
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              title={title}
              tabIndex={0}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                pointerEvents: isUserDragging ? 'none' : 'auto',
              }}
              onMouseDown={markFocused}
            />
          ) : (
            <div className="content-inner">{children}</div>
          )}
        </div>

        {/* 5.7: ONLY render resize handles if NOT fullscreen */}
        {!isThisFullscreen &&
          ['br','tr','bl','tl','top','bottom','left','right'].map((pos) => (
            <div
              key={pos}
              className={`resize-handle resize-${pos}`}
              onMouseDown={() => {
                markFocused();
                setIsUserResizing(true);
                setActiveResizeHandle(pos);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                markFocused();
                setIsUserResizing(true);
                setActiveResizeHandle(pos);
              }}
            />
          ))}
      </div>
    );
  }
);

export default DraggableWindow;
