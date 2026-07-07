export function requiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name} in agent/.env`);
  }

  return value;
}

export function optionalEnv(name: string, fallback: string) {
  return process.env[name]?.trim() || fallback;
}
