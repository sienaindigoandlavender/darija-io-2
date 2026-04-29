import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import './globals.css';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://darija.io';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('site');
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${t('name')} — ${t('tagline')}`,
      template: `%s | ${t('name')}`,
    },
    description: t('description'),
    keywords: [
      'Darija dictionary', 'Moroccan Arabic dictionary', 'learn Darija', 'Moroccan Arabic',
      'Darija translation', 'Darija to English', 'Darija phrases', 'Moroccan language',
      'how to say in Darija', 'Moroccan Arabic words', 'Darija for beginners',
      'Darija pronunciation', 'Moroccan dialect', 'Darija grammar',
      'Morocco travel phrases', 'Moroccan slang', 'Darija vocabulary',
      'Arabic Morocco dictionary', 'Darija online dictionary',
      'learn Moroccan Arabic online', 'Darija English French dictionary',
      'Moroccan Arabic translator', 'Darija cultural notes',
      'dictionnaire darija', 'apprendre darija', 'darija marocain',
      'dictionnaire marocain français', 'traduction darija',
      'قاموس الدارجة', 'الدارجة المغربية', 'تعلم الدارجة',
    ],
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      ],
      shortcut: '/icon.svg',
      apple: '/icon.svg',
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      alternateLocale: ['fr_FR', 'ar_MA'],
      url: siteUrl,
      siteName: t('name'),
      title: `${t('name')} — ${t('tagline')}`,
      description: t('description'),
      images: [{ url: `${siteUrl}/og-image.jpg`, width: 1200, height: 630, alt: t('name') }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t('name')} — ${t('tagline')}`,
      description: t('description'),
      images: [`${siteUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: siteUrl,
      languages: {
        en: siteUrl,
        fr: siteUrl,
        'x-default': siteUrl,
      },
    },
    robots: {
      index: true, follow: true, 'max-snippet': -1,
      'max-image-preview': 'large' as const, 'max-video-preview': -1,
    },
    category: 'education',
  };
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: 'Darija Dictionary',
    alternateName: ['Everyday Darija', 'Dictionnaire Darija', 'قاموس الدارجة'],
    url: siteUrl,
    inLanguage: ['en', 'fr', 'ar'],
    license: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
    copyrightYear: 2026,
    copyrightHolder: {
      '@type': 'Organization',
      name: 'Dancing with Lions',
      url: 'https://dancingwiththelions.com',
    },
    creditText: 'Dancing with Lions. (2026). Everyday Darija Dictionary [Dataset]. https://darija.io',
    usageInfo: `${siteUrl}/legal/terms`,
    publisher: {
      '@type': 'Organization',
      '@id': 'https://dancingwiththelions.com/#org',
      name: 'Dancing with Lions',
      url: 'https://dancingwiththelions.com',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${siteUrl}/#dictionary`,
    name: 'Darija Dictionary',
    description:
      'A comprehensive dictionary of Moroccan Arabic (Darija) containing 10,000+ words and 1,500 phrases. Each entry includes Arabizi (Latin) transliteration, Arabic script, English translation, French translation, pronunciation guide, and cultural context.',
    inLanguage: ['ar-MA', 'en', 'fr'],
    isPartOf: { '@id': `${siteUrl}/#website` },
    creator: {
      '@type': 'Organization',
      name: 'Dancing with Lions',
      url: 'https://dancingwiththelions.com',
    },
    about: [
      { '@type': 'Language', name: 'Moroccan Arabic', alternateName: ['Darija', 'الدارجة المغربية'] },
      { '@type': 'Country', name: 'Morocco' },
    ],
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'learner',
      audienceType: 'Travelers, language learners, researchers, expats',
    },
    educationalLevel: 'beginner to advanced',
    numberOfItems: 11500,
  },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} dir="ltr">
      <head>
        {jsonLd.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <meta name="robots" content="index, follow, noai, noimageai, max-snippet:-1, max-image-preview:large" />
        <link rel="license" href="https://creativecommons.org/licenses/by-nc-nd/4.0/" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <link rel="alternate" hrefLang="en" href={siteUrl} />
        <link rel="alternate" hrefLang="fr" href={siteUrl} />
        <link rel="alternate" hrefLang="x-default" href={siteUrl} />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-G9095QRS3N"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-G9095QRS3N');`
        }} />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
