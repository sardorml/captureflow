"use client";

import { captionsText } from "@videojs/core/i18n/text/menu";
import { Menu, Text as TextPrimitive } from "@videojs/react";
import { CaptionsOffIcon } from "@videojs/react/icons";
import { CaptionsRadioGroup } from "@videojs/react/ui/captions-radio-group";
import { MenuChevron } from "@/components/videojs/ui/menu-chevron";
import { RadioItem } from "@/components/videojs/ui/radio-item";
import { cn } from "@/lib/utils";
import {
  CAPTION_POSITIONS,
  CAPTION_SIZES,
  type CaptionPrefs,
} from "@/lib/recording/caption-prefs";

// The same classes the vendored Captions submenu uses, so the extra groups
// read as part of it.
const TRIGGER_CLASS = cn(
  "group/menu-trigger-item",
  "relative flex cursor-pointer select-none items-center gap-1.5 rounded-media-menu-item px-2 py-1.5 text-start whitespace-nowrap",
  "focus-ring-media",
  "media-highlighted:highlight-media",
  "focus-visible:outline-media-ring focus-visible:outline-offset-2",
  "text-shadow-media",
  "transition-[background-color,color] duration-media-fast ease-in-out",
  "media-anchored:duration-media-instant media-anchored:media-highlighted:duration-media-slow",
  "justify-between tabular-nums text-inherit",
  "data-[availability=unavailable]:hidden data-[availability=unsupported]:hidden",
  "aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
  "media-anchored:data-highlighted:[anchor-name:--media-menu-item-highlight-anchor]",
  "media-anchored:media-highlighted:bg-transparent",
);
const ICON_CLASS = cn(
  "shrink-0 drop-shadow-media-icon text-media-muted-foreground",
  "size-media-icon",
  "group-media-highlighted/menu-trigger-item:text-inherit",
);
const CONTENT_CLASS = cn(
  "[anchor-scope:--media-menu-item-highlight-anchor]",
  "media-anchored:before:anchor-media-highlight",
  "media-transitioning:before:hidden",
  "media-transitioning:[&_*]:before:hidden",
  "media-anchored:has-data-[highlighted=]:before:duration-0",
  "not-data-submenu:flex not-data-submenu:flex-col not-data-submenu:gap-0.5",
  "not-data-submenu:data-child-open:blur-media-hidden",
  "not-data-submenu:data-child-open:before:hidden",
  "data-submenu:media-transitioning:pointer-events-none data-submenu:media-transitioning:overflow-hidden",
  "data-submenu:media-transitioning:blur-media-hidden",
  "absolute max-h-[inherit] overflow-auto overscroll-none outline-hidden",
  "transition-[translate,filter] duration-media-menu ease-out",
  "not-data-submenu:inset-x-1 not-data-submenu:top-1",
  "not-data-submenu:data-child-open:-translate-x-full",
  "not-data-submenu:data-child-open:rtl:translate-x-full",
  "data-submenu:inset-x-0 data-submenu:top-0 data-submenu:z-10 data-submenu:max-h-[inherit] data-submenu:p-1",
  "data-submenu:media-transitioning:translate-x-full data-submenu:media-transitioning:rtl:-translate-x-full",
);
const BACK_CLASS = cn(
  "group/menu-back-item",
  "relative flex cursor-pointer select-none items-center gap-1.5 rounded-media-menu-item px-2 py-1.5 text-start whitespace-nowrap",
  "focus-ring-media",
  "media-highlighted:highlight-media",
  "focus-visible:outline-media-ring focus-visible:outline-offset-2",
  "text-shadow-media",
  "transition-[background-color,color] duration-media-fast ease-in-out",
  "media-anchored:duration-media-instant media-anchored:media-highlighted:duration-media-slow",
  "mb-0.5 w-full",
);
const SEPARATOR_CLASS = cn(
  "my-1 block border-b border-media-border media-high-contrast:border-media-foreground/25",
  "shadow-media-separator",
);
const OPTIONS_CLASS = cn(
  "flex [max-height:inherit] flex-col gap-0.5",
  "[anchor-scope:--media-menu-item-highlight-anchor]",
  "media-anchored:before:anchor-media-highlight",
  "media-transitioning:before:hidden",
  "media-transitioning:[&_*]:before:hidden",
  "media-anchored:has-data-[highlighted=]:before:duration-0",
);
const GROUP_LABEL_CLASS =
  "px-2 pt-1.5 pb-0.5 text-[11px] font-medium tracking-wide text-media-muted-foreground uppercase";

// A labelled run of radios inside the Captions list. The menu nests only
// one level deep, so a third level would paint over this one.
function LookGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const pick = (next: string): void => {
    const match = options.find((o) => o.value === next);
    if (match) onChange(match.value);
  };
  return (
    <Menu.Group>
      <Menu.GroupLabel className={GROUP_LABEL_CLASS}>{label}</Menu.GroupLabel>
      <Menu.RadioGroup
        value={value}
        onValueChange={pick}
        className={OPTIONS_CLASS}
      >
        {options.map((o) => (
          <RadioItem key={o.value} value={o.value}>
            <span>{o.label}</span>
          </RadioItem>
        ))}
      </Menu.RadioGroup>
    </Menu.Group>
  );
}

/*
 * The vendored Captions submenu with the watcher's size and position under
 * the track list. The trigger hides itself when the video has no captions.
 */
export function CaptionsMenu({
  prefs,
  onChange,
}: {
  prefs: CaptionPrefs;
  onChange: (patch: Partial<CaptionPrefs>) => void;
}) {
  return (
    <Menu.Root>
      <CaptionsRadioGroup.Root>
        <Menu.Trigger className={TRIGGER_CLASS}>
          <CaptionsOffIcon className={ICON_CLASS} />
          <TextPrimitive token={captionsText.key}>
            {captionsText.text}
          </TextPrimitive>
          <span className="ms-auto inline-flex min-w-0 items-center gap-1 ps-2">
            <CaptionsRadioGroup.Value className="max-w-24 truncate opacity-65" />
            <MenuChevron />
          </span>
        </Menu.Trigger>
        <Menu.Content className={CONTENT_CLASS}>
          <Menu.Item className={BACK_CLASS}>
            <MenuChevron back />
            <TextPrimitive token={captionsText.key}>
              {captionsText.text}
            </TextPrimitive>
          </Menu.Item>
          <Menu.Separator className={SEPARATOR_CLASS} />
          <CaptionsRadioGroup.Options
            className={OPTIONS_CLASS}
            renderItem={(props, item) => (
              <RadioItem {...props}>
                <span>{item.label}</span>
              </RadioItem>
            )}
          />
          <Menu.Separator className={SEPARATOR_CLASS} />
          <LookGroup
            label="Size"
            value={prefs.size}
            options={CAPTION_SIZES}
            onChange={(size) => onChange({ size })}
          />
          <Menu.Separator className={SEPARATOR_CLASS} />
          <LookGroup
            label="Position"
            value={prefs.position}
            options={CAPTION_POSITIONS}
            onChange={(position) => onChange({ position })}
          />
        </Menu.Content>
      </CaptionsRadioGroup.Root>
    </Menu.Root>
  );
}
