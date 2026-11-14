import { formatTRY } from '../lib/format.js'
import { monthlyTotal, yearlyTotal } from '../lib/subscriptions.js'

export default function SummaryCards({ items }) {
  return (
    <section className="summary" aria-label="Ödeme özeti">
      <div className="summary-item">
        <span className="summary-label">Aylık toplam</span>
        <strong className="summary-value">{formatTRY(monthlyTotal(items))}</strong>
      </div>

      <div className="summary-item">
        <span className="summary-label">Yıllık toplam</span>
        <strong className="summary-value">{formatTRY(yearlyTotal(items))}</strong>
      </div>
    </section>
  )
}
