// src/components/DraggableWindow/DraggableWindow.jsx

import React, {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect
} from 'react';
import useDraggable from '../../interactions/useDraggable/useDraggable.jsx';
import LoadingScreen from '../LoadingScreen/LoadingScreen.jsx';
import './DraggableWindow.css';
import { useLogger } from "../Logger/Logger.jsx";

const DraggableWindow = forwardRef(
  (
    {
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
      // NEW: lifted from provider
      isFocused,
      updateFocus
    },
    ref
  ) => {
    // Create a logger bound to this component name.
    // `log` signature: log(groupName: string, message: string)
    const { log, enabled } = useLogger("DraggableWindow");

    const windowRef = useRef(null);
    const iframeRef = useRef(null);

    // initial focus on mount (only runs once)
    useEffect(() => {
      if (enabled) log("lifecycle", "DraggableWindow mounted: setting initial focus");
      updateFocus(title);
      return () => {
        if (enabled) log("lifecycle", "DraggableWindow unmounted");
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [isIframeLoaded, setIsIframeLoaded] = useState(false);

    // dimensions
    const [currentWidth, setCurrentWidth] = useState(windowWidth);
    const [currentHeight, setCurrentHeight] = useState(windowHeight);

    // position helpers
    const parseCoord = (val, def) => {
      if (val === undefined) return def;
      return typeof val === 'number' ? val : parseInt(val, 10) || def;
    };
    const [currentX, setCurrentX] = useState(parseCoord(initialX, 10));
    const [currentY, setCurrentY] = useState(
      Math.max(parseCoord(initialY, 10), 26)
    );

    // interaction flags
    const [isUserDragging, setIsUserDragging] = useState(false);
    const [isUserResizing, setIsUserResizing] = useState(false);
    const [isProgrammaticResize, setIsProgrammaticResize] = useState(false);
    const [isProgrammaticMove, setIsProgrammaticMove] = useState(false);

    // stop dragging/resizing on mouse/touch up
    useEffect(() => {
      const up = () => {
        if (isUserDragging && enabled) log("userInteraction", "User stopped dragging");
        if (isUserResizing && enabled) log("userInteraction", "User stopped resizing");
        setIsUserDragging(false);
        setIsUserResizing(false);
      };
      window.addEventListener('mouseup', up);
      window.addEventListener('touchend', up);
      return () => {
        window.removeEventListener('mouseup', up);
        window.removeEventListener('touchend', up);
      };
    }, [isUserDragging, isUserResizing, enabled]);

    // extra pointerup for safety
    useEffect(() => {
      const pu = () => {
        if (isUserDragging && enabled) log("userInteraction", "Pointer up: stopping drag");
        setIsUserDragging(false);
      };
      window.addEventListener('pointerup', pu);
      return () => window.removeEventListener('pointerup', pu);
    }, [isUserDragging, enabled]);

    // respond to external width/height props
    useEffect(() => {
      if (enabled) log("resize", `External size props changed: width=${windowWidth}, height=${windowHeight}`);
      setCurrentWidth(windowWidth);
      setCurrentHeight(windowHeight);
    }, [windowWidth, windowHeight, enabled]);

    // setup draggable/resizable
    const { enterFullscreen } = useDraggable(
      windowRef,
      {
        width: currentWidth,
        height: currentHeight,
        minWidth: minWindowWidth,
        minHeight: minWindowHeight,
        maxWidth: maxWindowWidth,
        maxHeight: maxWindowHeight,
      },
      (newWidth, newHeight) => {
        // onResize callback from useDraggable
        if (enabled) log("resize", `User resized via Draggable: newWidth=${newWidth}, newHeight=${newHeight}`);
        onResize?.(newWidth, newHeight);
      },
      onUnmount
    );

    // fallback mount/unmount for draggable hook
    useEffect(() => {
      if (enabled) log("lifecycle", "Calling onMount callback (draggable-init)");
      onMount?.();
      return () => { 
        if (enabled) log("lifecycle", "Calling onUnmount callback (draggable-cleanup)");
        onUnmount?.(); 
      };
    }, [onMount, onUnmount, enabled]);

    // clamp top at 26px
    const clampedY = Math.max(currentY, 26);

    // expose imperative API
    useImperativeHandle(ref, () => ({
      showLoading: () => {
        if (enabled) log("render", "showLoading: starting fade-in");
        setIsFadingOut(false);
        setIsLoading(true);
      },
      hideLoading: () => {
        if (enabled) log("render", "hideLoading: starting fade-out");
        setIsFadingOut(true);
        setTimeout(() => {
          setIsLoading(false);
          setIsFadingOut(false);
          if (enabled) log("render", "hideLoading: completed fade-out");
        }, 1000);
      },
      resizeWindow: (w, h) => {
        if (enabled) log("programmatic", `resizeWindow called: newWidth=${w}, newHeight=${h}`);
        setIsProgrammaticResize(true);
        setCurrentWidth(w);
        setCurrentHeight(h);
        setTimeout(() => {
          setIsProgrammaticResize(false);
          if (enabled) log("programmatic", "Programmatic resize completed");
        }, 350);
      },
      moveWindow: (x, y) => {
        if (enabled) log("programmatic", `moveWindow called: newX=${x}, newY=${Math.max(y, 26)}`);
        setIsProgrammaticMove(true);
        setCurrentX(x);
        setCurrentY(Math.max(y, 26));
        setTimeout(() => {
          setIsProgrammaticMove(false);
          if (enabled) log("programmatic", "Programmatic move completed");
        }, 350);
      },
      isFocused
    }), [isFocused, enabled]);

    // programmatic vs user transition control
    const transitionStyle =
      !isUserDragging &&
      !isUserResizing &&
      (isProgrammaticResize || isProgrammaticMove)
        ? 'width 300ms ease, height 300ms ease, left 300ms ease, top 300ms ease'
        : 'none';

    // restore focus into iframe or canvas
    useEffect(() => {
      if (isFocused) {
        if (iframeSrc && iframeRef.current) {
          if (enabled) log("focus", "Window is focused with iframe: attempting to focus iframe content");
          setTimeout(() => {
            try {
              const win = iframeRef.current.contentWindow;
              const canvas = win?.document.getElementById('canvas');
              if (canvas) {
                if (enabled) log("focus", "Focusing canvas inside iframe");
                canvas.focus();
              } else {
                if (enabled) log("focus", "Focusing iframe window");
                win?.focus();
              }
            } catch {
              if (enabled) log("focus", "Error focusing iframe; focusing iframe element directly");
              iframeRef.current.focus();
            }
          }, 0);
        } else {
          if (enabled) log("focus", "Window is focused without iframe: no extra focus actions");
        }
      }
    }, [isFocused, iframeSrc, enabled]);

    // clicking inside iframe focuses canvas
    useEffect(() => {
      if (iframeSrc && isIframeLoaded && iframeRef.current) {
        let doc;
        try {
          doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
        } catch {
          return;
        }
        const onClick = () => {
          if (!isUserDragging) {
            if (enabled) log("focus", "Click inside iframe: focusing content");
            try {
              const c = doc.getElementById('canvas');
              if (c) {
                if (enabled) log("focus", "Focusing canvas inside iframe (click handler)");
                c.focus();
              } else {
                if (enabled) log("focus", "Focusing iframe window (click handler)");
                iframeRef.current.contentWindow.focus();
              }
            } catch {
              if (enabled) log("focus", "Error focusing iframe (click handler); focusing iframe element");
              iframeRef.current.focus();
            }
          }
        };
        doc.addEventListener('click', onClick);
        return () => {
          doc.removeEventListener('click', onClick);
        };
      }
    }, [iframeSrc, isIframeLoaded, isUserDragging, enabled]);

    // Log a render event for debugging layout and size
    if (enabled) {
      log(
        "render",
        `Rendering DraggableWindow: position=(${currentX},${clampedY}), size=(${currentWidth}x${currentHeight}), isFocused=${isFocused}`
      );
    }

    return (
      <div
        ref={windowRef}
        className={`draggable-window${isFocused ? ' focused' : ''}`}
        style={{
          width: `${currentWidth}px`,
          height: `${currentHeight}px`,
          left: `${currentX}px`,
          top: `${clampedY}px`,
          transition: transitionStyle,
          minWidth: minWindowWidth != null
            ? typeof minWindowWidth === 'number'
              ? `${minWindowWidth}px`
              : minWindowWidth
            : undefined,
          minHeight: minWindowHeight != null
            ? typeof minWindowHeight === 'number'
              ? `${minWindowHeight}px`
              : minWindowHeight
            : undefined,
          maxWidth: maxWindowWidth != null
            ? typeof maxWindowWidth === 'number'
              ? `${maxWindowWidth}px`
              : maxWindowWidth
            : undefined,
          maxHeight: maxWindowHeight != null
            ? typeof maxWindowHeight === 'number'
              ? `${maxWindowHeight}px`
              : maxWindowHeight
            : undefined,
        }}
        onClick={() => {
          if (enabled) log("userInteraction", `Window clicked: updating focus to "${title}"`);
          updateFocus(title);
          if (!isUserDragging && iframeSrc && iframeRef.current) {
            try {
              const c = iframeRef.current.contentWindow.document.getElementById('canvas');
              if (c) {
                if (enabled) log("focus", "Click on window: focusing canvas inside iframe");
                c.focus();
              } else {
                if (enabled) log("focus", "Click on window: focusing iframe window");
                iframeRef.current.contentWindow.focus();
              }
            } catch {
              if (enabled) log("focus", "Click on window: error focusing iframe; focusing iframe element");
              iframeRef.current.focus();
            }
          }
        }}
        onTouchStart={() => {
          if (enabled) log("userInteraction", `Touch start on window: updating focus to "${title}"`);
          updateFocus(title);
        }}
        onKeyDown={() => {
          if (enabled) log("userInteraction", `Key down on window: updating focus to "${title}"`);
          updateFocus(title);
        }}
      >
        {/* Header */}
        <div
          className="window-header"
          onMouseDown={(e) => {
            if (enabled) log("userInteraction", "Header mouse down: starting drag");
            updateFocus(title);
            setIsUserDragging(true);
          }}
          onTouchStart={(e) => {
            if (enabled) log("userInteraction", "Header touch start: starting drag");
            e.preventDefault();
            updateFocus(title);
            setIsUserDragging(true);
          }}
        >
          <div className="header-left">
            <button
              className="close-button"
              onClick={(e) => { 
                e.stopPropagation(); 
                if (enabled) log("userInteraction", "Close button clicked: invoking onClose");
                onClose?.(); 
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                if (enabled) log("userInteraction", "Close button touched: invoking onClose");
                onClose?.();
              }}
            />
            <button
              className="resize-button"
              onClick={(e) => {
                e.stopPropagation();
                if (enabled) log("userInteraction", "Resize button clicked: entering fullscreen");
                enterFullscreen();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                if (enabled) log("userInteraction", "Resize button touched: entering fullscreen");
                enterFullscreen();
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
              tabIndex={0}
              title={title}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                pointerEvents: isUserDragging ? 'none' : 'auto'
              }}
              onLoad={() => {
                if (enabled) log("render", "Iframe load started: beginning fade-out of loading overlay");
                setIsFadingOut(true);
                setTimeout(() => {
                  setIsLoading(false);
                  setIsFadingOut(false);
                  if (enabled) log("render", "Iframe load completed: hiding loading overlay");
                }, 1000);
                setIsIframeLoaded(true);
              }}
              onMouseDown={() => {
                if (enabled) log("focus", "Mouse down inside iframe: attempting to focus content");
                try {
                  const c = iframeRef.current.contentWindow.document.getElementById('canvas');
                  if (c) {
                    if (enabled) log("focus", "Focusing canvas inside iframe (mousedown)");
                    c.focus();
                  } else {
                    if (enabled) log("focus", "Focusing iframe window (mousedown)");
                    iframeRef.current.contentWindow.focus();
                  }
                } catch {
                  if (enabled) log("focus", "Error focusing iframe on mousedown; focusing iframe element");
                  iframeRef.current.focus();
                }
              }}
            />
          ) : (
            <div className="content-inner">
              {children}
              {isLoading && (
                <div className={`loading-overlay${isFadingOut ? ' fade-out' : ''}`}>
                  <LoadingScreen />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Corner & Edge Resizers */}
        {['br','tr','bl','tl','top','bottom','left','right'].map(pos => (
          <div
            key={pos}
            className={`resize-handle resize-${pos}`}
            onMouseDown={(e) => {
              if (enabled) log("userInteraction", `Resize handle "${pos}" mouse down: starting resize`);
              updateFocus(title);
              setIsUserResizing(true);
            }}
            onTouchStart={(e) => {
              if (enabled) log("userInteraction", `Resize handle "${pos}" touch start: starting resize`);
              e.preventDefault();
              updateFocus(title);
              setIsUserResizing(true);
            }}
          />
        ))}
      </div>
    );
  }
);

export default DraggableWindow;
