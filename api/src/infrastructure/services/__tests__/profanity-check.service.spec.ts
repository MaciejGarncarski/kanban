import { ProfanityCheckService } from 'src/infrastructure/services/profanity-check.service';

describe('ProfanityCheckService', () => {
  let service: ProfanityCheckService;

  beforeEach(() => {
    service = new ProfanityCheckService();

    // reset mocka przed każdym testem
    global.fetch = jest.fn();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return false when response validation fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invalidField: 'invalid' }),
    });

    const result = await service.isProfane('test');
    expect(result).toBe(false);
  });

  it('should return false when response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    });

    const result = await service.isProfane('test');
    expect(result).toBe(false);
  });

  it('should return false when text is clean', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isProfanity: false, score: 0 }),
    });

    const result = await service.isProfane('hello world');
    expect(result).toBe(false);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://vector.profanity.dev',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('should return true when text is profane', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isProfanity: true, score: 1 }),
    });

    const result = await service.isProfane('bad word');

    expect(result).toBe(true);
  });

  it('should handle fetch error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('network error'),
    );

    const result = await service.isProfane('test');
    expect(result).toBe(false); // fail-safe
  });

  it('should handle non-Error exceptions gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce('string error');

    const result = await service.isProfane('test');
    expect(result).toBe(false); // fail-safe
  });
});
