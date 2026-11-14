import { describe, expect, test } from 'vitest'
import { formatTRY } from './format.js'

describe('formatTRY', () => {
  test('tutarı Türk lirası biçiminde gösterir', () => {
    expect(formatTRY(159)).toBe('₺159,00')
  })

  test('kuruşları korur', () => {
    expect(formatTRY(99.8)).toBe('₺99,80')
  })
})
