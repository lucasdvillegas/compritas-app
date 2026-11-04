export function formatDate(value) {
  if (!value) {
    return ''
  }

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(String(value))
  const date = dateOnly ? new Date(`${value}T00:00:00`) : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
  }).format(date)
}

export function formatDateTime(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
