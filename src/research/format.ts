const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export function dayMonth(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`
}

export function dayMonthYear(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}`
}

export function eventDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}, ${hh}:${mm}`
}

export function readingLabel(minutes: number): string {
  const m = Math.max(1, Math.round(minutes))
  return `${m} ${plural(m, 'минута', 'минуты', 'минут')} чтения`
}

export function durationLabel(minutes: number): string {
  if (minutes >= 1440) {
    const days = Math.round(minutes / 1440)
    return `${days} ${plural(days, 'день', 'дня', 'дней')}`
  }
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m ? `${h} ч ${m} мин` : `${h} ${plural(h, 'час', 'часа', 'часов')}`
  }
  return `${minutes} мин`
}

export function creditsLabel(n: number): string {
  return `${n} ЗЕТ`
}
