// Inline SVGs, not the Material Symbols <Icon>: its ligature subset has no brand
// glyphs, so Apple/Chrome would leak as literal text.

type LogoProps = { className?: string };

export function AppleLogo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

export function ChromeLogoColor({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className}>
      <path
        fill="#4caf50"
        d="M44 24c0 11.044-8.956 20-20 20S4 35.044 4 24 12.956 4 24 4s20 8.956 20 20z"
      />
      <path
        fill="#ffc107"
        d="M24 4v20l8 4-8.843 16H24c11.053 0 20-8.947 20-20S35.053 4 24 4z"
      />
      <path
        fill="#f44336"
        d="M41.84 15H24v13l-3-1L7.16 13.26h-.02C10.68 7.69 16.91 4 24 4c7.8 0 14.55 4.48 17.84 11z"
      />
      <path fill="#dd2c00" d="m7.158 13.264 8.843 14.862L21 27z" />
      <path fill="#558b2f" d="m23.157 44 8.934-16.059L28 25z" />
      <path fill="#f9a825" d="M41.865 15H24l-1.579 4.58z" />
      <path fill="#fff" d="M33 24a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      <path fill="#2196f3" d="M31 24a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
    </svg>
  );
}
