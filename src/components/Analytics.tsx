'use client'

import Script from 'next/script'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export const trackEvent = (name: string, params: Record<string, string> = {}) => {
  window.gtag?.('event', name, params)
}

export const Analytics = () => {
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  if (!gaId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${gaId}');`}
      </Script>
    </>
  )
}
