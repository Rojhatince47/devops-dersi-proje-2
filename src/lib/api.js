async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      body?.error ?? 'Sunucuya ulaşılamadı. Lütfen tekrar dene.',
    )
  }

  return body
}

export function listSubscriptions() {
  return request('/api/subscriptions')
}

export function createSubscription(input) {
  return request('/api/subscriptions', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
