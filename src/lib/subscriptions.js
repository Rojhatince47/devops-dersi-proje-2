function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function clampedDate(year, month, day) {
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
  return new Date(year, month, Math.min(day, lastDayOfMonth))
}

export function nextRenewalDate(day, from = new Date()) {
  const today = startOfDay(from)
  const thisMonth = clampedDate(today.getFullYear(), today.getMonth(), day)

  if (thisMonth >= today) {
    return thisMonth
  }

  return clampedDate(today.getFullYear(), today.getMonth() + 1, day)
}

export function daysUntilRenewal(day, from = new Date()) {
  const today = startOfDay(from)
  const renewal = nextRenewalDate(day, today)

  return Math.round((renewal - today) / 86_400_000)
}

export function isUpcoming(day, from = new Date(), windowDays = 7) {
  const days = daysUntilRenewal(day, from)

  return days >= 0 && days <= windowDays
}

function roundMoney(value) {
  return Math.round(value * 100) / 100
}

export function monthlyTotal(items) {
  return roundMoney(
    items.reduce((total, item) => total + Number(item.monthlyAmount), 0),
  )
}

export function yearlyTotal(items) {
  return roundMoney(monthlyTotal(items) * 12)
}
