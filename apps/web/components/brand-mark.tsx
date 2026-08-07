/*
 * The bare brand glyph — the same shape inside the app icon, without the blue
 * squircle behind it. Fills with currentColor so it follows the surrounding
 * text colour in both themes. Source of truth for the path:
 * apps/desktop/build/captureflow.icon/Assets/ (drawn on a 100×125 canvas; the
 * glyph occupies the top 100 square, hence the cropped viewBox).
 */
export function BrandMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden
      focusable="false"
      /* The spin is driven by the `group` on the lockup that wraps the mark,
         so a call site opts in by marking that element `group`. */
      className={`group-hover:animate-brand-mark-spin motion-reduce:animate-none${
        className ? ` ${className}` : ""
      }`}
    >
      <path d="M86.24,63.54l4.19-9.08L55.86,43.16l0,0v0L52.19,42l33-8-3.46-9.38L49.31,41l-.05,0,0,0-3.44,1.75,17.68-29L54.46,9.57,43.16,44.14l0,0h0L42,47.81l-8-33-9.38,3.46L41,50.69l0,.05,0,0,1.75,3.44-29-17.68L9.57,45.54l34.57,11.3,0,0v0L47.81,58l-33,8,3.46,9.38L50.69,59l.05,0,0,0,3.44-1.75-17.68,29,9.08,4.19,11.3-34.57,0,0h0L58,52.19l8,33,9.38-3.46L59,49.31l0-.05,0,0-1.75-3.44ZM57.81,51.22l-3.15,5.16-5.88,1.43-5.16-3.15-1.43-5.88,3.15-5.16,5.88-1.43,5.16,3.15Z" />
    </svg>
  );
}
