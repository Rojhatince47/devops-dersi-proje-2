import Fastify from 'fastify'

const createSubscriptionSchema = {
  body: {
    type: 'object',
    additionalProperties: false,
    required: ['name', 'monthlyAmount', 'renewalDay'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 80 },
      monthlyAmount: { type: 'number', exclusiveMinimum: 0, maximum: 100000 },
      renewalDay: { type: 'integer', minimum: 1, maximum: 31 },
    },
  },
}

function toSubscription(row) {
  return {
    id: row.id,
    name: row.name,
    monthlyAmount: Number(row.monthly_amount),
    renewalDay: row.renewal_day,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
  }
}

export function buildApp({ pool }) {
  const app = Fastify({
    logger: false,
    ajv: { customOptions: { removeAdditional: false } },
  })

  app.setErrorHandler((error, _request, reply) => {
    if (error.validation) {
      return reply
        .code(400)
        .send({ error: 'Gönderilen abonelik bilgileri geçersiz.' })
    }

    return reply.code(500).send({ error: 'Beklenmeyen bir hata oluştu.' })
  })

  app.get('/api/health', async (_request, reply) => {
    try {
      await pool.query('SELECT 1')
      return { status: 'ok' }
    } catch {
      return reply.code(503).send({ status: 'error' })
    }
  })

  app.get('/api/subscriptions', async () => {
    const { rows } = await pool.query(
      `SELECT id, name, monthly_amount, renewal_day, created_at
         FROM subscriptions
        ORDER BY renewal_day ASC, name ASC`,
    )

    return rows.map(toSubscription)
  })

  app.post(
    '/api/subscriptions',
    { schema: createSubscriptionSchema },
    async (request, reply) => {
      const name = request.body.name.trim()

      if (name.length === 0) {
        return reply.code(400).send({ error: 'Abonelik adı boş olamaz.' })
      }

      const { monthlyAmount, renewalDay } = request.body
      const { rows } = await pool.query(
        `INSERT INTO subscriptions (name, monthly_amount, renewal_day)
              VALUES ($1, $2, $3)
           RETURNING id, name, monthly_amount, renewal_day, created_at`,
        [name, monthlyAmount, renewalDay],
      )

      return reply.code(201).send(toSubscription(rows[0]))
    },
  )

  return app
}
