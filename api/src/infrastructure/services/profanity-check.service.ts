import { Injectable, Logger } from '@nestjs/common';
import { ProfanityCheckPort } from 'src/core/application/ports/profanity-check.port';
import z from 'zod';

const responseDataSchema = z.object({
  isProfanity: z.boolean(),
  score: z.number(),
});

@Injectable()
export class ProfanityCheckService implements ProfanityCheckPort {
  constructor() {}

  async isProfane(text: string): Promise<boolean> {
    try {
      const res = await fetch('https://vector.profanity.dev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-agent': 'KanbanApp/1.0 (+https://kanban.maciej-garncarski.pl)',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        throw new Error(`Profanity API error: ${res.statusText}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await res.json();
      const parsedData = responseDataSchema.parse(data);

      return parsedData.isProfanity;
    } catch (error) {
      if (error instanceof z.ZodError) {
        Logger.error('Profanity API response validation error', error.message);
      } else if (error instanceof Error) {
        Logger.error('Profanity API error', error.message);
      } else {
        Logger.error('Profanity API unknown error', String(error));
      }

      // In case of error, assume text is clean to avoid blocking user actions
      return false;
    }
  }
}
