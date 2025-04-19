import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '../Label';

describe('Label', () => {
  it('renders with text content', () => {
    render(<Label>Test Label</Label>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with htmlFor attribute', () => {
    render(<Label htmlFor="test-input">Test Label</Label>);
    expect(screen.getByText('Test Label')).toHaveAttribute('for', 'test-input');
  });

  it('renders with custom className', () => {
    render(<Label className="custom-class">Test Label</Label>);
    expect(screen.getByText('Test Label')).toHaveClass('custom-class');
  });

  it('renders with required attribute', () => {
    render(<Label required>Required Label</Label>);
    expect(screen.getByText('Required Label')).toHaveAttribute('aria-required', 'true');
  });

  it('renders with disabled state', () => {
    render(<Label disabled>Disabled Label</Label>);
    expect(screen.getByText('Disabled Label')).toHaveClass('opacity-70');
  });

  it('renders with custom attributes', () => {
    render(
      <Label data-testid="test-label" aria-label="Test Label">
        Test Label
      </Label>
    );
    expect(screen.getByTestId('test-label')).toHaveAttribute('aria-label', 'Test Label');
  });

  it('renders with children elements', () => {
    render(
      <Label>
        <span>Test</span> <span>Label</span>
      </Label>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Label')).toBeInTheDocument();
  });
});
