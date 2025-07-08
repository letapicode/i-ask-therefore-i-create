import type { AppProps } from 'next/app';
import Script from 'next/script';
import { useEffect } from 'react';
import { loadTranslations } from '../lib/i18n';
import ChatWidget from '../components/ChatWidget';

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const lang = localStorage.getItem('lang') || 'en';
    loadTranslations(lang).then((d) => (window.__t = d));
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
      <ChatWidget />
    </>
  );
}
