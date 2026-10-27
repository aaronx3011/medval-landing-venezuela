const attempts = new Map<string, number[]>()

export const checkRateLimit = (
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): boolean => {
  const previous = attempts.get(key) ?? []
  const recent = previous.filter((timestamp) => now - timestamp < windowMs)

  if (recent.length >= limit) {
    attempts.set(key, recent)

    return false
  }

  attempts.set(key, [...recent, now])

  return true
}

export const resetRateLimit = (key?: string) => {
  if (key) {
    attempts.delete(key)
  } else {
    attempts.clear()
  }
}
