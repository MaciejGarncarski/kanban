import { AsyncLocalStorage } from 'async_hooks';

interface CorrelationStore {
  correlationId: string;
}

const asyncLocalStorage = new AsyncLocalStorage<CorrelationStore>();

export class CorrelationContext {
  static getCorrelationId(): string | undefined {
    const store = asyncLocalStorage.getStore();
    return store?.correlationId;
  }

  static run(correlationId: string, callback: () => void): void {
    const store: CorrelationStore = { correlationId };
    asyncLocalStorage.run(store, callback);
  }
}
