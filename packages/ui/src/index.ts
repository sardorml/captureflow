// Single barrel for the @captureflow/ui primitives. Callers can import
// from the root (`import { Button } from '@captureflow/ui'`) or from a
// subpath (`import { Button } from '@captureflow/ui/button'`) — both
// resolve to the same module via the package's exports map.

export { cn } from './lib/cn';
export {
  type Theme,
  THEME_COOKIE,
  DEFAULT_THEME,
  isTheme,
  readThemeFromCookieHeader,
} from './lib/theme';
export { ThemeToggle } from './ui/theme-toggle';
export { STALE_CHUNK_GUARD_SCRIPT } from './ui/stale-chunk-guard';
export { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
export { Badge, badgeVariants } from './ui/badge';
export { Button, buttonVariants } from './ui/button';
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
export { Input } from './ui/input';
export { Label } from './ui/label';
export { RadioGroup, RadioGroupItem } from './ui/radio-group';
export { Separator } from './ui/separator';
export { Textarea } from './ui/textarea';
// Motion-driven smoothui-flavoured variants. Same Radix substrate as
// the shadcn primitives above; the open/close + press feedback runs
// through `motion` springs so the chrome reads as "alive" instead of
// CSS-keyframed. Adopt these gradually — they're not drop-in renames
// because the Dialog/DropdownMenu Root components own controlled open
// state, so a few call sites that read Radix internals would need a
// tweak.
export { SmoothButton, smoothButtonVariants } from './ui/smooth-button';
export type { SmoothButtonProps } from './ui/smooth-button';
export {
  SmoothDialog,
  SmoothDialogTrigger,
  SmoothDialogClose,
  SmoothDialogContent,
  SmoothDialogHeader,
  SmoothDialogFooter,
  SmoothDialogTitle,
  SmoothDialogDescription,
} from './ui/smooth-dialog';
export { GridLoader } from './ui/grid-loader';
export type { GridLoaderProps } from './ui/grid-loader';
export { AvatarGroup, AvatarInviteSlot } from './ui/avatar-group';
export type { AvatarGroupItem, AvatarTone } from './ui/avatar-group';
export {
  SmoothDropdownMenu,
  SmoothDropdownMenuTrigger,
  SmoothDropdownMenuGroup,
  SmoothDropdownMenuPortal,
  SmoothDropdownMenuContent,
  SmoothDropdownMenuItem,
  SmoothDropdownMenuLabel,
  SmoothDropdownMenuSeparator,
} from './ui/smooth-dropdown-menu';
export {
  VisibilityPicker,
  ReadonlyVisibilityRow,
  VISIBILITY_LABELS,
  VISIBILITY_DESCRIPTIONS,
} from './ui/visibility-picker';
export type { Visibility } from './ui/visibility-picker';
