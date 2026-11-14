import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { useSubscriptions } from './useSubscriptions.js'

const spotify = {
  id: '1',
  name: 'Spotify',
  monthlyAmount: 60,
  renewalDay: 20,
  createdAt: '2026-11-14T09:00:00.000Z',
}

function jsonResponse(body, ok = true, status = 200) {
  return { ok, status, json: async () => body }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useSubscriptions', () => {
  test('açılışta abonelikleri yükler', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([spotify])))

    const { result } = renderHook(() => useSubscriptions())

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items).toEqual([spotify])
  })

  test('yeni abonelik ekler ve listeyi tazeler', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse(spotify, true, 201))
      .mockResolvedValueOnce(jsonResponse([spotify]))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useSubscriptions())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let created
    await act(async () => {
      created = await result.current.add({
        name: 'Spotify',
        monthlyAmount: 60,
        renewalDay: 20,
      })
    })

    expect(created).toBe(true)
    expect(result.current.items).toEqual([spotify])
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/subscriptions',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  test('ekleme başarısızsa hatayı saklar ve formu korur', async () => {
    const message = 'Gönderilen abonelik bilgileri geçersiz.'
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ error: message }, false, 400))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useSubscriptions())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let created
    await act(async () => {
      created = await result.current.add({
        name: '',
        monthlyAmount: 10,
        renewalDay: 5,
      })
    })

    expect(created).toBe(false)
    expect(result.current.error).toBe(message)
  })
})
