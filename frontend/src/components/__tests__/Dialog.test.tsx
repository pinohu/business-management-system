import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';

describe('Dialog', () => {
  it('renders dialog trigger and opens dialog on click', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Open Dialog'));
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('closes dialog when clicking outside', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    fireEvent.click(screen.getByText('Open Dialog'));
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();

    fireEvent.click(document.body);
    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
  });

  it('renders dialog with footer and buttons', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <button onClick={onCancel}>Cancel</button>
            <button onClick={onSave}>Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    fireEvent.click(screen.getByText('Open Dialog'));
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('applies custom class names correctly', () => {
    render(
      <Dialog>
        <DialogTrigger className="custom-trigger">Open Dialog</DialogTrigger>
        <DialogContent className="custom-content">
          <DialogHeader className="custom-header">
            <DialogTitle className="custom-title">Test Dialog</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Open Dialog')).toHaveClass('custom-trigger');

    fireEvent.click(screen.getByText('Open Dialog'));
    expect(screen.getByRole('dialog')).toHaveClass('custom-content');
    expect(screen.getByRole('banner')).toHaveClass('custom-header');
    expect(screen.getByRole('heading')).toHaveClass('custom-title');
  });

  it('renders dialog with custom attributes', () => {
    render(
      <Dialog>
        <DialogTrigger data-testid="custom-trigger">Open Dialog</DialogTrigger>
        <DialogContent data-testid="custom-content">
          <DialogHeader>
            <DialogTitle data-testid="custom-title">Test Dialog</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('custom-trigger'));
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByTestId('custom-title')).toBeInTheDocument();
  });
});
