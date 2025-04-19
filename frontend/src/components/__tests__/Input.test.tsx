import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with different types', () => {
    render(<Input type="password" placeholder="Enter password" />);
    expect(screen.getByPlaceholderText('Enter password')).toHaveAttribute('type', 'password');
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} placeholder="Enter text" />);

    const input = screen.getByPlaceholderText('Enter text');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('handles disabled state', () => {
    render(<Input disabled placeholder="Disabled input" />);
    expect(screen.getByPlaceholderText('Disabled input')).toBeDisabled();
  });

  it('renders with custom className', () => {
    render(<Input className="custom-class" placeholder="Custom input" />);
    expect(screen.getByPlaceholderText('Custom input')).toHaveClass('custom-class');
  });

  it('handles focus and blur events', () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();

    render(
      <Input
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Focus/blur input"
      />
    );

    const input = screen.getByPlaceholderText('Focus/blur input');
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalled();

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalled();
  });

  it('handles required attribute', () => {
    render(<Input required placeholder="Required input" />);
    expect(screen.getByPlaceholderText('Required input')).toBeRequired();
  });

  it('handles placeholder attribute', () => {
    render(<Input placeholder="Test placeholder" />);
    expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
  });
});
