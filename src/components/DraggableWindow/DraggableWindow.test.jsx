import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
// If you haven't set up jest-dom matchers globally, import them here or in a setupTests.js
import '@testing-library/jest-dom';

import DraggableWindow from './DraggableWindow.jsx';

describe('DraggableWindow', () => {
  it('renders a window with title and displays child content', () => {
    render(
      <DraggableWindow
        title="Test Title"
        windowWidth={300}
        windowHeight={200}
        onClose={() => {}}
        onMount={() => {}}
        onUnmount={() => {}}
      >
        <div>Hello from inside!</div>
      </DraggableWindow>
    );

    // Check the title is shown
    expect(screen.getByText('Test Title')).toBeInTheDocument();

    // Check the child content is rendered
    expect(screen.getByText('Hello from inside!')).toBeInTheDocument();

    // Optionally, confirm the window container is in the document
    const windowElement = document.querySelector('.draggable-window');
    expect(windowElement).toBeInTheDocument();
  });
});
