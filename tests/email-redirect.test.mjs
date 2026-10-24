import assert from 'node:assert/strict'
import test from 'node:test'
import { emailRedirect } from '../lib/auth/email-redirect.ts'

const origin = 'https://pixraise.com'

test('preserves same-site recovery and dashboard destinations across locales', () => {
  for (const path of ['/reset-password', '/en/reset-password', '/ar/reset-password', '/dashboard', '/en/dashboard/client']) {
    assert.equal(emailRedirect(path, origin, true), path)
    assert.equal(emailRedirect(origin + path, origin, true), path)
  }
})

test('rejects external, credential-bearing and unrelated destinations', () => {
  for (const path of ['https://evil.example/reset-password', '//evil.example/dashboard', '/\\evil.example/dashboard', 'javascript:alert(1)', 'https://user:pass@pixraise.com/dashboard', '/auth/confirm', '/api/pixo/users']) {
    assert.equal(emailRedirect(path, origin, true), '/reset-password')
  }
  assert.equal(emailRedirect(null, origin, false), '/dashboard')
})

test('removes query strings and fragments from email redirects', () => {
  assert.equal(emailRedirect('/en/reset-password?token=private#fragment', origin, true), '/en/reset-password')
})
