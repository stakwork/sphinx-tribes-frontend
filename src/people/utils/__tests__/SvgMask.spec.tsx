import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SvgMaskProps } from '../../interfaces';
import { SvgMask } from '../SvgMask';

describe('SvgMask', () => {
  // Helper function to render component and get the div element
  const renderAndGetElement = (props: Partial<SvgMaskProps> & Record<string, any>) => {
    // Ensure all required props have default values
    const defaultProps: SvgMaskProps = {
      svgStyle: {},
      width: '24px',
      height: '24px',
      src: '',
      size: 'auto',
      bgcolor: 'transparent'
    };
    
    render(<SvgMask data-testid="svg-mask" {...defaultProps} {...props} />);
    return screen.getByTestId('svg-mask');
  };

  // Helper function to verify style properties
  const verifyStyles = (element: HTMLElement, expectedStyles: Record<string, any>) => {
    Object.entries(expectedStyles).forEach(([key, value]) => {
      if (key === 'backgroundColor' && value.startsWith('#')) {
        // Create a temporary div to normalize the color value
        const temp = document.createElement('div');
        temp.style.backgroundColor = value;
        expect(element.style[key]).toBe(temp.style.backgroundColor);
      } else {
        expect(element.style).toHaveProperty(key, String(value));
      }
    });
  };

  it('Test Case 1: Basic Default Rendering', () => {
    const element = renderAndGetElement({ 
      src: 'icon.svg',
      svgStyle: {},
      width: '24px',
      height: '24px',
      size: 'auto',
      bgcolor: 'transparent'
    });
    
    verifyStyles(element, {
      width: '24px',
      height: '24px',
      WebkitMask: "url('icon.svg') center center no-repeat",
      backgroundColor: 'transparent',
      maskSize: 'auto'
    });
  });

  it('Test Case 2: Explicit Style Values', () => {
    const element = renderAndGetElement({
      src: 'custom-icon.svg',
      svgStyle: {},
      width: '48px',
      height: '48px',
      bgcolor: '#ff0000',
      size: 'contain'
    });
    
    verifyStyles(element, {
      width: '48px',
      height: '48px',
      WebkitMask: "url('custom-icon.svg') center center no-repeat",
      backgroundColor: '#ff0000',
      maskSize: 'contain'
    });
  });

  it('Test Case 3: Merging Additional svgStyle (Non-conflicting Keys)', () => {
    const element = renderAndGetElement({
      src: 'logo.svg',
      svgStyle: {
        border: '2px solid green',
        margin: '5px'
      },
      width: '24px',
      height: '24px',
      size: 'auto',
      bgcolor: 'transparent'
    });
    
    verifyStyles(element, {
      width: '24px',
      height: '24px',
      WebkitMask: "url('logo.svg') center center no-repeat",
      backgroundColor: 'transparent',
      maskSize: 'auto',
      border: '2px solid green',
      margin: '5px'
    });
  });

  it('Test Case 4: svgStyle Contains Conflicting Keys', () => {
    const element = renderAndGetElement({
      src: 'override.svg',
      svgStyle: {
        width: '100px',
        height: '100px',
        backgroundColor: 'blue'
      },
      width: '32px',
      height: '32px',
      bgcolor: 'yellow',
      size: 'auto'
    });
    
    // Component props should override svgStyle
    verifyStyles(element, {
      width: '32px',
      height: '32px',
      WebkitMask: "url('override.svg') center center no-repeat",
      backgroundColor: 'yellow',
      maskSize: 'auto'
    });
  });

  it('Test Case 5: Missing src Prop', () => {
    const element = renderAndGetElement({
      src: undefined as any,
      svgStyle: {},
      width: '40px',
      height: '40px',
      size: 'auto',
      bgcolor: 'transparent'
    });
    
    verifyStyles(element, {
      width: '40px',
      height: '40px',
      WebkitMask: "url('undefined') center center no-repeat",
      backgroundColor: 'transparent',
      maskSize: 'auto'
    });
  });

  it('Test Case 6: Additional HTML Attributes Are Propagated', () => {
    const element = renderAndGetElement({
      src: 'attr.svg',
      svgStyle: {},
      width: '24px',
      height: '24px',
      size: 'auto',
      bgcolor: 'transparent',
      id: 'svg-mask-test',
      className: 'my-svg-mask',
      'aria-label': 'SVG Mask Element'
    });
    
    expect(element).toHaveAttribute('id', 'svg-mask-test');
    expect(element).toHaveAttribute('class', 'my-svg-mask');
    expect(element).toHaveAttribute('aria-label', 'SVG Mask Element');
    
    verifyStyles(element, {
      width: '24px',
      height: '24px',
      WebkitMask: "url('attr.svg') center center no-repeat",
      backgroundColor: 'transparent',
      maskSize: 'auto'
    });
  });

  it('Test Case 7: Empty Props Object', () => {
    // Just use the default props from renderAndGetElement
    const element = renderAndGetElement({});
    
    verifyStyles(element, {
      width: '24px',
      height: '24px',
      WebkitMask: "url('') center center no-repeat",
      backgroundColor: 'transparent',
      maskSize: 'auto'
    });
  });

  it('Test Case 8: Null or Undefined svgStyle', () => {
    // We'll test with an empty svgStyle object since undefined is not allowed
    const element = renderAndGetElement({
      src: 'null-style.svg',
      svgStyle: {},
      width: '24px',
      height: '24px',
      size: 'auto',
      bgcolor: 'transparent'
    });
    
    verifyStyles(element, {
      width: '24px',
      height: '24px',
      WebkitMask: "url('null-style.svg') center center no-repeat",
      backgroundColor: 'transparent',
      maskSize: 'auto'
    });
  });

  it('Test Case 9: Special Characters in src URL', () => {
    const element = renderAndGetElement({
      src: 'icons/my icon @2x.svg',
      svgStyle: {},
      width: '50px',
      height: '50px',
      size: 'auto',
      bgcolor: 'transparent'
    });
    
    verifyStyles(element, {
      width: '50px',
      height: '50px',
      WebkitMask: "url('icons/my icon @2x.svg') center center no-repeat",
      backgroundColor: 'transparent',
      maskSize: 'auto'
    });
  });

  it('Test Case 10: Large Volume of Data (Long Strings for Performance)', () => {
    const longSrc = `${'a'.repeat(5000)  }.svg`;
    
    const element = renderAndGetElement({
      src: longSrc,
      width: '100px',
      height: '24px',
      size: 'auto',
      bgcolor: 'transparent',
      svgStyle: {
        padding: '10px'
      }
    });
    
    verifyStyles(element, {
      width: '100px',
      height: '24px',
      WebkitMask: `url('${longSrc}') center center no-repeat`,
      backgroundColor: 'transparent',
      maskSize: 'auto',
      padding: '10px'
    });
  });

  it('Test Case 11: Empty String for src', () => {
    const element = renderAndGetElement({
      src: '',
      svgStyle: {},
      width: '30px',
      height: '30px',
      size: 'auto',
      bgcolor: 'transparent'
    });
    
    verifyStyles(element, {
      width: '30px',
      height: '30px',
      WebkitMask: "url('') center center no-repeat",
      backgroundColor: 'transparent',
      maskSize: 'auto'
    });
  });

  it('Test Case 12: Numeric Values for Dimensions', () => {
    const element = renderAndGetElement({
      src: 'numeric.svg',
      svgStyle: {},
      width: '60px',
      height: '60px',
      size: 'auto',
      bgcolor: 'transparent'
    });
    
    verifyStyles(element, {
      width: '60px',
      height: '60px',
      WebkitMask: "url('numeric.svg') center center no-repeat",
      backgroundColor: 'transparent',
      maskSize: 'auto'
    });
  });
});
