const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const

export function formatBytes(value?: number, fractionDigits = 1): string {
  const bytes = Number(value)
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B'
  }

  const magnitude = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    BYTE_UNITS.length - 1
  )

  const size = bytes / Math.pow(1024, magnitude)
  return `${size.toFixed(magnitude === 0 ? 0 : fractionDigits)} ${BYTE_UNITS[magnitude]}`
}

export function formatDateTime(
  value: number | string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!value) {
    return 'Unknown'
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  const formatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  })

  return formatter.format(date)
}

const RELATIVE_DIVISIONS: Array<{
  amount: number
  unit: Intl.RelativeTimeFormatUnit
}> = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Infinity, unit: 'year' },
]

export function formatRelativeTime(value?: number | null): string {
  if (!value) {
    return 'Never'
  }

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  let duration = (value - Date.now()) / 1000

  for (const division of RELATIVE_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit)
    }
    duration /= division.amount
  }

  return rtf.format(0, 'second')
}
