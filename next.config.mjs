import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Old Slow Morocco /darija paths → darija.io equivalents
      { source: '/dictionary', destination: '/', permanent: true },
      { source: '/dictionary/:id', destination: '/word/:id', permanent: true },
      { source: '/phrases', destination: '/', permanent: true },
      { source: '/access', destination: '/', permanent: true },

      // Old dictionary verb paths (Slow Morocco redirects these here)
      { source: '/dictionary/verbs-:id', destination: '/', permanent: true },

      // dharija.space legacy paths
      { source: '/darija', destination: '/', permanent: true },
      { source: '/darija/:path*', destination: '/', permanent: true },

      // Low-quality how-to-say page that generated nonsensical queries
      { source: '/how-to-say/arabic', destination: '/', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
