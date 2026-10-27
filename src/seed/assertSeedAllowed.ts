export const assertSeedAllowed = (
  env: {
    NODE_ENV?: string
    SEED_ALLOWED?: string
  } = process.env,
) => {
  if (env.NODE_ENV === 'production' && env.SEED_ALLOWED !== '1') {
    throw new Error('The seed script must never run in production (WEB-49).')
  }
}
