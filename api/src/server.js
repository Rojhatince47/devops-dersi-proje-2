import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import fastifyStatic from '@fastify/static'
import { buildApp } from './app.js'
import { createPool, ensureSchema, waitForDatabase } from './db.js'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('DATABASE_URL tanımlı değil.')
  process.exit(1)
}

const pool = createPool(databaseUrl)
await waitForDatabase(pool)
await ensureSchema(pool)

const app = buildApp({ pool })
const distPath = fileURLToPath(new URL('../../dist', import.meta.url))

if (existsSync(distPath)) {
  await app.register(fastifyStatic, { root: distPath })
  app.setNotFoundHandler((request, reply) => {
    if (request.raw.url.startsWith('/api')) {
      return reply.code(404).send({ error: 'Bulunamadı.' })
    }

    return reply.sendFile('index.html')
  })
}

const port = Number(process.env.PORT ?? 3000)
await app.listen({ port, host: '0.0.0.0' })

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    await app.close()
    await pool.end()
    process.exit(0)
  })
}
