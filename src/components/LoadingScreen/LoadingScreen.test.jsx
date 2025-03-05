import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
// If you're not using a global setup for jest-dom matchers, import them here:
import '@testing-library/jest-dom';

import LoadingScreen from './LoadingScreen.jsx';

describe('LoadingScreen', () => {
  it('renders the loading screen with an image', () => {
    render(<LoadingScreen />);

    // Check that the container is in the document
    const container = document.querySelector('.loading-screen');
    expect(container).toBeInTheDocument();

    // Check that the <img> is in the document with alt text "Loading..."
    const img = screen.getByAltText('Loading...');
    expect(img).toBeInTheDocument();

    // Optionally, confirm it has the correct class if you like
    expect(img).toHaveClass('loading-gif');
  });
});
