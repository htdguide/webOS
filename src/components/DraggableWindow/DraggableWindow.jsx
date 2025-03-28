import React, {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect
} from 'react';
import useDraggable from '../../interactions/useDraggable/useDraggable.jsx';
import LoadingScreen from '../LoadingScreen/LoadingScreen.jsx';
import { useFocus } from '../../interactions/FocusControl/FocusControl.jsx';
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
      onResize, // new prop
      initialX, // new prop for initial horizontal position
      initialY, // new prop for initial vertical position
      children
    },
    ref
  ) => {
    const windowRef = useRef(null);

    // Focus handling using the FocusControl context
    const { focusedComponent, updateFocus } = useFocus();
    const isFocused = focusedComponent === title;

    // Set initial focus only once on mount.
    useEffect(() => {
      updateFocus(title);
    }, []); // run once when the window mounts

    // isLoading controls whether we render the loading overlay
    const [isLoading, setIsLoading] = useState(true);
    // isFadingOut controls the fade-out CSS class
    const [isFadingOut, setIsFadingOut] = useState(false);

    // State for current width and height to allow smooth resizing via function
    const [currentWidth, setCurrentWidth] = useState(windowWidth);
    const [currentHeight, setCurrentHeight] = useState(windowHeight);

    // State for current coordinates for smooth movement
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

    // No clamping for X; clamp Y to be at least 26.
    const [currentX, setCurrentX] = useState(getInitialCoordinate(initialX, 10));
    const [currentY, setCurrentY] = useState(
      Math.max(getInitialCoordinate(initialY, 10), 26)
    );

    // State to track if the user is manually dragging or resizing
    const [isUserDragging, setIsUserDragging] = useState(false);
    const [isUserResizing, setIsUserResizing] = useState(false);

    // State to track programmatic operations
    const [isProgrammaticResize, setIsProgrammaticResize] = useState(false);
    const [isProgrammaticMove, setIsProgrammaticMove] = useState(false);

    // Global event listeners to end manual dragging/resizing state
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

    // Update state if props change for size only (position is updated via moveWindow)
    useEffect(() => {
      setCurrentWidth(windowWidth);
      setCurrentHeight(windowHeight);
    }, [windowWidth, windowHeight]);

    // Initialize the draggable/resizable functionality with size constraints.
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
      onResize // pass onResize to the hook
    );

    // Fallback: Ensure onMount and onUnmount are called if not triggered by useDraggable.
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

    // For rendering, ensure the y-coordinate is never less than 26.
    const clampedY = Math.max(currentY, 26);

    // Expose imperative methods for parent components.
    useImperativeHandle(ref, () => ({
      showLoading: () => {
        setIsFadingOut(false);
        setIsLoading(true);
      },
      hideLoading: () => {
        setIsFadingOut(true);
        // After the fade-out duration, remove the loading overlay
        setTimeout(() => {
          setIsLoading(false);
          setIsFadingOut(false);
        }, 1000); // match your CSS transition duration
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
        // No clamping for X; clamp newY so that it never goes below 26px.
        setCurrentX(newX);
        setCurrentY(Math.max(newY, 26));
        setTimeout(() => {
          setIsProgrammaticMove(false);
        }, 350);
      },
      isFocused: isFocused
    }));

    // Compute transition style: only animate if a programmatic call is active and no manual interaction.
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
                event.stopPropagation(); // Prevent dragging
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
          <div className="content-inner">
            {children}
            {isLoading && (
              <div
                className={`loading-overlay ${isFadingOut ? 'fade-out' : ''}`}
              >
                <LoadingScreen />
              </div>
            )}
          </div>
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
