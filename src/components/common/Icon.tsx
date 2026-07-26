import type { CSSProperties } from 'react'

interface IconProps {
  name: IconName
  size?: number
  strokeWidth?: number
  style?: CSSProperties
  'aria-hidden'?: boolean
}

export type IconName =
  | 'plus'
  | 'sparkle'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'search'
  | 'bookmark'
  | 'bookmark-filled'
  | 'more'
  | 'check'
  | 'close'
  | 'thumbs-up'
  | 'thumbs-up-filled'
  | 'refresh'
  | 'shuffle'
  | 'verified'
  | 'chat'
  | 'feed'
  | 'user'
  | 'saved'
  | 'external'
  | 'clock'
  | 'arrow-left'
  | 'compass'

const paths: Record<IconName, JSX.Element> = {
  plus: <path d="M12 5v14M5 12h14" />,
  sparkle: (
    <>
      <path d="M12 3l1.6 4.2L18 9l-4.4 1.8L12 15l-1.6-4.2L6 9l4.4-1.8L12 3z" />
      <path d="M18 14l.8 2 2 .8-2 .8L18 20l-.8-2.4L15 16.8l2.2-.8L18 14z" />
    </>
  ),
  'chevron-left': <path d="M15 6l-6 6 6 6" />,
  'chevron-right': <path d="M9 6l6 6-6 6" />,
  'chevron-down': <path d="M6 9l6 6 6-6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.2-3.2" />
    </>
  ),
  bookmark: <path d="M6 4h12v17l-6-4-6 4V4z" />,
  'bookmark-filled': <path d="M6 4h12v17l-6-4-6 4V4z" fill="currentColor" />,
  more: (
    <>
      <circle cx="6" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="18" cy="12" r="1.6" fill="currentColor" />
    </>
  ),
  check: <path d="M5 12l5 5L20 7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  'thumbs-up': (
    <path d="M7 21V10l5-6a2 2 0 013 2v4h5a2 2 0 012 2l-2 8a2 2 0 01-2 1H7z" />
  ),
  'thumbs-up-filled': (
    <path
      d="M7 21V10l5-6a2 2 0 013 2v4h5a2 2 0 012 2l-2 8a2 2 0 01-2 1H7z"
      fill="currentColor"
    />
  ),
  refresh: (
    <>
      <path d="M21 12a9 9 0 11-3-6.7" />
      <path d="M21 4v5h-5" />
    </>
  ),
  shuffle: (
    <>
      <path d="M16 3h5v5" />
      <path d="M4 20L21 3" />
      <path d="M16 21h5v-5" />
      <path d="M4 4l5 5" />
      <path d="M15 15l6 6" />
    </>
  ),
  verified: (
    <>
      <path d="M12 3l2.4 1.7 2.9-.3 1 2.8 2.4 1.6-.6 2.9 1.3 2.6-2 2.1-.2 2.9-2.8.7-1.9 2.2-2.8-1-2.8 1-1.9-2.2-2.8-.7-.2-2.9-2-2.1L2.3 12l1-2.6-.6-2.9 2.4-1.6 1-2.8 2.9.3L12 3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  chat: (
    <>
      <path d="M4 6h16v10H8l-4 4V6z" />
    </>
  ),
  feed: (
    <>
      <path d="M4 6h10" />
      <path d="M4 12h16" />
      <path d="M4 18h13" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0116 0" />
    </>
  ),
  saved: <path d="M6 4h12v17l-6-4-6 4V4z" />,
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4L10 14" />
      <path d="M20 14v6H4V4h6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  'arrow-left': (
    <>
      <path d="M20 12H4" />
      <path d="M10 6l-6 6 6 6" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 5-5 2 2-5 5-2z" />
    </>
  ),
}

export function Icon({ name, size = 20, strokeWidth = 1.7, style, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden={rest['aria-hidden'] ?? true}
    >
      {paths[name]}
    </svg>
  )
}
