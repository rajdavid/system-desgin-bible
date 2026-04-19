// Central registry of all system design questions.
// To add a new question:
// 1. Create src/questions/<slug>/index.jsx exporting a default component.
// 2. Add an entry below.

export const questions = [
  {
    slug: 'url-shortener',
    number: 1,
    title: 'Design a URL Shortener',
    subtitle: 'TinyURL / Bit.ly',
    difficulty: 'Easy',
    frequency: 'Very High',
    tags: ['Hashing', 'DB Design', 'Caching', 'Key Generation', 'Sharding'],
    companies: ['Google', 'Amazon', 'Meta', 'Uber'],
    summary:
      'Generate short unique aliases for long URLs. Handles 500M new URLs/month with a 100:1 read:write ratio — roughly 200K redirects per second. Classic problem for reasoning about caching layers, connection pooling, key generation services, and consensus coordination.',
    status: 'available',
  },
  {
    slug: 'design-twitter',
    number: 2,
    title: 'Design Twitter',
    subtitle: 'Home timeline at scale',
    difficulty: 'Hard',
    frequency: 'Very High',
    tags: ['Feed', 'Fanout', 'Timeline', 'Celebrity Problem'],
    companies: ['Meta', 'Twitter', 'LinkedIn'],
    summary:
      'Build a home-timeline service that handles billions of fanouts efficiently. Covers push vs pull models, celebrity problem, and hybrid strategies.',
    status: 'coming-soon',
  },
  {
    slug: 'design-whatsapp',
    number: 3,
    title: 'Design WhatsApp',
    subtitle: 'Real-time messaging',
    difficulty: 'Hard',
    frequency: 'High',
    tags: ['Websockets', 'Presence', 'E2E Encryption'],
    companies: ['Meta', 'Snap', 'Discord'],
    summary:
      'Design a real-time messaging system with presence, delivery receipts, and end-to-end encryption. Dives into long-lived connections and message ordering.',
    status: 'coming-soon',
  },
  {
    slug: 'design-netflix',
    number: 4,
    title: 'Design Netflix',
    subtitle: 'Video streaming at scale',
    difficulty: 'Hard',
    frequency: 'High',
    tags: ['CDN', 'Transcoding', 'Adaptive Bitrate'],
    companies: ['Netflix', 'YouTube', 'Hulu'],
    summary:
      'Design a global video streaming platform with CDNs, transcoding pipelines, and adaptive bitrate streaming for varying network conditions.',
    status: 'coming-soon',
  },
  {
    slug: 'design-uber',
    number: 5,
    title: 'Design Uber',
    subtitle: 'Ride matching',
    difficulty: 'Hard',
    frequency: 'Very High',
    tags: ['Geospatial', 'Matching', 'Real-time'],
    companies: ['Uber', 'Lyft', 'DoorDash'],
    summary:
      'Build the rider-driver matching core — geospatial indexing (quadtrees, geohashes), dispatch algorithms, and real-time location updates.',
    status: 'coming-soon',
  },
  {
    slug: 'design-rate-limiter',
    number: 6,
    title: 'Design a Rate Limiter',
    subtitle: 'API throttling',
    difficulty: 'Medium',
    frequency: 'Very High',
    tags: ['Algorithms', 'Distributed', 'Redis'],
    companies: ['Stripe', 'Cloudflare', 'Google'],
    summary:
      'Compare token bucket, leaky bucket, sliding window algorithms. Build a distributed rate limiter with Redis that works across regions.',
    status: 'coming-soon',
  },
];

export const getQuestion = (slug) => questions.find((q) => q.slug === slug);
