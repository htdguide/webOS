// DraggableWindow.jsx
// This component renders a draggable and resizable window.
// It now supports rendering an iframe in the content area if the iframeSrc prop is provided.

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
      iframeSrc, // new prop: URL for the iframe content
      children
    },
    ref
  ) => {
    // Reference to the window element
    const windowRef = useRef(null);

    // Use the FocusControl context for managing focus state
    const { focusedComponent, updateFocus } = useFocus();
    const isFocused = focusedComponent === title;

    // Set initial focus when the window mounts
    useEffect(() => {
      updateFocus(title);
    }, []); // run once on mount

    // State to control the loading overlay
    const [isLoading, setIsLoading] = useState(true);
    // State to control fade-out animation for the loading overlay
    const [isFadingOut, setIsFadingOut] = useState(false);

    // States for the window dimensions, allowing smooth resizing
    const [currentWidth, setCurrentWidth] = useState(windowWidth);
    const [currentHeight, setCurrentHeight] = useState(windowHeight);

    // Helper function to safely parse initial coordinate values
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
    // The y-coordinate is clamped to a minimum of 26px (to avoid header overlap).
    const [currentX, setCurrentX] = useState(getInitialCoordinate(initialX, 10));
    const [currentY, setCurrentY] = useState(
      Math.max(getInitialCoordinate(initialY, 10), 26)
    );

    // States to track whether the user is manually dragging or resizing the window
    const [isUserDragging, setIsUserDragging] = useState(false);
    const [isUserResizing, setIsUserResizing] = useState(false);

    // States to track if a programmatic move or resize is in progress
    const [isProgrammaticResize, setIsProgrammaticResize] = useState(false);
    const [isProgrammaticMove, setIsProgrammaticMove] = useState(false);

    // Global event listeners to stop dragging/resizing when the mouse/touch is released
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

    // Expose imperative methods so parent components can control the window
    useImperativeHandle(ref, () => ({
      showLoading: () => {
        setIsFadingOut(false);
        setIsLoading(true);
      },
      hideLoading: () => {
        setIsFadingOut(true);
        // Remove the loading overlay after the fade-out transition
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
        onClick={() => updateFocus(title)}
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
                event.stopPropagation(); // Prevent dragging when clicking close
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
            // If iframeSrc is provided, render an iframe that fills the content area.
            <iframe
              src={iframeSrc}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={title}
              onLoad={() => {
                // Optionally, hide the loading overlay when the iframe content has loaded.
                setIsFadingOut(true);
                setTimeout(() => {
                  setIsLoading(false);
                  setIsFadingOut(false);
                }, 1000);
              }}
            />
          ) : (
            // Otherwise, render the children inside a content-inner div.
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
