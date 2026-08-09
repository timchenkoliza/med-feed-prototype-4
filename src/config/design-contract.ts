/**
 * Visual contract. Единственный источник значений для UI.
 * Извлечён из референсов: (поиск врачей и клиник), Алиса AI (desktop shell),
 * Filters Blocks / Filters Footer (кнопки, модалки), редакционная карточка DTF.
 *
 * Правило: компоненты не используют произвольные значения — только токены отсюда.
 */

export const color = {
  /* Поверхности */
  bg: '#ffffff',
  canvas: '#f1f1f1',
  surface: '#f7f7fa',
  surfaceStrong: '#ececf0',
  surfaceInverse: '#151519',
  border: '#e4e4e9',
  borderStrong: '#d6d6dd',
  divider: '#ececf0',

  /* Текст */
  text: '#151519',
  textSecondary: '#686871',
  textTertiary: '#96969f',
  textInverse: '#ffffff',

  /* Бренд */
  brand600: '#7779f2',
  brand500: '#898bff',
  brand400: '#a7a5ff',
  lilac400: '#d0b7ff',
  lilac200: '#e8ddff',
  lilac100: '#f3eeff',

  /* Акцент = брендовый фиолетовый */
  accent: '#7779f2',
  accentHover: '#6a6ce0',
  accentSoft: '#f3eeff',

  /* Служебные */
  success: '#268c5a',
  successSoft: '#e6f2ec',
  warning: '#b26a00',
  danger: '#d94141',
  link: '#7779f2',
} as const

/** Один шрифтовой стек, две гарнитуры недопустимы. */
export const font = {
  family: '"YS Text", -apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", Arial, sans-serif',
  display: '"YS Display", "YS Text", -apple-system, BlinkMacSystemFont, "Inter", sans-serif',
} as const

/** Типографическая шкала. Значений вне шкалы в коде быть не должно. */
export const fontSize = {
  xs: 12,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const

export const lineHeight = { tight: 1.2, snug: 1.3, normal: 1.45, relaxed: 1.6 } as const
export const fontWeight = { regular: 400, medium: 500, bold: 700 } as const

/** Spacing scale — 4-based. */
export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40, 9: 56 } as const

/** Радиусы: control / card / sheet / pill. Других не существует. */
export const radius = { control: 12, card: 16, sheet: 20, pill: 999 } as const

/** Тени: только две. */
export const shadow = {
  card: '0 1px 2px rgba(0,0,0,0.04)',
  overlay: '0 24px 64px rgba(0,0,0,0.18)',
} as const

/** Брейкпоинты считаются по полезной ширине приложения, а не по окну браузера. */
export const breakpoint = { mobile: 0, tablet: 768, compact: 1180, wide: 1440 } as const

/** Минимальная ширина центральной колонки, ниже которой раскладка упрощается. */
export const minFeedWidth = { wide: 680, twoColumns: 720 } as const

/** Ширины композиции. Desktop — трёхколоночный, как в Алисе + Мед Портал. */
export const layout = {
  container: 1440,
  sidebar: 248,
  sidebarCompact: 224,
  rail: 288,
  gutter: 28,
  headerHeightPhone: 56,
  headerHeightDesktop: 64,
  bottomNavHeight: 56,
  researchBarHeight: 52,
  feedGap: 24,
  cardCoverRatio: '16 / 9',
  heroCoverRatio: '16 / 9',
} as const

/** Ширины исследовательских вьюпортов. */
export const viewportWidth = { phone: 390, tablet: 834, desktop: 1440 } as const

/** Правила лент. Меняются здесь, а не в компонентах. */
export const feedRules = {
  /** Сколько материалов показываем в срезе. */
  itemsPerFeed: 12,
  /** Ритм: hero, затем две текстовые, затем одна с медиа. */
  rhythm: { textRun: 2, mediaRun: 1 },
  A: {
    /** Строгая лента: медиа — исключение. */
    maxMediaItems: 3,
    heroAllowsCover: false,
    showEvidence: true,
    showLimitations: true,
  },
  B: {
    maxMediaItems: 6,
    heroAllowsCover: true,
    showEvidence: false,
    showLimitations: false,
  },
} as const

/** Вес специальности при подборе ленты. */
export const relevance = { primary: 100, secondary: 60, general: 35, adjacent: 10, freshnessPerDay: -0.4 } as const

/** Переменные для CSS. Один проход, дальше только var(). */
export function cssVariables(): string {
  const lines: string[] = []
  for (const [k, v] of Object.entries(color)) lines.push(`--c-${kebab(k)}: ${v};`)
  for (const [k, v] of Object.entries(fontSize)) lines.push(`--fs-${k}: ${v}px;`)
  for (const [k, v] of Object.entries(lineHeight)) lines.push(`--lh-${k}: ${v};`)
  for (const [k, v] of Object.entries(space)) lines.push(`--sp-${k}: ${v}px;`)
  for (const [k, v] of Object.entries(radius)) lines.push(`--r-${k}: ${v}px;`)
  for (const [k, v] of Object.entries(shadow)) lines.push(`--sh-${k}: ${v};`)
  lines.push(`--font: ${font.family};`)
  lines.push(`--font-display: ${font.display};`)
  lines.push(`--l-container: ${layout.container}px;`)
  lines.push(`--l-sidebar: ${layout.sidebar}px;`)
  lines.push(`--l-sidebar-compact: ${layout.sidebarCompact}px;`)
  lines.push(`--l-minfeed: ${minFeedWidth.wide}px;`)
  lines.push(`--l-rail: ${layout.rail}px;`)
  lines.push(`--l-gutter: ${layout.gutter}px;`)
  lines.push(`--l-header: ${layout.headerHeightDesktop}px;`)
  lines.push(`--l-header-phone: ${layout.headerHeightPhone}px;`)
  lines.push(`--l-bottomnav: ${layout.bottomNavHeight}px;`)
  lines.push(`--l-researchbar: ${layout.researchBarHeight}px;`)
  lines.push(`--l-feedgap: ${layout.feedGap}px;`)
  lines.push(`--ratio-cover: ${layout.cardCoverRatio};`)
  return lines.join('\n  ')
}

function kebab(s: string): string {
  return s.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)
}
