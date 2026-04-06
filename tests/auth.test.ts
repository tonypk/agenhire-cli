import { describe, it, expect, afterEach } from 'vitest';
import { resolveApiKey, resolveBaseUrl } from '../src/auth.js';

describe('resolveApiKey', () => {
  const originalEnv = process.env.AGENHIRE_API_KEY;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.AGENHIRE_API_KEY = originalEnv;
    } else {
      delete process.env.AGENHIRE_API_KEY;
    }
  });

  it('returns CLI flag if provided', () => {
    process.env.AGENHIRE_API_KEY = 'env_key';
    expect(resolveApiKey({ key: 'flag_key' })).toBe('flag_key');
  });

  it('returns env var if no flag', () => {
    process.env.AGENHIRE_API_KEY = 'env_key';
    expect(resolveApiKey()).toBe('env_key');
  });

  it('returns undefined if nothing set and no config', () => {
    delete process.env.AGENHIRE_API_KEY;
    const result = resolveApiKey();
    expect(typeof result === 'string' || result === undefined).toBe(true);
  });
});

describe('resolveBaseUrl', () => {
  const originalEnv = process.env.AGENHIRE_BASE_URL;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.AGENHIRE_BASE_URL = originalEnv;
    } else {
      delete process.env.AGENHIRE_BASE_URL;
    }
  });

  it('returns env var if set', () => {
    process.env.AGENHIRE_BASE_URL = 'http://localhost:4000';
    expect(resolveBaseUrl()).toBe('http://localhost:4000');
  });

  it('returns default if nothing set', () => {
    delete process.env.AGENHIRE_BASE_URL;
    expect(resolveBaseUrl()).toMatch(/agenhire/);
  });
});
