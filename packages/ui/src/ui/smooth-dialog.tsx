'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';

// Motion-driven dialog. Radix owns state, focus trap, escape, scroll
// lock, and aria; we only spring-animate the content children on mount.
// The overlay keeps Radix's data-state fade so its exit reads right.
// No AnimatePresence wrapper: conditionally rendering it broke the
// Portal anchor (Radix lost track of the Content).

const SmoothDialog = DialogPrimitive.Root;
const SmoothDialogTrigger = DialogPrimitive.Trigger;
const SmoothDialogPortal = DialogPrimitive.Portal;
const SmoothDialogClose = DialogPrimitive.Close;

const CONTENT_SPRING = {
  type: 'spring' as const,
  stiffness: 360,
  damping: 30,
  mass: 0.9,
};

const SmoothDialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function SmoothDialogOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
        className
      )}
      {...props}
    />
  );
});

const SmoothDialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    // Suppress the default top-right Close so callers can render their
    // own inline close affordance.
    hideClose?: boolean;
  }
>(function SmoothDialogContent(
  { className, children, hideClose, ...props },
  ref
) {
  return (
    <SmoothDialogPortal>
      <SmoothDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 outline-none',
          className
        )}
        {...props}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={CONTENT_SPRING}
          className="relative rounded-2xl border border-line-strong bg-neutral-900 p-6 shadow-2xl shadow-black/50"
        >
          {children}
          {!hideClose && (
            <DialogPrimitive.Close
              className="absolute right-4 top-4 rounded-md p-1 text-neutral-500 transition-colors hover:bg-overlay hover:text-neutral-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          )}
        </motion.div>
      </DialogPrimitive.Content>
    </SmoothDialogPortal>
  );
});

function SmoothDialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4 flex flex-col gap-1.5', className)} {...props} />
  );
}

function SmoothDialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className
      )}
      {...props}
    />
  );
}

const SmoothDialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function SmoothDialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(
        'text-lg font-semibold tracking-tight text-neutral-50',
        className
      )}
      {...props}
    />
  );
});

const SmoothDialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function SmoothDialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('text-sm text-neutral-400', className)}
      {...props}
    />
  );
});

export {
  SmoothDialog,
  SmoothDialogTrigger,
  SmoothDialogClose,
  SmoothDialogContent,
  SmoothDialogHeader,
  SmoothDialogFooter,
  SmoothDialogTitle,
  SmoothDialogDescription,
};
