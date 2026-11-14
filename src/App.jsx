import SubscriptionForm from './components/SubscriptionForm.jsx'
import SubscriptionList from './components/SubscriptionList.jsx'
import { useSubscriptions } from './hooks/useSubscriptions.js'

export default function App() {
  const { items, loading, saving, error, add } = useSubscriptions()

  return (
    <main className="app">
      <header className="masthead">
        <p className="wordmark">Abonelik Takipçisi</p>
        <h1>Aylık ödemelerin tek bir dökümde.</h1>
        <p className="lede">
          Aboneliklerini ekle; ne kadar ödediğini ve sırada ne olduğunu gör.
        </p>
      </header>

      <div className="dashboard">
        <section className="form-panel" aria-labelledby="form-title">
          <h2 id="form-title">Yeni abonelik</h2>
          <SubscriptionForm onCreate={add} pending={saving} error={error} />
        </section>

        <section className="list-panel" aria-labelledby="list-title">
          <div className="list-heading">
            <h2 id="list-title">Aboneliklerin</h2>
            {!loading && items.length > 0 ? (
              <span className="list-count">{items.length} kayıt</span>
            ) : null}
          </div>

          {loading ? (
            <p className="loading" aria-live="polite">
              Yükleniyor…
            </p>
          ) : (
            <SubscriptionList items={items} />
          )}
        </section>
      </div>
    </main>
  )
}
