import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import SummaryCards from './SummaryCards.jsx'

const items = [
  { id: '1', name: 'Spotify', monthlyAmount: 60, renewalDay: 20 },
  { id: '2', name: 'Netflix', monthlyAmount: 99, renewalDay: 3 },
]

describe('SummaryCards', () => {
  test('aylık toplamı gösterir', () => {
    render(<SummaryCards items={items} />)

    expect(screen.getByText('Aylık toplam')).toBeInTheDocument()
    expect(screen.getByText('₺159,00')).toBeInTheDocument()
  })

  test('yıllık toplamı gösterir', () => {
    render(<SummaryCards items={items} />)

    expect(screen.getByText('Yıllık toplam')).toBeInTheDocument()
    expect(screen.getByText('₺1.908,00')).toBeInTheDocument()
  })
})
