import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { LabelProps as BaseLabelProps } from '@/types/ui';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        muted: 'text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface LabelProps
  extends BaseLabelProps,
    VariantProps<typeof labelVariants> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, variant, required, disabled, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(labelVariants({ variant }), className)}
        aria-required={required}
        data-disabled={disabled}
        {...props}
      >
        {children}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';

export { Label };
