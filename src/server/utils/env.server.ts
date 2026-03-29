export function readEnv(keys: string[], fallback?: string) {
  for (const key of keys) {
    const value = process.env[key]

    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim()
    }
  }

  return fallback
}

export function readRequiredEnv(keys: string[]) {
  const value = readEnv(keys)

  if (!value) {
    throw new Error(`Missing required environment variable. Tried: ${keys.join(', ')}`)
  }

  return value
}

export function readBoolean(keys: string[], fallback: boolean) {
  const value = readEnv(keys, fallback ? 'true' : 'false')?.toLowerCase()

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  throw new Error(`Invalid boolean value for ${keys.join(', ')}: ${value}`)
}

export function readOrigins(keys: string[], fallback: string) {
  return String(readEnv(keys, fallback))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

export function readSameSite(keys: string[], fallback: 'lax' | 'strict' | 'none') {
  const value = readEnv(keys, fallback)?.toLowerCase()

  if (value === 'lax' || value === 'strict' || value === 'none') {
    return value
  }

  throw new Error(`Invalid sameSite value for ${keys.join(', ')}: ${value}`)
}
