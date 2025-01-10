import React, { useRef, useState } from 'react';
import './Draggable.css';

const Draggable = () => {
  const cardRef = useRef(null);
  const handleRef = useRef(null);
  const resizeRef = useRef(null);
  let startX = 0, startY = 0, newWidth = 0, newHeight = 0;

  const [dimensions, setDimensions] = useState({ width: 300, height: 200 });

  const mouseDown = (e) => {
    if (e.target === handleRef.current) {
      startX = e.clientX;
      startY = e.clientY;

      document.addEventListener('mousemove', mouseMove);
      document.addEventListener('mouseup', mouseUp);
    }
  };

  const mouseMove = (e) => {
    if (cardRef.current) {
      const card = cardRef.current;
      const cardRect = card.getBoundingClientRect();

      const deltaX = startX - e.clientX;
      const deltaY = startY - e.clientY;

      startX = e.clientX;
      startY = e.clientY;

      const newTop = Math.min(
        Math.max(card.offsetTop - deltaY, 0),
        window.innerHeight - cardRect.height
      );
      const newLeft = Math.min(
        Math.max(card.offsetLeft - deltaX, 0),
        window.innerWidth - cardRect.width
      );

      card.style.top = `${newTop}px`;
      card.style.left = `${newLeft}px`;
    }
  };

  const mouseUp = () => {
    document.removeEventListener('mousemove', mouseMove);
    document.removeEventListener('mouseup', mouseUp);
  };

  const resizeMouseDown = (e) => {
    startX = e.clientX;
    startY = e.clientY;

    const card = cardRef.current;
    const cardRect = card.getBoundingClientRect();

    newWidth = cardRect.width;
    newHeight = cardRect.height;

    document.addEventListener('mousemove', resizeMouseMove);
    document.addEventListener('mouseup', resizeMouseUp);
  };

  const resizeMouseMove = (e) => {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    const card = cardRef.current;
    const cardRect = card.getBoundingClientRect();

    const updatedWidth = Math.max(200, newWidth + deltaX);
    const updatedHeight = Math.max(150, newHeight + deltaY);

    // Prevent resizing beyond the viewport boundaries
    if (
      cardRect.left + updatedWidth <= window.innerWidth &&
      cardRect.top + updatedHeight <= window.innerHeight
    ) {
      card.style.width = `${updatedWidth}px`;
      card.style.height = `${updatedHeight}px`;
    }
  };

  const resizeMouseUp = () => {
    document.removeEventListener('mousemove', resizeMouseMove);
    document.removeEventListener('mouseup', resizeMouseUp);
  };

  const closeWindow = () => {
    cardRef.current.style.display = 'none';
  };

  return (
    <div
      ref={cardRef}
      className="draggable-card"
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
      }}
      onMouseDown={mouseDown}
    >
      {/* Drag handle */}
      <div ref={handleRef} className="drag-handle">
        <div className="close-button" onClick={closeWindow}></div>
      </div>
      <div className="content">
        <p>macOS Window Content</p>
      </div>
      <div
        ref={resizeRef}
        className="resize-handle"
        onMouseDown={resizeMouseDown}
      ></div>
    </div>
  );
};

export default Draggable;
