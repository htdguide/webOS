import React, {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle
} from 'react';
import useDraggable from '../../interactions/useDraggable/useDraggable.jsx';
import LoadingScreen from '../LoadingScreen/LoadingScreen.jsx'; // Adjust path if needed
import './DraggableWindow.css';

const DraggableWindow = forwardRef(
  (
    {
      title,
      wasmWidth,
      wasmHeight,
      onClose,
      onMount,
      onUnmount,
      children
    },
    ref
  ) => {
    const windowRef = useRef(null);

    // isLoading => controls whether we actually render the loading overlay in the DOM
    const [isLoading, setIsLoading] = useState(true);
    // isFadingOut => controls the fade-out class
    const [isFadingOut, setIsFadingOut] = useState(false);

    // Make the window draggable/resizable
    useDraggable(windowRef, wasmWidth, wasmHeight, onMount, onUnmount);

    // Imperative handle for parent
    useImperativeHandle(ref, () => ({
      showLoading: () => {
        // If we show loading again, reset any fade-out
        setIsFadingOut(false);
        setIsLoading(true);
      },
      hideLoading: () => {
        // Trigger the CSS fade-out
        setIsFadingOut(true);
        // After the fade-out duration, remove from DOM
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
          width: `${wasmWidth}px`,
          height: `${wasmHeight}px`,
          top: '50px',
          left: '50px'
        }}
      >
        {/* --- Window Header --- */}
        <div className="window-header">
          <div className="header-left">
            <button
              className="close-button"
              onClick={(event) => {
                event.stopPropagation(); // Prevent dragging
                onClose && onClose();
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
