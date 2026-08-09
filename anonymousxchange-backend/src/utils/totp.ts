import crypto from 'crypto'

function base32Decode(input: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const cleaned = input.replace(/=+$/, '').toUpperCase().replace(/[^A-Z2-7]/g, '')
  let bits = ''
  for (const c of cleaned) {
    const val = alphabet.indexOf(c)
    if (val < 0) continue
    bits += val.toString(2).padStart(5, '0')
  }
  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2))
  }
  return Buffer.from(bytes)
}

function base32Encode(buf: Buffer): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = ''
  for (const b of buf) bits += b.toString(2).padStart(8, '0')
  let out = ''
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0')
    out += alphabet[parseInt(chunk, 2)]
  }
  return out
}

export function generateTotpSecret(bytes = 20): string {
  return base32Encode(crypto.randomBytes(bytes))
}

export function generateTotp(secret: string, step = 30, digits = 6): string {
  const key = base32Decode(secret)
  const counter = Math.floor(Date.now() / 1000 / step)
  const buf = Buffer.alloc(8)
  buf.writeBigUInt64BE(BigInt(counter))
  const hmac = crypto.createHmac('sha1', key).update(buf).digest()
  const offset = hmac[hmac.length - 1] & 0xf
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  return (code % 10 ** digits).toString().padStart(digits, '0')
}

export function verifyTotp(secret: string, token: string, window = 1): boolean {
  const cleaned = String(token).replace(/\s/g, '')
  if (!/^\d{6}$/.test(cleaned)) return false
  for (let w = -window; w <= window; w++) {
    const step = 30
    const counter = Math.floor(Date.now() / 1000 / step) + w
    const key = base32Decode(secret)
    const buf = Buffer.alloc(8)
    buf.writeBigUInt64BE(BigInt(counter))
    const hmac = crypto.createHmac('sha1', key).update(buf).digest()
    const offset = hmac[hmac.length - 1] & 0xf
    const code =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff)
    const expected = (code % 10 ** 6).toString().padStart(6, '0')
    if (expected === cleaned) return true
  }
  return false
}

export function totpOtpauthUrl(secret: string, email: string, issuer = 'AnonymousXchange') {
  const label = encodeURIComponent(`${issuer}:${email}`)
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  })
  return `otpauth://totp/${label}?${params.toString()}`
}
