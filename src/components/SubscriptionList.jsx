import { formatTRY } from '../lib/format.js'
import { daysUntilRenewal, isUpcoming } from '../lib/subscriptions.js'

export default function SubscriptionList({ items, today }) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>Henüz abonelik eklenmedi.</p>
        <p className="empty-hint">
          İlk aboneliğini ekle; aylık toplamı hemen gör.
        </p>
      </div>
    )
  }

  return (
    <ul className="subscription-list">
      {items.map((item) => {
        const days = daysUntilRenewal(item.renewalDay, today)
        const upcoming = isUpcoming(item.renewalDay, today)

        return (
          <li key={item.id} className="subscription-row">
            <div>
              <span className="subscription-name">{item.name}</span>
              <span className="subscription-meta">
                her ayın {item.renewalDay}. günü
              </span>
              <span className="subscription-days">
                {days === 0 ? 'bugün' : `${days} gün sonra`}
              </span>
            </div>

            <div className="subscription-end">
              {upcoming ? <span className="badge">Yaklaşan</span> : null}
              <span className="subscription-amount">
                {formatTRY(item.monthlyAmount)}
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
