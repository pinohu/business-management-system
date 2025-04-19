import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/Table';

describe('Table', () => {
  it('renders a basic table with all its components', () => {
    render(
      <Table>
        <TableCaption>Test Table</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Header 1</TableHead>
            <TableHead>Header 2</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell 1</TableCell>
            <TableCell>Cell 2</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Footer 1</TableCell>
            <TableCell>Footer 2</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    expect(screen.getByText('Test Table')).toBeInTheDocument();
    expect(screen.getByText('Header 1')).toBeInTheDocument();
    expect(screen.getByText('Header 2')).toBeInTheDocument();
    expect(screen.getByText('Cell 1')).toBeInTheDocument();
    expect(screen.getByText('Cell 2')).toBeInTheDocument();
    expect(screen.getByText('Footer 1')).toBeInTheDocument();
    expect(screen.getByText('Footer 2')).toBeInTheDocument();
  });

  it('applies custom class names correctly', () => {
    render(
      <Table className="custom-table">
        <TableHeader className="custom-header">
          <TableRow className="custom-row">
            <TableHead className="custom-head">Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="custom-body">
          <TableRow className="custom-row">
            <TableCell className="custom-cell">Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByRole('table')).toHaveClass('custom-table');
    expect(screen.getByRole('rowgroup')).toHaveClass('custom-header');
    expect(screen.getByRole('row')).toHaveClass('custom-row');
    expect(screen.getByRole('columnheader')).toHaveClass('custom-head');
    expect(screen.getByRole('cell')).toHaveClass('custom-cell');
  });

  it('renders table with empty state', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>No data available</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders table with multiple rows', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John</TableCell>
            <TableCell>25</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jane</TableCell>
            <TableCell>30</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('renders table with custom attributes', () => {
    render(
      <Table data-testid="custom-table">
        <TableHeader>
          <TableRow>
            <TableHead data-testid="custom-header">Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell data-testid="custom-cell">Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByTestId('custom-table')).toBeInTheDocument();
    expect(screen.getByTestId('custom-header')).toBeInTheDocument();
    expect(screen.getByTestId('custom-cell')).toBeInTheDocument();
  });
});
