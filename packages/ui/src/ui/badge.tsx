import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1',
  {
    variants: {
      variant: {
        default: 'bg-overlay text-neutral-100 ring-line-strong',
        muted: 'bg-neutral-800 text-neutral-400 ring-line-strong',
        outline: 'bg-transparent text-neutral-300 ring-line-strong',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
