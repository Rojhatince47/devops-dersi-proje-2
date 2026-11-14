import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import SubscriptionList from './SubscriptionList.jsx'

const TODAY = new Date(2026, 10, 14)

const spotify = {
  id: '1',
  name: 'Spotify',
  monthlyAmount: 60,
  renewalDay: 20,
  createdAt: '2026-11-14T09:00:00.000Z',
}

describe('SubscriptionList', () => {
  test('kayıt yokken yönlendirici boş durum gösterir', () => {
    render(<SubscriptionList items={[]} today={TODAY} />)

    expect(screen.getByText('Henüz abonelik eklenmedi.')).toBeInTheDocument()
  })

  test('aboneliğin adını, tutarını ve yenileme gününü gösterir', () => {
    render(<SubscriptionList items={[spotify]} today={TODAY} />)

    expect(screen.getByText('Spotify')).toBeInTheDocument()
    expect(screen.getByText('₺60,00')).toBeInTheDocument()
    expect(screen.getByText('her ayın 20. günü')).toBeInTheDocument()
  })

  test('bugün yenilenecek aboneliği yaklaşan olarak işaretler', () => {
    render(
      <SubscriptionList
        items={[{ ...spotify, renewalDay: 14 }]}
        today={new Date(2026, 10, 14)}
      />,
    )

    expect(screen.getByText('Yaklaşan')).toBeInTheDocument()
    expect(screen.getByText('bugün')).toBeInTheDocument()
  })

  test('7 gün sonra yenilenecek aboneliği yaklaşan olarak işaretler', () => {
    render(
      <SubscriptionList
        items={[{ ...spotify, renewalDay: 21 }]}
        today={new Date(2026, 10, 14)}
      />,
    )

    expect(screen.getByText('Yaklaşan')).toBeInTheDocument()
    expect(screen.getByText('7 gün sonra')).toBeInTheDocument()
  })

  test('8 gün sonra yenilenecek aboneliği işaretlemez', () => {
    render(
      <SubscriptionList
        items={[{ ...spotify, renewalDay: 22 }]}
        today={new Date(2026, 10, 14)}
      />,
    )

    expect(screen.queryByText('Yaklaşan')).not.toBeInTheDocument()
    expect(screen.getByText('8 gün sonra')).toBeInTheDocument()
  })
})
