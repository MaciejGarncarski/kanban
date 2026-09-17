/**
 * Validates runtime data against a Zod response schema and returns it as the
 * corresponding DTO class type.
 *
 * Response DTO classes double as OpenAPI models (via @ApiProperty), so their
 * declarations stay exactly as Swagger needs them (e.g. `createdAt: string`),
 * while the Zod schemas enforce the runtime shape (e.g. coercing dates).
 * The double cast is intentional and contained here: the schema is the
 * source of truth for what the API actually returns.
 */
export function parseResponse<TResponse>(
  schema: { parse: (data: unknown) => unknown },
  data: unknown,
): TResponse {
  return schema.parse(data) as TResponse;
}
