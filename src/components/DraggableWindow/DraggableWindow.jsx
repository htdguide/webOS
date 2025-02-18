import React, {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle
} from 'react';
import useDraggable from './useDraggable.jsx';
import LoadingScreen from '../LoadingScreen/LoadingScreen.jsx'; // adjust path if needed
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
    const [isLoading, setIsLoading] = useState(true);

    // Make this window draggable/resizable
    useDraggable(windowRef, wasmWidth, wasmHeight, onMount, onUnmount);

    // Let parent call .showLoading() / .hideLoading() 
    useImperativeHandle(ref, () => ({
      showLoading: () => setIsLoading(true),
      hideLoading: () => setIsLoading(false),
    }));

    return (
      <div
        ref={windowRef}
        className="draggable-window"
        style={{
          /* You can set width/height here or rely on the CSS file */
          width: `${wasmWidth}px`,
          height: `${wasmHeight}px`,
          top: '50px',
          left: '50px',
        }}
      >
        {/* Header: always visible, above the overlay */}
        <div className="window-header">
          <div className="header-left">
            <button
              className="close-button"
              onClick={(event) => {
                event.stopPropagation();
                onClose && onClose();
              }}
              onTouchStart={(event) => {
                event.stopPropagation();
              }}
            >
              {/* Close icon/text here */}
            </button>
          </div>
          <div className="header-title">{title}</div>
          <div className="header-right"></div>
        </div>

        {/* Content area: the overlay will only appear here, not over the header */}
        <div className="window-content">
          <div className="content-inner">
            {children}
            {isLoading && (
              <div className="loading-overlay">
                <LoadingScreen />
              </div>
            )}
          </div>
        </div>

        {/* Resizers: also above the overlay */}
        <div className="resize-handle resize-br" />
        <div className="resize-handle resize-tr" />
        <div className="resize-handle resize-bl" />
      </div>
    );
  }
);

export default DraggableWindow;
