import { describe, expect, test } from 'vitest'
import {
  daysUntilRenewal,
  isUpcoming,
  monthlyTotal,
  nextRenewalDate,
  yearlyTotal,
} from './subscriptions.js'

describe('nextRenewalDate', () => {
  test('31. günü olan abonelik şubatta ayın son gününe düşer', () => {
    expect(nextRenewalDate(31, new Date(2026, 1, 10))).toEqual(
      new Date(2026, 1, 28),
    )
  })

  test('artık yılda 29 şubata düşer', () => {
    expect(nextRenewalDate(31, new Date(2028, 1, 10))).toEqual(
      new Date(2028, 1, 29),
    )
  })

  test('yıl geçişinde ocak ayına taşar', () => {
    expect(nextRenewalDate(2, new Date(2026, 11, 30))).toEqual(
      new Date(2027, 0, 2),
    )
  })

  test('bu ayki gün geçtiyse gelecek aya taşar', () => {
    expect(nextRenewalDate(5, new Date(2026, 10, 14))).toEqual(
      new Date(2026, 11, 5),
    )
  })
})

describe('daysUntilRenewal', () => {
  test('bugün yenilenen abonelik için 0 döner', () => {
    expect(daysUntilRenewal(14, new Date(2026, 10, 14))).toBe(0)
  })

  test('gelecek ayki yenileme için doğru gün sayısını verir', () => {
    expect(daysUntilRenewal(5, new Date(2026, 10, 14))).toBe(21)
  })
})

describe('isUpcoming', () => {
  test('bugün yenilenen abonelik yaklaşandır', () => {
    expect(isUpcoming(14, new Date(2026, 10, 14))).toBe(true)
  })

  test('7 gün sonraki yenileme yaklaşandır', () => {
    expect(isUpcoming(21, new Date(2026, 10, 14))).toBe(true)
  })

  test('8 gün sonraki yenileme yaklaşan değildir', () => {
    expect(isUpcoming(22, new Date(2026, 10, 14))).toBe(false)
  })
})

describe('toplamlar', () => {
  test('aylık toplamı hesaplar', () => {
    expect(monthlyTotal([{ monthlyAmount: 60 }, { monthlyAmount: 99 }])).toBe(
      159,
    )
  })

  test('yıllık toplamı on ikiyle çarpar', () => {
    expect(yearlyTotal([{ monthlyAmount: 60 }, { monthlyAmount: 99 }])).toBe(
      1908,
    )
  })

  test('kuruşlu tutarları yuvarlar', () => {
    expect(monthlyTotal([{ monthlyAmount: 59.9 }, { monthlyAmount: 39.9 }])).toBe(
      99.8,
    )
  })
})
