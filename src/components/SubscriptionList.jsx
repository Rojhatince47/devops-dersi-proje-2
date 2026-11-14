import { formatTRY } from '../lib/format.js'

export default function SubscriptionList({ items }) {
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
      {items.map((item) => (
        <li key={item.id} className="subscription-row">
          <div>
            <span className="subscription-name">{item.name}</span>
            <span className="subscription-meta">
              her ayın {item.renewalDay}. günü
            </span>
          </div>
          <span className="subscription-amount">
            {formatTRY(item.monthlyAmount)}
          </span>
        </li>
      ))}
    </ul>
  )
}
