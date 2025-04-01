import React from 'react';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DeviceInfoProvider, { useDeviceInfo } from './DeviceInfoProvider';
import '@testing-library/jest-dom';

// A test consumer component that renders the device info from context
const TestConsumer = () => {
  const { ip, deviceType, orientation, browserModel, operatingSystem } = useDeviceInfo();
  return (
    <div>
      <p data-testid="ip">{ip}</p>
      <p data-testid="deviceType">{deviceType}</p>
      <p data-testid="orientation">{orientation}</p>
      <p data-testid="browserModel">{browserModel}</p>
      <p data-testid="operatingSystem">{operatingSystem}</p>
    </div>
  );
};

describe('DeviceInfoProvider (Vitest)', () => {
  beforeAll(() => {
    // Mock the user agent for browser detection
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/90.0.0.0 Safari/537.36',
      configurable: true,
    });

    // Mock the platform so getOperatingSystem() detects Windows
    Object.defineProperty(window.navigator, 'platform', {
      value: 'Win32',
      configurable: true,
    });

    // Mock screen size for orientation detection
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1200 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 800 });
  });

  beforeEach(() => {
    // Mock fetch to return a fake IP
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ ip: '1.2.3.4' }),
      })
    );

    // Spy on localStorage.setItem
    vi.spyOn(window.localStorage.__proto__, 'setItem');
    window.localStorage.setItem.mockClear();
  });

  afterEach(() => {
    // Restore mocks/spies to their original state
    vi.restoreAllMocks();
  });

  it('renders and provides device info via context', async () => {
    render(
      <DeviceInfoProvider>
        <TestConsumer />
      </DeviceInfoProvider>
    );

    // Check that IP is fetched and displayed
    expect(await screen.findByTestId('ip')).toHaveTextContent('1.2.3.4');

    // deviceType should be 'desktop' (based on userAgent + screen size)
    expect(screen.getByTestId('deviceType')).toHaveTextContent('desktop');

    // orientation should be 'landscape' since 1200 > 800
    expect(screen.getByTestId('orientation')).toHaveTextContent('landscape');

    // browserModel should be 'Chrome'
    expect(screen.getByTestId('browserModel')).toHaveTextContent('Chrome');

    // operatingSystem should be 'Windows' (due to mocked platform 'Win32')
    expect(screen.getByTestId('operatingSystem')).toHaveTextContent('Windows');

    // Ensure localStorage is called at least once
    await waitFor(() => {
      expect(window.localStorage.setItem).toHaveBeenCalled();
    });
  });
});
