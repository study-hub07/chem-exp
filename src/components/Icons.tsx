import type { ReactNode } from 'react'

export type IconName =
  | 'flame' | 'cards' | 'atom' | 'flask' | 'chart' | 'book' | 'bookmark' | 'globe'
  | 'download' | 'prev' | 'next' | 'pause' | 'play' | 'close' | 'menu' | 'image' | 'check' | 'alert' | 'info'

// Simple 24px line icons (stroke = currentColor), drawn for this site. Decorative: always aria-hidden.
const PATHS: Record<IconName, ReactNode> = {
  flame: <path d="M12 2.8c.5 3 4 4.6 4 8.7a4 4 0 0 1-8 0c0-1.5.6-2.7 1.4-3.6.3 1.3 1 2 1.8 2.2C11.1 7.7 11.3 5.2 12 2.8Z" />,
  cards: <><rect x="6" y="7" width="12" height="14" rx="2" /><path d="M9 4h8a2 2 0 0 1 2 2v9" /></>,
  atom: <><circle cx="12" cy="12" r="1.4" /><ellipse cx="12" cy="12" rx="9.5" ry="3.8" /><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(120 12 12)" /></>,
  flask: <><path d="M9 3h6M10 3v6.2L4.9 18.2A2 2 0 0 0 6.6 21h10.8a2 2 0 0 0 1.7-2.8L14 9.2V3" /><path d="M7.6 15h8.8" /></>,
  chart: <><path d="M3.5 3.5v17h17" /><path d="m7.5 15 3.8-4.6 3 3L19 7.2" /></>,
  book: <><path d="M4.5 5.5A2 2 0 0 1 6.5 3.5h12v14h-12a2 2 0 0 0-2 2" /><path d="M4.5 5.5v14a2 2 0 0 0 2 2h12" /></>,
  bookmark: <path d="M7 3.5h10a1 1 0 0 1 1 1v16l-6-3.8-6 3.8v-16a1 1 0 0 1 1-1Z" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" /></>,
  download: <><path d="M12 4v11" /><path d="m7.5 10.5 4.5 4.5 4.5-4.5" /><path d="M5 19.5h14" /></>,
  prev: <path d="m15 5-7 7 7 7" />,
  next: <path d="m9 5 7 7-7 7" />,
  pause: <><path d="M9 5.5v13" /><path d="M15 5.5v13" /></>,
  play: <path d="M8 5.5v13l10.5-6.5Z" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  menu: <path d="M4 7.5h16M4 12h16M4 16.5h16" />,
  image: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m20.5 16-4.8-4.8L7.5 19.5" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5v.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.5v.01" /></>,
}

export function Icon({ name, size = 24, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.6}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className}>
      {PATHS[name]}
    </svg>
  )
}
