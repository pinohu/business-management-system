import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('renders with different variants', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
  });

  it('renders with different sizes', () => {
    render(<Button size="lg">Large Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-11');
  });

  it('handles disabled state', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});
