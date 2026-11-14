import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import SubscriptionForm from './SubscriptionForm.jsx'

function renderForm(overrides = {}) {
  const onCreate = overrides.onCreate ?? vi.fn().mockResolvedValue(true)
  render(
    <SubscriptionForm
      onCreate={onCreate}
      pending={overrides.pending ?? false}
      error={overrides.error ?? ''}
    />,
  )
  return { onCreate }
}

async function fillForm(user, values = {}) {
  const { name = 'Spotify', amount = '60', day = '20' } = values
  await user.type(screen.getByLabelText('Abonelik adı'), name)
  await user.type(screen.getByLabelText('Aylık tutar (TL)'), amount)
  await user.type(screen.getByLabelText('Yenileme günü'), day)
}

describe('SubscriptionForm', () => {
  test('girilen değerleri temizleyip sayıya çevirerek gönderir', async () => {
    const user = userEvent.setup()
    const { onCreate } = renderForm()

    await fillForm(user, { name: '  Spotify  ', amount: '60', day: '20' })
    await user.click(screen.getByRole('button', { name: 'Aboneliği ekle' }))

    expect(onCreate).toHaveBeenCalledWith({
      name: 'Spotify',
      monthlyAmount: 60,
      renewalDay: 20,
    })
  })

  test('gönderim sürerken butonu devre dışı bırakır', () => {
    renderForm({ pending: true })

    expect(screen.getByRole('button', { name: 'Ekleniyor…' })).toBeDisabled()
  })

  test('API hatasını uyarı olarak gösterir', () => {
    renderForm({ error: 'Sunucuya ulaşılamadı.' })

    expect(screen.getByRole('alert')).toHaveTextContent('Sunucuya ulaşılamadı.')
  })

  test('kayıt başarısız olursa formdaki değerleri korur', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn().mockResolvedValue(false)
    renderForm({ onCreate })

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Aboneliği ekle' }))

    expect(screen.getByLabelText('Abonelik adı')).toHaveValue('Spotify')
    expect(screen.getByLabelText('Aylık tutar (TL)')).toHaveValue(60)
    expect(screen.getByLabelText('Yenileme günü')).toHaveValue(20)
  })

  test('kayıt başarılı olursa formu temizler', async () => {
    const user = userEvent.setup()
    renderForm()

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Aboneliği ekle' }))

    expect(screen.getByLabelText('Abonelik adı')).toHaveValue('')
    expect(screen.getByLabelText('Aylık tutar (TL)')).toHaveValue(null)
    expect(screen.getByLabelText('Yenileme günü')).toHaveValue(null)
  })
})
