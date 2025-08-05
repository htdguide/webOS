import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
// If you haven't set up jest-dom in a global setup file,
// make sure to import it here or in a setupTests.js file
import '@testing-library/jest-dom';

import DesktopIcon from './DesktopIcon.jsx';

describe('DesktopIcon', () => {
  it('renders the given icon and label', () => {
    const testName = 'My Test Icon';
    const testIcon = '../../media/icons/defaultapp.png';
    
    // Render the DesktopIcon
    const { container } = render(
      <DesktopIcon name={testName} icon={testIcon} />
    );

    // Verify the label text is in the document
    expect(screen.getByText(testName)).toBeInTheDocument();

    // Verify the image is set on the .icon-image element
    const iconImageDiv = container.querySelector('.icon-image');
    expect(iconImageDiv).toHaveStyle(`background-image: url(${testIcon})`);
  });
});
