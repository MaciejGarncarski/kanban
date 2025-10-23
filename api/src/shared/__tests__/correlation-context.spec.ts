import { CorrelationContext } from 'src/shared/context/correlation.context';

describe('CorrelationContext', () => {
  it('should return undefined if no context is set', () => {
    expect(CorrelationContext.getCorrelationId()).toBeUndefined();
  });

  it('should store and retrieve correlationId within run()', () => {
    CorrelationContext.run('abc123', () => {
      const id = CorrelationContext.getCorrelationId();
      expect(id).toBe('abc123');
    });
  });

  it('should isolate correlationIds between contexts', (done) => {
    CorrelationContext.run('id-1', () => {
      expect(CorrelationContext.getCorrelationId()).toBe('id-1');
      CorrelationContext.run('id-2', () => {
        expect(CorrelationContext.getCorrelationId()).toBe('id-2');
      });

      expect(CorrelationContext.getCorrelationId()).toBe('id-1');
      done();
    });
  });
});
