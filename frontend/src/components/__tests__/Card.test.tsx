import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '../Card';

describe('Card', () => {
  it('renders a basic card', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Test Content</CardContent>
        <CardFooter>Test Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Test Footer')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<Card className="custom-class">Test Card</Card>);
    expect(screen.getByText('Test Card').parentElement).toHaveClass('custom-class');
  });

  it('renders CardHeader with custom className', () => {
    render(
      <Card>
        <CardHeader className="custom-header">Test Header</CardHeader>
      </Card>
    );
    expect(screen.getByText('Test Header').parentElement).toHaveClass('custom-header');
  });

  it('renders CardTitle with custom className', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle className="custom-title">Test Title</CardTitle>
        </CardHeader>
      </Card>
    );
    expect(screen.getByText('Test Title')).toHaveClass('custom-title');
  });

  it('renders CardDescription with custom className', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription className="custom-description">Test Description</CardDescription>
        </CardHeader>
      </Card>
    );
    expect(screen.getByText('Test Description')).toHaveClass('custom-description');
  });

  it('renders CardContent with custom className', () => {
    render(
      <Card>
        <CardContent className="custom-content">Test Content</CardContent>
      </Card>
    );
    expect(screen.getByText('Test Content').parentElement).toHaveClass('custom-content');
  });

  it('renders CardFooter with custom className', () => {
    render(
      <Card>
        <CardFooter className="custom-footer">Test Footer</CardFooter>
      </Card>
    );
    expect(screen.getByText('Test Footer').parentElement).toHaveClass('custom-footer');
  });
});
