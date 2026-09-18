const attemptStore = new Map<string, { count: number; lockedUntil: number }>()

function now() {
  return Date.now()
}

export function resetLoginAttempts(key: string) {
  attemptStore.delete(key)
}

export function getLoginAttemptState(key: string) {
  const state = attemptStore.get(key)
  if (!state) {
    return { count: 0, locked: false, lockedUntil: 0 }
  }

  if (state.lockedUntil > now()) {
    return { count: state.count, locked: true, lockedUntil: state.lockedUntil }
  }

  if (state.lockedUntil && state.lockedUntil <= now()) {
    attemptStore.delete(key)
    return { count: 0, locked: false, lockedUntil: 0 }
  }

  return { count: state.count, locked: false, lockedUntil: state.lockedUntil }
}

export function recordFailedLogin(key: string, threshold: number, lockoutMs: number) {
  const current = getLoginAttemptState(key)
  if (current.locked) {
    return { count: current.count, locked: true, lockedUntil: current.lockedUntil }
  }

  const nextCount = current.count + 1
  if (nextCount >= threshold) {
    const lockedUntil = now() + lockoutMs
    attemptStore.set(key, { count: nextCount, lockedUntil })
    return { count: nextCount, locked: true, lockedUntil }
  }

  attemptStore.set(key, { count: nextCount, lockedUntil: 0 })
  return { count: nextCount, locked: false, lockedUntil: 0 }
}
