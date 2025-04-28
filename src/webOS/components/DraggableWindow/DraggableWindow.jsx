// DraggableWindow.jsx
// This component renders a draggable and resizable window.
// It supports rendering an iframe in the content area if the iframeSrc prop is provided.
// Fixes implemented:
// 1. Prevents dragging interruption when the mouse moves over the iframe by disabling pointer events during drag.
// 2. Enhances focus restoration so that if focus control indicates focus is on the draggable window,
//    the iframe (and its inner canvas) is automatically focused, ensuring keyboard events are captured.
// 3. Adds an event listener inside the iframe's document so that clicking anywhere inside the iframe
//    immediately focuses the inner canvas (or the iframe window), making keyboard input work.
// 4. Removes focus logic from the header so that drag initiation is not interfered with.
// 5. Adds a global "pointerup" listener to ensure that releasing the mouse (or touch) stops dragging.
// 6. Adds a "resize" button in the top‐left to immediately maximize/fullscreen via the draggable hook.

import React, {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect
} from 'react';
import useDraggable from '../../interactions/useDraggable/useDraggable.jsx';
import LoadingScreen from '../LoadingScreen/LoadingScreen.jsx';
import { useFocus } from '../../contexts/FocusControl/FocusControl.jsx';
import './DraggableWindow.css';

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
      children
    },
    ref
  ) => {
    const windowRef = useRef(null);
    const iframeRef = useRef(null);

    const { focusedComponent, updateFocus } = useFocus();
    const isFocused = focusedComponent === title;

    useEffect(() => {
      updateFocus(title);
    }, []); // on mount

    const [isLoading, setIsLoading] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [isIframeLoaded, setIsIframeLoaded] = useState(false);

    const [currentWidth, setCurrentWidth] = useState(windowWidth);
    const [currentHeight, setCurrentHeight] = useState(windowHeight);

    const getInitialCoordinate = (value, defaultValue) => {
      if (value !== undefined) {
        if (typeof value === 'number') {
          return value;
        } else {
          const parsed = parseInt(value, 10);
          return isNaN(parsed) ? defaultValue : parsed;
        }
      }
      return defaultValue;
    };

    const [currentX, setCurrentX] = useState(getInitialCoordinate(initialX, 10));
    const [currentY, setCurrentY] = useState(
      Math.max(getInitialCoordinate(initialY, 10), 26)
    );

    const [isUserDragging, setIsUserDragging] = useState(false);
    const [isUserResizing, setIsUserResizing] = useState(false);
    const [isProgrammaticResize, setIsProgrammaticResize] = useState(false);
    const [isProgrammaticMove, setIsProgrammaticMove] = useState(false);

    useEffect(() => {
      const handleMouseUp = () => {
        setIsUserDragging(false);
        setIsUserResizing(false);
      };
      const handleTouchEnd = () => {
        setIsUserDragging(false);
        setIsUserResizing(false);
      };
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleTouchEnd);
      return () => {
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }, []);

    useEffect(() => {
      const handlePointerUp = () => {
        setIsUserDragging(false);
      };
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }, []);

    useEffect(() => {
      setCurrentWidth(windowWidth);
      setCurrentHeight(windowHeight);
    }, [windowWidth, windowHeight]);

    // Now capture the fullscreen helper from the hook
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
      onMount,
      onUnmount,
      onResize
    );

    // Fallback mount/unmount calls
    useEffect(() => {
      if (onMount) onMount();
      return () => {
        if (onUnmount) onUnmount();
      };
    }, [onMount, onUnmount]);

    const clampedY = Math.max(currentY, 26);

    useImperativeHandle(ref, () => ({
      showLoading: () => {
        setIsFadingOut(false);
        setIsLoading(true);
      },
      hideLoading: () => {
        setIsFadingOut(true);
        setTimeout(() => {
          setIsLoading(false);
          setIsFadingOut(false);
        }, 1000);
      },
      resizeWindow: (newWidth, newHeight) => {
        setIsProgrammaticResize(true);
        setCurrentWidth(newWidth);
        setCurrentHeight(newHeight);
        setTimeout(() => {
          setIsProgrammaticResize(false);
        }, 350);
      },
      moveWindow: (newX, newY) => {
        setIsProgrammaticMove(true);
        setCurrentX(newX);
        setCurrentY(Math.max(newY, 26));
        setTimeout(() => {
          setIsProgrammaticMove(false);
        }, 350);
      },
      isFocused: isFocused
    }));

    const transitionValue =
      !isUserDragging &&
      !isUserResizing &&
      (isProgrammaticResize || isProgrammaticMove)
        ? 'width 300ms ease, height 300ms ease, left 300ms ease, top 300ms ease'
        : 'none';

    useEffect(() => {
      if (isFocused && iframeSrc && iframeRef.current) {
        setTimeout(() => {
          try {
            const iframeWindow = iframeRef.current.contentWindow;
            if (iframeWindow) {
              const canvas = iframeWindow.document.getElementById("canvas");
              if (canvas) canvas.focus();
              else iframeWindow.focus();
            }
          } catch (e) {
            iframeRef.current.focus();
          }
        }, 0);
      }
    }, [isFocused, iframeSrc]);

    useEffect(() => {
      if (iframeSrc && isIframeLoaded && iframeRef.current) {
        let iframeDoc;
        try {
          iframeDoc =
            iframeRef.current.contentDocument ||
            iframeRef.current.contentWindow.document;
        } catch (e) {
          console.error("Unable to access iframe document.", e);
          return;
        }
        if (iframeDoc) {
          const onIframeClick = () => {
            if (!isUserDragging) {
              try {
                const canvas = iframeDoc.getElementById("canvas");
                if (canvas) canvas.focus();
                else iframeRef.current.contentWindow.focus();
              } catch (e) {
                iframeRef.current.focus();
              }
            }
          };
          iframeDoc.addEventListener("click", onIframeClick);
          return () => {
            iframeDoc.removeEventListener("click", onIframeClick);
          };
        }
      }
    }, [iframeSrc, isIframeLoaded, isUserDragging]);

    return (
      <div
        ref={windowRef}
        className={`draggable-window ${isFocused ? 'focused' : ''}`}
        style={{
          width: `${currentWidth}px`,
          height: `${currentHeight}px`,
          transition: transitionValue,
          left: `${currentX}px`,
          top: `${clampedY}px`,
          minWidth: minWindowWidth
            ? typeof minWindowWidth === 'number'
              ? `${minWindowWidth}px`
              : minWindowWidth
            : undefined,
          minHeight: minWindowHeight
            ? typeof minWindowHeight === 'number'
              ? `${minWindowHeight}px`
              : minWindowHeight
            : undefined,
          maxWidth: maxWindowWidth
            ? typeof maxWindowWidth === 'number'
              ? `${maxWindowWidth}px`
              : maxWindowWidth
            : undefined,
          maxHeight: maxWindowHeight
            ? typeof maxWindowHeight === 'number'
              ? `${maxWindowHeight}px`
              : maxWindowHeight
            : undefined,
        }}
        onClick={() => {
          updateFocus(title);
          if (!isUserDragging && iframeSrc && iframeRef.current) {
            try {
              const canvas = iframeRef.current.contentWindow.document.getElementById("canvas");
              if (canvas) canvas.focus();
              else iframeRef.current.contentWindow.focus();
            } catch (e) {
              iframeRef.current.focus();
            }
          }
        }}
        onTouchStart={() => updateFocus(title)}
        onKeyDown={() => updateFocus(title)}
      >
        {/* --- Window Header --- */}
        <div
          className="window-header"
          onMouseDown={() => setIsUserDragging(true)}
          onTouchStart={() => setIsUserDragging(true)}
        >
          <div className="header-left">
            <button
              className="close-button"
              onClick={(event) => {
                event.stopPropagation();
                onClose?.();
              }}
              onTouchStart={(event) => {
                event.stopPropagation();
              }}
            />
            <button
              className="resize-button"
              onClick={(event) => {
                event.stopPropagation();
                enterFullscreen();
              }}
              onTouchStart={(event) => {
                event.stopPropagation();
                enterFullscreen();
              }}
            />
          </div>
          <div className="header-title">{title}</div>
          <div className="header-right" />
        </div>

        {/* --- Window Content Area --- */}
        <div className="window-content">
          {iframeSrc ? (
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              tabIndex={0}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                pointerEvents: isUserDragging ? 'none' : 'auto'
              }}
              title={title}
              onLoad={() => {
                setIsFadingOut(true);
                setTimeout(() => {
                  setIsLoading(false);
                  setIsFadingOut(false);
                }, 1000);
                setIsIframeLoaded(true);
              }}
              onMouseDown={() => {
                if (iframeRef.current?.contentWindow) {
                  try {
                    const canvas = iframeRef.current.contentWindow.document.getElementById("canvas");
                    if (canvas) canvas.focus();
                    else iframeRef.current.contentWindow.focus();
                  } catch (e) {
                    iframeRef.current.focus();
                  }
                }
              }}
            />
          ) : (
            <div className="content-inner">
              {children}
              {isLoading && (
                <div className={`loading-overlay ${isFadingOut ? 'fade-out' : ''}`}>
                  <LoadingScreen />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resizers */}
        <div
          className="resize-handle resize-br"
          onMouseDown={() => setIsUserResizing(true)}
          onTouchStart={() => setIsUserResizing(true)}
        />
        <div
          className="resize-handle resize-tr"
          onMouseDown={() => setIsUserResizing(true)}
          onTouchStart={() => setIsUserResizing(true)}
        />
        <div
          className="resize-handle resize-bl"
          onMouseDown={() => setIsUserResizing(true)}
          onTouchStart={() => setIsUserResizing(true)}
        />
      </div>
    );
  }
);

export default DraggableWindow;
