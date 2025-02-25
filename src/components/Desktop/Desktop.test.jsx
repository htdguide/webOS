import React from 'react';
import { describe, it, expect, vi } from 'vitest'; // <-- import vi here
import { render, screen } from '@testing-library/react';
import Desktop from './Desktop.jsx';
import DesktopAppsList from '../../lists/DesktopAppsList.jsx';
import "@testing-library/jest-dom";

describe('Desktop component', () => {
  it('renders icons from DesktopAppsList', () => {
    // Mock the onOpenApp prop
    const onOpenAppMock = vi.fn();

    // Render the Desktop
    render(<Desktop onOpenApp={onOpenAppMock} />);

    // For each app in DesktopAppsList, check if its name is displayed
    DesktopAppsList.forEach(app => {
      expect(screen.getByText(app.name)).toBeInTheDocument();
    });
  });
});
