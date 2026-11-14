import { useCallback, useEffect, useState } from 'react'
import { createSubscription, listSubscriptions } from '../lib/api.js'

export function useSubscriptions() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setItems(await listSubscriptions())
      setError('')
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // İlk yükleme API ile senkronizasyon; durum await sonrasında güncelleniyor.
    // oxlint-disable-next-line react/set-state-in-effect
    load()
  }, [load])

  const add = useCallback(
    async (input) => {
      setSaving(true)
      setError('')

      try {
        await createSubscription(input)
        await load()
        return true
      } catch (saveError) {
        setError(saveError.message)
        return false
      } finally {
        setSaving(false)
      }
    },
    [load],
  )

  return { items, loading, saving, error, add }
}
