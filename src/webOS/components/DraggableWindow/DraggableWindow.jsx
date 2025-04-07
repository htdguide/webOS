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
      onResize, // callback for resize events
      initialX, // initial horizontal position
      initialY, // initial vertical position
      iframeSrc, // URL for the iframe content (e.g., a WASM game)
      children
    },
    ref
  ) => {
    // Reference to the window element.
    const windowRef = useRef(null);
    // Reference to the iframe element, if used.
    const iframeRef = useRef(null);

    // Use the FocusControl context for managing focus state.
    const { focusedComponent, updateFocus } = useFocus();
    const isFocused = focusedComponent === title;

    // Set initial focus when the window mounts.
    useEffect(() => {
      updateFocus(title);
    }, []); // run once on mount

    // State to control the loading overlay.
    const [isLoading, setIsLoading] = useState(true);
    // State to control fade-out animation for the loading overlay.
    const [isFadingOut, setIsFadingOut] = useState(false);
    // Track whether the iframe has finished loading.
    const [isIframeLoaded, setIsIframeLoaded] = useState(false);

    // States for the window dimensions for smooth resizing.
    const [currentWidth, setCurrentWidth] = useState(windowWidth);
    const [currentHeight, setCurrentHeight] = useState(windowHeight);

    // Helper function to safely parse initial coordinate values.
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

    // States for the window position (x, y).
    // The y-coordinate is clamped to a minimum of 26px to avoid header overlap.
    const [currentX, setCurrentX] = useState(getInitialCoordinate(initialX, 10));
    const [currentY, setCurrentY] = useState(
      Math.max(getInitialCoordinate(initialY, 10), 26)
    );

    // States to track whether the user is manually dragging or resizing the window.
    const [isUserDragging, setIsUserDragging] = useState(false);
    const [isUserResizing, setIsUserResizing] = useState(false);

    // States to track if a programmatic move or resize is in progress.
    const [isProgrammaticResize, setIsProgrammaticResize] = useState(false);
    const [isProgrammaticMove, setIsProgrammaticMove] = useState(false);

    // Global event listeners to stop dragging/resizing when the mouse/touch is released.
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

    // Additional global listener for pointerup to ensure dragging stops.
    useEffect(() => {
      const handlePointerUp = () => {
        setIsUserDragging(false);
      };
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }, []);

    // Update dimensions if the props change.
    useEffect(() => {
      setCurrentWidth(windowWidth);
      setCurrentHeight(windowHeight);
    }, [windowWidth, windowHeight]);

    // Initialize the draggable/resizable functionality using a custom hook.
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
      onMount,
      onUnmount,
      onResize // pass onResize callback to the draggable hook
    );

    // Fallback: Ensure onMount and onUnmount are called even if not handled by useDraggable.
    useEffect(() => {
      if (onMount) {
        onMount();
      }
      return () => {
        if (onUnmount) {
          onUnmount();
        }
      };
    }, [onMount, onUnmount]);

    // Ensure the y-coordinate is never below 26px.
    const clampedY = Math.max(currentY, 26);

    // Expose imperative methods so parent components can control the window.
    useImperativeHandle(ref, () => ({
      showLoading: () => {
        setIsFadingOut(false);
        setIsLoading(true);
      },
      hideLoading: () => {
        setIsFadingOut(true);
        // Remove the loading overlay after the fade-out transition.
        setTimeout(() => {
          setIsLoading(false);
          setIsFadingOut(false);
        }, 1000); // duration should match the CSS transition
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
        // Clamp newY so that it never goes below 26px.
        setCurrentX(newX);
        setCurrentY(Math.max(newY, 26));
        setTimeout(() => {
          setIsProgrammaticMove(false);
        }, 350);
      },
      isFocused: isFocused
    }));

    // Compute the transition style based on programmatic operations and user interactions.
    const transitionValue =
      !isUserDragging && !isUserResizing && (isProgrammaticResize || isProgrammaticMove)
        ? 'width 300ms ease, height 300ms ease, left 300ms ease, top 300ms ease'
        : 'none';

    // Enhanced focus restoration:
    // When focus control indicates that the draggable window is focused,
    // if an iframe is present, focus its inner canvas (or fallback to the iframe window).
    useEffect(() => {
      if (isFocused && iframeSrc && iframeRef.current) {
        // Use a small delay to allow the focus state to settle.
        setTimeout(() => {
          try {
            const iframeWindow = iframeRef.current.contentWindow;
            if (iframeWindow) {
              const canvas = iframeWindow.document.getElementById("canvas");
              if (canvas) {
                canvas.focus();
              } else {
                iframeWindow.focus();
              }
            }
          } catch (e) {
            iframeRef.current.focus();
          }
        }, 0);
      }
    }, [isFocused, iframeSrc]);

    // Attach a click listener to the iframe's inner document after it loads.
    // This ensures that clicking inside the iframe focuses the inner canvas.
    // However, if the user is currently dragging, the click listener does nothing.
    useEffect(() => {
      if (iframeSrc && isIframeLoaded && iframeRef.current) {
        let iframeDoc;
        try {
          iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
        } catch (e) {
          console.error("Unable to access iframe document.", e);
          return;
        }
        if (iframeDoc) {
          const onIframeClick = () => {
            // Do not change focus if a drag is in progress.
            if (!isUserDragging) {
              try {
                const canvas = iframeDoc.getElementById("canvas");
                if (canvas) {
                  canvas.focus();
                } else if (iframeRef.current.contentWindow) {
                  iframeRef.current.contentWindow.focus();
                }
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
          // Only try to focus the iframe if a drag is not in progress.
          if (!isUserDragging && iframeSrc && iframeRef.current && iframeRef.current.contentWindow) {
            try {
              const canvas = iframeRef.current.contentWindow.document.getElementById("canvas");
              if (canvas) {
                canvas.focus();
              } else {
                iframeRef.current.contentWindow.focus();
              }
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
          // No onClick here to allow dragging without focus interference.
        >
          <div className="header-left">
            <button
              className="close-button"
              onClick={(event) => {
                event.stopPropagation(); // Prevent dragging when clicking close.
                onClose?.();
              }}
              onTouchStart={(event) => {
                event.stopPropagation();
              }}
            >
              {/* Close icon/text */}
            </button>
          </div>
          <div className="header-title">{title}</div>
          <div className="header-right"></div>
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
                if (iframeRef.current && iframeRef.current.contentWindow) {
                  try {
                    const canvas = iframeRef.current.contentWindow.document.getElementById("canvas");
                    if (canvas) {
                      canvas.focus();
                    } else {
                      iframeRef.current.contentWindow.focus();
                    }
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

        {/* Resizers for handling window resize interactions */}
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
