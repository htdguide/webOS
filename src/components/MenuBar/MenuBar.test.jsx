import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MenuBar from './MenuBar.jsx';

// Mock the useDeviceInfo hook
vi.mock('../../services/DeviceInfoProvider/DeviceInfoProvider', () => ({
  useDeviceInfo: vi.fn(() => ({ orientation: 'landscape' })),
}));

describe('MenuBar', () => {
  it('renders the menu bar with links and username', () => {
    render(<MenuBar />);

    // Check if the main menu links are present
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();

    // Check if the username is visible
    expect(screen.getByText('htdguide')).toBeInTheDocument();

    // (Optional) Confirm the .menu-bar container is in the document
    const menuBarElement = document.querySelector('.menu-bar');
    expect(menuBarElement).toBeInTheDocument();
  });
});
