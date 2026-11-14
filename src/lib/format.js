const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
})

export function formatTRY(value) {
  return currencyFormatter.format(value)
}
