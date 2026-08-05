const M = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

export function dayMonth(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : `${d.getDate()} ${M[d.getMonth()]}`
}

export function fullDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`
}

export function eventDate(startsAt: string, endsAt?: string): string {
  const a = new Date(startsAt)
  if (Number.isNaN(a.getTime())) return startsAt
  const time = `${String(a.getHours()).padStart(2, '0')}:${String(a.getMinutes()).padStart(2, '0')}`
  if (!endsAt) return `${a.getDate()} ${M[a.getMonth()]}, ${time}`
  const b = new Date(endsAt)
  if (a.getMonth() === b.getMonth()) return `${a.getDate()}–${b.getDate()} ${M[a.getMonth()]}`
  return `${a.getDate()} ${M[a.getMonth()]} — ${b.getDate()} ${M[b.getMonth()]}`
}

export function readLabel(min: number): string {
  return `${min} мин чтения`
}
