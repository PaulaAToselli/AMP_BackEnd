import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // Railway inyecta DATABASE_URL directamente.
  // Si no está, se usan las variables individuales.
  DATABASE_URL: Joi.string().uri().optional(),

  DB_HOST: Joi.string().when('DATABASE_URL', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().when('DATABASE_URL', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
  DB_USER: Joi.string().when('DATABASE_URL', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
  DB_PASS: Joi.string().when('DATABASE_URL', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  INTERSOFTIC_API_URL: Joi.string().uri().optional(),
  INTERSOFTIC_API_KEY: Joi.string().optional().allow(''),

  SYNC_CRON_INTERVAL: Joi.string().default('0 * * * *'),
});
