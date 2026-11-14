import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import SubscriptionList from './SubscriptionList.jsx'

const spotify = {
  id: '1',
  name: 'Spotify',
  monthlyAmount: 60,
  renewalDay: 20,
  createdAt: '2026-11-14T09:00:00.000Z',
}

describe('SubscriptionList', () => {
  test('kayıt yokken yönlendirici boş durum gösterir', () => {
    render(<SubscriptionList items={[]} />)

    expect(screen.getByText('Henüz abonelik eklenmedi.')).toBeInTheDocument()
  })

  test('aboneliğin adını, tutarını ve yenileme gününü gösterir', () => {
    render(<SubscriptionList items={[spotify]} />)

    expect(screen.getByText('Spotify')).toBeInTheDocument()
    expect(screen.getByText('₺60,00')).toBeInTheDocument()
    expect(screen.getByText('her ayın 20. günü')).toBeInTheDocument()
  })
})
