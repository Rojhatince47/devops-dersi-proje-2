import { useState } from 'react'

export default function SubscriptionForm({
  onCreate,
  pending = false,
  error = '',
}) {
  const [name, setName] = useState('')
  const [monthlyAmount, setMonthlyAmount] = useState('')
  const [renewalDay, setRenewalDay] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const busy = pending || submitting

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)

    try {
      const created = await onCreate({
        name: name.trim(),
        monthlyAmount: Number(monthlyAmount),
        renewalDay: Number(renewalDay),
      })

      if (created) {
        setName('')
        setMonthlyAmount('')
        setRenewalDay('')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="subscription-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">Abonelik adı</label>
        <input
          id="name"
          name="name"
          type="text"
          maxLength={80}
          placeholder="Spotify"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="monthlyAmount">Aylık tutar (TL)</label>
          <input
            id="monthlyAmount"
            name="monthlyAmount"
            type="number"
            inputMode="decimal"
            min="0.01"
            max="100000"
            step="0.01"
            placeholder="60,00"
            required
            value={monthlyAmount}
            onChange={(event) => setMonthlyAmount(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="renewalDay">Yenileme günü</label>
          <input
            id="renewalDay"
            name="renewalDay"
            type="number"
            inputMode="numeric"
            min="1"
            max="31"
            step="1"
            placeholder="20"
            required
            value={renewalDay}
            onChange={(event) => setRenewalDay(event.target.value)}
          />
        </div>
      </div>

      <button type="submit" disabled={busy}>
        {busy ? 'Ekleniyor…' : 'Aboneliği ekle'}
      </button>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
