import { nanoid } from 'nanoid';

export function generateReadableId() {
  return nanoid(8);
}
