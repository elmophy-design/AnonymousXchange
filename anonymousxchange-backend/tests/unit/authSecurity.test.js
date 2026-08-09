const test = require('node:test')
const assert = require('node:assert/strict')
const { recordFailedLogin, getLoginAttemptState, resetLoginAttempts } = require('../../dist/utils/authSecurity')

test('locks out repeated failed logins after the configured threshold', () => {
  const key = 'lockout-test'
  resetLoginAttempts(key)

  const first = recordFailedLogin(key, 3, 1000)
  assert.equal(first.count, 1)
  assert.equal(first.locked, false)

  const second = recordFailedLogin(key, 3, 1000)
  assert.equal(second.count, 2)
  assert.equal(second.locked, false)

  const third = recordFailedLogin(key, 3, 1000)
  assert.equal(third.count, 3)
  assert.equal(third.locked, true)

  const state = getLoginAttemptState(key)
  assert.equal(state.locked, true)
})
