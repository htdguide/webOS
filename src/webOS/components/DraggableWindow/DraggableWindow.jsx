// src/components/DraggableWindow/DraggableWindow.jsx

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
import { FullscreenContext } from '../../contexts/FullScreenContext/FullScreenContext.jsx';

const DraggableWindow = forwardRef(
  (
    {
      windowId,
      title,
      windowWidth,
      windowHeight,
      minWindowWidth,
      minWindowHeight,
      maxWindowWidth,
      maxWindowHeight,
      onClose,
      onMount,
      onUnmount,
      onResize,
      initialX,
      initialY,
      iframeSrc,
      children,
    },
    ref
  ) => {
    const { log, enabled } = useLogger('DraggableWindow');
    const { focusedComponent, updateFocus } = useFocus();
    const isFocused = focusedComponent === windowId;

    // Fullscreen context
    const {
      isFullscreen,
      fullscreenWindowId,
      enterFullscreen,
      exitFullscreen,
    } = useContext(FullscreenContext);
    const isThisFullscreen = isFullscreen && fullscreenWindowId === windowId;

    // Refs
    const windowRef = useRef(null);
    const iframeRef = useRef(null);

    // State: position & size
    const parseCoord = (val, def) =>
      val === undefined ? def : typeof val === 'number' ? val : parseInt(val, 10) || def;
    const [currentWidth, setCurrentWidth] = useState(windowWidth);
    const [currentHeight, setCurrentHeight] = useState(windowHeight);
    const [currentX, setCurrentX] = useState(parseCoord(initialX, 10));
    const [currentY, setCurrentY] = useState(Math.max(parseCoord(initialY, 10), 26));

    // Mouse/touch dragging/resizing flags
    const [isUserDragging, setIsUserDragging] = useState(false);
    const [isUserResizing, setIsUserResizing] = useState(false);
    const [isProgrammaticResize, setIsProgrammaticResize] = useState(false);
    const [isProgrammaticMove, setIsProgrammaticMove] = useState(false);

    // Transform/scale for fullscreen zoom
    const [scaleTransform, setScaleTransform] = useState({
      tx: 0,
      ty: 0,
      sx: 1,
      sy: 1,
    });

    // ⇒ Clean up dragging/resizing on mouseup/touchend
    useEffect(() => {
      const up = () => {
        setIsUserDragging(false);
        setIsUserResizing(false);
      };
      window.addEventListener('mouseup', up);
      window.addEventListener('touchend', up);
      return () => {
        window.removeEventListener('mouseup', up);
        window.removeEventListener('touchend', up);
      };
    }, []);

    // ⇒ Respond to external prop changes
    useEffect(() => {
      setCurrentWidth(windowWidth);
      setCurrentHeight(windowHeight);
    }, [windowWidth, windowHeight]);

    // ⇒ Draggable / resizable hook (we still keep your resizing logic)
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

    // ⇒ Lifecycle callbacks
    useEffect(() => {
      updateFocus(windowId);
      onMount?.();
      return () => onUnmount?.();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ⇒ Expose imperative API
    useImperativeHandle(
      ref,
      () => ({
        resizeWindow: (w, h) => {
          setIsProgrammaticResize(true);
          setCurrentWidth(w);
          setCurrentHeight(h);
          setTimeout(() => setIsProgrammaticResize(false), 300);
        },
        moveWindow: (x, y) => {
          setIsProgrammaticMove(true);
          setCurrentX(x);
          setCurrentY(Math.max(y, 26));
          setTimeout(() => setIsProgrammaticMove(false), 300);
        },
        isFocused,
      }),
      [isFocused]
    );

    // ⇒ Reset transform state once we exit fullscreen
    useEffect(() => {
      if (!isThisFullscreen) {
        // give the reverse animation a moment, then zero out
        setTimeout(
          () => setScaleTransform({ tx: 0, ty: 0, sx: 1, sy: 1 }),
          500
        );
      }
    }, [isThisFullscreen]);

    // Focus restoration for iframe content
    useEffect(() => {
      if (isFocused && iframeSrc && iframeRef.current) {
        setTimeout(() => {
          try {
            const win = iframeRef.current.contentWindow;
            const canvas = win?.document.getElementById('canvas');
            canvas ? canvas.focus() : win?.focus();
          } catch {
            iframeRef.current.focus();
          }
        }, 0);
      }
    }, [isFocused, iframeSrc, windowId]);

    const markFocused = () => updateFocus(windowId);
    const clampedY = Math.max(currentY, 26);

    // Combine transitions: size/pos + transform
    const baseTransition =
      !isUserDragging &&
      !isUserResizing &&
      (isProgrammaticResize || isProgrammaticMove)
        ? 'width 300ms ease, height 300ms ease, left 300ms ease, top 300ms ease'
        : 'none';
    const combinedTransition = `${baseTransition}${
      baseTransition === 'none' ? '' : ', '
    }transform 500ms ease`;

    return (
      <div
        ref={windowRef}
        className={`draggable-window${
          isFocused ? ' focused' : ''
        }${isThisFullscreen ? ' fullscreen' : ''}`}
        style={{
          width: `${currentWidth}px`,
          height: `${currentHeight}px`,
          left: `${currentX}px`,
          top: `${clampedY}px`,
          transformOrigin: 'top left',
          transform: isThisFullscreen
            ? `translate(${scaleTransform.tx}px, ${scaleTransform.ty}px) scale(${scaleTransform.sx}, ${scaleTransform.sy})`
            : 'none',
          transition: combinedTransition,
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
        {/* Header */}
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
            <button
              className="close-button"
              onClick={(e) => {
                e.stopPropagation();
                // if we're in fullscreen, step us back out
                if (isThisFullscreen) exitFullscreen();
                onClose?.();
              }}
            />
            <button
              className="resize-button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isThisFullscreen) {
                  // compute the zoom-from transform
                  const rect = windowRef.current.getBoundingClientRect();
                  const tx = -rect.left;
                  const ty = -rect.top;
                  const sx = window.innerWidth / rect.width;
                  const sy = window.innerHeight / rect.height;
                  setScaleTransform({ tx, ty, sx, sy });
                  // delay the flag flip so CSS sees the transform first
                  setTimeout(() => enterFullscreen(windowId), 0);
                } else {
                  exitFullscreen();
                }
              }}
            />
          </div>
          <div className="header-title">{title}</div>
          <div className="header-right" />
        </div>

        {/* Content */}
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

        {/* Resizers */}
        {[
          'br',
          'tr',
          'bl',
          'tl',
          'top',
          'bottom',
          'left',
          'right',
        ].map((pos) => (
          <div
            key={pos}
            className={`resize-handle resize-${pos}`}
            onMouseDown={() => {
              markFocused();
              setIsUserResizing(true);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              markFocused();
              setIsUserResizing(true);
            }}
          />
        ))}
      </div>
    );
  }
);

export default DraggableWindow;
