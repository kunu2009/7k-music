import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type SeoConfig = {
  title: string;
  description: string;
  noindex?: boolean;
  image?: string;
};

const APP_NAME = '7K Music';

function getSeoConfig(pathname: string): SeoConfig {
  if (pathname === '/') {
    return {
      title: '7K Music | Play, Discover, Create Music Videos Legally',
      description:
        'Stream trending music videos from YouTube, build playlists, and discover new tracks in a fast Spotify-style PWA.',
      image: '/favicon.png',
    };
  }

  if (pathname.startsWith('/search')) {
    return {
      title: 'Search Music Videos | 7K Music',
      description:
        'Search songs, artists, and genres to find music videos from YouTube inside 7K Music.',
      noindex: true,
      image: '/favicon.png',
    };
  }

  if (pathname.startsWith('/downloads')) {
    return {
      title: 'Android APK Downloads | 7K Music',
      description:
        'Download the latest 7K Music Android APK for arm64, armv7, or x86_64 devices.',
      image: '/favicon.png',
    };
  }

  if (pathname.startsWith('/categories')) {
    return {
      title: 'Browse Music Categories | 7K Music',
      description:
        'Explore trending music categories, curated sections, and discovery rails in 7K Music.',
      image: '/favicon.png',
    };
  }

  if (pathname.startsWith('/favorites')) {
    return {
      title: 'Your Favorites | 7K Music',
      description: 'Open your liked music videos and saved tracks in 7K Music.',
      noindex: true,
      image: '/favicon.png',
    };
  }

  if (pathname.startsWith('/my-music')) {
    return {
      title: 'My Music Library | 7K Music',
      description: 'View your saved music, playlists, and offline-ready library items.',
      noindex: true,
      image: '/favicon.png',
    };
  }

  if (pathname.startsWith('/playlists/')) {
    return {
      title: 'Playlist Details | 7K Music',
      description: 'Open a playlist and play the tracks inside 7K Music.',
      noindex: true,
      image: '/favicon.png',
    };
  }

  if (pathname.startsWith('/playlists')) {
    return {
      title: 'Playlists | 7K Music',
      description: 'Create, edit, and manage playlists in 7K Music.',
      noindex: true,
      image: '/favicon.png',
    };
  }

  if (pathname.startsWith('/now-playing')) {
    return {
      title: 'Now Playing | 7K Music',
      description: 'Control playback, seek through tracks, and manage the queue in 7K Music.',
      noindex: true,
      image: '/favicon.png',
    };
  }

  if (pathname.startsWith('/settings')) {
    return {
      title: 'App Settings | 7K Music',
      description: 'Adjust playback, appearance, and app preferences in 7K Music.',
      noindex: true,
      image: '/favicon.png',
    };
  }

  return {
    title: `${APP_NAME} | Music Videos and Playlists`,
    description: 'Stream music videos, discover songs, and manage playlists with 7K Music.',
    image: '/7kmusic.png',
  };
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  const existing = document.head.querySelector<HTMLMetaElement>(selector);
  const element = existing ?? document.createElement('meta');

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  if (!existing) {
    document.head.appendChild(element);
  }
}

function upsertLink(rel: string, href: string, extraAttributes: Record<string, string> = {}) {
  const selector = `link[rel="${rel}"]`;
  const existing = document.head.querySelector<HTMLLinkElement>(selector);
  const element = existing ?? document.createElement('link');
  element.setAttribute('rel', rel);
  element.setAttribute('href', href);
  Object.entries(extraAttributes).forEach(([key, value]) => element.setAttribute(key, value));

  if (!existing) {
    document.head.appendChild(element);
  }
}

function upsertJsonLd(id: string, value: object) {
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }

  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(value);
  document.head.appendChild(script);
}

export function SeoManager() {
  const location = useLocation();
  const isDownloadsPage = location.pathname.startsWith('/downloads');
  const isCategoriesPage = location.pathname.startsWith('/categories');

  const breadcrumbItems: Array<{ name: string; path: string }> = (() => {
    if (location.pathname === '/') {
      return [{ name: 'Home', path: '/' }];
    }
    if (isDownloadsPage) {
      return [
        { name: 'Home', path: '/' },
        { name: 'Downloads', path: '/downloads' },
      ];
    }
    if (isCategoriesPage) {
      return [
        { name: 'Home', path: '/' },
        { name: 'Categories', path: '/categories' },
      ];
    }
    return [];
  })();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const config = getSeoConfig(location.pathname);
    const origin = window.location.origin;
    const canonicalUrl = `${origin}${location.pathname}${location.search}`;
    const imageUrl = new URL(config.image ?? '/favicon.png', origin).toString();

    document.title = config.title;

    upsertMeta('meta[name="description"]', {
      name: 'description',
      content: config.description,
    });

    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: config.noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:large',
    });

    upsertMeta('meta[property="og:title"]', {
      property: 'og:title',
      content: config.title,
    });
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: config.description,
    });
    upsertMeta('meta[property="og:type"]', {
      property: 'og:type',
      content: 'website',
    });
    upsertMeta('meta[property="og:url"]', {
      property: 'og:url',
      content: canonicalUrl,
    });
    upsertMeta('meta[property="og:site_name"]', {
      property: 'og:site_name',
      content: APP_NAME,
    });
    upsertMeta('meta[property="og:image"]', {
      property: 'og:image',
      content: imageUrl,
    });
    upsertMeta('meta[property="og:image:alt"]', {
      property: 'og:image:alt',
      content: '7K Music logo',
    });

    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: 'twitter:title',
      content: config.title,
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: config.description,
    });
    upsertMeta('meta[name="twitter:image"]', {
      name: 'twitter:image',
      content: imageUrl,
    });
    upsertMeta('meta[name="twitter:image:alt"]', {
      name: 'twitter:image:alt',
      content: '7K Music logo',
    });

    upsertLink('canonical', canonicalUrl);
    upsertLink('icon', '/favicon.png', { type: 'image/png' });
    upsertLink('apple-touch-icon', '/favicon.png');

    upsertJsonLd('seo-website-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: APP_NAME,
      url: origin,
      description: config.description,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${origin}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    });

    if (location.pathname === '/') {
      upsertJsonLd('seo-app-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: APP_NAME,
        applicationCategory: 'MusicApplication',
        operatingSystem: 'Web, Android',
        description: config.description,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        url: origin,
      });

      upsertJsonLd('seo-org-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: APP_NAME,
        url: origin,
        logo: imageUrl,
      });
    } else {
      document.getElementById('seo-app-jsonld')?.remove();
      document.getElementById('seo-org-jsonld')?.remove();
    }

    if (isDownloadsPage) {
      upsertJsonLd('seo-faq-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Which APK should I install?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Install the recommended APK shown on the Downloads page. Most modern Android phones use arm64-v8a.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is 7K Music free to download?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. 7K Music APK downloads from the official Downloads page are free.',
            },
          },
          {
            '@type': 'Question',
            name: 'Why does Android block APK installation?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Android may require permission to install unknown apps. Enable that permission for your browser or file manager, then install again.',
            },
          },
          {
            '@type': 'Question',
            name: 'What if the app does not install?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Check architecture compatibility, available storage, and Android version. If needed, download another ABI build.',
            },
          },
        ],
      });
    } else {
      document.getElementById('seo-faq-jsonld')?.remove();
    }

    if (breadcrumbItems.length > 0) {
      upsertJsonLd('seo-breadcrumb-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `${origin}${item.path}`,
        })),
      });
    } else {
      document.getElementById('seo-breadcrumb-jsonld')?.remove();
    }
  }, [location.pathname, location.search]);

  return null;
}