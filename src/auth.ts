import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export interface AuthConfig {
  apiKey: string;
  baseUrl?: string;
}

const CONFIG_DIR = join(homedir(), '.agenhire');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export function resolveApiKey(options?: { key?: string }): string | undefined {
  if (options?.key) return options.key;
  if (process.env.AGENHIRE_API_KEY) return process.env.AGENHIRE_API_KEY;
  const config = loadConfig();
  return config?.apiKey;
}

export function resolveBaseUrl(): string {
  if (process.env.AGENHIRE_BASE_URL) return process.env.AGENHIRE_BASE_URL;
  const config = loadConfig();
  return config?.baseUrl ?? 'https://agenhire.com';
}

export function loadConfig(): AuthConfig | undefined {
  if (!existsSync(CONFIG_FILE)) return undefined;
  const raw = readFileSync(CONFIG_FILE, 'utf-8');
  return JSON.parse(raw) as AuthConfig;
}

export function saveConfig(config: AuthConfig): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

export function deleteConfig(): void {
  if (existsSync(CONFIG_FILE)) {
    unlinkSync(CONFIG_FILE);
  }
}
