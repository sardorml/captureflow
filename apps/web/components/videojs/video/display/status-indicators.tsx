import type { ComponentProps } from 'react';

import { SeekIndicator } from '@/components/videojs/ui/seek-indicator';
import { StatusAnnouncer } from '@/components/videojs/ui/status-announcer';
import { PlaybackStatusIndicator, StatusIndicator } from '@/components/videojs/ui/status-indicator';
import { VolumeIndicator } from '@/components/videojs/ui/volume-indicator';
import { cn } from '@/lib/resolve-class-name';

export type VideoStatusIndicatorsProps = Omit<ComponentProps<'div'>, 'children'>;

export function VideoStatusIndicators({ className, ...props }: VideoStatusIndicatorsProps = {}) {
  return (
    <>
      <StatusAnnouncer />
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-20 grid grid-cols-3 items-center justify-items-center',
          'text-media-controls-foreground',
          className
        )}
        {...props}
      >
        <VolumeIndicator />
        <StatusIndicator />
        <SeekIndicator />
        <PlaybackStatusIndicator
          className="p-8 [--media-duration-slow:0s] [--media-duration:0s] [--media-duration-fast:0.2s] [--media-icon-size:calc(--spacing(16)/1.5)]"
          closeDelay={350}
        />
      </div>
    </>
  );
}
