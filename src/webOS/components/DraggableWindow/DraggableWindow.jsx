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
    const windowRef = useRef(null);
    const iframeRef = useRef(null);

    // initial focus on mount (only runs once)
    useEffect(() => {
      updateFocus(title);
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

    // stop dragging/resizing on up
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

    // extra pointerup for safety
    useEffect(() => {
      const pu = () => setIsUserDragging(false);
      window.addEventListener('pointerup', pu);
      return () => window.removeEventListener('pointerup', pu);
    }, []);

    // respond to external width/height props
    useEffect(() => {
      setCurrentWidth(windowWidth);
      setCurrentHeight(windowHeight);
    }, [windowWidth, windowHeight]);

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
      onMount,
      onUnmount,
      onResize
    );

    // fallback mount/unmount
    useEffect(() => {
      onMount?.();
      return () => { onUnmount?.(); };
    }, [onMount, onUnmount]);

    // clamp top at 26px
    const clampedY = Math.max(currentY, 26);

    // expose imperative API
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
      resizeWindow: (w, h) => {
        setIsProgrammaticResize(true);
        setCurrentWidth(w);
        setCurrentHeight(h);
        setTimeout(() => setIsProgrammaticResize(false), 350);
      },
      moveWindow: (x, y) => {
        setIsProgrammaticMove(true);
        setCurrentX(x);
        setCurrentY(Math.max(y, 26));
        setTimeout(() => setIsProgrammaticMove(false), 350);
      },
      isFocused
    }), [isFocused]);

    // programmatic vs user transition control
    const transitionStyle =
      !isUserDragging &&
      !isUserResizing &&
      (isProgrammaticResize || isProgrammaticMove)
        ? 'width 300ms ease, height 300ms ease, left 300ms ease, top 300ms ease'
        : 'none';

    // restore focus into iframe or canvas
    useEffect(() => {
      if (isFocused && iframeSrc && iframeRef.current) {
        setTimeout(() => {
          try {
            const win = iframeRef.current.contentWindow;
            const canvas = win?.document.getElementById('canvas');
            if (canvas) canvas.focus();
            else win?.focus();
          } catch {
            iframeRef.current.focus();
          }
        }, 0);
      }
    }, [isFocused, iframeSrc]);

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
            try {
              const c = doc.getElementById('canvas');
              if (c) c.focus();
              else iframeRef.current.contentWindow.focus();
            } catch {
              iframeRef.current.focus();
            }
          }
        };
        doc.addEventListener('click', onClick);
        return () => doc.removeEventListener('click', onClick);
      }
    }, [iframeSrc, isIframeLoaded, isUserDragging]);

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
          updateFocus(title);
          if (!isUserDragging && iframeSrc && iframeRef.current) {
            try {
              const c = iframeRef.current.contentWindow.document.getElementById('canvas');
              if (c) c.focus();
              else iframeRef.current.contentWindow.focus();
            } catch {
              iframeRef.current.focus();
            }
          }
        }}
        onTouchStart={() => updateFocus(title)}
        onKeyDown={() => updateFocus(title)}
      >
        {/* Header */}
        <div
          className="window-header"
          onMouseDown={(e) => {
            updateFocus(title);
            setIsUserDragging(true);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            updateFocus(title);
            setIsUserDragging(true);
          }}
        >
          <div className="header-left">
            <button
              className="close-button"
              onClick={e => { e.stopPropagation(); onClose?.(); }}
              onTouchStart={e => e.stopPropagation()}
            />
            <button
              className="resize-button"
              onClick={e => { e.stopPropagation(); enterFullscreen(); }}
              onTouchStart={e => { e.stopPropagation(); enterFullscreen(); }}
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
              onMouseDown={() => {
                try {
                  const c = iframeRef.current.contentWindow.document.getElementById('canvas');
                  if (c) c.focus();
                  else iframeRef.current.contentWindow.focus();
                } catch {
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
              updateFocus(title);
              setIsUserResizing(true);
            }}
            onTouchStart={(e) => {
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
