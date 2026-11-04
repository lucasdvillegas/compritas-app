const quantityFormatter = new Intl.NumberFormat('es-AR', {
  maximumFractionDigits: 3,
})

export const WEIGHT_UNIT = 'kg'

export function isWeightUnit(unit) {
  return unit === WEIGHT_UNIT
}

export function unitShortLabel(unit) {
  return isWeightUnit(unit) ? 'kg' : 'u'
}

export function unitPriceSuffix(unit) {
  return isWeightUnit(unit) ? '/kg' : 'c/u'
}

export function unitSaleLabel(unit) {
  return isWeightUnit(unit) ? 'Por peso (kg)' : 'Por unidad'
}

export function formatQuantity(value, unit) {
  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return ''
  }

  return `${quantityFormatter.format(amount)} ${unitShortLabel(unit)}`
}
