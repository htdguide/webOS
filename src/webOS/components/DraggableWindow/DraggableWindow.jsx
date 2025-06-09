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
import { useLogger } from '../Logger/Logger.jsx';
import { useFocus } from '../../contexts/FocusControl/FocusControl.jsx';

const DraggableWindow = forwardRef(
  (
    {
      // NEW: unique ID for this window instance
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

    const windowRef = useRef(null);
    const iframeRef = useRef(null);

    // on mount, immediately focus this window
    useEffect(() => {
      if (enabled) log('lifecycle', `Mounted ${windowId}, setting focus`);
      updateFocus(windowId);
      return () => {
        if (enabled) log('lifecycle', `Unmounted ${windowId}`);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // loading + fade state
    const [isLoading, setIsLoading] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [isIframeLoaded, setIsIframeLoaded] = useState(false);

    // dimensions
    const [currentWidth, setCurrentWidth] = useState(windowWidth);
    const [currentHeight, setCurrentHeight] = useState(windowHeight);

    // position
    const parseCoord = (val, def) =>
      val === undefined ? def : typeof val === 'number' ? val : parseInt(val, 10) || def;
    const [currentX, setCurrentX] = useState(parseCoord(initialX, 10));
    const [currentY, setCurrentY] = useState(Math.max(parseCoord(initialY, 10), 26));

    // user vs programmatic flags
    const [isUserDragging, setIsUserDragging] = useState(false);
    const [isUserResizing, setIsUserResizing] = useState(false);
    const [isProgrammaticResize, setIsProgrammaticResize] = useState(false);
    const [isProgrammaticMove, setIsProgrammaticMove] = useState(false);

    // global mouse/touch up → stop drag/resize
    useEffect(() => {
      const up = () => {
        if (isUserDragging && enabled) log('userInteraction', 'Stopped dragging');
        if (isUserResizing && enabled) log('userInteraction', 'Stopped resizing');
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

    // pointerup safety
    useEffect(() => {
      const pu = () => {
        if (isUserDragging && enabled) log('userInteraction', 'Pointer up: stop drag');
        setIsUserDragging(false);
      };
      window.addEventListener('pointerup', pu);
      return () => window.removeEventListener('pointerup', pu);
    }, [isUserDragging, enabled]);

    // respond to external size props
    useEffect(() => {
      if (enabled) log('resize', `External size → ${windowWidth}×${windowHeight}`);
      setCurrentWidth(windowWidth);
      setCurrentHeight(windowHeight);
    }, [windowWidth, windowHeight, enabled]);

    // draggable/resizable hook
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
      (w, h) => {
        if (enabled) log('resize', `User-resized → ${w}×${h}`);
        onResize?.(w, h);
      },
      onUnmount
    );

    // fallback mount/unmount callbacks
    useEffect(() => {
      if (enabled) log('lifecycle', 'Calling onMount');
      onMount?.();
      return () => {
        if (enabled) log('lifecycle', 'Calling onUnmount');
        onUnmount?.();
      };
    }, [onMount, onUnmount, enabled]);

    const clampedY = Math.max(currentY, 26);

    // expose imperative API
    useImperativeHandle(
      ref,
      () => ({
        showLoading: () => {
          if (enabled) log('render', 'showLoading → fade in');
          setIsFadingOut(false);
          setIsLoading(true);
        },
        hideLoading: () => {
          if (enabled) log('render', 'hideLoading → fade out');
          setIsFadingOut(true);
          setTimeout(() => {
            setIsLoading(false);
            setIsFadingOut(false);
            if (enabled) log('render', 'hideLoading → complete');
          }, 1000);
        },
        resizeWindow: (w, h) => {
          if (enabled) log('programmatic', `resizeWindow → ${w}×${h}`);
          setIsProgrammaticResize(true);
          setCurrentWidth(w);
          setCurrentHeight(h);
          setTimeout(() => {
            setIsProgrammaticResize(false);
            if (enabled) log('programmatic', 'Programmatic resize done');
          }, 350);
        },
        moveWindow: (x, y) => {
          if (enabled) log('programmatic', `moveWindow → (${x},${y})`);
          setIsProgrammaticMove(true);
          setCurrentX(x);
          setCurrentY(Math.max(y, 26));
          setTimeout(() => {
            setIsProgrammaticMove(false);
            if (enabled) log('programmatic', 'Programmatic move done');
          }, 350);
        },
        isFocused,
      }),
      [windowId, isFocused, enabled]
    );

    const transitionStyle =
      !isUserDragging &&
      !isUserResizing &&
      (isProgrammaticResize || isProgrammaticMove)
        ? 'width 300ms ease, height 300ms ease, left 300ms ease, top 300ms ease'
        : 'none';

    // restore focus into iframe or canvas when this window becomes focused
    useEffect(() => {
      if (!isFocused) return;
      if (iframeSrc && iframeRef.current) {
        if (enabled) log('focus', `Restoring focus for ${windowId}`);
        setTimeout(() => {
          try {
            const win = iframeRef.current.contentWindow;
            const canvas = win?.document.getElementById('canvas');
            if (canvas) {
              canvas.focus();
            } else {
              win?.focus();
            }
          } catch {
            iframeRef.current.focus();
          }
        }, 0);
      }
    }, [isFocused, iframeSrc, enabled, windowId]);

    // click/keydown/touch on window → focus it
    const markFocused = () => {
      if (enabled) log('userInteraction', `Focusing ${windowId}`);
      updateFocus(windowId);
    };

    // render
    if (enabled) {
      log(
        'render',
        `${windowId}: pos=(${currentX},${clampedY}), size=(${currentWidth}×${currentHeight}), focused=${isFocused}`
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
          onMouseDown={(e) => {
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
                onClose?.();
              }}
            />
            <button
              className="resize-button"
              onClick={(e) => {
                e.stopPropagation();
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
                setIsFadingOut(true);
                setTimeout(() => {
                  setIsLoading(false);
                  setIsFadingOut(false);
                }, 1000);
                setIsIframeLoaded(true);
              }}
              onMouseDown={markFocused}
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

        {/* Resizers */}
        {['br','tr','bl','tl','top','bottom','left','right'].map(pos => (
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
