import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

// Dashboard button primitive. Variants line up with the surfaces the
// app actually has — `default` is the violet primary CTA, `secondary`
// is the neutral bordered button, `ghost` is icon-only, `destructive`
// is the red flavour for delete actions.

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white shadow-sm hover:bg-blue-500',
        secondary:
          'border border-line-strong bg-neutral-900 text-fg hover:border-line-strong hover:bg-overlay hover:text-fg-strong',
        ghost: 'text-fg-muted hover:bg-overlay hover:text-fg',
        destructive:
          'border border-line-strong bg-neutral-900 text-fg-muted hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300',
        link: 'text-fg-muted underline-offset-4 hover:underline hover:text-fg',
      },
      size: {
        default: 'h-9 px-3.5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-5',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, ...props },
  ref
) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
});

export { Button, buttonVariants };
