import crypto from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(crypto.scrypt)
const KEY_LENGTH = 64

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('base64url')
  const hash = (await scrypt(password, salt, KEY_LENGTH)) as Buffer

  return `scrypt$${salt}$${Buffer.from(hash).toString('base64url')}`
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, expectedHash] = String(storedHash).split('$')

  if (algorithm !== 'scrypt' || !salt || !expectedHash) {
    return false
  }

  const derivedHash = (await scrypt(password, salt, KEY_LENGTH)) as Buffer
  const expectedBuffer = Buffer.from(expectedHash, 'base64url')
  const derivedBuffer = Buffer.from(derivedHash)

  if (expectedBuffer.length !== derivedBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(expectedBuffer, derivedBuffer)
}
