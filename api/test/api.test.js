// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { buildApp } from '../src/app.js'
import { createPool, ensureSchema, waitForDatabase } from '../src/db.js'

const databaseUrl =
  process.env.TEST_DATABASE_URL ??
  'postgres://abonelik:abonelik_dev@localhost:5432/abonelik_test'

describe('abonelik API', () => {
  let pool
  let app

  beforeAll(async () => {
    pool = createPool(databaseUrl)
    await waitForDatabase(pool, 5, 500)
    await ensureSchema(pool)
    app = buildApp({ pool })
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
    await pool.end()
  })

  beforeEach(async () => {
    await pool.query('TRUNCATE subscriptions')
  })

  test('boş tabloda liste boş döner', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/subscriptions' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual([])
  })

  test('geçerli abonelik kaydedilir ve listede görünür', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/subscriptions',
      payload: { name: '  Spotify  ', monthlyAmount: 60, renewalDay: 20 },
    })

    expect(created.statusCode).toBe(201)
    const body = created.json()
    expect(body).toMatchObject({
      name: 'Spotify',
      monthlyAmount: 60,
      renewalDay: 20,
    })
    expect(body.id).toEqual(expect.any(String))

    const list = await app.inject({ method: 'GET', url: '/api/subscriptions' })

    expect(list.statusCode).toBe(200)
    expect(list.json()).toHaveLength(1)
    expect(list.json()[0]).toMatchObject({
      id: body.id,
      name: 'Spotify',
      monthlyAmount: 60,
      renewalDay: 20,
    })
  })

  test.each([
    ['boş ad', { name: '', monthlyAmount: 10, renewalDay: 5 }],
    ['sadece boşluktan oluşan ad', { name: '   ', monthlyAmount: 10, renewalDay: 5 }],
    ['81 karakterlik ad', { name: 'a'.repeat(81), monthlyAmount: 10, renewalDay: 5 }],
    ['sıfır tutar', { name: 'Deneme', monthlyAmount: 0, renewalDay: 5 }],
    ['negatif tutar', { name: 'Deneme', monthlyAmount: -1, renewalDay: 5 }],
    ['aşırı tutar', { name: 'Deneme', monthlyAmount: 100001, renewalDay: 5 }],
    ['sıfır yenileme günü', { name: 'Deneme', monthlyAmount: 10, renewalDay: 0 }],
    ['32. yenileme günü', { name: 'Deneme', monthlyAmount: 10, renewalDay: 32 }],
    ['kesirli yenileme günü', { name: 'Deneme', monthlyAmount: 10, renewalDay: 5.5 }],
    ['eksik alan', { name: 'Deneme' }],
    [
      'fazladan alan',
      { name: 'Deneme', monthlyAmount: 10, renewalDay: 5, renk: 'mavi' },
    ],
  ])('geçersiz gövde reddedilir: %s', async (_label, payload) => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/subscriptions',
      payload,
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().error).toEqual(expect.any(String))

    const { rows } = await pool.query(
      'SELECT count(*)::int AS adet FROM subscriptions',
    )
    expect(rows[0].adet).toBe(0)
  })

  test('liste yenileme gününe göre artan sıralanır', async () => {
    for (const payload of [
      { name: 'Spotify', monthlyAmount: 60, renewalDay: 20 },
      { name: 'Netflix', monthlyAmount: 99, renewalDay: 3 },
    ]) {
      await app.inject({ method: 'POST', url: '/api/subscriptions', payload })
    }

    const response = await app.inject({ method: 'GET', url: '/api/subscriptions' })

    expect(response.json().map((item) => item.renewalDay)).toEqual([3, 20])
  })

  test('sağlık ucu veritabanı açıkken 200 döner', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/health' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: 'ok' })
  })

  test('sağlık ucu veritabanı kapalıyken 503 döner', async () => {
    const failingApp = buildApp({
      pool: {
        query: async () => {
          throw new Error('veritabanı kapalı')
        },
      },
    })
    await failingApp.ready()

    const response = await failingApp.inject({ method: 'GET', url: '/api/health' })

    expect(response.statusCode).toBe(503)
    await failingApp.close()
  })
})
