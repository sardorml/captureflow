"use client";

import { useMessages } from "./i18n-provider";

/*
 * A corner ribbon rather than a bar across the top: the nav already owns the
 * top edge, and the triangle only fills the square to the left of the nav's
 * measure. It is hidden below xl, where the logo sits close enough to the
 * viewport edge that the two would collide.
 */
export function CornerBanner() {
  const m = useMessages();
  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-[110] hidden h-16 w-16 overflow-hidden select-none xl:block"
      aria-label={m.banner.aria}
      role="note"
    >
      {/* Amber rather than the accent: the nav's one solid control is already
          accent blue, and a second blue in the same corner read as a button. */}
      <div
        className="absolute inset-0 bg-[#f5a524]"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      />
      {/* Rotated about its own centre onto the triangle's short diagonal, so
          the label sits square between the corner and the hypotenuse. */}
      <span className="text-on-inverse absolute top-[15px] -left-[11px] w-16 -rotate-45 text-center text-[9px] leading-3 font-bold tracking-[0.1em] uppercase">
        {m.banner.label}
      </span>
    </div>
  );
}
