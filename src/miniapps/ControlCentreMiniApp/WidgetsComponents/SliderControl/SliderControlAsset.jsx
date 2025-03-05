import React, { useState, useEffect } from 'react';
import './SliderControlAsset.css';

/**
 * A reusable slider widget that uses unique CSS classes so multiple sliders
 * do NOT conflict with each other’s “active” (gray) styling.
 */
function SliderControlWidgetAsset({
  label = '',
  icon = null,
  value = 50,
  onChange,
  min = 0,
  max = 100,
  fadeThumbBorder = false,
  removeFocusOutline = true,
}) {
  // 1) Fading border logic (same as your old code).
  let thumbBorderOpacity = 1;
  if (fadeThumbBorder) {
    if (value < 20) {
      thumbBorderOpacity = 0;
    } else if (value >= 20 && value < 80) {
      thumbBorderOpacity = (value - 20) / 60;
    } else {
      thumbBorderOpacity = 1;
    }
  }

  // 2) Track if thumb is currently pressed.
  const [isThumbActive, setIsThumbActive] = useState(false);
  const handlePointerDown = () => setIsThumbActive(true);
  const handlePointerUp = () => setIsThumbActive(false);

  // 3) Generate a unique class name for THIS slider instance.
  //    We'll store it in a state so it doesn't change across renders.
  const [uniqueClass] = useState(() => {
    // e.g. "slider-s7s8z" – random string
    const rand = Math.random().toString(36).substring(2, 7);
    return `slider-${rand}`;
  });

  // 4) handle slider value changes
  const handleSliderChange = (e) => {
    onChange?.(Number(e.target.value));
  };

  // 5) Dynamically build a style block that applies only to this slider’s unique class
  const [dynamicCSS, setDynamicCSS] = useState('');

  useEffect(() => {
    // If not active => background is #fff
    if (!isThumbActive) {
      const css = `
        .${uniqueClass}::-webkit-slider-thumb {
          background: #fff !important;
        }
        .${uniqueClass}::-moz-range-thumb {
          background: #fff !important;
        }
      `;
      setDynamicCSS(css);
      return;
    }

    // If active => fade from #ccc to #fff using the same ratio as border fade
    const ratio = 1 - thumbBorderOpacity; // 0 => #ccc, 1 => #fff
    const startRGB = [225, 225, 225];   // #ccc
    const endRGB   = [255, 255, 255];   // #fff
    const r = startRGB[0] + Math.round((endRGB[0] - startRGB[0]) * ratio);
    const g = startRGB[1] + Math.round((endRGB[1] - startRGB[1]) * ratio);
    const b = startRGB[2] + Math.round((endRGB[2] - startRGB[2]) * ratio);
    const color = `rgb(${r}, ${g}, ${b})`;

    const css = `
      .${uniqueClass}::-webkit-slider-thumb {
        background: ${color} !important;
      }
      .${uniqueClass}::-moz-range-thumb {
        background: ${color} !important;
      }
    `;
    setDynamicCSS(css);
  }, [isThumbActive, thumbBorderOpacity, uniqueClass]);

  return (
    <div className="slider-control-outer">
      {/* Inject a style tag for this slider’s dynamic CSS */}
      {dynamicCSS && <style>{dynamicCSS}</style>}

      <div className="slider-control-title">{label}</div>

      <div className="slider-control-container">
        {icon && (
          <img
            src={icon}
            alt="Slider Icon"
            className="slider-icon-ontrack"
          />
        )}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleSliderChange}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className={`slider-control-range ${uniqueClass}${
            removeFocusOutline ? ' no-focus-outline' : ''
          }`}
          style={{
            '--white-stop': `${value}%`,
            '--thumb-border-opacity': thumbBorderOpacity,
          }}
        />
      </div>
    </div>
  );
}

export default SliderControlWidgetAsset;
