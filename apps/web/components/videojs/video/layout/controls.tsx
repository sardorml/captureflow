import { Controls, Time, Tooltip } from '@videojs/react';
import type { ComponentProps } from 'react';

import { AirPlayButton } from '@/components/videojs/ui/airplay-button';
import { ButtonTooltip } from '@/components/videojs/ui/button-tooltip';
import { CaptionsButton } from '@/components/videojs/ui/captions-button';
import { CastButton } from '@/components/videojs/ui/cast-button';
import { FullscreenButton } from '@/components/videojs/ui/fullscreen-button';
import { PiPButton } from '@/components/videojs/ui/pip-button';
import { PlayButton } from '@/components/videojs/ui/play-button';
import { TimeSlider } from '@/components/videojs/ui/time-slider';
import { VolumePopover } from '@/components/videojs/ui/volume-popover';
import { cn } from '@/lib/resolve-class-name';

import { VideoSettingsMenu } from '../menus/settings-menu';

export interface DefaultVideoControlsProps {
  renderThumbnail?: NonNullable<ComponentProps<typeof TimeSlider>>['renderThumbnail'];
}

export function DefaultVideoControls({ renderThumbnail }: DefaultVideoControlsProps = {}) {
  return (
    <Controls.Root>
      <Controls.Backdrop
        className={cn(
          'pointer-events-none absolute inset-0 z-10 rounded-[inherit] bg-(image:--media-controls-gradient)',
          'transition-opacity duration-media-controls ease-out not-data-visible:opacity-0'
        )}
      />
      <Controls.Content
        className={cn(
          'video-controls',
          'group/controls text-media-controls-foreground text-shadow-media',
          'duration-media-controls-enter ease-out',
          'contents p-1 transition-[filter,opacity,scale,translate]',
          'media-lg:absolute media-lg:inset-x-2 media-lg:bottom-2 media-lg:z-30',
          'media-lg:flex media-lg:items-center media-lg:rtl:flex-row-reverse media-lg:rounded-media-controls',
          'media-lg:bg-media-popover media-lg:text-media-popover-foreground',
          'media-lg:surface-media media-lg:after:surface-media-inset',
          'media-2xl:inset-x-3 media-2xl:bottom-3',
          'media-lg:not-data-visible:pointer-events-none media-lg:not-data-visible:opacity-0',
          'media-lg:not-data-visible:scale-media-hidden media-lg:not-data-visible:translate-y-media-hidden-offset',
          'media-lg:pointer-fine:not-data-visible:blur-media-hidden',
          'media-lg:not-data-visible:duration-media-controls'
        )}
      >
        <Tooltip.Provider>
          <Controls.Group
            className={cn(
              'absolute inset-x-2 bottom-2 z-30 flex origin-bottom items-center rtl:flex-row-reverse rounded-media-controls p-0.5',
              'media-max-lg:bg-media-popover media-max-lg:text-media-popover-foreground',
              'media-max-lg:surface-media media-max-lg:after:surface-media-inset',
              'media-lg:contents',
              'media-max-lg:group-[:not([data-visible])]/controls:pointer-events-none',
              'media-max-lg:group-[:not([data-visible])]/controls:opacity-0',
              'media-max-lg:group-[:not([data-visible])]/controls:scale-media-hidden',
              'media-max-lg:pointer-fine:group-[:not([data-visible])]/controls:blur-media-hidden',
              'transition-[filter,opacity,scale,translate] duration-media-controls-enter ease-out',
              'media-max-lg:group-[:not([data-visible])]/controls:duration-media-controls',
              'media-max-lg:group-[:not([data-visible])]/controls:translate-y-media-hidden-offset'
            )}
          >
            <ButtonTooltip side="top">
              <PlayButton />
            </ButtonTooltip>
            <VolumePopover className={'ms-px'} />

            <Controls.Group
              className={
                '@container/media-time flex flex-1 items-center rtl:flex-row-reverse gap-2.5 px-2 media-lg:px-3'
              }
            >
              <Time.Value
                className={cn(
                  'tabular-nums transition-opacity duration-media-slow ease-out data-unavailable:opacity-50',
                  '@max-[16rem]/media-time:hidden'
                )}
                type="current"
              />
              <TimeSlider renderThumbnail={renderThumbnail} />
              <Time.Value
                className={cn(
                  'cursor-pointer rounded-sm tabular-nums focus-ring-media',
                  'aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
                  'transition-[outline-color,outline-offset] duration-media-fast ease-out',
                  'focus-visible:outline-media-ring focus-visible:outline-offset-2',
                  '@max-[16rem]/media-time:hidden'
                )}
                type="remaining"
                toggle
              />
            </Controls.Group>

            <ButtonTooltip side="top">
              <CaptionsButton className={'media-max-lg:hidden'} />
            </ButtonTooltip>
            <VideoSettingsMenu className={'media-lg:ms-px'} />
          </Controls.Group>

          <Controls.Group
            className={cn(
              'absolute top-2 right-2 z-30 flex origin-top items-center rtl:flex-row-reverse gap-px rounded-media-controls p-0.5',
              'media-max-lg:bg-media-popover media-max-lg:text-media-popover-foreground',
              'media-max-lg:surface-media media-max-lg:after:surface-media-inset',
              'media-lg:static media-lg:p-0',
              'media-max-lg:group-[:not([data-visible])]/controls:pointer-events-none',
              'media-max-lg:group-[:not([data-visible])]/controls:opacity-0',
              'media-max-lg:group-[:not([data-visible])]/controls:scale-media-hidden',
              'media-max-lg:pointer-fine:group-[:not([data-visible])]/controls:blur-media-hidden',
              'transition-[filter,opacity,scale,translate] duration-media-controls-enter ease-out',
              'media-max-lg:group-[:not([data-visible])]/controls:duration-media-controls',
              'media-max-lg:group-[:not([data-visible])]/controls:-translate-y-media-hidden-offset'
            )}
          >
            <ButtonTooltip side="top">
              <CastButton />
            </ButtonTooltip>
            <ButtonTooltip side="top">
              <AirPlayButton />
            </ButtonTooltip>
            <ButtonTooltip side="top">
              <PiPButton />
            </ButtonTooltip>
            <ButtonTooltip side="top">
              <FullscreenButton />
            </ButtonTooltip>
          </Controls.Group>
        </Tooltip.Provider>
      </Controls.Content>
    </Controls.Root>
  );
}
