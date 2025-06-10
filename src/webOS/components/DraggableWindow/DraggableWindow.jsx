// src/webOS/components/DraggableWindow/DraggableWindow.jsx

import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useContext,
} from 'react';
import useDraggable from '../../interactions/useDraggable/useDraggable.jsx';
import './DraggableWindow.css';
import { useLogger } from '../Logger/Logger.jsx';
import { useFocus } from '../../contexts/FocusControl/FocusControl.jsx';
import { FullscreenSpace } from '../FullScreenSpace/FullScreenSpace.jsx';

const DraggableWindow = forwardRef(
  (
    {
      wrapId,                    // ← receive it here
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
    // you can now include wrapId in your logger or other logic
    const { enabled } = useLogger(`DraggableWindow [wrap:${wrapId}]`);

    const { focusedComponent, updateFocus } = useFocus();
    const isFocused = focusedComponent === windowId;

    // fullscreen context
    const {
      isFullscreen,
      fullscreenWindowId,
      enterFullscreen,
      exitFullscreen,
    } = useContext(FullscreenSpace);
    const isThisFullscreen = isFullscreen && fullscreenWindowId === windowId;

    const windowRef = useRef(null);
    const iframeRef = useRef(null);

    // parse initial coords
    const parseCoord = (val, def) =>
      val === undefined
        ? def
        : typeof val === 'number'
        ? val
        : parseInt(val, 10) || def;
    const [currentWidth, setCurrentWidth] = useState(windowWidth);
    const [currentHeight, setCurrentHeight] = useState(windowHeight);
    const [currentX, setCurrentX] = useState(parseCoord(initialX, 10));
    const [currentY, setCurrentY] = useState(Math.max(parseCoord(initialY, 10), 26));

    // user interaction flags
    const [isUserDragging, setIsUserDragging] = useState(false);
    const [isUserResizing, setIsUserResizing] = useState(false);

    // track transform for zoom animation
    const [scaleTransform, setScaleTransform] = useState({
      tx: 0,
      ty: 0,
      sx: 1,
      sy: 1,
    });

    // stop drag/resize on mouseup/touchend
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

    // respond to prop changes
    useEffect(() => {
      setCurrentWidth(windowWidth);
      setCurrentHeight(windowHeight);
    }, [windowWidth, windowHeight]);

    // draggable/resizable integration
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
      (w, h) => onResize?.(w, h),
      onUnmount
    );

    // focus + mount/unmount callbacks
    useEffect(() => {
      updateFocus(windowId);
      onMount?.();
      return () => onUnmount?.();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // imperative API for parent control
    useImperativeHandle(
      ref,
      () => ({
        resizeWindow: (w, h) => {
          setCurrentWidth(w);
          setCurrentHeight(h);
        },
        moveWindow: (x, y) => {
          setCurrentX(x);
          setCurrentY(Math.max(y, 26));
        },
        isFocused,
      }),
      [isFocused]
    );

    // after exiting fullscreen, reset transform so next enter animates
    useEffect(() => {
      if (!isThisFullscreen) {
        setTimeout(
          () => setScaleTransform({ tx: 0, ty: 0, sx: 1, sy: 1 }),
          500
        );
      }
    }, [isThisFullscreen]);

    // restore iframe focus when this window regains focus
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
    }, [isFocused, iframeSrc, windowId]);

    const markFocused = () => updateFocus(windowId);
    const clampedY = Math.max(currentY, 26);

    // only disable CSS transitions while dragging
    const noTransition = isUserDragging;

    // build up className
    const className = [
      'draggable-window',
      isFocused && 'focused',
      isThisFullscreen && 'fullscreen',
      noTransition && 'no-transition',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={windowRef}
        className={className}
        style={{
          width: `${currentWidth}px`,
          height: `${currentHeight}px`,
          left: `${currentX}px`,
          top: `${clampedY}px`,
          transform: isThisFullscreen
            ? `translate(${scaleTransform.tx}px, ${scaleTransform.ty}px) scale(${scaleTransform.sx}, ${scaleTransform.sy})`
            : 'none',
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
          onMouseDown={() => {
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
                if (isThisFullscreen) exitFullscreen();
                onClose?.();
              }}
            />
            <button
              className="resize-button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isThisFullscreen) {
                  const rect = windowRef.current.getBoundingClientRect();
                  const tx = -rect.left;
                  const ty = -rect.top;
                  const sx = window.innerWidth / rect.width;
                  const sy = window.innerHeight / rect.height;
                  setScaleTransform({ tx, ty, sx, sy });
                  setTimeout(() => enterFullscreen(windowId), 0);
                } else {
                  exitFullscreen();
                }
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
              title={title}
              tabIndex={0}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                pointerEvents: isUserDragging ? 'none' : 'auto',
              }}
              onMouseDown={markFocused}
            />
          ) : (
            <div className="content-inner">{children}</div>
          )}
        </div>

        {/* Resizers */}
        {[
          'br',
          'tr',
          'bl',
          'tl',
          'top',
          'bottom',
          'left',
          'right',
        ].map((pos) => (
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
