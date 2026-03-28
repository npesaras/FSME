const crypto = require('node:crypto')
const { promisify } = require('node:util')

const scrypt = promisify(crypto.scrypt)
const KEY_LENGTH = 64

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64url')
  const hash = await scrypt(password, salt, KEY_LENGTH)

  return `scrypt$${salt}$${Buffer.from(hash).toString('base64url')}`
}

async function verifyPassword(password, storedHash) {
  const [algorithm, salt, expectedHash] = String(storedHash).split('$')

  if (algorithm !== 'scrypt' || !salt || !expectedHash) {
    return false
  }

  const derivedHash = await scrypt(password, salt, KEY_LENGTH)
  const expectedBuffer = Buffer.from(expectedHash, 'base64url')
  const derivedBuffer = Buffer.from(derivedHash)

  if (expectedBuffer.length !== derivedBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(expectedBuffer, derivedBuffer)
}

module.exports = {
  hashPassword,
  verifyPassword,
}
