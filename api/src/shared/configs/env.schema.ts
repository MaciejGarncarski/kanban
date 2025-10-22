import z from 'zod/v4';

export const envSchema = z.object({
  DATABASE_URL: z.url(),
  API_PORT: z
    .string()
    .transform(Number)
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'API_PORT must be a positive number',
    }),
  JWT_SECRET: z
    .string()
    .min(32, { message: 'JWT_SECRET must be at least 32 characters' }),
  COOKIE_SECRET: z
    .string()
    .min(32, { message: 'COOKIE_SECRET must be at least 32 characters' }),
  COOKIE_SECURE: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean(),
  ),
  CORS_ORIGIN: z.url(),
});

export const validate = (config: Record<string, unknown>) => {
  const validated = envSchema.parse(config);
  return validated;
};
