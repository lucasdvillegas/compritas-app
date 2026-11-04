const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatMoney(value) {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return ''
  }

  return currencyFormatter.format(amount)
}

export function roundAmount(value) {
  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return null
  }

  return Math.round(amount * 100) / 100
}
