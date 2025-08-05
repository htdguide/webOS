import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Notification, { notify } from './Notification';

describe('Notification component', () => {
  it('displays the message and icon when notify is called', () => {
    // 1) Render the Notification component, which listens for "show-notification" events
    render(<Notification />);

    // 2) Use act to dispatch the "show-notification" event via notify
    act(() => {
      notify('Hello world', 5000, '/test-icon.png');
    });

    // 3) Confirm the message text is now visible
    expect(screen.getByText('Hello world')).toBeInTheDocument();

    // 4) Confirm the icon is rendered with the correct src
    const icon = screen.getByAltText('icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', '/test-icon.png');
  });
});
