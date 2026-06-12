import createNextIntlPlugin from 'next-intl/plugin';
import canonicalOverrides from './data/canonical-overrides.json' with { type: 'json' };

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// Generate 301 redirects from each duplicate word URL to its canonical
// master. This complements the dynamicParams=false setting on /word/[id]
// — duplicates would otherwise 404; instead they send Google (and any
// external backlink) to the surviving master URL.
const duplicateRedirects = Object.entries(canonicalOverrides).map(
  ([from, to]) => ({
    source: `/word/${from}`,
    destination: `/word/${to}`,
    permanent: true,
  })
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Old Slow Morocco /darija paths → darija.io equivalents
      { source: '/dictionary', destination: '/', permanent: true },
      { source: '/dictionary/:id', destination: '/word/:id', permanent: true },
      // Old "phrases" section maps to the how-to-say hub, not the homepage
      { source: '/phrases', destination: '/how-to-say', permanent: true },
      { source: '/access', destination: '/', permanent: true },

      // (Removed dead rule '/dictionary/verbs-:id' — it could never fire
      // because '/dictionary/:id' above matches first. All verbs-* IDs
      // exist as real words, so /word/verbs-XXXXX is the correct target.)

      // dharija.space legacy paths
      { source: '/darija', destination: '/', permanent: true },
      { source: '/darija/:path*', destination: '/', permanent: true },

      // Low-quality how-to-say page that generated nonsensical queries
      { source: '/how-to-say/arabic', destination: '/', permanent: true },

      // Duplicate-word canonicalization — sourced from
      // data/canonical-overrides.json so the redirect set stays in sync
      // with the indexing/canonical strategy.
      ...duplicateRedirects,
    ];
  },
};

export default withNextIntl(nextConfig);
