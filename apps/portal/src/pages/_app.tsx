import type { AppProps } from 'next/app';
import Script from 'next/script';
import { useEffect } from 'react';
import { loadTranslations } from '../lib/i18n';

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const lang = localStorage.getItem('lang') || 'en';
    loadTranslations(lang).then((d) => (window.__t = d));
    if (process.env.NEXT_PUBLIC_DISABLE_UI_ANALYTICS !== 'true') {
      const handleClick = (e: MouseEvent) => {
        const t = e.target as HTMLElement;
        const id = t.id || t.getAttribute('data-track');
        if (!id) return;
        fetch('/analytics/uiEvent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: window.location.pathname, element: id, action: 'click' }),
        });
      };
      document.addEventListener('click', handleClick);
      fetch('/analytics/uiEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: window.location.pathname, action: 'navigate' }),
      });
      return () => document.removeEventListener('click', handleClick);
    }
  }, []);
  return (
    <>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
      )}
      {process.env.NEXT_PUBLIC_GA_ID && (
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}
        </Script>
      )}
      <Component {...pageProps} />
    </>
  );
}
