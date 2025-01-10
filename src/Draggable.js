import React, { useRef } from 'react';
import './Draggable.css';

const Draggable = () => {
  const cardRef = useRef(null);
  let startX = 0, startY = 0, newX = 0, newY = 0;

  const mouseDown = (e) => {
    startX = e.clientX;
    startY = e.clientY;

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
  };

  const mouseMove = (e) => {
    if (cardRef.current) {
      newX = startX - e.clientX;
      newY = startY - e.clientY;

      startX = e.clientX;
      startY = e.clientY;

      const card = cardRef.current;
      card.style.top = `${card.offsetTop - newY}px`;
      card.style.left = `${card.offsetLeft - newX}px`;
    }
  };

  const mouseUp = () => {
    document.removeEventListener('mousemove', mouseMove);
    document.removeEventListener('mouseup', mouseUp);
  };

  return (
    <div
      ref={cardRef}
      className="draggable-card"
      onMouseDown={mouseDown}
    ></div>
  );
};

export default Draggable;
