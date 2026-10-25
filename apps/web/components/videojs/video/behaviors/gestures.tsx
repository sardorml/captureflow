import { Gesture } from '@videojs/react';

export interface VideoGesturesProps {
  disabled?: boolean | undefined;
}

export function VideoGestures({ disabled = false }: VideoGesturesProps = {}) {
  return (
    <>
      <Gesture disabled={disabled} type="tap" action="togglePaused" pointer="mouse" region="center" />
      <Gesture disabled={disabled} type="tap" action="toggleControls" pointer="touch" />
    </>
  );
}
