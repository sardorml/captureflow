// Shared SharePlayer + share-config types used by both the public
// share viewer and the dashboard edit page. The public viewer wraps
// SharePlayer with reactions via the progressOverlay + belowPlayer
// slot props; the editor uses SharePlayer directly.

export { SharePlayer } from './SharePlayer';
export type { SharePlayerHandle, ProgressOverlayInfo } from './SharePlayer';

export {
  DEFAULT_SHARE_CONFIG,
  SHARE_GRADIENT_KEYS,
  SHARE_GRADIENT_PRESETS,
  hydrateShareConfig,
  isShareGradientKey,
  isShareHexColor,
  shareConfigKeyFor,
  shareGradientCss,
} from './share-config';
export type {
  ShareCameraCorner,
  ShareCameraSize,
  ShareConfig,
  ShareGradientKey,
} from './share-config';
