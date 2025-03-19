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
      children
    },
    ref
  ) => {
    const windowRef = useRef(null);

    // isLoading controls whether we render the loading overlay
    const [isLoading, setIsLoading] = useState(true);
    // isFadingOut controls the fade-out CSS class
    const [isFadingOut, setIsFadingOut] = useState(false);

    // Initialize the draggable/resizable functionality with size constraints.
    useDraggable(
      windowRef,
      {
        width: windowWidth,
        height: windowHeight,
        minWidth: minWindowWidth,
        minHeight: minWindowHeight,
        maxWidth: maxWindowWidth,
        maxHeight: maxWindowHeight,
      },
      onMount,
      onUnmount
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
    }));

    return (
      <div
        ref={windowRef}
        className="draggable-window"
        style={{
          width: `${windowWidth}px`,
          height: `${windowHeight}px`,
          top: '50px',
          left: '50px',
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
      >
        {/* --- Window Header --- */}
        <div className="window-header">
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
        <div className="resize-handle resize-br" />
        <div className="resize-handle resize-tr" />
        <div className="resize-handle resize-bl" />
      </div>
    );
  }
);

export default DraggableWindow;
