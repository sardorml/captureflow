'use client';

import '../styles/base.css';
import '../styles/audio/theme.css';
import '../styles/video/captions.css';
import '../styles/video/theme.css';
import { ErrorDialog as ErrorDialogPrimitive } from '@videojs/react';

import { Button } from '@/components/videojs/ui/button';
import { cn } from '@/lib/resolve-class-name';

export function ErrorDialog() {
  return (
    <ErrorDialogPrimitive.Root>
      <ErrorDialogPrimitive.Backdrop
        className={cn(
          'absolute inset-0 z-40 bg-media-backdrop/20 opacity-100 backdrop-filter-media-dialog rounded-[inherit]',
          'not-data-open:hidden transition-opacity delay-media-dialog duration-media-dialog ease-out',
          'media-transitioning:opacity-0 data-ending-style:delay-0',
          'data-ending-style:duration-media-slower'
        )}
      />
      <ErrorDialogPrimitive.Popup
        className={cn(
          'absolute top-1/2 left-1/2 z-50 flex w-media-dialog-width max-w-media-dialog max-h-[calc(100%-0.5rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-media-dialog text-media-popover-foreground outline-hidden not-data-open:hidden',
          'text-shadow-media-dialog transition-[opacity,scale] delay-media-dialog duration-media-dialog ease-out',
          'media-transitioning:scale-media-hidden-popup media-transitioning:opacity-0 data-ending-style:delay-0',
          'bg-media-popover surface-media after:surface-media-inset',
          'p-3',
          'data-ending-style:duration-media-slower'
        )}
      >
        <div className={cn('flex min-h-0 flex-col gap-2 overflow-y-auto', 'px-2 pt-2 pb-1.5')}>
          <ErrorDialogPrimitive.Title className={'m-0 text-media-lg font-semibold leading-tight'} />
          <ErrorDialogPrimitive.Description className={'m-0 opacity-70 wrap-anywhere'} />
        </div>
        <div className={'flex shrink-0 gap-2'}>
          <ErrorDialogPrimitive.Close
            render={<Button />}
            className={
              'h-media-control w-full flex-1 bg-media-primary! px-4 py-2 font-medium text-media-primary-foreground!'
            }
          />
        </div>
      </ErrorDialogPrimitive.Popup>
    </ErrorDialogPrimitive.Root>
  );
}
