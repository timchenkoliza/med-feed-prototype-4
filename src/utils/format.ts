const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function formatDateFull(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function readingLabel(minutes: number): string {
  const m = Math.max(1, Math.round(minutes))
  const mod10 = m % 10
  const mod100 = m % 100
  if (mod10 === 1 && mod100 !== 11) return `${m} минута чтения`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${m} минуты чтения`
  return `${m} минут чтения`
}
