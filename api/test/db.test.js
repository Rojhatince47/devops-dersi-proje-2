// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { createPool, ensureSchema, waitForDatabase } from '../src/db.js'

const databaseUrl =
  process.env.TEST_DATABASE_URL ??
  'postgres://abonelik:abonelik_dev@localhost:5432/abonelik_test'

describe('veritabanı şeması', () => {
  let pool

  beforeAll(async () => {
    pool = createPool(databaseUrl)
    await waitForDatabase(pool, 5, 500)
  })

  afterAll(async () => {
    await pool.end()
  })

  beforeEach(async () => {
    await pool.query('DROP TABLE IF EXISTS subscriptions')
    await ensureSchema(pool)
  })

  test('şema iki kez uygulandığında hata vermez', async () => {
    await ensureSchema(pool)

    const { rows } = await pool.query(
      "SELECT to_regclass('public.subscriptions') AS tablo",
    )

    expect(rows[0].tablo).toBe('subscriptions')
  })

  test('31den büyük yenileme günü veritabanı tarafından reddedilir', async () => {
    await expect(
      pool.query(
        "INSERT INTO subscriptions (name, monthly_amount, renewal_day) VALUES ('Deneme', 10, 32)",
      ),
    ).rejects.toThrow()
  })

  test('sıfır tutar veritabanı tarafından reddedilir', async () => {
    await expect(
      pool.query(
        "INSERT INTO subscriptions (name, monthly_amount, renewal_day) VALUES ('Deneme', 0, 5)",
      ),
    ).rejects.toThrow()
  })
})
