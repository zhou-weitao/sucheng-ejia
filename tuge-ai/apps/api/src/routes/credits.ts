import { Context } from 'hono'

export async function handleCreditsBalance(c: Context) {
  // In production: query D1 for user's credits
  // For demo, return mock data
  return c.json({
    account: {
      userId: 'ncCKTpxseIl78d2MnpheLGnEOFoFvBDC',
      balanceInteger: 950,
      versionInteger: 8,
      createdAt: '2026-10-10T08:23:04.256Z',
      updatedAt: '2026-10-10T08:25:56.695Z',
    },
    pricingAuthority: 'SERVER_PRICING_MATRIX',
    pricingVersion: 'INTERNAL_BETA_PRICING_V1',
    pricing: [
      { businessTier: 'normal', resolution: '1K', priceInteger: 1, enabled: true },
      { businessTier: 'normal', resolution: '2K', priceInteger: 1, enabled: true },
      { businessTier: 'normal', resolution: '4K', priceInteger: 1, enabled: true },
      { businessTier: 'advanced', resolution: '1K', priceInteger: 1, enabled: true },
      { businessTier: 'advanced', resolution: '2K', priceInteger: 1, enabled: true },
      { businessTier: 'advanced', resolution: '4K', priceInteger: 1, enabled: true },
      { businessTier: 'super', resolution: '1K', priceInteger: 1, enabled: true },
      { businessTier: 'super', resolution: '2K', priceInteger: 1, enabled: true },
      { businessTier: 'super', resolution: '4K', priceInteger: 1, enabled: true },
    ],
  })
}
