import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const { Pool } = pg
const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url))

export function createPool(connectionString) {
  return new Pool({ connectionString })
}

export async function waitForDatabase(pool, attempts = 10, delayMs = 1000) {
  let lastError

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await pool.query('SELECT 1')
      return
    } catch (error) {
      lastError = error
      await new Promise((resolve) => {
        setTimeout(resolve, delayMs)
      })
    }
  }

  throw lastError
}

export async function ensureSchema(pool) {
  const schema = await readFile(schemaPath, 'utf8')
  await pool.query(schema)
}
