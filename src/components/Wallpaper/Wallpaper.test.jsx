import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Wallpaper from './Wallpaper';

describe('Wallpaper', () => {
  it('displays the fallback image and the video', () => {
    // Render the Wallpaper
    const { container } = render(<Wallpaper />);

    // 1. Confirm the fallback image is in the document
    const fallbackImg = screen.getByAltText('Wallpaper Fallback');
    expect(fallbackImg).toBeInTheDocument();

    // 2. Confirm a <video> element is rendered
    const videoEl = container.querySelector('video');
    expect(videoEl).toBeInTheDocument();

    // 3. Check that the <video> includes the expected <source>
    const sourceEl = container.querySelector('source');
    expect(sourceEl).toHaveAttribute('src', '/WebintoshHD/Wallpapers/SequoiaSunrise.mp4');
    expect(sourceEl).toHaveAttribute('type', 'video/mp4');
  });
});
