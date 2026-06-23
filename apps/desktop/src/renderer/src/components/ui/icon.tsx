/**
 * Material Symbols (Rounded) icon wrapper. The font is loaded once in
 * `main.tsx` via `import 'material-symbols/rounded.css'`.
 *
 * `name` is any Material Symbols identifier (see fonts.google.com/icons).
 * `size` is the font-size in pixels; `fill` selects the filled variant.
 */
import type { CSSProperties } from 'react'

type IconProps = {
  name: string
  size?: number
  fill?: boolean
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700
  className?: string
  style?: CSSProperties
  'aria-hidden'?: boolean
  title?: string
}

export function Icon({
  name,
  size = 20,
  fill = false,
  weight = 400,
  className = '',
  style,
  title
}: IconProps): React.JSX.Element {
  const varSettings = `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`
  return (
    <span
      className={`material-symbols-rounded select-none leading-none inline-flex items-center justify-center ${className}`}
      style={{
        fontSize: size,
        width: size,
        height: size,
        fontVariationSettings: varSettings,
        ...style
      }}
      aria-hidden="true"
      title={title}
    >
      {name}
    </span>
  )
}
