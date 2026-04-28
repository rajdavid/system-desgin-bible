// Auto-generated from system_design_bible.html — 265 questions
// Buckets: 1=Product Design, 2=Infrastructure, 3=AI/ML & GenAI, 4=AI Interview Gotcha

export const BUCKETS = [
  { id: 1, label: 'Product Design', count: 55 },
  { id: 2, label: 'Infrastructure', count: 35 },
  { id: 3, label: 'AI/ML & GenAI', count: 100 },
  { id: 4, label: 'AI Interview Gotcha', count: 75 },
];

export const questions = [
  {
    "number": 1,
    "slug": "url-shortener",
    "title": "Design a URL Shortener (TinyURL / Bit.ly)",
    "difficulty": "Easy",
    "frequency": "Very High",
    "tags": [
      "Hashing",
      "DB Design",
      "Caching",
      "Key Generation",
      "Sharding"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Meta",
      "Uber"
    ],
    "answer": "### Requirements\n\nGenerate short unique alias for long URLs. Redirect short URL to original. Track analytics. Scale: 500M new URLs/month, 100:1 read:write ratio = ~200K redirects/sec.\n\n### Key Design Decisions\n\n**Key generation**: (1) Hash-based — MD5/SHA256 of URL, take first 7 chars (Base62). Handle collisions by appending/re-hashing. (2) Pre-generated Key Service (KGS) — generate unique keys in advance, hand them out. KGS is preferred because it avoids collision entirely.\n\n**Storage**: Simple KV mapping `shortKey -> {longURL, created, userId, expiry}`. NoSQL (DynamoDB/Cassandra) for horizontal scale. ~500 bytes/record x 500M/month = 250GB/month.\n\n**Read path**: Client -> LB -> App Server -> Redis Cache -> DB. Cache top 20% of URLs. Return 301 (permanent redirect, browser caches, lose analytics) or 302 (temporary, track every click).\n\n**Write path**: Client -> LB -> App Server -> KGS (get key) -> DB. For idempotency: hash index on longURL column to return existing short URL if same long URL submitted again.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/bitly",
        "label": "HelloInterview — Design TinyURL"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-url-shortener",
        "label": "ByteByteGo — URL Shortener (Alex Xu Ch.)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-a-url-shortening-service-like-tinyurl",
        "label": "Grokking — URL Shortener"
      }
    ],
    "diagramTitle": "URL Shortener — Architecture",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Client"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Load Balancer"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "App Servers"
      },
      {
        "id": "n3",
        "type": "cache",
        "label": "Redis Cache",
        "subtitle": "hot URLs"
      },
      {
        "id": "n4",
        "type": "database",
        "label": "DynamoDB"
      },
      {
        "id": "n5",
        "type": "service",
        "label": "Key Gen Service"
      },
      {
        "id": "n6",
        "type": "database",
        "label": "Pre-generated Key Pool"
      },
      {
        "id": "n7",
        "type": "client",
        "label": "Click Events"
      },
      {
        "id": "n8",
        "type": "queue",
        "label": "Kafka"
      },
      {
        "id": "n9",
        "type": "database",
        "label": "BigQuery",
        "subtitle": "data warehouse"
      }
    ],
    "bucket": 1,
    "tier": 1,
    "status": "available",
    "subtitle": "TinyURL / Bit.ly",
    "summary": "Generate short unique aliases for long URLs. Handles 500M new URLs/month with a 100:1 read:write ratio — roughly 200K redirects per second. Classic problem for reasoning about caching layers, connection pooling, key generation services, and consensus coordination."
  },
  {
    "number": 2,
    "slug": "chat-system",
    "status": "available",
    "title": "Design a Chat System (WhatsApp / Messenger)",
    "difficulty": "Medium",
    "frequency": "Very High",
    "tags": [
      "WebSockets",
      "Message Queues",
      "Presence",
      "E2E Encryption"
    ],
    "companies": [
      "Meta",
      "Google",
      "Amazon",
      "Startups"
    ],
    "answer": "### Requirements\n1:1 and group messaging, presence (online/offline), delivery status (sent/delivered/read), media, E2E encryption. Scale: 500M DAU, 40B messages/day.\n\n### Architecture\n\n**Connection layer**: Each user maintains persistent WebSocket to a Chat Server. Connection Manager (Redis) tracks `userId -> serverId`.\n\n**1:1 flow**: User A sends msg -> Chat Server A -> Message Service -> lookup B's server in Connection Manager -> route to Chat Server B -> deliver via WebSocket. If B offline, store in Offline Queue + send push notification (APNS/FCM).\n\n**Group flow**: Small groups (&lt;500): fan-out on write, copy to each member's inbox. Large groups/channels: fan-out on read, store once, members fetch on demand.\n\n**Storage**: Wide-column store (Cassandra/HBase) partitioned by `(chatId, timestamp)`. Efficient range queries for \"load last 50 messages.\" Media in S3 + CDN.\n\n**Presence**: Heartbeat every 5s. Miss 3 heartbeats = offline. Broadcast status changes via pub/sub to friends.\n\n**E2E Encryption**: Signal Protocol. Per-device key pairs. Server cannot read content.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/whatsapp",
        "label": "HelloInterview — Design WhatsApp"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-chat-system",
        "label": "ByteByteGo — Chat System (Alex Xu Ch.)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-facebook-messenger",
        "label": "Grokking — Facebook Messenger"
      }
    ],
    "diagramTitle": "Chat System — WhatsApp Architecture",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "User A"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Chat Server A"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Message Service"
      },
      {
        "id": "n3",
        "type": "queue",
        "label": "Kafka",
        "subtitle": "async"
      },
      {
        "id": "n4",
        "type": "cache",
        "label": "Connection Mgr",
        "subtitle": "userId→serverId"
      },
      {
        "id": "n5",
        "type": "service",
        "label": "Chat Server B"
      },
      {
        "id": "n6",
        "type": "client",
        "label": "User B"
      },
      {
        "id": "n7",
        "type": "queue",
        "label": "Offline Queue"
      },
      {
        "id": "n8",
        "type": "warning",
        "label": "Push Notification",
        "subtitle": "APNS / FCM"
      },
      {
        "id": "n9",
        "type": "database",
        "label": "Cassandra",
        "subtitle": "partitioned by chatId+timestamp"
      }
    ],
    "bucket": 1,
    "tier": 1
  },
  {
    "number": 3,
    "slug": "news-feed",
    "title": "Design a News Feed / Timeline (Twitter / Instagram)",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "Fan-out",
      "Ranking",
      "Celebrity Problem"
    ],
    "companies": [
      "Meta",
      "Google",
      "Twitter/X",
      "LinkedIn"
    ],
    "answer": "### The Core Problem: Fan-out\n\n**Fan-out on write (push)**: On post, push to all followers' feed caches. Pro: instant reads. Con: 100M writes for celebrity post (write amplification).\n\n**Fan-out on read (pull)**: On feed open, query all followed users, merge, rank. Pro: simple writes. Con: slow reads.\n\n**Hybrid (real-world)**: Push for regular users, pull for celebrities (&gt;10K followers). Merge pre-computed feed with dynamically fetched celebrity posts.\n\n### Feed Ranking\n\nML model scores candidates using: affinity (interaction frequency with poster), content type, recency, engagement velocity, negative signals (hide/report). Not chronological.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/fb-news-feed",
        "label": "HelloInterview — Design News Feed"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-news-feed-system",
        "label": "ByteByteGo — News Feed (Alex Xu Ch.)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-twitter",
        "label": "Grokking — Design Twitter"
      }
    ],
    "diagramTitle": "News Feed — Hybrid Fan-out",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "User A posts"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Post Service"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Fan-out Service",
        "subtitle": "regular users"
      },
      {
        "id": "n3",
        "type": "cache",
        "label": "Feed Cache",
        "subtitle": "Redis sorted set"
      },
      {
        "id": "n4",
        "type": "client",
        "label": "User B opens"
      },
      {
        "id": "n5",
        "type": "service",
        "label": "Feed Service"
      },
      {
        "id": "n6",
        "type": "cache",
        "label": "Pre-built",
        "subtitle": "cache"
      },
      {
        "id": "n7",
        "type": "warning",
        "label": "Celebrity",
        "subtitle": "pull"
      },
      {
        "id": "n8",
        "type": "service",
        "label": "Ads"
      },
      {
        "id": "n9",
        "type": "decision",
        "label": "Ranking Service",
        "subtitle": "ML model"
      }
    ],
    "bucket": 1,
    "tier": null,
    "status": "available"
  },
  {
    "number": 4,
    "slug": "youtube",
    "title": "Design YouTube / Video Streaming Platform",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "CDN",
      "Transcoding",
      "Adaptive Bitrate",
      "Object Storage"
    ],
    "companies": [
      "Google",
      "Netflix",
      "Amazon",
      "Meta"
    ],
    "answer": "**Upload**: User uploads -> API stores metadata in DB -> raw video to S3 -> triggers async transcoding (Kafka/SQS) -> Workers convert to multiple resolutions (360p/720p/1080p/4K) + codecs (H.264/VP9/AV1) -> segments to S3 -> CDN caches -> video marked ready.\n\n**Transcoding**: Split into 2-10s chunks, transcode in parallel (embarrassingly parallel). DAG pipeline: Split -> Encode Video + Audio + Thumbnails -> Assemble.\n\n**Streaming (HLS/DASH)**: Client requests manifest (.m3u8) listing qualities. Adaptive Bitrate Streaming (ABR) monitors bandwidth, switches quality mid-stream. Segments from nearest CDN edge.\n\n**CDN**: Multi-tier: Edge -> Regional -> Origin (S3). Hot content at edge, long-tail at origin. Netflix pushes popular content to ISP-embedded servers (Open Connect).",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/youtube",
        "label": "HelloInterview — Design YouTube"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-youtube",
        "label": "ByteByteGo — YouTube (Alex Xu Ch.)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-youtube-or-netflix",
        "label": "Grokking — YouTube / Netflix"
      }
    ],
    "diagramTitle": "YouTube — Video Platform",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "User"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Upload API"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "S3",
        "subtitle": "raw"
      },
      {
        "id": "n3",
        "type": "queue",
        "label": "Queue"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Transcode",
        "subtitle": "FFmpeg parallel"
      },
      {
        "id": "n5",
        "type": "database",
        "label": "S3",
        "subtitle": "segments"
      },
      {
        "id": "n6",
        "type": "client",
        "label": "Viewer"
      },
      {
        "id": "n7",
        "type": "service",
        "label": "DNS"
      },
      {
        "id": "n8",
        "type": "success",
        "label": "CDN Edge"
      },
      {
        "id": "n9",
        "type": "service",
        "label": "CDN Regional"
      },
      {
        "id": "n10",
        "type": "database",
        "label": "S3 Origin"
      }
    ],
    "bucket": 1,
    "tier": null,
    "status": "available"
  },
  {
    "number": 5,
    "slug": "design-uber-ride-sharing-service",
    "title": "Design Uber / Ride-Sharing Service",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "Geospatial",
      "Real-time Matching",
      "WebSockets",
      "ETA/Routing"
    ],
    "companies": [
      "Uber",
      "Lyft",
      "Google",
      "Amazon"
    ],
    "answer": "**Location Service**: Drivers send GPS every 3-4s via WebSocket. Store in geospatial index (Geohashing/H3 hexagons). Redis GEO or specialized spatial DB.\n\n**Matching/Dispatch**: Rider requests -> query nearby drivers within radius -> rank by distance, ETA, rating, acceptance probability -> send offer to top driver -> if declined in 10s, cascade. Trip state machine: REQUESTED -> MATCHED -> EN_ROUTE -> ARRIVED -> IN_TRIP -> COMPLETED.\n\n**ETA**: Graph algorithms (Dijkstra/A*) on road network. Pre-compute with Contraction Hierarchies. Real-time traffic adjusts edge weights.\n\n**Surge Pricing**: Hexagonal zones. Track supply vs demand per zone per minute. Multiplier when ratio exceeds threshold.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/uber",
        "label": "HelloInterview — Design Uber"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/proximity-service",
        "label": "ByteByteGo — Proximity Service (Alex Xu Ch.)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-uber-backend",
        "label": "Grokking — Uber Backend"
      }
    ],
    "diagramTitle": "Uber — Ride Sharing",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Driver App"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Location Service"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "Geospatial Index",
        "subtitle": "Redis GEO / H3"
      },
      {
        "id": "n3",
        "type": "client",
        "label": "Rider App"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Ride Service"
      },
      {
        "id": "n5",
        "type": "decision",
        "label": "Dispatch / Match",
        "subtitle": "query nearby"
      },
      {
        "id": "n6",
        "type": "service",
        "label": "Trip Service",
        "subtitle": "state machine"
      },
      {
        "id": "n7",
        "type": "service",
        "label": "ETA Engine"
      },
      {
        "id": "n8",
        "type": "service",
        "label": "Payment"
      },
      {
        "id": "n9",
        "type": "service",
        "label": "Notification"
      }
    ],
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 6,
    "slug": "design-an-e-commerce-platform-amazon",
    "title": "Design an E-Commerce Platform (Amazon)",
    "difficulty": "Medium",
    "frequency": "Very High",
    "tags": [
      "Inventory",
      "Search",
      "Payment",
      "Saga Pattern"
    ],
    "companies": [
      "Amazon",
      "Flipkart",
      "Shopify",
      "Walmart"
    ],
    "answer": "**Product Catalog**: PostgreSQL for structured data. Elasticsearch for search with facets. Denormalize for reads.\n\n**Cart**: Redis (fast) with DB backup. Checkout: validate inventory -> calculate total -> create order -> payment -> decrement inventory -> confirm.\n\n**Inventory**: Prevent overselling with optimistic locking: `UPDATE SET qty=qty-1 WHERE id=X AND qty>0`. Flash sales: queue-based serialization per product.\n\n**Orders**: Saga pattern: Create Order -> Reserve Inventory -> Process Payment -> Confirm Shipping. Each step has compensating action for rollback.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/online-auction",
        "label": "HelloInterview — Design E-Commerce (Auction)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-system-design-interview-ii/doc/design-a-flash-sale-for-an-ecommerce-site",
        "label": "Grokking Vol 2 — Flash Sale / E-Commerce"
      },
      {
        "url": "https://www.designgurus.io/course-play/system-design-interview-crash-course/doc/6949ad757c4334fbab16895b",
        "label": "Grokking Crash — Amazon Shopping Cart"
      }
    ],
    "diagramTitle": "E-Commerce — Amazon",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Client"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "API Gateway"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Product",
        "subtitle": "Catalog + ES"
      },
      {
        "id": "n3",
        "type": "cache",
        "label": "Cart",
        "subtitle": "Redis + DB"
      },
      {
        "id": "n4",
        "type": "warning",
        "label": "Order Svc",
        "subtitle": "Saga"
      },
      {
        "id": "n5",
        "type": "service",
        "label": "Inventory"
      },
      {
        "id": "n6",
        "type": "success",
        "label": "Payment",
        "subtitle": "Stripe"
      },
      {
        "id": "n7",
        "type": "service",
        "label": "Shipping"
      },
      {
        "id": "n8",
        "type": "queue",
        "label": "Kafka",
        "subtitle": "all services publish/consume"
      }
    ],
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 7,
    "slug": "design-dropbox-google-drive",
    "title": "Design Dropbox / Google Drive",
    "difficulty": "Medium",
    "frequency": "Very High",
    "tags": [
      "Chunking",
      "Sync",
      "Deduplication",
      "Conflict Resolution"
    ],
    "companies": [
      "Google",
      "Dropbox",
      "Microsoft",
      "Apple"
    ],
    "answer": "**Chunking**: Split files into 4MB chunks, hash each (SHA-256). Only upload changed chunks = delta sync. Deduplication: same content hash = stored once.\n\n**Metadata**: Relational DB stores file tree, versions, permissions. Each file -> ordered list of chunk hashes.\n\n**Sync**: File watcher detects changes -> compute chunk diffs -> upload new chunks to S3 -> update metadata. Other clients pull via long-poll/WebSocket. Conflict: last-write-wins or \"conflicted copy.\"",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/dropbox",
        "label": "HelloInterview — Design Dropbox"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-google-drive",
        "label": "ByteByteGo — Google Drive (Alex Xu Ch.)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-dropbox",
        "label": "Grokking — Design Dropbox"
      }
    ],
    "diagramTitle": "Dropbox — File Sync",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "File Change"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Chunking Engine",
        "subtitle": "4MB + SHA256"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Delta Sync",
        "subtitle": "changed chunks only"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Block Service"
      },
      {
        "id": "n4",
        "type": "database",
        "label": "S3",
        "subtitle": "immutable chunks"
      },
      {
        "id": "n5",
        "type": "database",
        "label": "Metadata DB",
        "subtitle": "file tree + versions"
      },
      {
        "id": "n6",
        "type": "service",
        "label": "Sync Service",
        "subtitle": "WebSocket notify"
      }
    ],
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 8,
    "slug": "design-search-autocomplete-typeahead",
    "title": "Design Search Autocomplete / Typeahead",
    "difficulty": "Medium",
    "frequency": "Very High",
    "tags": [
      "Trie",
      "Caching",
      "Ranking",
      "Low Latency"
    ],
    "companies": [
      "Google",
      "Amazon",
      "LinkedIn",
      "Uber"
    ],
    "answer": "**Data Structure**: Trie where each node stores pre-computed top-K suggestions for that prefix. Not computed at query time.\n\n**Data Pipeline**: Query logs -> Kafka -> Aggregation (MapReduce hourly/daily) -> rebuild Trie weekly in batch.\n\n**Serving**: Trie sharded by prefix range. Each shard in-memory. Client sends prefix -> route to shard -> return pre-computed top-K. Cache popular prefixes at CDN/Redis.\n\n**Optimization**: Debounce requests (100-200ms). Browser caches recent prefixes locally.",
    "resources": [
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-search-autocomplete-system",
        "label": "ByteByteGo — Autocomplete (Alex Xu Ch.)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-typeahead-suggestion",
        "label": "Grokking — Typeahead Suggestion"
      },
      {
        "url": "https://www.designgurus.io/course-play/system-design-interview-crash-course/doc/6949af57c75bc82e6c4739d5",
        "label": "Grokking Crash — Typeahead"
      }
    ],
    "diagramTitle": "Typeahead — Search Autocomplete",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "User types"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "API Gateway"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Routing",
        "subtitle": "prefix→shard"
      },
      {
        "id": "n3",
        "type": "cache",
        "label": "Trie Shard",
        "subtitle": "in-memory"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Top 5 results"
      },
      {
        "id": "n5",
        "type": "database",
        "label": "Query Logs"
      },
      {
        "id": "n6",
        "type": "queue",
        "label": "Kafka"
      },
      {
        "id": "n7",
        "type": "service",
        "label": "Spark",
        "subtitle": "aggregate weekly"
      },
      {
        "id": "n8",
        "type": "warning",
        "label": "Updated Trie",
        "subtitle": "deploy to shards"
      }
    ],
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 9,
    "slug": "design-instagram-photo-sharing",
    "title": "Design Instagram / Photo Sharing",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "CDN",
      "Feed",
      "Object Storage"
    ],
    "companies": [
      "Meta",
      "Google",
      "Snap"
    ],
    "answer": "**Photo upload**: Client -> API -> S3 -> Image Workers (resize to thumb/medium/full) -> CDN. **Feed**: Same hybrid fan-out as Twitter Q3. **Stories**: Ephemeral (24h TTL) in Redis sorted set, expire automatically. **Storage**: 500M DAU, 2M photos/day, avg 500KB = 1TB/day raw.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/instagram",
        "label": "HelloInterview — Design Instagram"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-instagram",
        "label": "Grokking — Design Instagram"
      },
      {
        "url": "https://blog.bytebytego.com/p/how-instagram-scaled-its-infrastructure",
        "label": "ByteByteGo Blog — How Instagram Scaled"
      }
    ],
    "diagramTitle": "Instagram — Photo Sharing",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Upload"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "API"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "S3",
        "subtitle": "original"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Image Workers",
        "subtitle": "resize"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "CDN"
      },
      {
        "id": "n5",
        "type": "service",
        "label": "Feed Service"
      },
      {
        "id": "n6",
        "type": "cache",
        "label": "Cache",
        "subtitle": "pre-built"
      },
      {
        "id": "n7",
        "type": "warning",
        "label": "Celebrity pull"
      },
      {
        "id": "n8",
        "type": "decision",
        "label": "Ranking",
        "subtitle": "ML"
      }
    ],
    "bucket": 1,
    "tier": 2,
    "status": "coming-soon"
  },
  {
    "number": 10,
    "slug": "design-a-notification-system",
    "title": "Design a Notification System",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Push/Pull",
      "Priority Queue",
      "Multi-channel"
    ],
    "companies": [
      "Amazon",
      "Meta",
      "Uber",
      "Startups"
    ],
    "answer": "Channels: Push (APNS/FCM), Email (SES), SMS (Twilio), In-app (WebSocket). Flow: Source -> Kafka -> Notification Service (check preferences, dedup, rate limit) -> route to channel handler -> third-party delivery -> track status. Priority queues: Critical alerts bypass limits; marketing batched off-peak. Template system with i18n and A/B testing.",
    "resources": [
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-notification-system",
        "label": "ByteByteGo — Notification System (Alex Xu Ch.)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-system-design-interview-ii/doc/designing-a-notification-system",
        "label": "Grokking Vol 2 — Notification System"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/fb-live-comments",
        "label": "HelloInterview — FB Live Comments (related)"
      }
    ],
    "diagramTitle": "Notification System",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Source Services"
      },
      {
        "id": "n1",
        "type": "queue",
        "label": "Kafka",
        "subtitle": "events"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Notification Svc",
        "subtitle": "prefs + dedup + rate limit"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Push",
        "subtitle": "APNS/FCM"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Email",
        "subtitle": "SES"
      },
      {
        "id": "n5",
        "type": "service",
        "label": "SMS",
        "subtitle": "Twilio"
      },
      {
        "id": "n6",
        "type": "service",
        "label": "In-App",
        "subtitle": "WebSocket"
      }
    ],
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 11,
    "slug": "design-a-web-crawler-google-crawler",
    "title": "Design a Web Crawler (Google Crawler)",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "BFS/DFS",
      "Dedup (Bloom Filter)",
      "Politeness"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft"
    ],
    "answer": "**Frontier**: Distributed priority queue (Kafka) partitioned by domain for politeness (max 1 req/sec/domain). **Loop**: Pick URL -> DNS -> fetch (obey robots.txt) -> parse HTML -> extract links -> dedup (Bloom filter for URLs, SimHash for content) -> add new URLs to frontier -> store content. Scale: 1B pages/week = ~1600 pages/sec.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/web-crawler",
        "label": "HelloInterview — Design Web Crawler"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-web-crawler",
        "label": "ByteByteGo — Web Crawler (Alex Xu Ch.)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-a-web-crawler",
        "label": "Grokking — Web Crawler"
      }
    ],
    "diagramTitle": "Web Crawler",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "database",
        "label": "URL Frontier",
        "subtitle": "priority queue"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "DNS Resolve"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Fetch",
        "subtitle": "robots.txt"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Parse HTML"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Extract Links"
      },
      {
        "id": "n5",
        "type": "cache",
        "label": "Bloom Filter",
        "subtitle": "URL dedup"
      },
      {
        "id": "n6",
        "type": "warning",
        "label": "SimHash",
        "subtitle": "content dedup"
      },
      {
        "id": "n7",
        "type": "database",
        "label": "Frontier"
      }
    ],
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 12,
    "slug": "design-google-maps-location-service",
    "title": "Design Google Maps / Location Service",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Geohashing",
      "QuadTree",
      "Graph Algorithms"
    ],
    "companies": [
      "Google",
      "Uber",
      "Grab",
      "Yelp"
    ],
    "answer": "**Map tiles**: Pre-rendered at zoom levels 0-21, 256x256px PNGs in S3, served via CDN. **Search**: Geohash lat/lng, query POIs in cell + neighbors, rank by distance/rating. Elasticsearch with geo_point. **Navigation**: Road network as weighted graph. Dijkstra + A*. Contraction Hierarchies for long-distance. Real-time traffic from GPS traces adjusts edge weights.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/yelp",
        "label": "HelloInterview — Design Yelp / Proximity"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/google-maps",
        "label": "ByteByteGo — Google Maps (Alex Xu Ch.)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-yelp-or-nearby-friends",
        "label": "Grokking — Yelp / Nearby Friends"
      }
    ],
    "diagramTitle": "Google Maps",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Client"
      },
      {
        "id": "n1",
        "type": "success",
        "label": "CDN",
        "subtitle": "pre-rendered"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "S3",
        "subtitle": "256x256 PNGs"
      },
      {
        "id": "n3",
        "type": "client",
        "label": "Origin"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Road Graph",
        "subtitle": "Dijkstra/A*"
      },
      {
        "id": "n5",
        "type": "success",
        "label": "ETA",
        "subtitle": "traffic-adjusted"
      }
    ],
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 13,
    "slug": "design-ticket-booking-bookmyshow-ticketmaster",
    "title": "Design Ticket Booking (BookMyShow / Ticketmaster)",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Concurrency",
      "Distributed Locks",
      "Queue-based"
    ],
    "companies": [
      "Amazon",
      "Booking.com",
      "Square"
    ],
    "answer": "Core: prevent double-booking under extreme concurrency. Temporary seat reservation via Redis SETNX with 5-10min TTL. Payment confirms; TTL expiry releases seat. Virtual waiting room for extreme demand (Taylor Swift tickets). Queue users, release in batches. General admission uses atomic counter decrement; assigned seating uses per-seat locks.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/ticketmaster",
        "label": "HelloInterview — Design Ticketmaster"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/hotel-reservation",
        "label": "ByteByteGo — Hotel Reservation (related)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-ticketmaster",
        "label": "Grokking — Design Ticketmaster"
      }
    ],
    "diagramTitle": "Ticket Booking",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Users",
        "subtitle": "100K concurrent"
      },
      {
        "id": "n1",
        "type": "queue",
        "label": "Virtual Queue",
        "subtitle": "waiting room"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Seat Selection"
      },
      {
        "id": "n3",
        "type": "cache",
        "label": "Redis SETNX",
        "subtitle": "temp lock 5min"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Payment"
      },
      {
        "id": "n5",
        "type": "success",
        "label": "Confirm Booking"
      },
      {
        "id": "n6",
        "type": "warning",
        "label": "Release Seat",
        "subtitle": "back to pool"
      }
    ],
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 14,
    "slug": "design-a-recommendation-system",
    "title": "Design a Recommendation System",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Collaborative Filtering",
      "ML Pipeline",
      "Feature Store",
      "ANN Index"
    ],
    "companies": [
      "Netflix",
      "Amazon",
      "Spotify",
      "TikTok"
    ],
    "answer": "**3-stage funnel**: (1) Candidate Gen: ~1000 items via collaborative filtering (matrix factorization, embeddings) + content-based + popularity. ANN index (FAISS/ScaNN) for fast lookup. (2) Ranking: Deep NN scores candidates using rich features from Feature Store. (3) Re-ranking: business rules (diversity, freshness, ads). Cold start: new users get popularity fallback; new items get content-based only.",
    "resources": [
      {
        "url": "https://www.designgurus.io/course-play/grokking-system-design-interview-ii/doc/design-a-recommendation-system-for-netflix",
        "label": "Grokking Vol 2 — Netflix Recommendation"
      },
      {
        "url": "https://blog.bytebytego.com/p/how-video-recommendations-work-part",
        "label": "ByteByteGo Blog — How Video Recs Work"
      },
      {
        "url": "https://netflixtechblog.com/",
        "label": "Netflix Tech Blog — Rec Algorithms"
      }
    ],
    "diagramTitle": "Recommendation System — 3-Stage Funnel",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "User"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Candidate Gen",
        "subtitle": "~1000 items"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "Ranking",
        "subtitle": "ML model"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Re-ranking",
        "subtitle": "business rules"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Top 20"
      },
      {
        "id": "n5",
        "type": "database",
        "label": "Collaborative",
        "subtitle": "filter"
      },
      {
        "id": "n6",
        "type": "database",
        "label": "Content-based",
        "subtitle": "embeddings"
      },
      {
        "id": "n7",
        "type": "database",
        "label": "Popularity",
        "subtitle": "cold-start"
      },
      {
        "id": "n8",
        "type": "cache",
        "label": "Feature Store",
        "subtitle": "Redis"
      }
    ],
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 15,
    "slug": "design-google-docs-collaborative-editor",
    "title": "Design Google Docs / Collaborative Editor",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "OT / CRDT",
      "Real-time Sync",
      "Conflict Resolution"
    ],
    "companies": [
      "Google",
      "Microsoft",
      "Notion"
    ],
    "answer": "**OT (Operational Transforms)**: Google Docs approach. Each edit = operation (insert/delete at position). Concurrent ops transformed against each other by central server. **CRDT**: Newer (Figma). Each char has unique ID, ops commutative, no central sequencer needed. Architecture: Client -> WebSocket -> Document Session Server (1 per active doc) -> apply OT/CRDT -> broadcast to all clients -> periodic snapshot to DB/S3.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/google-docs",
        "label": "HelloInterview — Design Google Docs"
      },
      {
        "url": "https://blog.bytebytego.com/p/how-to-design-google-docs-episode",
        "label": "ByteByteGo Blog — Design Google Docs"
      },
      {
        "url": "https://www.designgurus.io/blog/design-real-time-editor",
        "label": "DesignGurus Blog — Real-time Editor (free)"
      }
    ],
    "diagramTitle": "Google Docs — Collaborative Editor",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Client A"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Doc Session Server",
        "subtitle": "1 per active doc"
      },
      {
        "id": "n2",
        "type": "client",
        "label": "Client B"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "OT / CRDT",
        "subtitle": "transform concurrent ops"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Broadcast",
        "subtitle": "to all clients"
      },
      {
        "id": "n5",
        "type": "database",
        "label": "Snapshot",
        "subtitle": "periodic save"
      }
    ],
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 16,
    "slug": "design-a-payment-system-stripe",
    "title": "Design a Payment System (Stripe)",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Idempotency",
      "Saga Pattern",
      "Ledger",
      "Exactly-once"
    ],
    "companies": [
      "Stripe",
      "PayPal",
      "Amazon",
      "Fintech"
    ],
    "answer": "**Idempotency**: Every request has idempotency key. Server checks \"processed before?\" If yes, return same result. **Double-entry ledger**: Every txn = debit one account + credit another. Sum must = 0. Append-only. **Flow**: Client -> Payment API (idempotency key) -> Validate -> Fraud Detection -> PSP (Stripe) -> Ledger -> Notify. **Reconciliation**: Nightly batch compares ledger vs PSP vs bank statements.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/payment-system",
        "label": "HelloInterview — Design Payment System"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/payment-system",
        "label": "ByteByteGo — Payment System (Alex Xu Ch.)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-system-design-interview-ii/doc/design-payment-system",
        "label": "Grokking Vol 2 — Payment System"
      }
    ],
    "diagramTitle": "Payment System",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Client"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Payment API",
        "subtitle": "+ idempotency key"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "Fraud Check",
        "subtitle": "ML"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "PSP",
        "subtitle": "Stripe"
      },
      {
        "id": "n4",
        "type": "database",
        "label": "Ledger",
        "subtitle": "double-entry"
      },
      {
        "id": "n5",
        "type": "warning",
        "label": "Reconciliation",
        "subtitle": "ledger vs PSP vs bank"
      }
    ],
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 17,
    "slug": "design-a-search-engine-google-search",
    "title": "Design a Search Engine (Google Search)",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Inverted Index",
      "PageRank",
      "Hybrid Search"
    ],
    "companies": [
      "Google",
      "Microsoft",
      "Amazon"
    ],
    "answer": "**Indexing**: Crawler -> Parser -> Tokenizer -> Inverted Index: `\"python\" -> [doc3, doc7, doc42]`. **Query**: Tokenize -> look up terms -> intersect posting lists -> rank. **Ranking**: BM25 (term relevance) + PageRank (authority) + freshness + CTR + semantic similarity (BERT embeddings). Modern: hybrid keyword + vector search with RRF merge. Index sharded across thousands of machines, broker merges and re-ranks.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/fb-post-search",
        "label": "HelloInterview — FB Post Search (related)"
      },
      {
        "url": "https://blog.bytebytego.com/p/ep104-how-do-search-engines-work",
        "label": "ByteByteGo Blog — How Search Engines Work"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-twitter-search",
        "label": "Grokking — Twitter Search"
      }
    ],
    "diagramTitle": "Search Engine",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Query"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Tokenize"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "Inverted Index",
        "subtitle": "BM25 sparse"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "Vector Index",
        "subtitle": "BERT dense"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "RRF Merge",
        "subtitle": "hybrid"
      },
      {
        "id": "n5",
        "type": "success",
        "label": "Top 10"
      }
    ],
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 18,
    "slug": "design-zoom-video-conferencing",
    "title": "Design Zoom / Video Conferencing",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "WebRTC",
      "SFU/MCU",
      "Simulcast"
    ],
    "companies": [
      "Google",
      "Microsoft",
      "Zoom"
    ],
    "answer": "1:1 = P2P WebRTC. Group = SFU (Selective Forwarding Unit) - no re-encoding, cheaper than MCU. Simulcast: each participant sends 3 quality layers, SFU forwards appropriate layer per receiver. Signaling via WebSocket for room mgmt, ICE candidates, SDP. Screen sharing = additional video stream optimized for high-res low-framerate.",
    "resources": [
      {
        "url": "https://www.designgurus.io/blog/design-video-conferencing-system",
        "label": "DesignGurus Blog — Video Conferencing (free)"
      },
      {
        "url": "https://blog.bytebytego.com/p/ep139-design-a-live-streaming-system",
        "label": "ByteByteGo Blog — Live Streaming System"
      },
      {
        "url": "https://webrtc.org/getting-started/overview",
        "label": "WebRTC Official Documentation"
      }
    ],
    "diagramTitle": "Video Conferencing — Zoom",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "User A"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "SFU",
        "subtitle": "Selective Forwarding"
      },
      {
        "id": "n2",
        "type": "client",
        "label": "User B"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Low"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Medium"
      },
      {
        "id": "n5",
        "type": "service",
        "label": "High"
      }
    ],
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 19,
    "slug": "design-pastebin-text-storage",
    "title": "Design Pastebin / Text Storage",
    "difficulty": "Easy",
    "frequency": "High",
    "tags": [
      "Key-Value",
      "Blob Storage",
      "TTL"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Junior",
      "roles"
    ],
    "answer": "Like URL shortener but value = multi-KB text blob. Store blobs in S3, metadata in relational DB. Same key generation as TinyURL. Add syntax highlighting, paste expiration via TTL, abuse prevention (rate limits, size limits).",
    "resources": [
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-pastebin",
        "label": "Grokking — Design Pastebin"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-url-shortener",
        "label": "ByteByteGo — URL Shortener (similar pattern)"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/bitly",
        "label": "HelloInterview — TinyURL (similar pattern)"
      }
    ],
    "diagramTitle": "Pastebin",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Client"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "API"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Key Gen"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "S3",
        "subtitle": "blob"
      },
      {
        "id": "n4",
        "type": "database",
        "label": "Metadata",
        "subtitle": "TTL + syntax"
      }
    ],
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 20,
    "slug": "design-doordash-food-delivery",
    "title": "Design DoorDash / Food Delivery",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "3-sided Marketplace",
      "Real-time Tracking",
      "Order State Machine"
    ],
    "companies": [
      "DoorDash",
      "Uber",
      "Eats",
      "Swiggy",
      "Zomato"
    ],
    "answer": "Three-sided: Customer, Restaurant, Driver. State machine: PLACED -> CONFIRMED -> PREPARING -> READY -> PICKED_UP -> EN_ROUTE -> DELIVERED. Dispatch factors in restaurant prep time + driver location + order batching (2 pickups nearby). ETA = prep time + travel. Real-time tracking via WebSocket, driver location every 4s.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/gopuff",
        "label": "HelloInterview — Design Gopuff (Local Delivery)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-uber-backend",
        "label": "Grokking — Uber Backend (similar 3-sided)"
      },
      {
        "url": "https://doordash.engineering/",
        "label": "DoorDash Engineering Blog"
      }
    ],
    "diagramTitle": "Food Delivery — DoorDash",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Customer"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Order Svc",
        "subtitle": "state machine"
      },
      {
        "id": "n2",
        "type": "client",
        "label": "Restaurant"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Dispatch",
        "subtitle": "match driver"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Driver",
        "subtitle": "GPS 4s updates"
      },
      {
        "id": "n5",
        "type": "client",
        "label": "Live Map"
      }
    ],
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 21,
    "slug": "design-discord-large-scale-chat",
    "title": "Design Discord / Large-scale Chat",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Hierarchical Fan-out",
      "WebSocket Scale"
    ],
    "companies": [
      "Discord",
      "Slack",
      "Meta"
    ],
    "answer": "100K+ members in one channel. Naive fan-out = O(N) per message. Solution: hierarchical relay tree, only push to active/visible members. Voice = SFU (like Zoom). Lazy scrollback. Discord uses ScyllaDB (Cassandra-compatible) for message storage.",
    "resources": [
      {
        "url": "https://www.designgurus.io/course-play/system-design-interview-crash-course/doc/design-discord",
        "label": "Grokking Crash — Design Discord"
      },
      {
        "url": "https://blog.bytebytego.com/p/how-discord-stores-trillions-of-messages",
        "label": "ByteByteGo Blog — Discord Stores Trillions"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/whatsapp",
        "label": "HelloInterview — WhatsApp (chat patterns)"
      }
    ],
    "diagramTitle": "Discord — Large-scale Chat",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Users",
        "subtitle": "100K+ channel"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Relay Tree",
        "subtitle": "hierarchical fan-out"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "ScyllaDB",
        "subtitle": "messages"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Voice SFU"
      }
    ],
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 22,
    "slug": "design-twitch-live-streaming",
    "title": "Design Twitch / Live Streaming",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "RTMP Ingest",
      "Low-latency HLS",
      "Live Chat Scale"
    ],
    "companies": [
      "Amazon(Twitch)",
      "Google",
      "TikTok"
    ],
    "answer": "Ingest: RTMP to nearest server -> real-time transcode to HLS/DASH segments -> CDN. Low latency (2-5s): shorter segments + chunked transfer. Ultra-low (&lt;1s): WebRTC. Live chat with 1M viewers: probabilistic delivery, sample messages, ML + human moderation.",
    "resources": [
      {
        "url": "https://www.designgurus.io/course-play/system-design-interview-crash-course/doc/6949ae459e786057b2628ef0",
        "label": "Grokking Crash — Live Streaming / Twitch"
      },
      {
        "url": "https://blog.bytebytego.com/p/ep139-design-a-live-streaming-system",
        "label": "ByteByteGo Blog — Live Streaming System"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/fb-live-comments",
        "label": "HelloInterview — FB Live Comments"
      }
    ],
    "diagramTitle": "Live Streaming — Twitch",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Streamer"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Ingest"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Transcode",
        "subtitle": "real-time"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "CDN",
        "subtitle": "HLS/DASH"
      },
      {
        "id": "n4",
        "type": "client",
        "label": "Viewers"
      }
    ],
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 23,
    "slug": "design-airbnb-hotel-booking",
    "title": "Design Airbnb / Hotel Booking",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "Calendar Availability",
      "Double-booking Prevention"
    ],
    "companies": [
      "Airbnb",
      "Booking.com"
    ],
    "answer": "Availability calendars per listing. Elasticsearch for geo+filter search, cross-check availability. Optimistic locking prevents double-booking.",
    "resources": [
      {
        "url": "https://www.designgurus.io/course-play/system-design-interview-crash-course/doc/6945ac95716135e82b1744d4",
        "label": "Grokking Crash — Design Airbnb"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/hotel-reservation",
        "label": "ByteByteGo — Hotel Reservation (Alex Xu Ch.)"
      },
      {
        "url": "https://medium.com/airbnb-engineering",
        "label": "Airbnb Engineering Blog"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": 3,
    "status": "coming-soon"
  },
  {
    "number": 24,
    "slug": "design-spotify-music-streaming",
    "title": "Design Spotify / Music Streaming",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "Audio Streaming",
      "Offline Mode"
    ],
    "companies": [
      "Spotify",
      "Apple",
      "Amazon"
    ],
    "answer": "Audio in S3 at multiple bitrates. CDN delivery. Pre-buffer next song. Offline: encrypted download + cached DRM key. Search via Elasticsearch. Collaborative playlists use CRDT-like merge.",
    "resources": [
      {
        "url": "https://blog.bytebytego.com/p/how-spotify-built-its-data-platform",
        "label": "ByteByteGo Blog — Spotify Data Platform"
      },
      {
        "url": "https://engineering.atspotify.com/",
        "label": "Spotify Engineering Blog"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-youtube-or-netflix",
        "label": "Grokking — YouTube/Netflix (streaming patterns)"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": 3,
    "status": "coming-soon"
  },
  {
    "number": 25,
    "slug": "design-tiktok-short-video-platform",
    "title": "Design TikTok / Short-Video Platform",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "Recommendation-first",
      "Content Moderation"
    ],
    "companies": [
      "TikTok",
      "Meta(Reels)",
      "Google(Shorts)"
    ],
    "answer": "FYP is 100% algorithmic (no social graph needed). New content seeded to small test audience; engagement determines broader distribution. Fast transcoding for 15s-3min clips. Duet/Stitch = server-side video composition. Critical content moderation pipeline.",
    "resources": [
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-youtube",
        "label": "ByteByteGo — YouTube (short-video patterns)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-system-design-interview-ii/doc/design-a-recommendation-system-for-netflix",
        "label": "Grokking — Recommendation System (core of TikTok)"
      },
      {
        "url": "https://newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you",
        "label": "TikTok — How Recommendations Work"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 26,
    "slug": "design-google-calendar",
    "title": "Design Google Calendar",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "Recurring Events (RRULE)",
      "Timezone"
    ],
    "companies": [
      "Google",
      "Microsoft",
      "Apple"
    ],
    "answer": "RRULE format for recurring events - compute instances on-the-fly, don't materialize. Store UTC + timezone ID. Free/busy lookup queries all attendees. Invitation fan-out with accept/decline sync.",
    "resources": [
      {
        "url": "https://www.designgurus.io/course-play/grokking-system-design-interview-ii/doc/design-google-calendar",
        "label": "Grokking Vol 2 — Google Calendar"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-notification-system",
        "label": "ByteByteGo — Notification System (invites pattern)"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/google-docs",
        "label": "HelloInterview — Google Docs (collab patterns)"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 27,
    "slug": "design-online-code-editor-leetcode-replit",
    "title": "Design Online Code Editor (LeetCode / Replit)",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "Sandboxed Execution",
      "Container Orchestration"
    ],
    "companies": [
      "Google",
      "Microsoft",
      "Startups"
    ],
    "answer": "Isolated containers (Docker/gVisor/Firecracker) per execution. Pre-warmed for fast start. Resource limits via cgroups. Network disabled. Queue -> execute -> capture stdout/stderr -> return. Collaboration via OT/CRDT.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/job-scheduler",
        "label": "HelloInterview — Design Job Scheduler"
      },
      {
        "url": "https://www.designgurus.io/course-play/system-design-interview-crash-course/doc/6943aba2eb7a4d6fa49c42e8",
        "label": "Grokking Crash — Code Editor"
      },
      {
        "url": "https://blog.replit.com/",
        "label": "Replit Engineering Blog"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 28,
    "slug": "design-linkedin-connections-social-graph",
    "title": "Design LinkedIn Connections / Social Graph",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "Graph DB",
      "BFS",
      "Degree of Connection"
    ],
    "companies": [
      "LinkedIn",
      "Meta",
      "Twitter/X"
    ],
    "answer": "Graph DB or Cassandra adjacency list. \"People you may know\" = 2-hop BFS, rank by mutual connections. \"Degrees of separation\" = bidirectional BFS. Pre-compute 2nd-degree connections offline for LinkedIn's scale.",
    "resources": [
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-facebooks-newsfeed",
        "label": "Grokking — Facebook Newsfeed (graph patterns)"
      },
      {
        "url": "https://engineering.linkedin.com/",
        "label": "LinkedIn Engineering Blog"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/fb-news-feed",
        "label": "HelloInterview — FB News Feed (social graph)"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 29,
    "slug": "design-stock-exchange-trading-platform",
    "title": "Design Stock Exchange / Trading Platform",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "Order Matching",
      "Low Latency",
      "Event Sourcing"
    ],
    "companies": [
      "Bloomberg",
      "Citadel",
      "Robinhood"
    ],
    "answer": "Order book per stock (buy desc, sell asc). Single-threaded per stock. Event sourcing: every order/trade immutable. Market data broadcast via UDP multicast. Risk engine validates before matching.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/robinhood",
        "label": "HelloInterview — Design Robinhood"
      },
      {
        "url": "https://www.designgurus.io/course-play/system-design-interview-crash-course/doc/6949abf9d5c46f6c243b8b1d",
        "label": "Grokking Crash — Financial Systems"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-unique-id-generator-in-distributed-systems",
        "label": "ByteByteGo — Unique ID (ordering patterns)"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 30,
    "slug": "design-metrics-analytics-platform",
    "title": "Design Metrics / Analytics Platform",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "Time-series DB",
      "Stream Processing",
      "Aggregation"
    ],
    "companies": [
      "Datadog",
      "Grafana",
      "Netflix",
      "Uber"
    ],
    "answer": "Millions of data points/sec. Time-series DB (InfluxDB/Prometheus). Kafka -> Flink for real-time rollups (1min/5min/1hr). Alerting engine evaluates rules. Downsampling: raw 7d, 1min rollups 30d, 1hr rollups 1yr.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/metrics-monitoring",
        "label": "HelloInterview — Design Metrics Monitoring"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/top-k",
        "label": "HelloInterview — Top K (analytics patterns)"
      },
      {
        "url": "https://www.datadoghq.com/blog/engineering/",
        "label": "Datadog Engineering Blog"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 31,
    "slug": "design-a-parking-lot-system",
    "title": "Design a Parking Lot System",
    "difficulty": "Easy",
    "frequency": null,
    "tags": [
      "OOP Design",
      "State Machine"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Junior"
    ],
    "answer": "Classes: ParkingLot, Floor, Spot (Small/Med/Large), Vehicle, Ticket. State: AVAILABLE -> OCCUPIED -> RESERVED. Strategy pattern for pricing. Thread-safe operations.",
    "resources": [
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-uber-backend",
        "label": "Grokking — Uber Backend (OOP patterns)"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-key-value-store",
        "label": "ByteByteGo — KV Store (design patterns)"
      },
      {
        "url": "https://www.educative.io/courses/grokking-the-object-oriented-design-interview",
        "label": "Educative — Grokking OO Design Interview"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 32,
    "slug": "design-ai-chatbot-service-chatgpt-new-2025",
    "title": "Design AI Chatbot Service (ChatGPT) NEW 2025+",
    "difficulty": "Hard",
    "frequency": "Rising Fast",
    "tags": [
      "LLM Serving",
      "Streaming (SSE)",
      "RAG"
    ],
    "companies": [
      "OpenAI",
      "Google",
      "Anthropic",
      "Startups"
    ],
    "answer": "**Newest question type in 2025-2026.** GPU cluster with continuous batching for inference. Stream tokens via SSE. Conversation history management (summarize long convos to fit context window). RAG: query -> vector DB retrieval -> inject context -> generate grounded answer. Per-user token quotas. Priority queuing (paid > free).",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/ad-click-aggregator",
        "label": "HelloInterview — Ad Click Aggregator (LLM infra)"
      },
      {
        "url": "https://blog.bytebytego.com/p/how-to-design-google-docs-episode",
        "label": "ByteByteGo Blog — Streaming Architecture"
      },
      {
        "url": "https://www.educative.io/courses/grokking-modern-system-design-interview-for-engineers-managers",
        "label": "Educative — Grokking Modern System Design"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 33,
    "slug": "design-figma-real-time-whiteboard",
    "title": "Design Figma / Real-time Whiteboard",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "CRDT",
      "WebGL Canvas"
    ],
    "companies": [
      "Figma",
      "Miro",
      "Google"
    ],
    "answer": "2D canvas of objects with CRDT-based sync. Fractional indexing for layer ordering. WebGL rendering. Cursor awareness via ephemeral broadcast.",
    "resources": [
      {
        "url": "https://www.figma.com/blog/how-figmas-multiplayer-technology-works/",
        "label": "Figma Blog — Multiplayer Technology"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/google-docs",
        "label": "HelloInterview — Google Docs (CRDT patterns)"
      },
      {
        "url": "https://martin.kleppmann.com/2020/07/06/crdt-hard-parts-hydra.html",
        "label": "Martin Kleppmann — CRDTs: The Hard Parts"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 34,
    "slug": "design-reddit-qamp-a-forum",
    "title": "Design Reddit / Q&amp;A Forum",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "Voting",
      "Ranking Algorithms"
    ],
    "companies": [
      "Reddit",
      "Stack",
      "Overflow"
    ],
    "answer": "Comment threading (adjacency list or materialized path). Atomic vote counters with double-vote prevention. \"Hot\" ranking = f(score, age). Search via Elasticsearch.",
    "resources": [
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-twitter",
        "label": "Grokking — Design Twitter (voting/ranking)"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/fb-post-search",
        "label": "HelloInterview — FB Post Search (forum patterns)"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-news-feed-system",
        "label": "ByteByteGo — News Feed (ranking)"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 35,
    "slug": "design-digital-wallet-google-pay",
    "title": "Design Digital Wallet (Google Pay)",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "Ledger",
      "Tokenization"
    ],
    "companies": [
      "Google",
      "Apple",
      "Paytm",
      "Fintech"
    ],
    "answer": "Double-entry ledger. Tokenization for card storage. P2P = internal ledger transfer. Top-up/withdrawal via external payment rails. PCI-DSS compliance.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/payment-system",
        "label": "HelloInterview — Payment System (wallet/ledger)"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/payment-system",
        "label": "ByteByteGo — Payment System (Alex Xu Ch.)"
      },
      {
        "url": "https://stripe.com/blog/engineering",
        "label": "Stripe Engineering Blog"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 36,
    "slug": "design-ad-click-aggregator",
    "title": "Design Ad Click Aggregator",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "Stream Processing",
      "Exactly-once"
    ],
    "companies": [
      "Meta",
      "Google",
      "Amazon"
    ],
    "answer": "Lambda architecture: Flink for real-time + Spark for batch accuracy. Click dedup via event IDs. OLAP DB (ClickHouse/Druid). Fraud detection ML before aggregation.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/ad-click-aggregator",
        "label": "HelloInterview — Ad Click Aggregator"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/top-k",
        "label": "HelloInterview — Top K Problems"
      },
      {
        "url": "https://engineering.fb.com/",
        "label": "Meta Engineering Blog"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 37,
    "slug": "design-flight-booking-system",
    "title": "Design Flight Booking System",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "Multi-leg Booking",
      "Dynamic Pricing"
    ],
    "companies": [
      "Google",
      "Flights",
      "Expedia"
    ],
    "answer": "Pre-computed route graph. Dynamic pricing with short TTL cache. Multi-leg Saga pattern. GDS integration.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/ticketmaster",
        "label": "HelloInterview — Ticketmaster (booking patterns)"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/hotel-reservation",
        "label": "ByteByteGo — Hotel Reservation (Alex Xu Ch.)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-ticketmaster",
        "label": "Grokking — Ticketmaster"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 38,
    "slug": "design-gmail-email-system",
    "title": "Design Gmail / Email System",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "SMTP/IMAP",
      "Search Indexing",
      "Spam Filter"
    ],
    "companies": [
      "Google",
      "Microsoft",
      "Yahoo"
    ],
    "answer": "Send: SMTP -> DNS MX lookup -> relay. Receive: IMAP/POP3. Sharded mailbox storage. Attachments in blob. Per-user search index. ML spam classifier at ingress.",
    "resources": [
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-chat-system",
        "label": "ByteByteGo — Chat System (messaging patterns)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-facebook-messenger",
        "label": "Grokking — Messenger (email-adjacent)"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/whatsapp",
        "label": "HelloInterview — WhatsApp (messaging)"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 39,
    "slug": "design-content-moderation-system",
    "title": "Design Content Moderation System",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "ML Pipeline",
      "Human-in-loop"
    ],
    "companies": [
      "Meta",
      "TikTok",
      "Trust&amp;Safety"
    ],
    "answer": "Hash match against known-bad DB -> ML classifiers (toxicity, nudity, violence) -> high-confidence auto-remove, low-confidence queue for human review -> appeals flow -> feedback loop retrains models.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/fb-live-comments",
        "label": "HelloInterview — FB Live Comments (moderation)"
      },
      {
        "url": "https://engineering.fb.com/",
        "label": "Meta Engineering — Content Integrity"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-twitter",
        "label": "Grokking — Twitter (content pipeline)"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 40,
    "slug": "design-news-aggregator-google-news",
    "title": "Design News Aggregator (Google News)",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "NLP Clustering",
      "Personalization"
    ],
    "companies": [
      "Google",
      "Apple",
      "Startups"
    ],
    "answer": "Crawl/poll news sources. NLP: extract entities, cluster related articles by embedding similarity. Rank by recency + importance. Personalize from reading history.",
    "resources": [
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-news-feed-system",
        "label": "ByteByteGo — News Feed (aggregation)"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/fb-news-feed",
        "label": "HelloInterview — News Feed (aggregation)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-facebooks-newsfeed",
        "label": "Grokking — Facebook Newsfeed"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 41,
    "slug": "design-image-search-google-images",
    "title": "Design Image Search (Google Images)",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "Vector Embeddings",
      "Multi-modal ANN"
    ],
    "companies": [
      "Google",
      "Pinterest",
      "Amazon"
    ],
    "answer": "Index by surrounding text + visual embeddings (CNN/ViT). Upload image -> extract embedding -> ANN search. Text-to-image via cross-modal embeddings. FAISS/ScaNN index partitioned by category.",
    "resources": [
      {
        "url": "https://engineering.pinterest.com/",
        "label": "Pinterest Engineering — Visual Search"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/fb-post-search",
        "label": "HelloInterview — FB Post Search (search patterns)"
      },
      {
        "url": "https://blog.bytebytego.com/p/ep104-how-do-search-engines-work",
        "label": "ByteByteGo Blog — How Search Engines Work"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 42,
    "slug": "design-logging-log-aggregation",
    "title": "Design Logging / Log Aggregation",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "ELK Stack",
      "Write-heavy"
    ],
    "companies": [
      "Datadog",
      "Elastic",
      "Splunk"
    ],
    "answer": "Agents -> Kafka (buffer) -> Flink (process/enrich) -> Elasticsearch (search) + S3 (archive). Hot/warm/cold tiering. Alert on patterns. Retention policies.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/metrics-monitoring",
        "label": "HelloInterview — Metrics Monitoring (logging)"
      },
      {
        "url": "https://www.elastic.co/guide",
        "label": "Elastic Stack (ELK) Documentation"
      },
      {
        "url": "https://blog.bytebytego.com/p/ep208-load-balancer-vs-api-gateway",
        "label": "ByteByteGo Blog — Infra Architecture"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 43,
    "slug": "design-vending-machine",
    "title": "Design Vending Machine",
    "difficulty": "Easy",
    "frequency": null,
    "tags": [
      "State Machine",
      "OOP"
    ],
    "companies": [
      "Amazon",
      "Goldman",
      "Junior"
    ],
    "answer": "State pattern: IDLE -> COIN_INSERTED -> ITEM_SELECTED -> DISPENSING -> CHANGE_RETURNED. Handle insufficient funds, out of stock, exact change only.",
    "resources": [
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-uber-backend",
        "label": "Grokking — Uber (state machine patterns)"
      },
      {
        "url": "https://www.educative.io/courses/grokking-the-object-oriented-design-interview",
        "label": "Educative — Grokking OO Design"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-key-value-store",
        "label": "ByteByteGo — KV Store (OOP patterns)"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 44,
    "slug": "design-leaderboard-system",
    "title": "Design Leaderboard System",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "Redis Sorted Sets",
      "Real-time Ranking"
    ],
    "companies": [
      "Gaming",
      "Startups"
    ],
    "answer": "Redis Sorted Set: ZADD, ZREVRANK, ZREVRANGE. O(log N). Shard for millions of users. Time-windowed leaderboards via separate sorted sets with expiry.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/top-k",
        "label": "HelloInterview — Top K / Leaderboard"
      },
      {
        "url": "https://redis.io/docs/data-types/sorted-sets/",
        "label": "Redis — Sorted Sets Documentation"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-url-shortener",
        "label": "ByteByteGo — URL Shortener (KV patterns)"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 45,
    "slug": "design-review-amp-rating-system",
    "title": "Design Review &amp; Rating System",
    "difficulty": "Easy",
    "frequency": null,
    "tags": [
      "Aggregate Scoring",
      "Spam Detection"
    ],
    "companies": [
      "Amazon",
      "Yelp",
      "Google"
    ],
    "answer": "Pre-computed average rating. Wilson Score for fair ranking. ML fake-review detection. Helpful votes for secondary ranking.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/yelp",
        "label": "HelloInterview — Yelp (reviews/ratings)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-yelp-or-nearby-friends",
        "label": "Grokking — Yelp / Nearby"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/proximity-service",
        "label": "ByteByteGo — Proximity (review patterns)"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 46,
    "slug": "design-auction-system-ebay",
    "title": "Design Auction System (eBay)",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "Real-time Bidding",
      "Concurrency"
    ],
    "companies": [
      "eBay",
      "Amazon",
      "Startups"
    ],
    "answer": "Optimistic locking for bids. Real-time updates via WebSocket. Anti-sniping: extend auction on late bids. Reserve price.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/online-auction",
        "label": "HelloInterview — Online Auction (eBay)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-ticketmaster",
        "label": "Grokking — Ticketmaster (concurrency)"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/hotel-reservation",
        "label": "ByteByteGo — Hotel Reservation (locking)"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 47,
    "slug": "design-coupon-promo-system",
    "title": "Design Coupon / Promo System",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "Distributed Counters",
      "Rule Engine"
    ],
    "companies": [
      "Amazon",
      "Flipkart",
      "Startups"
    ],
    "answer": "Rules engine for eligibility. Redis atomic decrement for global limits. Virtual queue for flash sales. Track redemptions for fraud detection.",
    "resources": [
      {
        "url": "https://www.designgurus.io/course-play/grokking-system-design-interview-ii/doc/design-a-flash-sale-for-an-ecommerce-site",
        "label": "Grokking Vol 2 — Flash Sale (promo patterns)"
      },
      {
        "url": "https://www.designgurus.io/course-play/system-design-interview-crash-course/doc/6949ad757c4334fbab16895b",
        "label": "Grokking Crash — Amazon Cart"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-rate-limiter",
        "label": "ByteByteGo — Rate Limiter (counter patterns)"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 48,
    "slug": "design-subscription-amp-billing-platform",
    "title": "Design Subscription &amp; Billing Platform",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "Recurring Payments",
      "Proration"
    ],
    "companies": [
      "Stripe",
      "Chargebee",
      "SaaS"
    ],
    "answer": "Lifecycle: TRIAL -> ACTIVE -> PAST_DUE -> CANCELED. Retry logic for failed charges. Proration on plan changes. Usage metering for consumption-based billing.",
    "resources": [
      {
        "url": "https://stripe.com/docs/billing",
        "label": "Stripe — Billing Documentation"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/payment-system",
        "label": "ByteByteGo — Payment System (Alex Xu Ch.)"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/payment-system",
        "label": "HelloInterview — Payment System"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 49,
    "slug": "design-document-management-system",
    "title": "Design Document Management System",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "Versioning",
      "RBAC",
      "Full-text Search"
    ],
    "companies": [
      "Microsoft",
      "Google",
      "Startups"
    ],
    "answer": "Blob storage for docs, relational DB for metadata + permissions. Versioning (every save = new version). RBAC. Elasticsearch for content search. Audit trail.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/dropbox",
        "label": "HelloInterview — Dropbox (doc mgmt patterns)"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-google-drive",
        "label": "ByteByteGo — Google Drive (Alex Xu Ch.)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-dropbox",
        "label": "Grokking — Dropbox"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 50,
    "slug": "design-nearby-proximity-friends",
    "title": "Design Nearby / Proximity Friends",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "Geohash Pub/Sub",
      "Privacy Controls"
    ],
    "companies": [
      "Meta",
      "Snap",
      "Google"
    ],
    "answer": "Geohash location -> pub/sub by cell. When friend in nearby cell, appear on list. Fuzzy location based on privacy. TTL on location data.",
    "resources": [
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-yelp-or-nearby-friends",
        "label": "Grokking — Yelp / Nearby Friends"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/proximity-service",
        "label": "ByteByteGo — Proximity Service (Alex Xu Ch.)"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/yelp",
        "label": "HelloInterview — Yelp (proximity)"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 51,
    "slug": "design-cloud-storage-api-s3-like",
    "title": "Design Cloud Storage API (S3-like)",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "Object Storage",
      "Erasure Coding"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "answer": "PUT/GET/DELETE objects. Metadata service + data service. Erasure coding (Reed-Solomon) over 3x replication. Multipart upload. Pre-signed URLs. Versioning.",
    "resources": [
      {
        "url": "https://www.designgurus.io/course-play/system-design-interview-crash-course/doc/69444a9ce4092f77ed73eadf",
        "label": "Grokking Crash — Amazon S3"
      },
      {
        "url": "https://www.allthingsdistributed.com/",
        "label": "Werner Vogels Blog — S3 Architecture"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-key-value-store",
        "label": "ByteByteGo — KV Store (storage patterns)"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 52,
    "slug": "design-url-link-preview-generator",
    "title": "Design URL Link Preview Generator",
    "difficulty": "Easy",
    "frequency": null,
    "tags": [
      "Web Scraping",
      "OpenGraph"
    ],
    "companies": [
      "Slack",
      "LinkedIn",
      "Startups"
    ],
    "answer": "Fetch URL, parse OG meta tags, generate preview card. Cache aggressively. SSRF prevention (don't fetch private IPs). Queue-based for batch processing.",
    "resources": [
      {
        "url": "https://ogp.me/",
        "label": "Open Graph Protocol Specification"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/web-crawler",
        "label": "HelloInterview — Web Crawler (scraping)"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-web-crawler",
        "label": "ByteByteGo — Web Crawler"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 53,
    "slug": "design-poll-survey-system",
    "title": "Design Poll / Survey System",
    "difficulty": "Easy",
    "frequency": null,
    "tags": [
      "Atomic Counters",
      "Real-time Results"
    ],
    "companies": [
      "Startups",
      "Junior"
    ],
    "answer": "Redis atomic counters for votes. Record voter to prevent duplicates. WebSocket for real-time results. Anonymous vs identified modes.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/top-k",
        "label": "HelloInterview — Top K (counting patterns)"
      },
      {
        "url": "https://redis.io/docs/data-types/sorted-sets/",
        "label": "Redis — Sorted Sets Documentation"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-rate-limiter",
        "label": "ByteByteGo — Rate Limiter (counter patterns)"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 54,
    "slug": "design-social-media-stories-feature",
    "title": "Design Social Media Stories Feature",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "Ephemeral Content",
      "TTL"
    ],
    "companies": [
      "Meta",
      "Snap",
      "LinkedIn"
    ],
    "answer": "Redis sorted set with 24h TTL per user. Viewer tracking. Pre-load on app open. Archive option before expiry.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/instagram",
        "label": "HelloInterview — Instagram (stories)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-instagram",
        "label": "Grokking — Design Instagram"
      },
      {
        "url": "https://blog.bytebytego.com/p/how-instagram-scaled-its-infrastructure",
        "label": "ByteByteGo Blog — How Instagram Scaled"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 55,
    "slug": "design-duplicate-urlcontent-detector",
    "title": "Design Duplicate URL/Content Detector",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "Bloom Filter",
      "SimHash/MinHash"
    ],
    "companies": [
      "Google",
      "Microsoft"
    ],
    "answer": "URL dedup: Bloom filter. Content dedup: SimHash (LSH) with Hamming distance threshold. Exact dupes: SHA-256 of content.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/web-crawler",
        "label": "HelloInterview — Web Crawler (dedup)"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-web-crawler",
        "label": "ByteByteGo — Web Crawler (Alex Xu Ch.)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-a-web-crawler",
        "label": "Grokking — Web Crawler"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 1,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 1,
    "slug": "design-a-rate-limiter",
    "title": "Design a Rate Limiter",
    "difficulty": "Medium",
    "frequency": "Very High",
    "tags": [
      "Token Bucket",
      "Sliding Window",
      "Redis",
      "Distributed State"
    ],
    "companies": [
      "All",
      "FAANG",
      "Stripe",
      "Cloudflare"
    ],
    "answer": "### Algorithms\n\n**Token Bucket**: Bucket holds N tokens, refills at rate R/sec. Each request consumes 1 token. If empty, reject (429). Allows bursts up to bucket size. Most commonly used (AWS, Stripe).\n\n**Leaky Bucket**: Requests enter a queue (bucket) processed at fixed rate. Overflow rejected. Strict rate enforcement, no bursts. Good for smoothing traffic.\n\n**Fixed Window**: Count requests in fixed time windows (e.g., per minute). Simple but vulnerable to boundary spikes (59s + 1s = 2x limit). **Sliding Window Log**: Track timestamp of each request, count within rolling window. Accurate but memory-heavy. **Sliding Window Counter**: Weighted average of current + previous window. Best balance of accuracy and efficiency.\n\n### Distributed Rate Limiting\n\nMultiple app servers need shared state. Use Redis for centralized counters. `INCR key` + `EXPIRE` for fixed window. Lua scripts for atomic token bucket operations. Trade-off: Redis round-trip adds ~1ms latency. For extreme performance, use local counters with periodic sync (accept slight inaccuracy).\n\n**Rate limit by**: IP (for unauthenticated), user ID (authenticated), API key (B2B). Different limits per tier (free: 100/hr, pro: 10K/hr). Headers: `X-RateLimit-Remaining`, `X-RateLimit-Reset`.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/distributed-rate-limiter",
        "label": "HelloInterview — Distributed Rate Limiter"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-rate-limiter",
        "label": "ByteByteGo — Rate Limiter (Alex Xu Ch.)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-an-api-rate-limiter",
        "label": "Grokking — API Rate Limiter"
      }
    ],
    "diagramTitle": "Rate Limiter",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Client"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "API Gateway",
        "subtitle": "rate limiter middleware"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "Check Redis",
        "subtitle": "INCR + EXPIRE"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "Under limit",
        "subtitle": "→ Backend"
      },
      {
        "id": "n4",
        "type": "warning",
        "label": "Over limit",
        "subtitle": "429 Reject"
      },
      {
        "id": "n5",
        "type": "database",
        "label": "Redis Primary"
      },
      {
        "id": "n6",
        "type": "database",
        "label": "Redis Replica",
        "subtitle": "auto-failover"
      }
    ],
    "bucket": 2,
    "tier": 1,
    "status": "coming-soon"
  },
  {
    "number": 2,
    "slug": "design-a-distributed-cache-redis-memcached",
    "title": "Design a Distributed Cache (Redis / Memcached)",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "Consistent Hashing",
      "Eviction Policies",
      "Cache Patterns",
      "Replication"
    ],
    "companies": [
      "All",
      "FAANG",
      "Redis",
      "Labs"
    ],
    "answer": "### Cache Patterns\n\n**Cache-aside (Lazy Loading)**: App checks cache first. Miss? Query DB, write to cache, return. Most common. Stale data possible until TTL expires.\n\n**Write-through**: Every DB write also writes to cache. Always consistent but higher write latency. Good for read-heavy data that's written once.\n\n**Write-behind (Write-back)**: Write to cache immediately, async flush to DB. Fast writes but risk of data loss if cache crashes before flush.\n\n### Consistent Hashing\n\nDistribute keys across N cache nodes. When a node is added/removed, only K/N keys need to move (vs all keys with simple hash mod). Use virtual nodes (100+ per physical node) for even distribution. Jump consistent hash is a simpler alternative.\n\n### Eviction Policies\n\n**LRU** (Least Recently Used): most common, good general-purpose. **LFU** (Least Frequently Used): better for Zipfian access patterns. **TTL**: time-based expiration. Redis uses approximated LRU (samples 5 random keys, evicts least recent).\n\n**Replication**: Master-replica for reads. Async replication (fast but eventual consistency). Redis Sentinel for auto-failover. Redis Cluster for sharding + replication.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/distributed-cache",
        "label": "HelloInterview — Distributed Cache"
      },
      {
        "url": "https://blog.bytebytego.com/p/ep-38-where-do-we-cache-data",
        "label": "ByteByteGo Blog — Where Do We Cache Data"
      },
      {
        "url": "https://www.designgurus.io/course-play/system-design-interview-crash-course/doc/6949ac567c4334fbab1661c6",
        "label": "Grokking Crash — Distributed Cache (Redis)"
      }
    ],
    "diagramTitle": "Distributed Cache — Redis",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "App Server"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Cache Client",
        "subtitle": "consistent hashing"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "Node 1",
        "subtitle": "master"
      },
      {
        "id": "n3",
        "type": "cache",
        "label": "Replica 1a"
      },
      {
        "id": "n4",
        "type": "database",
        "label": "Node 2",
        "subtitle": "master"
      },
      {
        "id": "n5",
        "type": "cache",
        "label": "Replica 2a"
      },
      {
        "id": "n6",
        "type": "database",
        "label": "Node 3",
        "subtitle": "master"
      },
      {
        "id": "n7",
        "type": "cache",
        "label": "Replica 3a"
      },
      {
        "id": "n8",
        "type": "client",
        "label": "GET"
      },
      {
        "id": "n9",
        "type": "decision",
        "label": "HIT?"
      },
      {
        "id": "n10",
        "type": "success",
        "label": "Return"
      },
      {
        "id": "n11",
        "type": "database",
        "label": "Query DB"
      },
      {
        "id": "n12",
        "type": "service",
        "label": "SET EX 3600"
      },
      {
        "id": "n13",
        "type": "success",
        "label": "Return"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 3,
    "slug": "design-a-distributed-message-queue-kafka",
    "title": "Design a Distributed Message Queue (Kafka)",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "Pub/Sub",
      "Partitioning",
      "Consumer Groups",
      "At-least-once"
    ],
    "companies": [
      "All",
      "FAANG",
      "Confluent",
      "LinkedIn"
    ],
    "answer": "### Core Design\n\n**Topics and Partitions**: Messages organized into topics. Each topic split into partitions for parallelism. Messages within a partition are ordered (not across partitions). Key determines partition (hash(key) mod N).\n\n**Producer**: Publishes to a topic. Chooses partition by key or round-robin. Acknowledgment modes: acks=0 (fire-and-forget), acks=1 (leader confirms), acks=all (all replicas confirm = most durable).\n\n**Consumer Groups**: Each partition assigned to exactly one consumer in a group. Parallelism = number of partitions. Consumer tracks offset (position in partition). On crash, new consumer resumes from last committed offset.\n\n**Storage**: Append-only log on disk. Sequential I/O is fast (1GB/s on modern SSDs). Zero-copy transfer (sendfile syscall) for consumer reads. Retention: time-based (7 days) or size-based (1TB).\n\n**Replication**: Each partition has a leader + N replicas. Writes go to leader, replicated to followers. ISR (In-Sync Replicas) = followers that are caught up. Leader election from ISR on failure.\n\n### Delivery Guarantees\n\n**At-most-once**: Commit offset before processing. Fast but may lose messages. **At-least-once**: Process then commit. May get duplicates. **Exactly-once**: Idempotent producers + transactional consumers. Kafka supports this natively since 0.11.",
    "resources": [
      {
        "url": "https://bytebytego.com/courses/system-design-interview/distributed-message-queue",
        "label": "ByteByteGo — Message Queue (Alex Xu Ch.)"
      },
      {
        "url": "https://blog.bytebytego.com/p/why-do-we-need-a-message-queue",
        "label": "ByteByteGo Blog — Why Message Queues"
      },
      {
        "url": "https://kafka.apache.org/documentation/",
        "label": "Apache Kafka Official Documentation"
      }
    ],
    "diagramTitle": "Kafka — Distributed Message Queue",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "database",
        "label": "Partition 0",
        "subtitle": "msg1,2,5..."
      },
      {
        "id": "n1",
        "type": "cache",
        "label": "Follower"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Consumer A",
        "subtitle": "Group 1"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "Partition 1",
        "subtitle": "msg3,4,6..."
      },
      {
        "id": "n4",
        "type": "cache",
        "label": "Follower"
      },
      {
        "id": "n5",
        "type": "service",
        "label": "Consumer B",
        "subtitle": "Group 1"
      },
      {
        "id": "n6",
        "type": "database",
        "label": "Partition 2",
        "subtitle": "msg7,10..."
      },
      {
        "id": "n7",
        "type": "cache",
        "label": "Follower"
      },
      {
        "id": "n8",
        "type": "service",
        "label": "Consumer C",
        "subtitle": "Group 1"
      },
      {
        "id": "n9",
        "type": "client",
        "label": "Producers"
      },
      {
        "id": "n10",
        "type": "queue",
        "label": "Broker Cluster"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 4,
    "slug": "design-a-distributed-key-value-store-dynamodb",
    "title": "Design a Distributed Key-Value Store (DynamoDB)",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "CAP Theorem",
      "Consistent Hashing",
      "Quorum",
      "Vector Clocks"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "answer": "### Core Decisions\n\n**Partitioning**: Consistent hashing distributes keys across nodes. Virtual nodes for balance. Each key lives on N nodes (replication factor).\n\n**Consistency**: Quorum-based reads/writes. W + R > N guarantees strong consistency. Example: N=3, W=2, R=2. Eventual consistency: W=1, R=1 (fast but stale reads possible).\n\n**Conflict Resolution**: Last-Writer-Wins (LWW) using timestamps (simple but lossy) or Vector Clocks (track causal history, app resolves conflicts). Dynamo uses vector clocks; Cassandra uses LWW.\n\n**Failure Handling**: Gossip protocol for failure detection (each node pings random peers). Hinted handoff: if target node is down, neighbor temporarily holds writes, forwards when target recovers. Anti-entropy: Merkle trees compare data between replicas, sync differences.\n\n**Storage Engine**: LSM-tree (Log-Structured Merge). Writes to in-memory memtable -> flush to sorted SSTable on disk -> periodic compaction merges SSTables. Fast writes, read amplification mitigated by bloom filters.",
    "resources": [
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-key-value-store",
        "label": "ByteByteGo — Key-Value Store (Alex Xu Ch.)"
      },
      {
        "url": "https://www.designgurus.io/course-play/system-design-interview-crash-course/doc/6949ac6d12526d454709c9ac",
        "label": "Grokking Crash — KV Store (DynamoDB)"
      },
      {
        "url": "https://www.allthingsdistributed.com/2007/10/amazons_dynamo.html",
        "label": "Amazon Dynamo Paper (original)"
      }
    ],
    "diagramTitle": "Key-Value Store — DynamoDB",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Client"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Coordinator"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "Consistent Hash"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "Node B",
        "subtitle": "primary"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Node C",
        "subtitle": "replica"
      },
      {
        "id": "n5",
        "type": "service",
        "label": "Node D",
        "subtitle": "replica"
      },
      {
        "id": "n6",
        "type": "warning",
        "label": "Node C down"
      },
      {
        "id": "n7",
        "type": "queue",
        "label": "Hinted Handoff",
        "subtitle": "Node E holds"
      },
      {
        "id": "n8",
        "type": "service",
        "label": "Gossip",
        "subtitle": "detects"
      },
      {
        "id": "n9",
        "type": "success",
        "label": "C recovers"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 5,
    "slug": "design-a-unique-id-generator-snowflake",
    "title": "Design a Unique ID Generator (Snowflake)",
    "difficulty": "Easy",
    "frequency": "Very High",
    "tags": [
      "Distributed IDs",
      "Ordering",
      "Clock Sync"
    ],
    "companies": [
      "Twitter/X",
      "Amazon",
      "Google"
    ],
    "answer": "**Requirements**: 64-bit IDs, globally unique, roughly time-sortable, 10K+ IDs/sec per node. No coordination between nodes.\n\n**Twitter Snowflake**: 64 bits = 1 (sign) + 41 (timestamp ms, ~69 years) + 10 (machine ID, 1024 machines) + 12 (sequence, 4096/ms per machine). Each machine generates IDs independently. Time-sortable. No central point of failure.\n\n**Alternatives**: UUID (128-bit, no coordination, but not sortable and 2x storage). Database auto-increment (simple but single point of failure and not distributed). ULID (UUID-compatible but time-sortable).\n\n**Clock skew**: If system clock goes backward (NTP adjustment), Snowflake waits until clock catches up. Critical to handle this edge case.",
    "resources": [
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-unique-id-generator-in-distributed-systems",
        "label": "ByteByteGo — Unique ID Generator (Alex Xu Ch.)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-system-design-interview-ii/doc/design-unique-id-generator",
        "label": "Grokking Vol 2 — Unique ID Generator"
      },
      {
        "url": "https://blog.twitter.com/engineering/en_us/a/2010/announcing-snowflake",
        "label": "Twitter Engineering — Snowflake Announcement"
      }
    ],
    "diagramTitle": "Snowflake — Unique ID Generator",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "service",
        "label": "1 bit",
        "subtitle": "sign"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "41 bits",
        "subtitle": "timestamp ~69yr"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "10 bits",
        "subtitle": "machine ID"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "12 bits",
        "subtitle": "sequence 4096/ms"
      },
      {
        "id": "n4",
        "type": "client",
        "label": "Machine 1"
      },
      {
        "id": "n5",
        "type": "success",
        "label": "Unique IDs",
        "subtitle": "no coordination"
      },
      {
        "id": "n6",
        "type": "client",
        "label": "Machine 2"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 6,
    "slug": "design-a-content-delivery-network-cdn",
    "title": "Design a Content Delivery Network (CDN)",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "Edge Caching",
      "DNS Routing",
      "Cache Invalidation",
      "Geo Distribution"
    ],
    "companies": [
      "Cloudflare",
      "Akamai",
      "AWS",
      "Netflix"
    ],
    "answer": "**Architecture**: Multi-tier caching — Edge PoPs (Points of Presence, closest to user) -> Regional PoPs -> Origin Server. Geographic DNS routing directs users to nearest edge. Anycast IP: same IP resolves to different servers based on BGP routing.\n\n**Cache Strategy**: Push (origin pushes hot content to edges proactively) vs Pull (edge fetches on first miss). Pull is more common. Cache-Control headers (max-age, s-maxage, stale-while-revalidate). Cache key = URL + query params + Vary headers.\n\n**Invalidation**: TTL-based (simplest). Purge API (instant but expensive at scale). Versioned URLs (best: `style.v3.css` is a new cache key, no purge needed). Stale-while-revalidate: serve stale content while fetching fresh version in background.\n\n**Optimization**: Brotli/gzip compression. HTTP/2 multiplexing. Image optimization (WebP/AVIF conversion at edge). Edge compute (Cloudflare Workers, Lambda@Edge) for dynamic content at the edge.",
    "resources": [
      {
        "url": "https://www.cloudflare.com/learning/cdn/what-is-a-cdn/",
        "label": "Cloudflare — What Is a CDN (free guide)"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-youtube",
        "label": "ByteByteGo — YouTube (CDN patterns)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-youtube-or-netflix",
        "label": "Grokking — YouTube/Netflix (CDN patterns)"
      }
    ],
    "diagramTitle": "Content Delivery Network",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "User"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "DNS",
        "subtitle": "GeoDNS/Anycast"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "Edge PoP",
        "subtitle": "nearest"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "HIT",
        "subtitle": "serve 1-5ms"
      },
      {
        "id": "n4",
        "type": "decision",
        "label": "Regional PoP"
      },
      {
        "id": "n5",
        "type": "success",
        "label": "HIT",
        "subtitle": "cache at edge"
      },
      {
        "id": "n6",
        "type": "database",
        "label": "Origin Server"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 7,
    "slug": "design-a-load-balancer",
    "title": "Design a Load Balancer",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "L4 vs L7",
      "Health Checks",
      "Algorithms"
    ],
    "companies": [
      "All",
      "FAANG",
      "AWS",
      "Cloudflare"
    ],
    "answer": "**L4 (Transport)**: Routes based on IP+port. Fast (no payload inspection). TCP/UDP level. Hardware or software (IPVS, HAProxy). Uses NAT or DSR (Direct Server Return).\n\n**L7 (Application)**: Routes based on HTTP headers, URL path, cookies. Can do SSL termination, content-based routing, request modification. Nginx, Envoy, ALB.\n\n**Algorithms**: Round-robin (simple, equal distribution). Weighted round-robin (bigger servers get more). Least connections (route to server with fewest active connections, best for varying request durations). Consistent hashing (sticky sessions without cookies). IP hash (same client always goes to same server).\n\n**Health checks**: Active (LB pings servers periodically) vs Passive (monitor response codes). Remove unhealthy servers from rotation. Gradual drain: stop sending new requests but let existing connections finish.",
    "resources": [
      {
        "url": "https://blog.bytebytego.com/p/ep208-load-balancer-vs-api-gateway",
        "label": "ByteByteGo Blog — Load Balancer vs API Gateway"
      },
      {
        "url": "https://www.nginx.com/resources/glossary/load-balancing/",
        "label": "Nginx — Load Balancing Guide"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/load-balancing",
        "label": "Grokking — Load Balancing (concept lesson)"
      }
    ],
    "diagramTitle": "Load Balancer",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Client"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "L4 LB",
        "subtitle": "TCP/IP"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "L7 LB",
        "subtitle": "HTTP headers"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Server 1"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Server 2"
      },
      {
        "id": "n5",
        "type": "service",
        "label": "Server 3"
      }
    ],
    "bucket": 2,
    "tier": 2,
    "status": "coming-soon"
  },
  {
    "number": 8,
    "slug": "design-an-api-gateway",
    "title": "Design an API Gateway",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Auth",
      "Rate Limiting",
      "Request Routing",
      "Service Mesh"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Kong"
    ],
    "answer": "Single entry point for all client requests. Responsibilities: authentication/authorization (JWT validation), rate limiting (Q1), request routing (path-based to microservices), request/response transformation, SSL termination, logging/monitoring, circuit breaking. API versioning via URL path or headers. Can be a bottleneck — scale horizontally. Consider: Kong, AWS API Gateway, Envoy.",
    "resources": [
      {
        "url": "https://blog.bytebytego.com/p/ep122-api-gateway-101",
        "label": "ByteByteGo Blog — API Gateway 101"
      },
      {
        "url": "https://www.designgurus.io/course-play/system-design-interview-crash-course/doc/6949ae6ad5c46f6c243bd24f",
        "label": "Grokking Crash — API Gateway"
      },
      {
        "url": "https://docs.konghq.com/",
        "label": "Kong API Gateway Documentation"
      }
    ],
    "diagramTitle": "API Gateway",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Client"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "API Gateway",
        "subtitle": "auth+rate limit+route"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Service A"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Service B"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Service C"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 9,
    "slug": "design-a-distributed-task-scheduler-job-queue",
    "title": "Design a Distributed Task Scheduler / Job Queue",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Priority Queue",
      "Exactly-once Execution",
      "Cron at Scale"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Uber",
      "Startups"
    ],
    "answer": "**Requirements**: Schedule jobs (one-time or recurring cron). Execute exactly once. Handle worker failures (retry with backoff). Priority-based execution. Support millions of scheduled jobs.\n\n**Architecture**: Scheduler Service stores job definitions (DB). Timer Service (or Redis sorted set with score=execution_time) holds pending jobs. Worker Pool picks jobs. Distributed lock (Redis/ZooKeeper) ensures only one worker executes each job. Heartbeat-based liveness: if worker doesn't heartbeat within timeout, job is re-queued. Idempotency key prevents duplicate execution on retry.\n\n**Cron at scale**: Don't use system crontab. Store cron expressions in DB. A partition leader evaluates cron rules every minute and enqueues due jobs. Shard cron evaluation across multiple leaders by job ID range.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/job-scheduler",
        "label": "HelloInterview — Design Job Scheduler"
      },
      {
        "url": "https://www.designgurus.io/course-play/system-design-interview-crash-course/doc/6949afa57c4334fbab16d05b",
        "label": "Grokking Crash — Job Scheduler (Cron)"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/distributed-message-queue",
        "label": "ByteByteGo — Message Queue (task patterns)"
      }
    ],
    "diagramTitle": "Task Scheduler",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "database",
        "label": "Job Definitions"
      },
      {
        "id": "n1",
        "type": "cache",
        "label": "Timer",
        "subtitle": "Redis sorted set"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Worker Pool",
        "subtitle": "execute"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Distributed Lock"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Heartbeat"
      },
      {
        "id": "n5",
        "type": "warning",
        "label": "Retry+backoff"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 10,
    "slug": "design-a-distributed-locking-service",
    "title": "Design a Distributed Locking Service",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Fencing Tokens",
      "Redlock",
      "ZooKeeper"
    ],
    "companies": [
      "All",
      "FAANG",
      "Distributed",
      "Systems",
      "roles"
    ],
    "answer": "**Single-node (Redis)**: `SET lock_key unique_value NX EX 30`. Release: Lua script checks value before DELETE (prevents releasing someone else's lock). Problem: if Redis master fails before replicating, lock is lost.\n\n**Redlock (multi-node)**: Acquire lock on N/2+1 independent Redis nodes. If majority acquired within timeout, lock is held. Controversial — Martin Kleppmann argues it's unsafe for correctness (clock skew issues).\n\n**ZooKeeper/etcd**: Create ephemeral sequential node under lock path. If yours is lowest sequence number, you hold the lock. On disconnect, ephemeral node auto-deleted. Fencing tokens: monotonically increasing number attached to each lock acquisition. Resource checks fencing token and rejects stale holders.\n\n**When NOT to use distributed locks**: If you can use optimistic concurrency control (versioned writes) instead, do that. Locks should be a last resort.",
    "resources": [
      {
        "url": "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html",
        "label": "Martin Kleppmann — Distributed Locking"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/ticketmaster",
        "label": "HelloInterview — Ticketmaster (locking)"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-key-value-store",
        "label": "ByteByteGo — KV Store (consensus)"
      }
    ],
    "diagramTitle": "Distributed Lock",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "cache",
        "label": "SETNX",
        "subtitle": "NX EX 30"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Do Work"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "Lua DELETE",
        "subtitle": "check value"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "Ephemeral Node",
        "subtitle": "sequential"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Lowest seq = holder"
      },
      {
        "id": "n5",
        "type": "service",
        "label": "Fencing Token"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 11,
    "slug": "design-a-service-discovery-system",
    "title": "Design a Service Discovery System",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Registry",
      "Health Checks",
      "DNS-based vs Client-side"
    ],
    "companies": [
      "Netflix",
      "Google",
      "Amazon"
    ],
    "answer": "**Client-side** (Netflix Eureka): Services register themselves with a registry. Clients query registry and load-balance locally. Pros: no proxy bottleneck. Cons: client complexity.\n\n**Server-side** (AWS ALB): Client hits load balancer, which queries registry and routes. Simpler client but LB is a bottleneck.\n\n**DNS-based** (Consul DNS): Services register, DNS resolves service names to IPs. Simple but DNS TTL means slow updates.\n\nRegistry must be highly available (replicated, consensus-based like etcd/ZooKeeper). Health checks: services send heartbeats; registry removes unhealthy instances.",
    "resources": [
      {
        "url": "https://www.consul.io/docs",
        "label": "HashiCorp Consul — Service Discovery Docs"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-rate-limiter",
        "label": "ByteByteGo — Rate Limiter (registry patterns)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/load-balancing",
        "label": "Grokking — Load Balancing (discovery)"
      }
    ],
    "diagramTitle": "Service Discovery",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "service",
        "label": "Service A",
        "subtitle": "register"
      },
      {
        "id": "n1",
        "type": "database",
        "label": "Registry",
        "subtitle": "etcd/Consul"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Service B",
        "subtitle": "discover"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Heartbeat"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Remove unhealthy"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 12,
    "slug": "design-a-blobobject-storage-s3-like",
    "title": "Design a Blob/Object Storage (S3-like)",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Erasure Coding",
      "Metadata Service",
      "Data Placement"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "answer": "Separate metadata plane (object name, ACL, size, chunk locations) from data plane (actual bytes). Metadata in distributed DB (DynamoDB-like). Data split into chunks, erasure-coded (e.g., 6 data + 3 parity = 1.5x storage vs 3x for replication, same durability). Chunks placed across failure domains (different racks/AZs). Consistency: read-after-write for new objects. Multipart upload for large files. Lifecycle policies: transition to cheaper tiers (Glacier) after N days.",
    "resources": [
      {
        "url": "https://www.designgurus.io/course-play/system-design-interview-crash-course/doc/69444a9ce4092f77ed73eadf",
        "label": "Grokking Crash — Amazon S3 (Object Storage)"
      },
      {
        "url": "https://www.allthingsdistributed.com/",
        "label": "Werner Vogels Blog — S3 Architecture"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-google-drive",
        "label": "ByteByteGo — Google Drive (storage layer)"
      }
    ],
    "diagramTitle": "Blob/Object Storage",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "PUT"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Metadata",
        "subtitle": "name+ACL"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Data Svc",
        "subtitle": "chunk"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Erasure Code",
        "subtitle": "6+3"
      },
      {
        "id": "n4",
        "type": "database",
        "label": "Multi-AZ"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 13,
    "slug": "design-a-pubsub-system-google-pubsub",
    "title": "Design a Pub/Sub System (Google Pub/Sub)",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Topic-based",
      "Push vs Pull",
      "At-least-once"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Startups"
    ],
    "answer": "Publishers send messages to topics. Subscribers receive messages from subscriptions (1 topic -> N subscriptions). Each subscription gets its own copy. Push (server sends to subscriber endpoint) vs Pull (subscriber polls). Message acknowledgment: subscriber acks after processing; unacked messages redelivered after timeout. Dead letter queue for repeatedly failed messages. Ordering: per-key ordering within a subscription. At-least-once default; exactly-once via dedup on message ID.",
    "resources": [
      {
        "url": "https://cloud.google.com/pubsub/docs/overview",
        "label": "Google Cloud Pub/Sub Documentation"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/distributed-message-queue",
        "label": "ByteByteGo — Message Queue (pub/sub)"
      },
      {
        "url": "https://blog.bytebytego.com/p/why-do-we-need-a-message-queue",
        "label": "ByteByteGo Blog — Why Message Queues"
      }
    ],
    "diagramTitle": "Pub/Sub System",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Publisher"
      },
      {
        "id": "n1",
        "type": "queue",
        "label": "Topic"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Sub A",
        "subtitle": "push/pull"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Sub B"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Process"
      },
      {
        "id": "n5",
        "type": "success",
        "label": "ACK"
      },
      {
        "id": "n6",
        "type": "warning",
        "label": "Redeliver"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 14,
    "slug": "design-a-search-index-elasticsearch",
    "title": "Design a Search Index / Elasticsearch",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Inverted Index",
      "Sharding",
      "Near Real-time"
    ],
    "companies": [
      "Elastic",
      "Amazon",
      "Google"
    ],
    "answer": "Documents indexed into an inverted index (term -> [doc IDs + positions]). Shard index by document ID range or hash. Each shard has replicas. Query: coordinator sends to all shards, each returns local top-K, coordinator merges and re-ranks globally. Near real-time: new docs buffered in memory (refresh interval = 1s default), then flushed to searchable segment. Segments periodically merged (compaction). Analyzers: tokenizer + filters (lowercase, stemming, stop words). Mapping defines schema per field.",
    "resources": [
      {
        "url": "https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html",
        "label": "Elasticsearch Reference Documentation"
      },
      {
        "url": "https://blog.bytebytego.com/p/ep104-how-do-search-engines-work",
        "label": "ByteByteGo Blog — How Search Engines Work"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/fb-post-search",
        "label": "HelloInterview — FB Post Search"
      }
    ],
    "diagramTitle": "Search Index — Elasticsearch",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Documents"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Analyzer",
        "subtitle": "tokenize+stem"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "Inverted Index",
        "subtitle": "term→docIDs"
      },
      {
        "id": "n3",
        "type": "client",
        "label": "Query"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "All Shards",
        "subtitle": "parallel"
      },
      {
        "id": "n5",
        "type": "decision",
        "label": "Merge+Rerank"
      },
      {
        "id": "n6",
        "type": "success",
        "label": "Top K"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 15,
    "slug": "design-a-webhook-delivery-system",
    "title": "Design a Webhook Delivery System",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Retry + Backoff",
      "Idempotency",
      "Delivery Guarantee"
    ],
    "companies": [
      "Stripe",
      "Twilio",
      "GitHub",
      "Startups"
    ],
    "answer": "Event occurs -> enqueue webhook payload to Kafka/SQS -> Worker picks up -> HTTP POST to subscriber URL -> if 2xx, mark delivered. If non-2xx or timeout, retry with exponential backoff (1min, 5min, 30min, 2hr, 24hr). Max retries (e.g., 5 attempts over 3 days). Signing: HMAC-SHA256 of payload with shared secret so subscriber can verify authenticity. Idempotency: include event ID so subscriber can dedup. Dead letter queue after max retries. Dashboard showing delivery status per endpoint. Circuit breaker: if endpoint fails consistently, pause delivery and alert.",
    "resources": [
      {
        "url": "https://stripe.com/docs/webhooks",
        "label": "Stripe — Webhooks Documentation"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-notification-system",
        "label": "ByteByteGo — Notification (delivery patterns)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-system-design-interview-ii/doc/designing-a-notification-system",
        "label": "Grokking Vol 2 — Notification System"
      }
    ],
    "diagramTitle": "Webhook Delivery",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Event"
      },
      {
        "id": "n1",
        "type": "queue",
        "label": "Queue",
        "subtitle": "Kafka/SQS"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Worker"
      },
      {
        "id": "n3",
        "type": "client",
        "label": "Subscriber URL"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "1m"
      },
      {
        "id": "n5",
        "type": "service",
        "label": "5m"
      },
      {
        "id": "n6",
        "type": "service",
        "label": "30m"
      },
      {
        "id": "n7",
        "type": "service",
        "label": "2h"
      },
      {
        "id": "n8",
        "type": "warning",
        "label": "Dead Letter"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 16,
    "slug": "design-a-consensus-protocol-raft-paxos",
    "title": "Design a Consensus Protocol (Raft / Paxos)",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "Leader Election",
      "Log Replication",
      "Safety"
    ],
    "companies": [
      "Google",
      "Meta",
      "DB",
      "Companies"
    ],
    "answer": "Raft: Leader-based consensus. Leader election via randomized timeouts. Log replication: leader appends entry, replicates to followers, commits when majority confirms. Safety: committed entries are never lost. Leader sends heartbeats; followers start election if heartbeat timeout. Term numbers prevent stale leaders. Joint consensus for membership changes. Used by etcd, CockroachDB, TiKV.",
    "resources": [
      {
        "url": "https://raft.github.io/",
        "label": "Raft Consensus — Interactive Visualization"
      },
      {
        "url": "https://raft.github.io/raft.pdf",
        "label": "Raft Paper (Ongaro & Ousterhout)"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-key-value-store",
        "label": "ByteByteGo — KV Store (consensus chapter)"
      }
    ],
    "diagramTitle": "Consensus — Raft",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "success",
        "label": "Leader"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Follower 1"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Follower 2"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Follower 3"
      }
    ],
    "bucket": 2,
    "tier": 3,
    "status": "coming-soon"
  },
  {
    "number": 17,
    "slug": "design-a-database-sharding-strategy",
    "title": "Design a Database Sharding Strategy",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "Hash vs Range",
      "Resharding",
      "Cross-shard Queries"
    ],
    "companies": [
      "All",
      "FAANG",
      "Database",
      "roles"
    ],
    "answer": "**Hash sharding**: hash(key) mod N. Even distribution but range queries require scatter-gather. **Range sharding**: key ranges assigned to shards. Good for range queries but can create hotspots. **Directory-based**: lookup table maps key -> shard. Most flexible but directory is bottleneck/SPOF.\n\n**Resharding**: Adding shards requires data migration. Consistent hashing minimizes movement. Or use virtual shards: create 1000 logical shards mapped to 10 physical nodes, rebalance by moving logical shards. Cross-shard queries: scatter-gather (slow) or denormalize to avoid them.",
    "resources": [
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-key-value-store",
        "label": "ByteByteGo — KV Store (sharding patterns)"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/distributed-cache",
        "label": "HelloInterview — Cache (sharding)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-a-url-shortening-service-like-tinyurl",
        "label": "Grokking — URL Shortener (partitioning)"
      }
    ],
    "diagramTitle": "Database Sharding",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Key"
      },
      {
        "id": "n1",
        "type": "decision",
        "label": "Hash / Range",
        "subtitle": "shard selection"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "Shard 1"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "Shard 2"
      },
      {
        "id": "n4",
        "type": "database",
        "label": "Shard 3"
      }
    ],
    "bucket": 2,
    "tier": 3,
    "status": "coming-soon"
  },
  {
    "number": 18,
    "slug": "design-a-configuration-management-system",
    "title": "Design a Configuration Management System",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "Feature Flags",
      "Dynamic Config",
      "Rollback"
    ],
    "companies": [
      "Google",
      "Meta",
      "Netflix",
      "Startups"
    ],
    "answer": "Central config store (etcd/ZooKeeper/Consul). Services watch for changes and hot-reload. Feature flags: boolean toggles or percentage rollouts. Versioned configs with instant rollback. Audit log of all changes. Environment hierarchy (dev/staging/prod) with inheritance. Canary deployments: enable feature for 1% of users, monitor, then ramp up. Kill switch for instant feature disable.",
    "resources": [
      {
        "url": "https://launchdarkly.com/blog/",
        "label": "LaunchDarkly Blog — Feature Flag Patterns"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-notification-system",
        "label": "ByteByteGo — Notifications (config patterns)"
      },
      {
        "url": "https://www.designgurus.io/course-play/system-design-interview-crash-course/doc/6949ae6ad5c46f6c243bd24f",
        "label": "Grokking Crash — API Gateway (config)"
      }
    ],
    "diagramTitle": "Config Management",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "database",
        "label": "Config Store",
        "subtitle": "etcd/Consul"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Services",
        "subtitle": "hot-reload"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "Feature Flags",
        "subtitle": "% rollout"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Kill Switch"
      },
      {
        "id": "n4",
        "type": "database",
        "label": "Audit Log"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 19,
    "slug": "design-a-distributed-file-system-gfshdfs",
    "title": "Design a Distributed File System (GFS/HDFS)",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "Chunk Servers",
      "Master/NameNode",
      "Replication"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Hadoop",
      "roles"
    ],
    "answer": "Master (NameNode) stores metadata (file -> chunk list, chunk -> server mapping). Chunk Servers store 64MB chunks, each replicated 3x across racks. Client gets chunk locations from Master, reads/writes directly to Chunk Servers. Write: client -> primary chunk server -> replicate to 2 secondaries -> ack. Master heartbeats chunk servers, detects failures, re-replicates under-replicated chunks. Single master is SPOF: mitigate with shadow master or Raft-based master group.",
    "resources": [
      {
        "url": "https://research.google/pubs/pub51/",
        "label": "Google GFS Paper (original)"
      },
      {
        "url": "https://hadoop.apache.org/docs/r3.3.1/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html",
        "label": "HDFS Architecture Documentation"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-google-drive",
        "label": "ByteByteGo — Google Drive (DFS patterns)"
      }
    ],
    "diagramTitle": "Distributed File System",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Client"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Master/NameNode",
        "subtitle": "metadata"
      },
      {
        "id": "n2",
        "type": "client",
        "label": "Client"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "Chunk Server 1"
      },
      {
        "id": "n4",
        "type": "database",
        "label": "Chunk Server 2"
      },
      {
        "id": "n5",
        "type": "database",
        "label": "Chunk Server 3"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 20,
    "slug": "design-a-circuit-breaker",
    "title": "Design a Circuit Breaker",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "State Machine",
      "Fault Tolerance",
      "Cascading Failures"
    ],
    "companies": [
      "Netflix",
      "Amazon",
      "Startups"
    ],
    "answer": "Three states: CLOSED (normal, requests pass through, track failure rate), OPEN (failures exceeded threshold, all requests fail-fast with fallback response), HALF-OPEN (after timeout, allow limited requests to test if service recovered). Metrics: failure rate, slow call rate. Configurable thresholds, timeouts, and window sizes. Prevent cascading failures across microservices. Libraries: Resilience4j, Netflix Hystrix (deprecated but conceptually important). Combine with retries and fallback responses.",
    "resources": [
      {
        "url": "https://martinfowler.com/bliki/CircuitBreaker.html",
        "label": "Martin Fowler — Circuit Breaker Pattern"
      },
      {
        "url": "https://resilience4j.readme.io/",
        "label": "Resilience4j Documentation"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-rate-limiter",
        "label": "ByteByteGo — Rate Limiter (resilience)"
      }
    ],
    "diagramTitle": "Circuit Breaker",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "success",
        "label": "CLOSED",
        "subtitle": "normal"
      },
      {
        "id": "n1",
        "type": "warning",
        "label": "OPEN",
        "subtitle": "fail-fast"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "HALF-OPEN",
        "subtitle": "test"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "CLOSED"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 21,
    "slug": "design-a-distributed-tracing-system-jaeger",
    "title": "Design a Distributed Tracing System (Jaeger)",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "Trace Context",
      "Span Collection",
      "Sampling"
    ],
    "companies": [
      "Google",
      "Uber",
      "Datadog"
    ],
    "answer": "Each request gets a unique trace ID, propagated via headers (W3C TraceContext). Each service creates spans (start time, duration, metadata). Spans shipped to collector (Kafka -> storage). Storage in Cassandra/Elasticsearch. Sampling: head-based (decide at entry) or tail-based (decide after trace completes based on characteristics like high latency). UI shows waterfall timeline of spans. Use for debugging cross-service latency.",
    "resources": [
      {
        "url": "https://research.google/pubs/pub36356/",
        "label": "Google Dapper Paper (Distributed Tracing)"
      },
      {
        "url": "https://www.jaegertracing.io/docs/",
        "label": "Jaeger Tracing Documentation"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/metrics-monitoring",
        "label": "HelloInterview — Metrics Monitoring"
      }
    ],
    "diagramTitle": "Distributed Tracing",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Request",
        "subtitle": "+trace ID"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Service A",
        "subtitle": "span 1"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Service B",
        "subtitle": "span 2"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Service C",
        "subtitle": "span 3"
      },
      {
        "id": "n4",
        "type": "queue",
        "label": "Kafka"
      },
      {
        "id": "n5",
        "type": "database",
        "label": "Cassandra"
      },
      {
        "id": "n6",
        "type": "client",
        "label": "UI",
        "subtitle": "waterfall"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 22,
    "slug": "design-a-dns-system",
    "title": "Design a DNS System",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "Hierarchical Resolution",
      "Caching",
      "GeoDNS"
    ],
    "companies": [
      "Cloudflare",
      "Google",
      "AWS"
    ],
    "answer": "Hierarchical: Root servers -> TLD servers (.com) -> Authoritative servers (example.com). Recursive resolver caches at each level (TTL-based). Record types: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), NS (nameserver). GeoDNS returns different IPs based on client's geographic location (used by CDNs). Anycast: same IP announced from multiple locations, BGP routes to nearest. DNS over HTTPS (DoH) for privacy.",
    "resources": [
      {
        "url": "https://www.cloudflare.com/learning/dns/what-is-dns/",
        "label": "Cloudflare — How DNS Works (free)"
      },
      {
        "url": "https://blog.bytebytego.com/p/ep208-load-balancer-vs-api-gateway",
        "label": "ByteByteGo Blog — DNS & Routing"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/load-balancing",
        "label": "Grokking — Load Balancing (DNS routing)"
      }
    ],
    "diagramTitle": "DNS System",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Client"
      },
      {
        "id": "n1",
        "type": "cache",
        "label": "Recursive Resolver"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Root"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "TLD .com"
      },
      {
        "id": "n4",
        "type": "database",
        "label": "Authoritative"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 23,
    "slug": "design-a-monitoring-amp-alerting-system",
    "title": "Design a Monitoring &amp; Alerting System",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "Metrics Collection",
      "Alert Rules",
      "On-call Routing"
    ],
    "companies": [
      "Datadog",
      "PagerDuty",
      "Grafana"
    ],
    "answer": "Metrics: pull (Prometheus scrapes /metrics endpoints) or push (StatsD/Datadog agent). Time-series storage with rollup aggregation. Alert rules engine: evaluate conditions every N seconds (e.g., \"error_rate > 5% for 3 minutes\"). Alert routing: severity-based -> notification channel (PagerDuty, Slack, email). On-call schedules with escalation policies. Deduplication and grouping of related alerts. Silence/mute during maintenance. Dashboard builder for visualization.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/metrics-monitoring",
        "label": "HelloInterview — Metrics Monitoring"
      },
      {
        "url": "https://prometheus.io/docs/introduction/overview/",
        "label": "Prometheus Official Documentation"
      },
      {
        "url": "https://www.datadoghq.com/blog/engineering/",
        "label": "Datadog Engineering Blog"
      }
    ],
    "diagramTitle": "Monitoring & Alerting",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Servers"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Prometheus",
        "subtitle": "scrape"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "TSDB"
      },
      {
        "id": "n3",
        "type": "client",
        "label": "Grafana"
      },
      {
        "id": "n4",
        "type": "decision",
        "label": "Alert Rules"
      },
      {
        "id": "n5",
        "type": "warning",
        "label": "PagerDuty",
        "subtitle": "escalate"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 24,
    "slug": "design-a-secret-management-system-vault",
    "title": "Design a Secret Management System (Vault)",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "Encryption at Rest",
      "Access Control",
      "Rotation"
    ],
    "companies": [
      "HashiCorp",
      "AWS",
      "Google"
    ],
    "answer": "Secrets encrypted at rest with master key (sealed/unsealed model). Master key split using Shamir's Secret Sharing (K of N shares needed to unseal). Access policies: RBAC per path. Dynamic secrets: generate short-lived DB credentials on demand. Automatic rotation: rotate secrets periodically, update all consumers. Audit log of all secret access. Lease-based: secrets have TTL, must be renewed or they expire. Backends: AWS IAM, database, PKI certificates.",
    "resources": [
      {
        "url": "https://www.vaultproject.io/docs",
        "label": "HashiCorp Vault Documentation"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-key-value-store",
        "label": "ByteByteGo — KV Store (encryption patterns)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-an-api-rate-limiter",
        "label": "Grokking — Rate Limiter (auth patterns)"
      }
    ],
    "diagramTitle": "Secret Management",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "warning",
        "label": "Sealed Vault",
        "subtitle": "Shamir K-of-N"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Vault"
      },
      {
        "id": "n2",
        "type": "cache",
        "label": "Dynamic Secret",
        "subtitle": "short-lived"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 25,
    "slug": "design-a-database-connection-pool",
    "title": "Design a Database Connection Pool",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "Resource Management",
      "Timeout Handling"
    ],
    "companies": [
      "All",
      "companies"
    ],
    "answer": "Pre-create N connections to DB. App borrows connection from pool, uses it, returns it. Pool manages min/max connections, idle timeout, max lifetime, and connection validation (test before use). When pool exhausted: queue requests with timeout (vs creating unbounded connections that overwhelm DB). Health check: periodic ping on idle connections, remove dead ones. PgBouncer for PostgreSQL pooling. HikariCP for Java.",
    "resources": [
      {
        "url": "https://github.com/brettwooldridge/HikariCP",
        "label": "HikariCP — Connection Pool Best Practices"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-key-value-store",
        "label": "ByteByteGo — KV Store (resource mgmt)"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/distributed-cache",
        "label": "HelloInterview — Cache (pooling patterns)"
      }
    ],
    "diagramTitle": "Connection Pool",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "App"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Pool",
        "subtitle": "min/max/idle"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "DB Connection"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Pool"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 26,
    "slug": "design-an-event-driven-architecture",
    "title": "Design an Event-Driven Architecture",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "Event Sourcing",
      "CQRS",
      "Eventual Consistency"
    ],
    "companies": [
      "All",
      "FAANG",
      "Architect",
      "roles"
    ],
    "answer": "**Event Sourcing**: Store all changes as immutable events (not current state). State = replay of events. Enables audit trail, time travel, and rebuilding projections. **CQRS**: Separate read and write models. Writes go to event store; reads come from materialized views optimized for queries. Event bus (Kafka) connects producers and consumers. Eventual consistency between write and read sides (typically milliseconds). Sagas for distributed transactions across services (choreography vs orchestration).",
    "resources": [
      {
        "url": "https://martinfowler.com/eaaDev/EventSourcing.html",
        "label": "Martin Fowler — Event Sourcing"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/distributed-message-queue",
        "label": "ByteByteGo — Message Queue (event-driven)"
      },
      {
        "url": "https://blog.bytebytego.com/p/why-do-we-need-a-message-queue",
        "label": "ByteByteGo Blog — Why Message Queues"
      }
    ],
    "diagramTitle": "Event-Driven / CQRS",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Command"
      },
      {
        "id": "n1",
        "type": "database",
        "label": "Event Store",
        "subtitle": "append-only"
      },
      {
        "id": "n2",
        "type": "queue",
        "label": "Kafka"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "Read Model",
        "subtitle": "materialized view"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 27,
    "slug": "design-a-zero-downtime-deployment-system",
    "title": "Design a Zero-Downtime Deployment System",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "Blue-Green",
      "Canary",
      "Rolling Update"
    ],
    "companies": [
      "All",
      "companies",
      "DevOps/SRE"
    ],
    "answer": "**Blue-Green**: Two identical environments. Deploy to inactive (green), test, switch traffic (DNS/LB). Instant rollback by switching back. Cost: 2x infrastructure. **Canary**: Deploy to small subset (1-5%), monitor metrics, gradually increase if healthy. **Rolling**: Replace instances one-by-one. No extra infra cost but rollback is slow. Database migrations: use expand-contract pattern (add new column -> dual-write -> backfill -> switch reads -> drop old column).",
    "resources": [
      {
        "url": "https://martinfowler.com/bliki/BlueGreenDeployment.html",
        "label": "Martin Fowler — Blue-Green Deployment"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-rate-limiter",
        "label": "ByteByteGo — Rate Limiter (rollout)"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/distributed-rate-limiter",
        "label": "HelloInterview — Rate Limiter (canary)"
      }
    ],
    "diagramTitle": "Zero-Downtime Deploy",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "success",
        "label": "Blue",
        "subtitle": "current"
      },
      {
        "id": "n1",
        "type": "warning",
        "label": "Green",
        "subtitle": "new"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "1%"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "5%"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "50%"
      },
      {
        "id": "n5",
        "type": "success",
        "label": "100%"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 28,
    "slug": "design-a-data-pipeline-etl-system",
    "title": "Design a Data Pipeline / ETL System",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "Batch + Stream",
      "DAG Orchestration",
      "Data Quality"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Netflix",
      "Data",
      "roles"
    ],
    "answer": "Extract from sources (DBs, APIs, logs) -> Transform (clean, join, aggregate) -> Load to data warehouse. DAG orchestration (Airflow): define task dependencies, schedule runs, retry failures. Batch (nightly) vs streaming (real-time via Flink/Spark Streaming). Data quality: schema validation, row counts, null checks, anomaly detection. Idempotent pipelines: re-running produces same result. Backfill capability for reprocessing historical data.",
    "resources": [
      {
        "url": "https://airflow.apache.org/docs/",
        "label": "Apache Airflow — DAG Orchestration"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/job-scheduler",
        "label": "HelloInterview — Job Scheduler (ETL)"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/distributed-message-queue",
        "label": "ByteByteGo — Message Queue (pipeline)"
      }
    ],
    "diagramTitle": "Data Pipeline — ETL",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "database",
        "label": "Sources",
        "subtitle": "DB/API/logs"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Extract"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Transform",
        "subtitle": "Spark"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "Load",
        "subtitle": "warehouse"
      },
      {
        "id": "n4",
        "type": "warning",
        "label": "Airflow DAG",
        "subtitle": "retry+backfill"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 29,
    "slug": "design-an-sso-authentication-system",
    "title": "Design an SSO / Authentication System",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "OAuth2 / OIDC",
      "JWT",
      "Session Mgmt"
    ],
    "companies": [
      "Okta",
      "Auth0",
      "All",
      "FAANG"
    ],
    "answer": "OAuth2 authorization code flow: User -> Client -> Auth Server (login page) -> auth code -> Client exchanges for access token + refresh token. JWT: stateless, contains claims, signed (RS256), short-lived (15min). Refresh token: long-lived, stored securely, used to get new access tokens. Session management: server-side sessions (Redis) vs stateless JWT. SAML for enterprise SSO. MFA: TOTP (Google Authenticator), SMS (less secure), WebAuthn/FIDO2 (most secure).",
    "resources": [
      {
        "url": "https://auth0.com/docs",
        "label": "Auth0 — OAuth2 / OIDC Documentation"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-rate-limiter",
        "label": "ByteByteGo — Rate Limiter (auth patterns)"
      },
      {
        "url": "https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-an-api-rate-limiter",
        "label": "Grokking — Rate Limiter (session mgmt)"
      }
    ],
    "diagramTitle": "Auth / SSO",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "User"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Auth Server",
        "subtitle": "login"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Client"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Access Token",
        "subtitle": "JWT"
      },
      {
        "id": "n4",
        "type": "database",
        "label": "Refresh Token",
        "subtitle": "long-lived"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 30,
    "slug": "design-a-container-orchestration-system-k8s-like",
    "title": "Design a Container Orchestration System (K8s-like)",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "Scheduling",
      "Service Discovery",
      "Auto-scaling"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft"
    ],
    "answer": "Control plane: API server (all operations), Scheduler (assigns pods to nodes based on resources, affinity, constraints), Controller Manager (desired state -> actual state reconciliation), etcd (cluster state store). Data plane: Kubelet on each node manages containers, kube-proxy handles networking. Scheduling: bin-packing, resource requests/limits, node affinity, pod anti-affinity. Auto-scaling: HPA (Horizontal Pod Autoscaler) based on CPU/custom metrics. Rolling updates with readiness probes.",
    "resources": [
      {
        "url": "https://kubernetes.io/docs/concepts/overview/",
        "label": "Kubernetes Architecture Documentation"
      },
      {
        "url": "https://www.designgurus.io/course-play/system-design-interview-crash-course/doc/6949afa57c4334fbab16d05b",
        "label": "Grokking Crash — Job Scheduler (orchestration)"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-unique-id-generator-in-distributed-systems",
        "label": "ByteByteGo — ID Generator (scheduling)"
      }
    ],
    "diagramTitle": "Container Orchestration — K8s",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "service",
        "label": "API Server"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Scheduler",
        "subtitle": "bin-pack"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "Node 1",
        "subtitle": "kubelet"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "Node 2"
      },
      {
        "id": "n4",
        "type": "database",
        "label": "Node 3"
      },
      {
        "id": "n5",
        "type": "warning",
        "label": "etcd",
        "subtitle": "cluster state"
      },
      {
        "id": "n6",
        "type": "service",
        "label": "Controller Mgr",
        "subtitle": "desired=actual"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 31,
    "slug": "design-a-change-data-capture-cdc-system",
    "title": "Design a Change Data Capture (CDC) System",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "DB Replication Log",
      "Debezium",
      "Event Streaming"
    ],
    "companies": [
      "LinkedIn",
      "Uber",
      "Startups"
    ],
    "answer": "Capture every row-level change from DB (INSERT/UPDATE/DELETE) as a stream of events. Implementation: read DB's write-ahead log (WAL/binlog). Debezium connects to PostgreSQL/MySQL WAL and publishes changes to Kafka. Use cases: keep search index in sync, replicate to data warehouse, trigger downstream processing. Ordering: per-key ordering preserved. Schema evolution: include schema registry (Avro/Protobuf). Handles initial snapshot + ongoing changes.",
    "resources": [
      {
        "url": "https://debezium.io/documentation/",
        "label": "Debezium — CDC Documentation"
      },
      {
        "url": "https://www.confluent.io/blog/cdc-and-debezium/",
        "label": "Confluent — CDC with Debezium Guide"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/distributed-message-queue",
        "label": "ByteByteGo — Message Queue (CDC patterns)"
      }
    ],
    "diagramTitle": "Change Data Capture",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "database",
        "label": "Database",
        "subtitle": "WAL/binlog"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Debezium",
        "subtitle": "read WAL"
      },
      {
        "id": "n2",
        "type": "queue",
        "label": "Kafka",
        "subtitle": "change events"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Consumers",
        "subtitle": "search/DW"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 32,
    "slug": "design-a-feature-store-ml-platform",
    "title": "Design a Feature Store (ML Platform)",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "Online/Offline Serving",
      "Feature Engineering"
    ],
    "companies": [
      "Uber(Michelangelo)",
      "Google",
      "Startups"
    ],
    "answer": "Central repository for ML features. Offline store (Hive/BigQuery): batch features for training. Online store (Redis/DynamoDB): low-latency features for inference. Feature pipelines: batch (Spark) or streaming (Flink) compute features from raw data. Feature registry: catalog with descriptions, owners, freshness SLAs. Point-in-time correctness: avoid data leakage by serving features as they existed at prediction time. Examples: Feast, Tecton, Uber Michelangelo.",
    "resources": [
      {
        "url": "https://feast.dev/docs/",
        "label": "Feast — Feature Store Documentation"
      },
      {
        "url": "https://eng.uber.com/michelangelo-machine-learning-platform/",
        "label": "Uber — Michelangelo ML Platform"
      },
      {
        "url": "https://blog.bytebytego.com/p/how-video-recommendations-work-part",
        "label": "ByteByteGo Blog — Video Recs (features)"
      }
    ],
    "diagramTitle": "Feature Store",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "database",
        "label": "Raw Data"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Pipeline",
        "subtitle": "Spark/Flink"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "Offline",
        "subtitle": "S3/Hive"
      },
      {
        "id": "n3",
        "type": "cache",
        "label": "Online",
        "subtitle": "Redis <30ms"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 33,
    "slug": "design-a-vector-database-for-aiembeddings",
    "title": "Design a Vector Database (for AI/Embeddings)",
    "difficulty": "Hard",
    "frequency": "Rising Fast",
    "tags": [
      "ANN Algorithms",
      "HNSW",
      "Hybrid Search"
    ],
    "companies": [
      "Pinecone",
      "Weaviate",
      "AI",
      "Startups"
    ],
    "answer": "**Newest infrastructure question in 2025-2026.** Store high-dimensional vectors (embeddings from ML models). ANN search: find K nearest neighbors without brute-force. Algorithms: HNSW (graph-based, best recall/speed), IVF (inverted file, good for large scale), Product Quantization (compression for memory savings). Hybrid search: combine vector similarity with keyword filtering (pre-filter or post-filter). Sharding: by vector range or hash. Replication for availability. Metadata filtering during search. Used for RAG, recommendation, image search.",
    "resources": [
      {
        "url": "https://www.pinecone.io/learn/",
        "label": "Pinecone — Vector DB Learning Center"
      },
      {
        "url": "https://weaviate.io/developers/weaviate",
        "label": "Weaviate — Vector Search Docs"
      },
      {
        "url": "https://blog.bytebytego.com/p/ep104-how-do-search-engines-work",
        "label": "ByteByteGo Blog — Search (embedding)"
      }
    ],
    "diagramTitle": "Vector Database",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Embeddings"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "HNSW/IVF",
        "subtitle": "ANN index"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "Query",
        "subtitle": "K nearest"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "Metadata Filter",
        "subtitle": "pre/post"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 34,
    "slug": "design-a-global-database-spanner-like",
    "title": "Design a Global Database (Spanner-like)",
    "difficulty": "Hard",
    "frequency": null,
    "tags": [
      "TrueTime",
      "External Consistency",
      "Multi-region"
    ],
    "companies": [
      "Google",
      "CockroachDB"
    ],
    "answer": "Google Spanner achieves external consistency (stronger than linearizability) across the globe using TrueTime (GPS + atomic clocks providing bounded clock uncertainty). Transactions wait out the uncertainty interval before committing. Paxos-based replication across regions. Sharded by key range. SQL interface on top of distributed KV store. CockroachDB is the open-source equivalent (uses NTP instead of TrueTime, slightly weaker guarantees). Use case: financial systems needing global strong consistency.",
    "resources": [
      {
        "url": "https://research.google/pubs/pub39966/",
        "label": "Google Spanner Paper (TrueTime)"
      },
      {
        "url": "https://www.cockroachlabs.com/docs/",
        "label": "CockroachDB Architecture Docs"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-key-value-store",
        "label": "ByteByteGo — KV Store (global consistency)"
      }
    ],
    "diagramTitle": "Global DB — Spanner",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "warning",
        "label": "TrueTime",
        "subtitle": "GPS+atomic clocks"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Paxos",
        "subtitle": "cross-region"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "Shards",
        "subtitle": "key range"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 35,
    "slug": "design-an-ab-testing-platform",
    "title": "Design an A/B Testing Platform",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [
      "Experiment Assignment",
      "Statistical Significance",
      "Feature Flags"
    ],
    "companies": [
      "Netflix",
      "Google",
      "Meta",
      "Startups"
    ],
    "answer": "Experiment config: define variants (control/treatment), traffic allocation (%), targeting rules (country, user tier). Assignment: deterministic hash of (userId, experimentId) mod 100. Consistent: same user always sees same variant. Metrics collection: event tracking for each variant. Analysis: compute conversion rate, statistical significance (p-value, confidence interval), guard-rail metrics (latency, crash rate). Mutual exclusion: some experiments can't overlap (use layers/domains). Results dashboard with automated significance detection.",
    "resources": [
      {
        "url": "https://netflixtechblog.com/",
        "label": "Netflix Tech Blog — Experimentation"
      },
      {
        "url": "https://www.hellointerview.com/learn/system-design/problem-breakdowns/top-k",
        "label": "HelloInterview — Top K (experiment metrics)"
      },
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-unique-id-generator-in-distributed-systems",
        "label": "ByteByteGo — ID Generator (assignment)"
      }
    ],
    "diagramTitle": "A/B Testing Platform",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "User"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Hash",
        "subtitle": "userId+expId"
      },
      {
        "id": "n2",
        "type": "success",
        "label": "Control 50%"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Treatment 50%"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Primary"
      },
      {
        "id": "n5",
        "type": "warning",
        "label": "Guardrails"
      },
      {
        "id": "n6",
        "type": "decision",
        "label": "Significance",
        "subtitle": "p-value"
      }
    ],
    "bucket": 2,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 1,
    "slug": "design-youtube-video-recommendations",
    "title": "Design YouTube Video Recommendations",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "Two-tower model",
      "Candidate Gen",
      "Ranking",
      "ANN retrieval"
    ],
    "companies": [
      "Google",
      "Netflix",
      "Amazon",
      "TikTok"
    ],
    "answer": "### Architecture\n**Three-stage funnel**: (1) Candidate Generation — two-tower model (user tower + video tower) produces embeddings, ANN search (FAISS/ScaNN) retrieves ~1000 candidates from millions. (2) Ranking — deep ranking model scores each candidate using rich features (user history, video metadata, context, cross-features). Optimize for watch time, not CTR. (3) Re-ranking — business rules: diversity, freshness, creator fairness, ad insertion.\n**Key decisions**: Multi-objective optimization (engagement + satisfaction + creator equity). Position bias correction via inverse propensity weighting. Cold-start: content-based features for new videos, popularity-based for new users. Feedback loop: implicit signals (watch time, skips, replays) weighted more than explicit (likes).",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/ml-system-design/problem-breakdowns/video-recommendations",
        "label": "HelloInterview — Video Recommendations"
      },
      {
        "url": "https://eugeneyan.com/writing/system-design-for-discovery/",
        "label": "Eugene Yan — System Design for RecSys"
      },
      {
        "url": "https://bytebytego.com/courses/machine-learning-system-design-interview",
        "label": "ByteByteGo — ML SD: Recommendation System Ch."
      }
    ],
    "diagramTitle": "YouTube Recommendations",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "User"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Two-tower",
        "subtitle": "embeddings"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "ANN",
        "subtitle": "~1000 candidates"
      },
      {
        "id": "n3",
        "type": "decision",
        "label": "Light Ranker",
        "subtitle": "GBDT"
      },
      {
        "id": "n4",
        "type": "decision",
        "label": "Heavy Ranker",
        "subtitle": "DNN"
      },
      {
        "id": "n5",
        "type": "success",
        "label": "Top 10"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 2,
    "slug": "design-instagram-explore-tiktok-for-you-page",
    "title": "Design Instagram Explore / TikTok For You Page",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "Content-based filtering",
      "User embeddings",
      "Real-time signals",
      "Exploration vs Exploitation"
    ],
    "companies": [
      "Meta",
      "TikTok",
      "Pinterest",
      "Snap"
    ],
    "answer": "**Explore vs Feed**: Feed = social graph driven; Explore = interest graph driven (no follow relationship needed). Use multi-stage retrieval: embedding-based ANN → lightweight ranker → heavy ranker. TikTok FYP is 100% algorithmic — test new content on small audience, engagement metrics determine distribution. Key: serendipity injection (explore 10-20% non-obvious content to avoid filter bubbles). Real-time features: last 10 interactions, session context. Train on implicit feedback (dwell time, completion rate, shares).",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/personalization/",
        "label": "Eugene Yan — Patterns for Personalization"
      },
      {
        "url": "https://www.hellointerview.com/learn/ml-system-design/problem-breakdowns/video-recommendations",
        "label": "HelloInterview — Video Recommendations (Explore)"
      },
      {
        "url": "https://newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you",
        "label": "TikTok — How Recommendations Work"
      }
    ],
    "diagramTitle": "TikTok FYP",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "New Content"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Seed",
        "subtitle": "small audience"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "Engagement",
        "subtitle": "metrics"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "Broaden"
      },
      {
        "id": "n4",
        "type": "warning",
        "label": "Suppress"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 3,
    "slug": "design-amazon-product-recommendations",
    "title": "Design Amazon Product Recommendations",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "Collaborative filtering",
      "Session-based recs",
      "Cross-sell/Upsell"
    ],
    "companies": [
      "Amazon",
      "Flipkart",
      "Walmart",
      "eBay"
    ],
    "answer": "**Multiple recommendation surfaces**: 'Frequently bought together' (association rules / co-purchase graph), 'Customers who viewed also viewed' (item-item CF), 'Recommended for you' (personalized ranking). Session-based recommendations using transformer models for anonymous users. Handle catalog of 100M+ items. Real-time inventory awareness — don't recommend out-of-stock items. Multi-objective: relevance × purchase probability × margin. Cold-start via category-level popularity.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/system-design-for-discovery/",
        "label": "Eugene Yan — System Design for RecSys & Search"
      },
      {
        "url": "https://bytebytego.com/courses/machine-learning-system-design-interview",
        "label": "ByteByteGo — ML SD: E-Commerce Recs Ch."
      },
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Product Recs"
      }
    ],
    "diagramTitle": "Amazon Product Recs",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "User Session"
      },
      {
        "id": "n1",
        "type": "database",
        "label": "Co-purchase",
        "subtitle": "graph"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Item-Item CF"
      },
      {
        "id": "n3",
        "type": "decision",
        "label": "Personalized",
        "subtitle": "ranking"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Results"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 4,
    "slug": "design-google-youtube-search-ranking",
    "title": "Design Google / YouTube Search Ranking",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "Learning to rank",
      "BM25 + Neural",
      "Query understanding",
      "Presentation bias"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Apple(App",
      "Store)",
      "Airbnb"
    ],
    "answer": "**Query understanding**: intent classification (navigational/informational/transactional), query expansion, spell correction. **Retrieval**: BM25 (inverted index) + dense retrieval (BERT embeddings) with hybrid fusion. **Ranking**: LambdaMART or neural ranker, pointwise/pairwise/listwise loss. Features: query-document relevance, freshness, authority (PageRank), user history, click-through data. Debias position bias with inverse propensity weighting. Evaluate with NDCG@10, MRR.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/search-query-matching/",
        "label": "Eugene Yan — Search Query Matching"
      },
      {
        "url": "https://www.hellointerview.com/learn/ml-system-design/core-concepts/evaluation",
        "label": "HelloInterview — ML Evaluation (Search Metrics)"
      },
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Search Ranking"
      }
    ],
    "diagramTitle": "Search Ranking",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Query"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Intent",
        "subtitle": "classify"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "BM25",
        "subtitle": "sparse"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "Dense",
        "subtitle": "BERT"
      },
      {
        "id": "n4",
        "type": "decision",
        "label": "L2R",
        "subtitle": "rerank"
      },
      {
        "id": "n5",
        "type": "success",
        "label": "Top 10"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 5,
    "slug": "design-ad-click-prediction-metagoogle-ads",
    "title": "Design Ad Click Prediction (Meta/Google Ads)",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "CTR prediction",
      "Deep & Cross Network",
      "Calibration",
      "Multi-task learning"
    ],
    "companies": [
      "Meta",
      "Google",
      "Amazon",
      "Snap",
      "Pinterest"
    ],
    "answer": "**Model**: Deep & Cross Network (DCN-v2) for automatic feature crossing. Multi-task learning: predict CTR + CVR jointly. Features: user demographics, ad creative features, contextual (time, device, placement), historical interaction features. **Training**: continuous training on streaming data (retrain every few hours). Calibration critical — predicted probabilities must be accurate for auction pricing. Metric: Normalized Cross Entropy. **Serving**: <100ms latency, score thousands of ads per request. Feature engineering is 80% of the work.",
    "resources": [
      {
        "url": "https://www.trybackprop.com/blog/11_real_ml_interview_questions_asked_at_faang",
        "label": "Backprop — 11 Real FAANG ML Questions (Ads)"
      },
      {
        "url": "https://bytebytego.com/courses/machine-learning-system-design-interview",
        "label": "ByteByteGo — ML SD: Ad Click Prediction Ch."
      },
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Ad Prediction"
      }
    ],
    "diagramTitle": "Ad Click Prediction",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Ad Request"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Candidates"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "DCN-v2",
        "subtitle": "score CTR"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Calibrate"
      },
      {
        "id": "n4",
        "type": "warning",
        "label": "Auction",
        "subtitle": "bid×CTR"
      },
      {
        "id": "n5",
        "type": "success",
        "label": "Winner"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 6,
    "slug": "design-real-time-fraud-detection",
    "title": "Design Real-time Fraud Detection",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Class imbalance",
      "Streaming ML",
      "Rules + ML hybrid",
      "Adversarial adaptation"
    ],
    "companies": [
      "Meta",
      "Amazon",
      "Stripe",
      "PayPal",
      "Capital",
      "One"
    ],
    "answer": "**Multi-layer**: Rule engine (fast, catches known patterns) → lightweight model (GBM, <10ms) → heavy model (deep network, async). Handle 99.9% class imbalance: SMOTE/undersampling for training, use PR-AUC not ROC-AUC. Real-time features via Kafka/Flink: transaction velocity, geo anomalies, device fingerprinting. Adversarial loop: fraudsters adapt, so retrain weekly + rule updates. Human-in-the-loop review queue for borderline cases. Graph-based detection for organized fraud rings.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/content-moderation/",
        "label": "Eugene Yan — Content Moderation & Fraud Detection"
      },
      {
        "url": "https://www.interviewnode.com/post/top-25-high-level-design-hld-questions-in-ml-interviews-at-faang-companies",
        "label": "InterviewNode — Top 25 ML HLD (Fraud)"
      },
      {
        "url": "https://github.com/alirezadir/machine-learning-interviews/blob/main/src/MLSD/ml-system-design.md",
        "label": "GitHub — ML Interview: Fraud Detection"
      }
    ],
    "diagramTitle": "Fraud Detection",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Transaction"
      },
      {
        "id": "n1",
        "type": "warning",
        "label": "Rules",
        "subtitle": "fast"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "GBM",
        "subtitle": "<10ms"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Deep Model",
        "subtitle": "async"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Block/Allow"
      },
      {
        "id": "n5",
        "type": "database",
        "label": "Chargebacks",
        "subtitle": "ground truth"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 7,
    "slug": "design-harmful-content-detection-system",
    "title": "Design Harmful Content Detection System",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Multi-modal classification",
      "Active learning",
      "Precision constraints",
      "Adversarial ML"
    ],
    "companies": [
      "Meta",
      "Google(YouTube)",
      "TikTok",
      "Apple"
    ],
    "answer": "**Multi-modal**: Separate classifiers for text (BERT), image (ViT), video (frame sampling + temporal model). Combine via late fusion. Categories: hate speech, violence, nudity, self-harm, misinformation. **Precision constraint**: 95%+ precision before auto-removal (false positives = user trust damage). Active learning to efficiently label edge cases. Hash-matching (PhotoDNA) for known CSAM. Behavioral signals: user reports, engagement anomalies boost classifier confidence. Appeals pipeline for overturned decisions feeds back to training.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/ml-system-design/problem-breakdowns/harmful-content",
        "label": "HelloInterview — Harmful Content Detection"
      },
      {
        "url": "https://eugeneyan.com/writing/content-moderation/",
        "label": "Eugene Yan — Content Moderation Patterns"
      },
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Content Moderation"
      }
    ],
    "diagramTitle": "Content Moderation",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Post"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Text ML",
        "subtitle": "BERT"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Image ML",
        "subtitle": "ViT"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Video ML",
        "subtitle": "frames"
      },
      {
        "id": "n4",
        "type": "decision",
        "label": "Fusion",
        "subtitle": "score"
      },
      {
        "id": "n5",
        "type": "success",
        "label": ">95%",
        "subtitle": "auto-remove"
      },
      {
        "id": "n6",
        "type": "warning",
        "label": "<95%",
        "subtitle": "human review"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 8,
    "slug": "design-email-spam-detection-gmail",
    "title": "Design Email Spam Detection (Gmail)",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Text classification",
      "Feature engineering",
      "Adversarial robustness"
    ],
    "companies": [
      "Google",
      "Microsoft",
      "Yahoo"
    ],
    "answer": "Multi-signal approach: text content features (TF-IDF, BERT embeddings), sender reputation score, link analysis, header anomalies, user behavior (report rates). Ensemble of fast rules + GBM + deep model. Handle adversarial evolution (spammers constantly change tactics). Train on billions of emails with crowdsourced labels (user 'Report Spam' clicks). Personalization: what's spam for one user may be legitimate for another. Low FPR critical — missing legitimate email is worse than letting some spam through.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/content-moderation/",
        "label": "Eugene Yan — Fraud & Spam Detection Patterns"
      },
      {
        "url": "https://www.hellointerview.com/learn/ml-system-design/problem-breakdowns/bot-detection",
        "label": "HelloInterview — Bot Detection System"
      },
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Spam Detection"
      }
    ],
    "diagramTitle": "Spam Detection",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Email"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Text Features",
        "subtitle": "TF-IDF"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "Sender Rep"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Link Analysis"
      },
      {
        "id": "n4",
        "type": "decision",
        "label": "Ensemble",
        "subtitle": "GBM+DNN"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 9,
    "slug": "design-notification-ranking-priority-inbox",
    "title": "Design Notification Ranking / Priority Inbox",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "User engagement prediction",
      "Multi-objective",
      "Frequency capping"
    ],
    "companies": [
      "Meta",
      "Apple",
      "LinkedIn",
      "Amazon"
    ],
    "answer": "Predict P(open), P(click), P(annoyance) for each notification. Multi-objective: maximize engagement while minimizing opt-outs. Features: notification type, sender relevance, time of day, user's notification history, device state. Frequency capping: max N notifications/hour. Channel optimization: push vs email vs in-app. Cold-start for new notification types: rule-based then learn. A/B test aggressively — wrong notification timing erodes trust fast.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/push-notifications/",
        "label": "Eugene Yan — Push Notification Ranking"
      },
      {
        "url": "https://www.hellointerview.com/learn/ml-system-design/core-concepts/evaluation",
        "label": "HelloInterview — ML Evaluation (Ranking)"
      },
      {
        "url": "https://bytebytego.com/courses/machine-learning-system-design-interview",
        "label": "ByteByteGo — ML SD: Notification Ch."
      }
    ],
    "diagramTitle": "Notification Ranking",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Notification"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "P(open)"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "P(annoy)"
      },
      {
        "id": "n3",
        "type": "decision",
        "label": "Send / Suppress / Batch"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 10,
    "slug": "design-eta-prediction-ubergoogle-maps",
    "title": "Design ETA Prediction (Uber/Google Maps)",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Spatial-temporal features",
      "Graph neural networks",
      "Real-time signals"
    ],
    "companies": [
      "Uber",
      "Google",
      "Grab",
      "Lyft"
    ],
    "answer": "Input: origin, destination, departure time, current traffic. Model: GNN on road graph + historical speed patterns + real-time GPS traces. Segment-level prediction (per road segment) summed for route. Features: day of week, hour, weather, events, road type, speed limit. Handle uncertainty: predict distribution, not point estimate (report P50 as ETA, P90 for 'latest arrival'). Online updates: adjust predictions using real-time GPS traces from drivers currently on that route. Evaluate: MAE, MAPE, % within 10% accuracy.",
    "resources": [
      {
        "url": "https://bytebytego.com/courses/machine-learning-system-design-interview",
        "label": "ByteByteGo — ML SD: ETA Prediction Ch."
      },
      {
        "url": "https://eng.uber.com/deepeta-how-uber-predicts-arrival-times/",
        "label": "Uber Engineering — DeepETA Prediction"
      },
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Regression"
      }
    ],
    "diagramTitle": "ETA Prediction",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Origin+Dest"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Road GNN"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "Real-time GPS"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "Historical"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "ETA",
        "subtitle": "distribution"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 11,
    "slug": "design-people-you-may-know-linkedin",
    "title": "Design People You May Know (LinkedIn)",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Graph algorithms",
      "2-hop BFS",
      "Feature engineering"
    ],
    "companies": [
      "LinkedIn",
      "Meta",
      "Google"
    ],
    "answer": "2-hop BFS on social graph: friends-of-friends ranked by mutual connection count + shared attributes (workplace, school, location). Graph neural network for embedding-based similarity. Features: mutual connections, profile similarity, interaction recency, shared groups. Negative sampling from non-connections. Handle cold-start: profile-attribute matching. Privacy: don't suggest people who blocked each other.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/personalization/",
        "label": "Eugene Yan — Personalization via Graphs"
      },
      {
        "url": "https://engineering.linkedin.com/",
        "label": "LinkedIn Engineering — PYMK Algorithm"
      },
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Graph Features"
      }
    ],
    "diagramTitle": "People You May Know",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "User"
      },
      {
        "id": "n1",
        "type": "database",
        "label": "Graph",
        "subtitle": "adjacency"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "2-hop BFS"
      },
      {
        "id": "n3",
        "type": "decision",
        "label": "Rank",
        "subtitle": "mutuals"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Suggestions"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 12,
    "slug": "design-visual-search-pinterestgoogle-lens",
    "title": "Design Visual Search (Pinterest/Google Lens)",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "CNN/ViT embeddings",
      "ANN search",
      "Multi-modal"
    ],
    "companies": [
      "Pinterest",
      "Google",
      "Amazon"
    ],
    "answer": "User uploads image → extract embedding via CNN/ViT → ANN search in visual embedding index → return similar items. For shopping: detect product regions, crop, embed each separately. Combine visual + text signals for hybrid ranking. Handle: different angles, lighting, partial occlusion. Index billions of images with FAISS/ScaNN. Serve at <200ms. Fine-tune embedding model on domain-specific triplet loss.",
    "resources": [
      {
        "url": "https://engineering.pinterest.com/",
        "label": "Pinterest Engineering — Visual Search"
      },
      {
        "url": "https://www.pinecone.io/learn/",
        "label": "Pinecone — Visual Embeddings & ANN"
      },
      {
        "url": "https://eugeneyan.com/writing/real-time-recommendations/",
        "label": "Eugene Yan — Real-time Retrieval"
      }
    ],
    "diagramTitle": "Visual Search",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Image"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "CNN/ViT",
        "subtitle": "embed"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "ANN",
        "subtitle": "FAISS"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "Similar Items"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 13,
    "slug": "design-fake-account-detection",
    "title": "Design Fake Account Detection",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Graph-based detection",
      "Behavioral analysis",
      "Adversarial ML"
    ],
    "companies": [
      "Meta",
      "Google",
      "Twitter/X"
    ],
    "answer": "Multi-signal: profile features (completeness, age, photo), behavioral (posting patterns, friend request velocity, content similarity), graph-based (detect clusters of coordinated fake accounts), device fingerprinting. Two-phase: registration-time screening + ongoing behavioral monitoring. Graph analysis critical — fake accounts form dense clusters with unusual connection patterns.",
    "resources": [
      {
        "url": "https://www.hellointerview.com/learn/ml-system-design/problem-breakdowns/bot-detection",
        "label": "HelloInterview — Bot/Fake Account Detection"
      },
      {
        "url": "https://eugeneyan.com/writing/content-moderation/",
        "label": "Eugene Yan — Fraud & Anomaly Detection"
      },
      {
        "url": "https://engineering.fb.com/",
        "label": "Meta Engineering — Fake Account Systems"
      }
    ],
    "diagramTitle": "Fake Account Detection",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Account"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Profile",
        "subtitle": "features"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "Behavior",
        "subtitle": "patterns"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "Graph",
        "subtitle": "clusters"
      },
      {
        "id": "n4",
        "type": "decision",
        "label": "Score"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 14,
    "slug": "design-sentiment-analysis-system",
    "title": "Design Sentiment Analysis System",
    "difficulty": "Medium",
    "frequency": "Medium",
    "tags": [
      "NLP classification",
      "Transfer learning",
      "Multi-language"
    ],
    "companies": [
      "Amazon",
      "Apple",
      "Google"
    ],
    "answer": "BERT/RoBERTa fine-tuned on labeled sentiment data. Handle: sarcasm, negation, multi-language (multilingual BERT or per-language models). Aspect-based sentiment (separate sentiment per product feature). Scale: batch processing for historical + real-time for new reviews via Kafka. Active learning to improve on domain-specific edge cases.",
    "resources": [
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: NLP Classification"
      },
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems Design (NLP Ch.)"
      },
      {
        "url": "https://bytebytego.com/courses/machine-learning-system-design-interview",
        "label": "ByteByteGo — ML SD: NLP Systems"
      }
    ],
    "diagramTitle": "Sentiment Analysis",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Text"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "BERT",
        "subtitle": "fine-tuned"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "Sentiment",
        "subtitle": "±neutral"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "Aspect-level"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 15,
    "slug": "design-machine-translation-system",
    "title": "Design Machine Translation System",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "Seq2Seq",
      "Transformer",
      "Beam search",
      "BLEU"
    ],
    "companies": [
      "Google",
      "Meta",
      "Apple",
      "Amazon"
    ],
    "answer": "Encoder-decoder Transformer. Train on parallel corpus (millions of sentence pairs). Byte-pair encoding (BPE) tokenization handles rare words. Beam search decoding with length penalty. Quality estimation model for confidence scoring. Handle low-resource languages: transfer learning from high-resource + back-translation for data augmentation. Evaluate: BLEU, COMET, human evaluation. Serve: quantized model, batched inference.",
    "resources": [
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: NLP/Translation"
      },
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems Design (Seq2Seq)"
      },
      {
        "url": "https://eugeneyan.com/writing/search-query-matching/",
        "label": "Eugene Yan — NLP Matching Techniques"
      }
    ],
    "diagramTitle": "Machine Translation",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Source"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Encoder",
        "subtitle": "Transformer"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Decoder",
        "subtitle": "beam search"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "Target"
      },
      {
        "id": "n4",
        "type": "decision",
        "label": "BLEU/COMET"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 16,
    "slug": "design-spotify-discover-weekly",
    "title": "Design Spotify Discover Weekly",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Collaborative filtering",
      "Content features",
      "Audio embeddings"
    ],
    "companies": [
      "Spotify",
      "Apple",
      "Amazon"
    ],
    "answer": "Hybrid approach: collaborative filtering (users with similar listening history) + content-based (audio features via CNN on spectrograms, genre, mood, tempo) + NLP on lyrics/descriptions. Matrix factorization for user-song embeddings. Negative sampling from songs user skipped. Diversity injection: don't make all 30 songs same genre. Evaluate: discovery rate (% of new artists), skip rate, save rate, long-term retention.",
    "resources": [
      {
        "url": "https://engineering.atspotify.com/",
        "label": "Spotify Engineering — Discover Weekly"
      },
      {
        "url": "https://eugeneyan.com/writing/system-design-for-discovery/",
        "label": "Eugene Yan — Discovery System Design"
      },
      {
        "url": "https://eugeneyan.com/writing/bandits/",
        "label": "Eugene Yan — Bandits for RecSys"
      }
    ],
    "diagramTitle": "Spotify Discover Weekly",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Listen History"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "CF",
        "subtitle": "similar users"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Audio CNN",
        "subtitle": "spectrogram"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "NLP",
        "subtitle": "lyrics"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "30 Songs"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 17,
    "slug": "design-image-auto-tagging-instagramgoogle-photos",
    "title": "Design Image Auto-tagging (Instagram/Google Photos)",
    "difficulty": "Medium",
    "frequency": "Medium",
    "tags": [
      "Multi-label classification",
      "Object detection",
      "Efficiency"
    ],
    "companies": [
      "Google",
      "Meta",
      "Apple"
    ],
    "answer": "Multi-label classification: ResNet/EfficientNet backbone → multi-label sigmoid heads. Object detection (YOLO/DETR) for scene understanding. Face recognition (with user consent) for people tagging. On-device inference for privacy (Core ML / TFLite). Hierarchical taxonomy: animal → dog → golden retriever. Handle: millions of images/day, serve tags in <100ms. Active learning on images where model is uncertain.",
    "resources": [
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Vision Models"
      },
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems Design (CV Ch.)"
      },
      {
        "url": "https://bytebytego.com/courses/machine-learning-system-design-interview",
        "label": "ByteByteGo — ML SD: Image Classification"
      }
    ],
    "diagramTitle": "Image Tagging",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Image"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "ResNet",
        "subtitle": "multi-label"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "YOLO",
        "subtitle": "object det"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "Tags",
        "subtitle": "hierarchical"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 18,
    "slug": "design-ride-matching-driver-rider-matching",
    "title": "Design Ride-Matching / Driver-Rider Matching",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Bipartite matching",
      "Real-time optimization",
      "Spatial indexing"
    ],
    "companies": [
      "Uber",
      "Lyft",
      "Grab",
      "DoorDash"
    ],
    "answer": "Real-time bipartite matching: riders to drivers. Objective: minimize global wait time (not greedy per-rider). Features: distance, ETA, driver rating, rider destination alignment (batch rides), surge area. Geospatial indexing (H3/geohash) for fast nearest-driver queries. Re-optimize as new requests arrive (rolling optimization window). Handle: driver cancellations, peak demand, fair distribution of rides to drivers.",
    "resources": [
      {
        "url": "https://eng.uber.com/h3/",
        "label": "Uber Engineering — Geospatial Matching"
      },
      {
        "url": "https://bytebytego.com/courses/machine-learning-system-design-interview",
        "label": "ByteByteGo — ML SD: Matching Systems"
      },
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Optimization"
      }
    ],
    "diagramTitle": "Ride Matching",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Riders"
      },
      {
        "id": "n1",
        "type": "decision",
        "label": "Bipartite Match",
        "subtitle": "minimize wait"
      },
      {
        "id": "n2",
        "type": "client",
        "label": "Drivers"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "H3 Index",
        "subtitle": "geospatial"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 19,
    "slug": "design-dynamic-pricing-surge-pricing",
    "title": "Design Dynamic Pricing / Surge Pricing",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "Supply-demand modeling",
      "Causal inference",
      "Real-time optimization"
    ],
    "companies": [
      "Uber",
      "Amazon",
      "Airlines"
    ],
    "answer": "Model supply (available drivers/inventory) and demand (ride requests/purchases) per zone per time window. Price elasticity estimation via causal methods. ML model predicts optimal price multiplier to balance supply-demand. Constraints: maximum surge cap, fairness across neighborhoods, regulatory compliance. A/B test carefully — pricing experiments are high-stakes. Real-time feature pipeline via Flink/Kafka.",
    "resources": [
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Pricing/Causal"
      },
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems Design (Pricing)"
      },
      {
        "url": "https://eugeneyan.com/writing/bandits/",
        "label": "Eugene Yan — Bandits (Explore-Exploit)"
      }
    ],
    "diagramTitle": "Surge Pricing",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "warning",
        "label": "Demand",
        "subtitle": "requests"
      },
      {
        "id": "n1",
        "type": "success",
        "label": "Supply",
        "subtitle": "drivers"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "Multiplier",
        "subtitle": "per zone"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Price"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 20,
    "slug": "design-ab-testing-platform-for-ml-models",
    "title": "Design A/B Testing Platform for ML Models",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Statistical significance",
      "Multi-armed bandits",
      "Guardrail metrics"
    ],
    "companies": [
      "Netflix",
      "Google",
      "Meta",
      "Amazon"
    ],
    "answer": "Experiment assignment: deterministic hash(userId, experimentId) mod 100. Track both primary metrics (CTR, revenue) and guardrail metrics (latency, crash rate). Statistical framework: fixed-horizon (t-test, z-test) or sequential testing (always-valid p-values). Handle: novelty effects (new model always gets more clicks initially), interference between experiments (layered experiment system). Multi-armed bandits for faster convergence. Shadow mode: new model runs in parallel, compare offline before live traffic.",
    "resources": [
      {
        "url": "https://netflixtechblog.com/",
        "label": "Netflix Tech Blog — A/B Testing"
      },
      {
        "url": "https://www.hellointerview.com/learn/ml-system-design/core-concepts/evaluation",
        "label": "HelloInterview — ML Evaluation & A/B Testing"
      },
      {
        "url": "https://eugeneyan.com/writing/counterfactual-evaluation/",
        "label": "Eugene Yan — Counterfactual Evaluation"
      }
    ],
    "diagramTitle": "A/B Testing for ML",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "User"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Hash",
        "subtitle": "assign"
      },
      {
        "id": "n2",
        "type": "success",
        "label": "Control",
        "subtitle": "model A"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Treatment",
        "subtitle": "model B"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Primary"
      },
      {
        "id": "n5",
        "type": "warning",
        "label": "Guardrails"
      },
      {
        "id": "n6",
        "type": "decision",
        "label": "Sig",
        "subtitle": "p<0.05"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 21,
    "slug": "design-news-feed-ranking-facebooklinkedin",
    "title": "Design News Feed Ranking (Facebook/LinkedIn)",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "Multi-objective ranking",
      "Feature interactions",
      "Real-time signals"
    ],
    "companies": [
      "Meta",
      "LinkedIn",
      "Twitter/X"
    ],
    "answer": "Predict P(like), P(comment), P(share), P(hide) for each candidate post. Combine into composite score: w1*P(like) + w2*P(comment) + w3*P(share) - w4*P(hide). Deep model with user-post interaction features. Real-time signals: trending topics, breaking news boost. Diversity: don't show 5 posts from same friend. Anti-clickbait: penalize engagement-bait. Recency decay. Content type mixing (photos, videos, articles).",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/system-design-for-discovery/",
        "label": "Eugene Yan — Feed Ranking Architecture"
      },
      {
        "url": "https://engineering.fb.com/",
        "label": "Meta Engineering — News Feed Ranking"
      },
      {
        "url": "https://www.hellointerview.com/learn/ml-system-design/problem-breakdowns/video-recommendations",
        "label": "HelloInterview — Ranking Models"
      }
    ],
    "diagramTitle": "Feed Ranking",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Posts"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "P(like)"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "P(comment)"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "P(share)"
      },
      {
        "id": "n4",
        "type": "warning",
        "label": "P(hide)"
      },
      {
        "id": "n5",
        "type": "success",
        "label": "Score"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 22,
    "slug": "design-autocomplete-query-suggestion",
    "title": "Design Autocomplete / Query Suggestion",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Language model",
      "Trie + ML",
      "Personalization"
    ],
    "companies": [
      "Google",
      "Amazon",
      "LinkedIn"
    ],
    "answer": "Combine trie-based prefix matching with ML ranking. Candidates from: popular queries matching prefix, user's past queries, trending queries. ML ranker scores by: query frequency, user personalization, recency, query quality. Features: prefix match position, character edit distance, user's search history similarity. Serve <50ms. Filter: remove offensive, low-quality suggestions. Personalization layer: boost queries related to user's interests.",
    "resources": [
      {
        "url": "https://bytebytego.com/courses/system-design-interview/design-a-search-autocomplete-system",
        "label": "ByteByteGo — Autocomplete (Alex Xu Ch.)"
      },
      {
        "url": "https://eugeneyan.com/writing/search-query-matching/",
        "label": "Eugene Yan — Query Suggestion Patterns"
      },
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Autocomplete"
      }
    ],
    "diagramTitle": "Autocomplete ML",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Prefix"
      },
      {
        "id": "n1",
        "type": "database",
        "label": "Trie",
        "subtitle": "candidates"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "ML Ranker",
        "subtitle": "personalized"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "Top 5"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 23,
    "slug": "design-airbnb-booking-search-ranking",
    "title": "Design Airbnb / Booking Search Ranking",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "Multi-stakeholder optimization",
      "Position bias",
      "Cold-start listings"
    ],
    "companies": [
      "Airbnb",
      "Booking.com",
      "Expedia"
    ],
    "answer": "Three-sided marketplace: optimize for guest satisfaction + host earnings + platform revenue. Learning-to-rank with GBDT. Features: price competitiveness, location score, reviews, response rate, cancellation rate, availability calendar, photos quality. Handle: cold-start for new listings (content features + neighborhood average), position bias debiasing (IPW), diversity (don't show all apartments on same street).",
    "resources": [
      {
        "url": "https://medium.com/airbnb-engineering",
        "label": "Airbnb Engineering — Search Ranking ML"
      },
      {
        "url": "https://eugeneyan.com/writing/system-design-for-discovery/",
        "label": "Eugene Yan — Marketplace RecSys Design"
      },
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Marketplace"
      }
    ],
    "diagramTitle": "Airbnb Search Ranking",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Search"
      },
      {
        "id": "n1",
        "type": "decision",
        "label": "GBDT L2R"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Guest Sat"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Host Rev"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Platform"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 24,
    "slug": "design-text-to-speech-system",
    "title": "Design Text-to-Speech System",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "Tacotron/VITS",
      "Vocoder",
      "Speaker embedding"
    ],
    "companies": [
      "Google",
      "Apple",
      "Amazon",
      "Meta"
    ],
    "answer": "Two-stage: text → mel spectrogram (Tacotron2 / VITS) → waveform (HiFi-GAN vocoder). Handle prosody, emphasis, pauses from punctuation. Multi-speaker: condition on speaker embedding vector. Fine-tune for custom voices with minimal data (few-shot voice cloning). On-device for privacy (Core ML on iPhone). Evaluate: MOS (Mean Opinion Score), naturalness, intelligibility.",
    "resources": [
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Speech/Audio"
      },
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems Design (Audio)"
      },
      {
        "url": "https://bytebytego.com/courses/machine-learning-system-design-interview",
        "label": "ByteByteGo — ML SD: TTS Systems"
      }
    ],
    "diagramTitle": "Text-to-Speech",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Text"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Tacotron",
        "subtitle": "mel spec"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "HiFi-GAN",
        "subtitle": "vocoder"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "Audio"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 25,
    "slug": "design-speech-recognition-asr-system",
    "title": "Design Speech Recognition / ASR System",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "CTC loss",
      "Attention-based",
      "Streaming inference"
    ],
    "companies": [
      "Google",
      "Apple",
      "Amazon(Alexa)"
    ],
    "answer": "End-to-end: audio → mel spectrogram → encoder (Conformer) → decoder (CTC or attention-based). Streaming: chunk-based processing for real-time transcription. Language model fusion for improved accuracy. Handle: accents, background noise, domain-specific vocabulary. On-device for privacy. Evaluate: WER (Word Error Rate). Active learning: uncertain transcriptions sent for human review to improve model.",
    "resources": [
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: ASR Systems"
      },
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems Design (ASR Ch.)"
      },
      {
        "url": "https://bytebytego.com/courses/machine-learning-system-design-interview",
        "label": "ByteByteGo — ML SD: Speech Recognition"
      }
    ],
    "diagramTitle": "Speech Recognition",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Audio"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Mel Spec"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Conformer",
        "subtitle": "encoder"
      },
      {
        "id": "n3",
        "type": "decision",
        "label": "CTC Decode"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Text"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 26,
    "slug": "design-entity-resolution-deduplication-system",
    "title": "Design Entity Resolution / Deduplication System",
    "difficulty": "Medium",
    "frequency": "Medium",
    "tags": [
      "Record linkage",
      "Blocking strategies",
      "Active learning"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Salesforce"
    ],
    "answer": "Find duplicate records across datasets without unique IDs. Blocking: reduce O(n²) comparisons using LSH or attribute-based blocking. Pairwise similarity: combine string similarity (Jaro-Winkler), phonetic (Soundex), embedding similarity. ML classifier: train on labeled pairs (match/non-match). Active learning for efficient labeling. Transitive closure for cluster merging. Handle: typos, abbreviations, missing fields.",
    "resources": [
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Entity Resolution"
      },
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems (Data Quality)"
      },
      {
        "url": "https://eugeneyan.com/writing/bootstrapping-data-labels/",
        "label": "Eugene Yan — Bootstrapping Labels"
      }
    ],
    "diagramTitle": "Entity Resolution",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Records"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Blocking",
        "subtitle": "LSH"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "Pairwise Sim",
        "subtitle": "Jaro-Winkler"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "ML Classify",
        "subtitle": "match/not"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 27,
    "slug": "design-ad-conversion-prediction",
    "title": "Design Ad Conversion Prediction",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Delayed feedback",
      "Multi-touch attribution",
      "Calibration"
    ],
    "companies": [
      "Meta",
      "Google",
      "Amazon"
    ],
    "answer": "Predict P(purchase | ad click). Challenge: delayed conversions (user clicks today, buys 7 days later). Importance-weighted loss or waiting window approach. Multi-touch attribution: which ad in the user's journey gets credit? Features: ad creative, user history, browsing behavior post-click. Calibration is critical for bidding. Handle data freshness vs label completeness tradeoff.",
    "resources": [
      {
        "url": "https://www.trybackprop.com/blog/11_real_ml_interview_questions_asked_at_faang",
        "label": "Backprop — Real FAANG ML Qs (Conversion)"
      },
      {
        "url": "https://bytebytego.com/courses/machine-learning-system-design-interview",
        "label": "ByteByteGo — ML SD: Ad Conversion Ch."
      },
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Delayed Labels"
      }
    ],
    "diagramTitle": "Ad Conversion Prediction",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Click"
      },
      {
        "id": "n1",
        "type": "warning",
        "label": "Purchase?",
        "subtitle": "delayed label"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Model",
        "subtitle": "importance-weighted"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "P(convert)"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 28,
    "slug": "design-food-delivery-eta-prediction",
    "title": "Design Food Delivery ETA Prediction",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Multi-component ETA",
      "Real-time features",
      "Uncertainty estimation"
    ],
    "companies": [
      "DoorDash",
      "Uber",
      "Eats",
      "Swiggy",
      "Zomato"
    ],
    "answer": "Total ETA = restaurant prep time + driver travel time + pickup/dropoff overhead. Each component modeled separately. Restaurant prep: depends on order complexity, current queue, restaurant speed history. Travel: same as ride ETA but with stops. Real-time signals: restaurant confirmation, order status. Predict distribution (not point estimate) for customer-facing confidence intervals.",
    "resources": [
      {
        "url": "https://doordash.engineering/",
        "label": "DoorDash Engineering — ETA Prediction"
      },
      {
        "url": "https://bytebytego.com/courses/machine-learning-system-design-interview",
        "label": "ByteByteGo — ML SD: ETA Systems"
      },
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Forecasting"
      }
    ],
    "diagramTitle": "Delivery ETA",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Order"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Prep Time",
        "subtitle": "restaurant"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "Travel Time",
        "subtitle": "road model"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Overhead"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Total ETA"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 29,
    "slug": "design-content-quality-scoring",
    "title": "Design Content Quality Scoring",
    "difficulty": "Medium",
    "frequency": "Medium",
    "tags": [
      "Quality metrics",
      "Multi-signal fusion",
      "Human-AI alignment"
    ],
    "companies": [
      "Google(Search)",
      "Meta",
      "LinkedIn"
    ],
    "answer": "Score content quality for ranking: originality, depth, expertise, trustworthiness (E-E-A-T for Google). Signals: text quality (grammar, readability), engagement metrics, author authority, citation quality, factual accuracy checks. Combine ML scores with rule-based quality signals. Calibrate against human raters. Handle gaming: adversarial content optimized for the scoring model.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/content-moderation/",
        "label": "Eugene Yan — Content Quality Patterns"
      },
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems (Quality)"
      },
      {
        "url": "https://www.hellointerview.com/learn/ml-system-design/problem-breakdowns/harmful-content",
        "label": "HelloInterview — Content Classification"
      }
    ],
    "diagramTitle": "Content Quality Scoring",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Content"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Text Quality"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "Engagement"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "Authority",
        "subtitle": "E-E-A-T"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Quality Score"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 30,
    "slug": "design-user-churn-prediction",
    "title": "Design User Churn Prediction",
    "difficulty": "Medium",
    "frequency": "Medium",
    "tags": [
      "Survival analysis",
      "Feature engineering",
      "Actionable predictions"
    ],
    "companies": [
      "Netflix",
      "Spotify",
      "Amazon",
      "SaaS"
    ],
    "answer": "Predict P(churn in next 30 days). Features: engagement trend (declining login frequency), usage patterns, billing issues, support tickets, competitor activity. Survival analysis (Cox proportional hazards) or binary classification with time-windowed labels. Key: make predictions actionable — segment users by churn reason to trigger different retention interventions (discount, feature education, re-engagement campaign).",
    "resources": [
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Churn Prediction"
      },
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems (Forecasting)"
      },
      {
        "url": "https://bytebytego.com/courses/machine-learning-system-design-interview",
        "label": "ByteByteGo — ML SD: User Modeling"
      }
    ],
    "diagramTitle": "Churn Prediction",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "User"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Features",
        "subtitle": "engagement trend"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "Survival Model",
        "subtitle": "P(churn 30d)"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Intervention",
        "subtitle": "retention action"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 31,
    "slug": "design-a-rag-system-for-enterprise-documents",
    "title": "Design a RAG System for Enterprise Documents",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "Chunking strategies",
      "Hybrid search",
      "Reranking",
      "Vector DB"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Meta",
      "Anthropic",
      "Cohere"
    ],
    "answer": "**Pipeline**: Document ingestion → chunking (recursive, semantic, or sliding window) → embedding (OpenAI ada-002 / Cohere embed) → store in vector DB (Pinecone/Qdrant/Weaviate). **Retrieval**: Hybrid search (BM25 sparse + dense vector) merged via Reciprocal Rank Fusion. Cross-encoder reranker for top-K precision. **Generation**: Retrieved chunks injected as context → LLM generates grounded answer with citations. **Key decisions**: chunk size (512-1024 tokens), overlap (10-20%), metadata filtering, conflict resolution across contradictory sources.",
    "resources": [
      {
        "url": "https://www.datacamp.com/blog/rag-interview-questions",
        "label": "DataCamp — 30 RAG Interview Questions"
      },
      {
        "url": "https://www.systemdesignhandbook.com/guides/generative-ai-system-design-interview/",
        "label": "System Design Handbook — GenAI RAG Guide"
      },
      {
        "url": "https://github.com/KalyanKS-NLP/RAG-Interview-Questions-and-Answers-Hub",
        "label": "GitHub — RAG Interview Q&A Hub"
      }
    ],
    "diagramTitle": "RAG Pipeline",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Docs"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Chunk",
        "subtitle": "recursive"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Embed",
        "subtitle": "ada-002"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "Vector DB",
        "subtitle": "Pinecone"
      },
      {
        "id": "n4",
        "type": "client",
        "label": "Query"
      },
      {
        "id": "n5",
        "type": "service",
        "label": "Hybrid Search",
        "subtitle": "BM25+dense"
      },
      {
        "id": "n6",
        "type": "decision",
        "label": "Reranker",
        "subtitle": "cross-encoder"
      },
      {
        "id": "n7",
        "type": "success",
        "label": "LLM",
        "subtitle": "+ citations"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 32,
    "slug": "design-a-graphrag-system",
    "title": "Design a GraphRAG System",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Knowledge graphs",
      "Entity extraction",
      "Graph traversal + LLM"
    ],
    "companies": [
      "Google",
      "Microsoft",
      "Amazon"
    ],
    "answer": "**Why GraphRAG**: Standard RAG fails on multi-hop reasoning ('Which company's CEO also serves on board of X?'). GraphRAG combines knowledge graph traversal with LLM generation. **Pipeline**: Documents → entity/relation extraction (NER + RE models or LLM) → build knowledge graph (Neo4j/Neptune) → query decomposition → graph traversal for relevant subgraph → LLM generates from graph context. **Advantages**: handles multi-hop, better for structured relationships, reduces hallucination. **Challenges**: graph construction quality, entity resolution, keeping graph updated.",
    "resources": [
      {
        "url": "https://www.datacamp.com/blog/rag-interview-questions",
        "label": "DataCamp — RAG Questions (GraphRAG section)"
      },
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (RAG + Graphs)"
      },
      {
        "url": "https://www.systemdesignhandbook.com/guides/generative-ai-system-design-interview/",
        "label": "System Design Handbook — GenAI"
      }
    ],
    "diagramTitle": "GraphRAG",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Docs"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "NER + RE",
        "subtitle": "extract"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "Knowledge Graph",
        "subtitle": "Neo4j"
      },
      {
        "id": "n3",
        "type": "client",
        "label": "Query"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Decompose"
      },
      {
        "id": "n5",
        "type": "service",
        "label": "Graph Traverse",
        "subtitle": "subgraph"
      },
      {
        "id": "n6",
        "type": "success",
        "label": "LLM",
        "subtitle": "grounded"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 33,
    "slug": "design-an-ai-chatbot-chatgpt-like",
    "title": "Design an AI Chatbot (ChatGPT-like)",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "LLM serving",
      "Streaming (SSE)",
      "Conversation management",
      "Token budgets"
    ],
    "companies": [
      "OpenAI",
      "Google",
      "Anthropic",
      "Meta"
    ],
    "answer": "**Serving**: GPU cluster with continuous batching (vLLM/TGI). Stream tokens via SSE. **Conversation**: Store full history, but manage context window — summarize older turns when approaching limit. **Multi-turn**: Each request sends full conversation (or summary + recent turns). Token counting for pricing/limits. **Safety**: Input classifier (prompt injection, jailbreak detection) → LLM → output filter (toxicity, PII). Rate limiting per user. Priority queuing (paid > free). **Evaluation**: human preference ratings, RLHF/DPO alignment.",
    "resources": [
      {
        "url": "https://igotanoffer.com/en/advice/generative-ai-system-design-interview",
        "label": "IGotAnOffer — GenAI System Design (Chatbot)"
      },
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Serving)"
      },
      {
        "url": "https://skphd.medium.com/llm-system-design-interview-questions-and-answers-2a7a16212492",
        "label": "Medium — LLM System Design Q&A"
      }
    ],
    "diagramTitle": "AI Chatbot — ChatGPT",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "User"
      },
      {
        "id": "n1",
        "type": "warning",
        "label": "Input Filter",
        "subtitle": "injection"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "GPU",
        "subtitle": "vLLM batch"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "Stream Tokens"
      },
      {
        "id": "n4",
        "type": "database",
        "label": "Conv History"
      },
      {
        "id": "n5",
        "type": "warning",
        "label": "Token Budget"
      },
      {
        "id": "n6",
        "type": "warning",
        "label": "Output Filter",
        "subtitle": "safety"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 34,
    "slug": "design-an-autonomous-ai-agent",
    "title": "Design an Autonomous AI Agent",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "ReAct pattern",
      "Tool use",
      "Loop detection",
      "State management"
    ],
    "companies": [
      "Google",
      "OpenAI",
      "Anthropic",
      "Salesforce"
    ],
    "answer": "**Agent loop**: Observe (get user task + context) → Think (LLM reasons about next step) → Act (call tool/API) → Observe result → repeat until task done. **Patterns**: ReAct (interleaved reasoning + action), Plan-and-Execute (plan all steps first, then execute). **Tool interface**: function calling with typed schemas. **Safety**: loop detection (max steps, state hashing), irreversible action confirmation, sandboxed execution. **State**: maintain scratchpad of intermediate results. **Error handling**: retry with backoff, fallback to simpler approach, human escalation.",
    "resources": [
      {
        "url": "https://www.datacamp.com/blog/agentic-ai-interview-questions",
        "label": "DataCamp — Agentic AI Interview Questions"
      },
      {
        "url": "https://www.analyticsvidhya.com/blog/2025/05/ai-agent-interview-questions/",
        "label": "Analytics Vidhya — AI Agent Interview Q&A"
      },
      {
        "url": "https://github.com/amitshekhariitbhu/ai-engineering-interview-questions",
        "label": "GitHub — AI Engineering Interview Qs (200+)"
      }
    ],
    "diagramTitle": "AI Agent — Autonomous",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Task"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Think",
        "subtitle": "LLM reason"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "Act",
        "subtitle": "call tool"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "Observe",
        "subtitle": "result"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Think"
      },
      {
        "id": "n5",
        "type": "warning",
        "label": "Max steps"
      },
      {
        "id": "n6",
        "type": "warning",
        "label": "Confirm irreversible"
      },
      {
        "id": "n7",
        "type": "service",
        "label": "Fallback",
        "subtitle": "human"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 35,
    "slug": "design-a-multi-agent-system-a2a-protocol",
    "title": "Design a Multi-Agent System (A2A Protocol)",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Agent-to-agent communication",
      "Task delegation",
      "Agent discovery"
    ],
    "companies": [
      "Google",
      "Anthropic",
      "Microsoft",
      "Salesforce"
    ],
    "answer": "**Architecture**: Orchestrator agent decomposes complex task into subtasks → delegates to specialist agents (research agent, code agent, data agent) via A2A protocol. **A2A**: Google's Agent-to-Agent protocol — agents publish Agent Cards (capability descriptions), discover each other, communicate via structured messages. **Patterns**: hierarchical (orchestrator + workers), peer-to-peer (agents negotiate), blackboard (shared workspace). **Challenges**: deadlock prevention, result aggregation, error propagation, cost control (each agent call costs tokens).",
    "resources": [
      {
        "url": "https://skphd.medium.com/a2a-vs-mcp-interview-questions-and-answers-dc08bc3c0787",
        "label": "Medium — A2A vs MCP Interview Q&A"
      },
      {
        "url": "https://www.datacamp.com/blog/agentic-ai-interview-questions",
        "label": "DataCamp — Agentic AI (Multi-Agent)"
      },
      {
        "url": "https://www.geeksforgeeks.org/artificial-intelligence/top-agentic-ai-interview-questions-and-answers/",
        "label": "GeeksforGeeks — Agentic AI Q&A"
      }
    ],
    "diagramTitle": "Multi-Agent — A2A",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "service",
        "label": "Orchestrator"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Research Agent"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Code Agent"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Data Agent"
      },
      {
        "id": "n4",
        "type": "database",
        "label": "Agent Cards",
        "subtitle": "capabilities"
      },
      {
        "id": "n5",
        "type": "queue",
        "label": "Messages",
        "subtitle": "structured"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 36,
    "slug": "design-mcp-server-architecture",
    "title": "Design MCP Server Architecture",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "Model Context Protocol",
      "Tool standardization",
      "JSON-RPC 2.0"
    ],
    "companies": [
      "Anthropic",
      "OpenAI",
      "Microsoft",
      "Google"
    ],
    "answer": "**MCP = 'USB-C for AI'**: Standardizes how LLMs connect to external tools/data sources. Server exposes tools, resources, and prompts via JSON-RPC 2.0. **Architecture**: MCP Host (Claude/GPT) ↔ MCP Client (SDK) ↔ MCP Server (your tool). Servers are stateless, lightweight. **Design decisions**: tool schema design (clear descriptions for LLM), auth (OAuth 2.1 in MCP v2), error handling, rate limiting per tool. **vs A2A**: MCP is vertical (model→tool), A2A is horizontal (agent→agent). Both are Linux Foundation projects.",
    "resources": [
      {
        "url": "https://skphd.medium.com/a2a-vs-mcp-interview-questions-and-answers-dc08bc3c0787",
        "label": "Medium — MCP vs A2A Deep Comparison"
      },
      {
        "url": "https://www.geeksforgeeks.org/artificial-intelligence/model-context-protocol-mcp/",
        "label": "GeeksforGeeks — Model Context Protocol"
      },
      {
        "url": "https://www.systemdesignhandbook.com/guides/generative-ai-system-design-interview/",
        "label": "System Design Handbook — GenAI (MCP)"
      }
    ],
    "diagramTitle": "MCP Server Architecture",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "service",
        "label": "LLM Host",
        "subtitle": "Claude/GPT"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "MCP Client",
        "subtitle": "SDK"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "MCP Server",
        "subtitle": "your tool"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Tools"
      },
      {
        "id": "n4",
        "type": "database",
        "label": "Resources"
      },
      {
        "id": "n5",
        "type": "service",
        "label": "Prompts"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 37,
    "slug": "design-a-fault-tolerant-ai-agent",
    "title": "Design a Fault-Tolerant AI Agent",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Retry/backoff",
      "Circuit breaker",
      "Checkpointing",
      "Fallback chains"
    ],
    "companies": [
      "Google",
      "Anthropic",
      "Amazon",
      "OpenAI"
    ],
    "answer": "**Failure modes**: LLM timeout, tool API failure, malformed output, infinite loops, context overflow. **Resilience patterns**: (1) Retry with exponential backoff + jitter for transient failures, (2) Circuit breaker for repeatedly failing tools, (3) State checkpointing — save agent state every N steps, resume from checkpoint on crash, (4) Fallback chain: GPT-4 → Claude → smaller model → cached response → human escalation. **Loop prevention**: max step count, state hash dedup (detect repeated states), cost budget (max $X per task). **Graceful degradation**: partial results with explanation > total failure.",
    "resources": [
      {
        "url": "https://www.datacamp.com/blog/agentic-ai-interview-questions",
        "label": "DataCamp — Agentic AI (Fault Tolerance)"
      },
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Guardrails)"
      },
      {
        "url": "https://github.com/amitshekhariitbhu/ai-engineering-interview-questions",
        "label": "GitHub — AI Engineering Qs (Reliability)"
      }
    ],
    "diagramTitle": "Fault-Tolerant Agent",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Agent Step"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Try",
        "subtitle": "primary"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "Retry",
        "subtitle": "exp backoff"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Fallback",
        "subtitle": "smaller model"
      },
      {
        "id": "n4",
        "type": "client",
        "label": "Human",
        "subtitle": "escalate"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 38,
    "slug": "design-token-optimization-context-window-management",
    "title": "Design Token Optimization / Context Window Management",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Prompt compression",
      "Sliding window",
      "Hierarchical summarization",
      "KV cache"
    ],
    "companies": [
      "OpenAI",
      "Google",
      "Anthropic",
      "All",
      "AI",
      "startups"
    ],
    "answer": "**Strategies**: (1) Prompt trimming — remove boilerplate, compress system prompts, use shorter variable names. (2) Sliding window — keep last N turns verbatim, summarize older turns. (3) Hierarchical summarization — create summaries at multiple granularities. (4) Selective retrieval — only inject relevant context chunks, not everything. (5) Prompt caching — cache common prefixes (Anthropic's prompt caching saves 90% on repeated system prompts). **KV cache management**: cache attention key-value pairs for repeated prefixes. Token-level cost tracking per request for billing. Monitor: tokens_in/tokens_out ratio, cost per conversation.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Caching/Tokens)"
      },
      {
        "url": "https://skphd.medium.com/llm-system-design-interview-questions-and-answers-2a7a16212492",
        "label": "Medium — LLM System Design (Context Mgmt)"
      },
      {
        "url": "https://www.systemdesignhandbook.com/guides/generative-ai-system-design-interview/",
        "label": "System Design Handbook — GenAI (Tokens)"
      }
    ],
    "diagramTitle": "Token Optimization",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Long Conv"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Summarize",
        "subtitle": "older turns"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Recent",
        "subtitle": "verbatim"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "Fits context"
      },
      {
        "id": "n4",
        "type": "cache",
        "label": "Prompt cache",
        "subtitle": "90% savings"
      },
      {
        "id": "n5",
        "type": "service",
        "label": "Selective RAG",
        "subtitle": "relevant chunks only"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 39,
    "slug": "design-short-term-and-long-term-memory-for-ai-agents",
    "title": "Design Short-term and Long-term Memory for AI Agents",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Memory tiers",
      "Episodic memory",
      "Semantic memory",
      "Memory retrieval"
    ],
    "companies": [
      "OpenAI",
      "Anthropic",
      "Google",
      "Startups"
    ],
    "answer": "**Memory tiers**: (1) Working memory — current conversation context (in-context tokens). (2) Short-term buffer — recent interactions stored in Redis, decays with time. (3) Long-term episodic — past conversations/actions stored in vector DB, retrieved by semantic similarity. (4) Long-term semantic — extracted facts/preferences stored as structured data (user likes X, user's timezone is Y). **Memory management**: importance scoring (save significant events, discard small talk), consolidation (periodic summarization of episodes into facts), forgetting (TTL-based expiry, relevance decay). **Retrieval**: query memory with current context embedding, inject relevant memories into prompt.",
    "resources": [
      {
        "url": "https://www.datacamp.com/blog/agentic-ai-interview-questions",
        "label": "DataCamp — Agentic AI (Memory Design)"
      },
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Memory)"
      },
      {
        "url": "https://github.com/amitshekhariitbhu/ai-engineering-interview-questions",
        "label": "GitHub — AI Engineering (Agent Memory)"
      }
    ],
    "diagramTitle": "Agent Memory Tiers",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "service",
        "label": "Working",
        "subtitle": "in-context"
      },
      {
        "id": "n1",
        "type": "cache",
        "label": "Short-term",
        "subtitle": "Redis buffer"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "Episodic",
        "subtitle": "vector DB"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "Semantic",
        "subtitle": "structured facts"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 40,
    "slug": "design-llm-personalization-system",
    "title": "Design LLM Personalization System",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "User preference learning",
      "Profile embeddings",
      "Dynamic system prompts"
    ],
    "companies": [
      "Google",
      "Anthropic",
      "OpenAI",
      "Amazon"
    ],
    "answer": "**Levels**: (1) Explicit preferences — user sets tone, verbosity, expertise level. (2) Implicit learning — infer preferences from interaction patterns (thumbs up/down, edits, re-asks). (3) Context-aware — adapt based on user's role, industry, recent topics. **Implementation**: User profile as structured JSON → injected into system prompt. Profile updated after each conversation via extraction (LLM-as-judge: 'what did we learn about this user?'). Long-term: embedding-based user representation updated incrementally. **Privacy**: on-device preference storage, opt-in/opt-out, data retention policies.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/personalization/",
        "label": "Eugene Yan — Patterns for Personalization"
      },
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (User Context)"
      },
      {
        "url": "https://igotanoffer.com/en/advice/generative-ai-system-design-interview",
        "label": "IGotAnOffer — GenAI (Personalization)"
      }
    ],
    "diagramTitle": "LLM Personalization",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Interactions"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Extract",
        "subtitle": "LLM-as-judge"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "User Profile",
        "subtitle": "structured JSON"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "System Prompt",
        "subtitle": "personalized"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 41,
    "slug": "design-an-llm-gateway-model-router",
    "title": "Design an LLM Gateway / Model Router",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Semantic routing",
      "Cost optimization",
      "Failover"
    ],
    "companies": [
      "OpenAI",
      "Google",
      "Amazon(Bedrock)"
    ],
    "answer": "Route requests to different models based on complexity, cost, latency. Semantic classifier determines query difficulty → simple queries to cheap/fast model (Haiku), complex to expensive (Opus). Failover: if primary model fails, cascade to backup. Token-based rate limiting per user. Semantic caching: if similar query was answered recently, return cached response. Tools: LiteLLM, Portkey, Helicone.",
    "resources": [
      {
        "url": "https://www.helicone.ai/blog/top-llm-gateways-comparison-2025",
        "label": "Helicone — Top LLM Gateways 2025"
      },
      {
        "url": "https://developers.redhat.com/articles/2025/05/20/llm-semantic-router-intelligent-request-routing",
        "label": "Red Hat — LLM Semantic Router"
      },
      {
        "url": "https://dev.to/kuldeep_paul/top-5-llm-gateways-in-2025-architecture-features-and-a-practical-selection-guide-56nh",
        "label": "DEV — Top 5 LLM Gateways Guide"
      }
    ],
    "diagramTitle": "LLM Gateway / Router",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Request"
      },
      {
        "id": "n1",
        "type": "decision",
        "label": "Classifier",
        "subtitle": "complexity"
      },
      {
        "id": "n2",
        "type": "success",
        "label": "Fast Model",
        "subtitle": "Haiku"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Heavy Model",
        "subtitle": "Opus"
      },
      {
        "id": "n4",
        "type": "cache",
        "label": "Semantic Cache",
        "subtitle": "cosine>0.95"
      },
      {
        "id": "n5",
        "type": "service",
        "label": "Failover"
      },
      {
        "id": "n6",
        "type": "warning",
        "label": "Rate Limit"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 42,
    "slug": "design-llm-evaluation-monitoring-system",
    "title": "Design LLM Evaluation & Monitoring System",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "LLM-as-judge",
      "RAGAS",
      "Drift detection",
      "Human eval"
    ],
    "companies": [
      "Google",
      "Meta",
      "Anthropic",
      "Cohere"
    ],
    "answer": "Offline eval: automated metrics (BLEU, ROUGE, BERTScore), LLM-as-judge (GPT-4 rates responses), RAGAS for RAG (faithfulness, relevance, context precision). Online monitoring: latency P50/P95/P99, token usage, hallucination rate (NLI-based), toxicity scores, cost/query. Drift detection: embedding distribution shift of queries over time. Human evaluation: periodic sampling with rubric-based scoring.",
    "resources": [
      {
        "url": "https://www.interviewnode.com/post/llm-engineering-interviews-how-to-prepare-for-prompting-fine-tuning-and-evaluation",
        "label": "InterviewNode — LLM Eval & Fine-tuning Prep"
      },
      {
        "url": "https://www.datacamp.com/blog/llm-interview-questions",
        "label": "DataCamp — LLM Interview Questions"
      },
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Evals section)"
      }
    ],
    "diagramTitle": "LLM Monitoring",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "LLM Response"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Latency",
        "subtitle": "P50/P95/P99"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "Hallucination",
        "subtitle": "NLI check"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Toxicity"
      },
      {
        "id": "n4",
        "type": "database",
        "label": "Cost",
        "subtitle": "$/query"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 43,
    "slug": "design-a-fine-tuning-pipeline",
    "title": "Design a Fine-tuning Pipeline",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "LoRA/QLoRA",
      "RLHF/DPO",
      "Data curation",
      "Catastrophic forgetting"
    ],
    "companies": [
      "Google",
      "Meta",
      "Anthropic",
      "OpenAI"
    ],
    "answer": "Decision matrix: prompt engineering (fastest) → RAG (fresh data) → fine-tuning (behavior change). Pipeline: curate training data → format (instruction/input/output) → fine-tune with LoRA/QLoRA (4-bit) → evaluate on held-out set → compare vs base model → deploy with A/B test. Alignment: RLHF (train reward model → PPO) or DPO (simpler, no reward model). Prevent catastrophic forgetting: mix fine-tune data with general data, use low learning rate.",
    "resources": [
      {
        "url": "https://www.datacamp.com/blog/llm-interview-questions",
        "label": "DataCamp — LLM Interview (Fine-tuning)"
      },
      {
        "url": "https://www.interviewnode.com/post/llm-engineering-interviews-how-to-prepare-for-prompting-fine-tuning-and-evaluation",
        "label": "InterviewNode — Fine-tuning Prep"
      },
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Fine-tuning)"
      }
    ],
    "diagramTitle": "Fine-tuning Pipeline",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Decision"
      },
      {
        "id": "n1",
        "type": "success",
        "label": "Prompt Eng",
        "subtitle": "fastest"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "RAG",
        "subtitle": "fresh data"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Fine-tune",
        "subtitle": "behavior"
      },
      {
        "id": "n4",
        "type": "client",
        "label": "Data"
      },
      {
        "id": "n5",
        "type": "service",
        "label": "LoRA/QLoRA",
        "subtitle": "4-bit"
      },
      {
        "id": "n6",
        "type": "database",
        "label": "Eval",
        "subtitle": "holdout"
      },
      {
        "id": "n7",
        "type": "warning",
        "label": "DPO",
        "subtitle": "align"
      },
      {
        "id": "n8",
        "type": "success",
        "label": "Deploy"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 44,
    "slug": "design-a-prompt-management-system",
    "title": "Design a Prompt Management System",
    "difficulty": "Medium",
    "frequency": "Medium",
    "tags": [
      "Version control",
      "Template engine",
      "A/B testing prompts"
    ],
    "companies": [
      "All",
      "GenAI",
      "companies"
    ],
    "answer": "Centralized prompt registry with versioning (like code). Template engine with variables ({{user_name}}, {{context}}). A/B test different prompt versions. Track: prompt → response quality correlation. Rollback capability. Environment management (dev/staging/prod). Prompt analytics: which prompts produce best outputs. Collaborate: team-level prompt libraries with access control.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Prompt Mgmt)"
      },
      {
        "url": "https://www.systemdesignhandbook.com/guides/generative-ai-system-design-interview/",
        "label": "System Design Handbook — GenAI (Prompts)"
      },
      {
        "url": "https://github.com/amitshekhariitbhu/ai-engineering-interview-questions",
        "label": "GitHub — AI Engineering (Prompt Ops)"
      }
    ],
    "diagramTitle": "Prompt Management",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "database",
        "label": "Registry",
        "subtitle": "versioned"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Templates",
        "subtitle": "{{vars}}"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "A/B Test",
        "subtitle": "variants"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "Analytics",
        "subtitle": "quality"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 45,
    "slug": "design-a-vector-database-for-embeddings",
    "title": "Design a Vector Database for Embeddings",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "HNSW",
      "IVF",
      "Product Quantization",
      "Hybrid search"
    ],
    "companies": [
      "Pinecone",
      "Weaviate",
      "Google",
      "Amazon"
    ],
    "answer": "Store high-dimensional vectors. ANN algorithms: HNSW (graph-based, best recall/speed), IVF (inverted file, good for large scale), PQ (compression for memory). Hybrid: combine vector similarity with metadata filtering (pre-filter vs post-filter). Sharding by vector range or hash. Replication for availability. Real-time indexing for new documents. Evaluate: recall@K, QPS, latency P99.",
    "resources": [
      {
        "url": "https://www.pinecone.io/learn/",
        "label": "Pinecone — Vector DB Learning Center"
      },
      {
        "url": "https://weaviate.io/developers/weaviate",
        "label": "Weaviate — Vector Search Documentation"
      },
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Vector Store)"
      }
    ],
    "diagramTitle": "Vector Database",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Vectors"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "HNSW",
        "subtitle": "graph ANN"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "IVF",
        "subtitle": "inverted file"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "PQ",
        "subtitle": "compress"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "K Nearest",
        "subtitle": "<50ms"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 46,
    "slug": "design-semantic-search-system",
    "title": "Design Semantic Search System",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Dense retrieval",
      "Bi-encoder vs Cross-encoder",
      "Hybrid BM25+vector"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Elastic",
      "Cohere"
    ],
    "answer": "Bi-encoder: encode query and documents independently, ANN search for top-K. Cross-encoder: score query-document pairs jointly (more accurate but O(n), use for reranking top-50). Hybrid: BM25 for keyword matching + dense vectors for semantic matching, merge via RRF. Fine-tune embedding model on domain-specific data with contrastive loss. Handle: multi-language, query expansion, zero-shot domains.",
    "resources": [
      {
        "url": "https://www.pinecone.io/learn/",
        "label": "Pinecone — Semantic Search Tutorials"
      },
      {
        "url": "https://eugeneyan.com/writing/search-query-matching/",
        "label": "Eugene Yan — Search Query Matching"
      },
      {
        "url": "https://www.educative.io/courses/generative-ai-system-design",
        "label": "Educative — GenAI SD: Semantic Search"
      }
    ],
    "diagramTitle": "Semantic Search",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Query"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Bi-encoder",
        "subtitle": "embed"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "ANN",
        "subtitle": "top 50"
      },
      {
        "id": "n3",
        "type": "decision",
        "label": "Cross-encoder",
        "subtitle": "rerank"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Top 10"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 47,
    "slug": "design-ai-code-assistant-github-copilot",
    "title": "Design AI Code Assistant (GitHub Copilot)",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Code completion",
      "RAG over codebase",
      "Streaming",
      "Security"
    ],
    "companies": [
      "GitHub/Microsoft",
      "Google",
      "Amazon(Q)"
    ],
    "answer": "Context: current file + open tabs + imports + repo structure → RAG over codebase → model generates completion. Multi-turn: user accepts/rejects/edits → feedback loop. Fast path (<500ms): lightweight model for inline completion. Deep path: heavy model for complex generation. RAG: index codebase, docs, git history. Security: don't leak secrets, don't generate vulnerable code (SAST check on output). IDE integration via LSP-like protocol.",
    "resources": [
      {
        "url": "https://igotanoffer.com/en/advice/generative-ai-system-design-interview",
        "label": "IGotAnOffer — GenAI SD (Code Assistant)"
      },
      {
        "url": "https://myengineeringpath.dev/genai-engineer/interview-questions/",
        "label": "MyEngineeringPath — GenAI Interview Qs"
      },
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Code Gen)"
      }
    ],
    "diagramTitle": "AI Code Assistant",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "service",
        "label": "IDE Context",
        "subtitle": "file+tabs"
      },
      {
        "id": "n1",
        "type": "database",
        "label": "RAG",
        "subtitle": "codebase"
      },
      {
        "id": "n2",
        "type": "success",
        "label": "Fast Model",
        "subtitle": "<500ms"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Heavy Model",
        "subtitle": "complex"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 48,
    "slug": "design-document-understanding-pipeline",
    "title": "Design Document Understanding Pipeline",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "OCR",
      "Layout parsing",
      "Table extraction",
      "Multi-format"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Apple",
      "Salesforce"
    ],
    "answer": "Multi-format: PDF, images, scanned docs, emails. Pipeline: format detection → OCR (for scanned) → layout analysis (detect headers, tables, paragraphs) → structured extraction (key-value pairs, tables to rows) → validation → LLM-powered understanding for complex queries. Handle: poor scan quality, handwriting, multi-column layouts. Tools: Tesseract OCR, LayoutLM, Donut (end-to-end). Evaluate: F1 on field extraction, table structure accuracy.",
    "resources": [
      {
        "url": "https://www.systemdesignhandbook.com/guides/generative-ai-system-design-interview/",
        "label": "System Design Handbook — GenAI (Doc Pipeline)"
      },
      {
        "url": "https://igotanoffer.com/en/advice/generative-ai-system-design-interview",
        "label": "IGotAnOffer — GenAI (Document Extraction)"
      },
      {
        "url": "https://www.educative.io/courses/generative-ai-system-design",
        "label": "Educative — GenAI SD: Doc Processing"
      }
    ],
    "diagramTitle": "Document Pipeline",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Upload"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "OCR",
        "subtitle": "Tesseract"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Layout",
        "subtitle": "tables/headers"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "Extract",
        "subtitle": "KV pairs"
      },
      {
        "id": "n4",
        "type": "decision",
        "label": "Validate"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 49,
    "slug": "design-llm-guardrails-safety-system",
    "title": "Design LLM Guardrails & Safety System",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "Prompt injection",
      "Output filtering",
      "Hallucination detection",
      "PII masking"
    ],
    "companies": [
      "Anthropic",
      "OpenAI",
      "Google",
      "Meta"
    ],
    "answer": "**Multi-layer**: (1) Input: prompt injection classifier, PII detection/masking, jailbreak detection, topic blocklist. (2) Model-level: Constitutional AI constraints, system prompt hardening. (3) Output: toxicity classifier, hallucination check via NLI (does response contradict retrieved context?), schema validation, PII re-detection. (4) Tool-level: sandboxed execution, permission scoping, irreversible action confirmation. **Frameworks**: Guardrails AI, NeMo Guardrails, LMQL. Five-stage hallucination mitigation: ground → constrain → verify → validate → gate.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Guardrails)"
      },
      {
        "url": "https://cloudsecurityalliance.org/blog/2025/12/10/how-to-build-ai-prompt-guardrails-an-in-depth-guide-for-securing-enterprise-genai",
        "label": "CSA — Building AI Prompt Guardrails"
      },
      {
        "url": "https://github.com/amitshekhariitbhu/ai-engineering-interview-questions",
        "label": "GitHub — AI Engineering (Safety Qs)"
      }
    ],
    "diagramTitle": "LLM Guardrails",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "warning",
        "label": "Input"
      },
      {
        "id": "n1",
        "type": "decision",
        "label": "Injection Check"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "PII Mask"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "LLM"
      },
      {
        "id": "n4",
        "type": "decision",
        "label": "Toxicity"
      },
      {
        "id": "n5",
        "type": "warning",
        "label": "Hallucination",
        "subtitle": "NLI"
      },
      {
        "id": "n6",
        "type": "success",
        "label": "Output"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 50,
    "slug": "design-ai-powered-customer-support-system",
    "title": "Design AI-Powered Customer Support System",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Intent classification",
      "RAG over KB",
      "Human handoff",
      "Conversation routing"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Salesforce",
      "Zendesk"
    ],
    "answer": "Intent classification → route to: (1) FAQ bot (RAG over knowledge base), (2) Transactional bot (structured actions: refund, cancel, track order), (3) Human agent (complex/emotional issues). Conversation context maintained across channel switches. Sentiment monitoring: escalate if frustration detected. Agent assist mode: suggest responses to human agents. Evaluate: resolution rate, CSAT, containment rate (% resolved without human). Continuous learning from agent corrections.",
    "resources": [
      {
        "url": "https://www.educative.io/courses/generative-ai-system-design",
        "label": "Educative — GenAI SD: Customer Support AI"
      },
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (RAG + Agent)"
      },
      {
        "url": "https://igotanoffer.com/en/advice/generative-ai-system-design-interview",
        "label": "IGotAnOffer — GenAI System Design"
      }
    ],
    "diagramTitle": "AI Customer Support",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Query"
      },
      {
        "id": "n1",
        "type": "decision",
        "label": "Intent",
        "subtitle": "classify"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "RAG Bot",
        "subtitle": "KB"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Human Agent"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 51,
    "slug": "design-ai-powered-search-perplexity-like",
    "title": "Design AI-Powered Search (Perplexity-like)",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Query decomposition",
      "Multi-source retrieval",
      "Citation generation"
    ],
    "companies": [
      "Google",
      "Perplexity",
      "AI",
      "startups"
    ],
    "answer": "User query → decompose into sub-queries → parallel web search + RAG → synthesize with citations → stream response. Cite every claim with source URL. Handle: conflicting sources (present both sides), temporal queries (prioritize recent), follow-up questions. Evaluate: factual accuracy, citation quality, user satisfaction.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (RAG Search)"
      },
      {
        "url": "https://www.systemdesignhandbook.com/guides/generative-ai-system-design-interview/",
        "label": "System Design Handbook — GenAI (AI Search)"
      },
      {
        "url": "https://www.datacamp.com/blog/rag-interview-questions",
        "label": "DataCamp — RAG Questions (Search)"
      }
    ],
    "diagramTitle": "AI-Powered Search",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Query"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Decompose"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Web Search",
        "subtitle": "parallel"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "RAG"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Synthesize",
        "subtitle": "+ citations"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 52,
    "slug": "design-conversational-ai-with-persistent-memory",
    "title": "Design Conversational AI with Persistent Memory",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Memory extraction",
      "Profile updates",
      "Retrieval-augmented memory"
    ],
    "companies": [
      "OpenAI",
      "Anthropic",
      "Google"
    ],
    "answer": "After each conversation: extract key facts → store in user profile (structured) + episodic memory (vector DB). Next conversation: retrieve relevant memories → inject into system prompt. Memory types: facts (user is a Python developer), preferences (prefers concise answers), episodic (last week discussed X project). Conflict resolution when memories contradict. Privacy: user can view/delete memories.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Memory Mgmt)"
      },
      {
        "url": "https://www.datacamp.com/blog/agentic-ai-interview-questions",
        "label": "DataCamp — Agentic AI (Persistent Memory)"
      },
      {
        "url": "https://github.com/amitshekhariitbhu/ai-engineering-interview-questions",
        "label": "GitHub — AI Engineering (Memory)"
      }
    ],
    "diagramTitle": "Persistent Memory",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Conv"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Extract Facts",
        "subtitle": "LLM"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "Profile",
        "subtitle": "structured"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "Episodes",
        "subtitle": "vector"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Inject",
        "subtitle": "into prompt"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 53,
    "slug": "design-real-time-ai-translation-system",
    "title": "Design Real-time AI Translation System",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "Streaming translation",
      "Context preservation",
      "Low latency"
    ],
    "companies": [
      "Google",
      "Apple",
      "Meta",
      "Amazon"
    ],
    "answer": "Stream audio → ASR → translate → TTS in target language. Challenge: translation needs sentence context but streaming gives partial input. Solution: speculative translation with correction. Handle: idioms, code-switching (mixing languages), proper nouns. Latency budget: <2s end-to-end. Evaluate: BLEU, latency, naturalness MOS.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Translation)"
      },
      {
        "url": "https://www.educative.io/courses/generative-ai-system-design",
        "label": "Educative — GenAI SD: Real-time AI"
      },
      {
        "url": "https://igotanoffer.com/en/advice/generative-ai-system-design-interview",
        "label": "IGotAnOffer — GenAI (Translation)"
      }
    ],
    "diagramTitle": "Real-time Translation",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Audio"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "ASR",
        "subtitle": "streaming"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Translate",
        "subtitle": "speculative"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "TTS",
        "subtitle": "target"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Audio out"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 54,
    "slug": "design-ai-image-generation-pipeline-dall-e-like",
    "title": "Design AI Image Generation Pipeline (DALL-E-like)",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "Diffusion models",
      "CLIP guidance",
      "Safety filtering",
      "Scaling inference"
    ],
    "companies": [
      "OpenAI",
      "Google(Imagen)",
      "Meta",
      "Stability"
    ],
    "answer": "Text → CLIP text encoder → diffusion model (UNet denoiser) → image. Safety: input classifier blocks harmful prompts, output classifier filters generated images. Scale: GPU fleet for inference, queue-based for batch requests. Optimization: classifier-free guidance, step reduction (DDIM), model distillation. Content policy enforcement. User controls: aspect ratio, style, negative prompts.",
    "resources": [
      {
        "url": "https://www.systemdesignhandbook.com/guides/generative-ai-system-design-interview/",
        "label": "System Design Handbook — GenAI (Image Gen)"
      },
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Generation)"
      },
      {
        "url": "https://igotanoffer.com/en/advice/generative-ai-system-design-interview",
        "label": "IGotAnOffer — GenAI SD (Diffusion)"
      }
    ],
    "diagramTitle": "Image Generation",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Text"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "CLIP",
        "subtitle": "encode"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Diffusion",
        "subtitle": "UNet"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Safety Filter"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Image"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 55,
    "slug": "design-agentic-workflow-orchestrator",
    "title": "Design Agentic Workflow Orchestrator",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "DAG execution",
      "Conditional branching",
      "Human-in-the-loop",
      "Cost budgets"
    ],
    "companies": [
      "Google",
      "Anthropic",
      "Salesforce",
      "Startups"
    ],
    "answer": "Visual workflow builder where users define AI agent workflows as DAGs. Nodes: LLM call, tool call, human approval, conditional branch, loop. Execution engine: topological sort, parallel execution where possible, retry/fallback per node. Cost budget: track token usage, pause if budget exceeded. Audit trail: log every step for debugging. Templates: pre-built workflows (customer onboarding, code review, data analysis).",
    "resources": [
      {
        "url": "https://www.datacamp.com/blog/agentic-ai-interview-questions",
        "label": "DataCamp — Agentic AI (Workflow Orchestration)"
      },
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Agents)"
      },
      {
        "url": "https://github.com/amitshekhariitbhu/ai-engineering-interview-questions",
        "label": "GitHub — AI Engineering (Agentic)"
      }
    ],
    "diagramTitle": "Agentic Workflow",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "database",
        "label": "DAG Builder",
        "subtitle": "visual"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Nodes",
        "subtitle": "LLM+tool+human"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "Executor",
        "subtitle": "parallel"
      },
      {
        "id": "n3",
        "type": "decision",
        "label": "Cost Budget",
        "subtitle": "tokens"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 56,
    "slug": "design-ai-meeting-summarizer",
    "title": "Design AI Meeting Summarizer",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "ASR + diarization",
      "Extractive + abstractive",
      "Action item detection"
    ],
    "companies": [
      "Google(Meet)",
      "Microsoft(Teams)",
      "Zoom"
    ],
    "answer": "Audio → ASR with speaker diarization → structured transcript. LLM generates: executive summary, key decisions, action items with assignees, follow-up questions. Handle: multi-speaker, cross-talk, domain jargon. Integrate with calendar (add action items as tasks). Real-time summarization during meeting. Privacy: opt-in recording, auto-delete after processing.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Summarization)"
      },
      {
        "url": "https://www.educative.io/courses/generative-ai-system-design",
        "label": "Educative — GenAI SD: Meeting AI"
      },
      {
        "url": "https://igotanoffer.com/en/advice/generative-ai-system-design-interview",
        "label": "IGotAnOffer — GenAI (Meeting Summarizer)"
      }
    ],
    "diagramTitle": "Meeting Summarizer",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Audio"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "ASR+Diarize",
        "subtitle": "who said what"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "LLM",
        "subtitle": "summary+actions"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "Calendar",
        "subtitle": "add tasks"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 57,
    "slug": "design-multi-modal-ai-system-text-image-audio",
    "title": "Design Multi-modal AI System (Text + Image + Audio)",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "Cross-modal fusion",
      "Unified embeddings",
      "Task routing"
    ],
    "companies": [
      "Google(Gemini)",
      "OpenAI(GPT-4V)",
      "Meta"
    ],
    "answer": "Unified model (GPT-4V, Gemini) or modular (separate encoders + fusion layer). Input: any combination of text, image, audio, video. Cross-modal attention for understanding relationships. Task routing: visual QA, image captioning, audio transcription, multimodal search. Handle: missing modalities (graceful degradation). Evaluation per modality + cross-modal benchmarks.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Multi-modal)"
      },
      {
        "url": "https://www.systemdesignhandbook.com/guides/generative-ai-system-design-interview/",
        "label": "System Design Handbook — GenAI (Multi-modal)"
      },
      {
        "url": "https://www.datacamp.com/blog/llm-interview-questions",
        "label": "DataCamp — LLM Qs (Multi-modal)"
      }
    ],
    "diagramTitle": "Multi-modal AI",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "service",
        "label": "Text"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Image"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Audio"
      },
      {
        "id": "n3",
        "type": "decision",
        "label": "Cross-modal",
        "subtitle": "attention fusion"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Unified Output"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 58,
    "slug": "design-llm-semantic-cache",
    "title": "Design LLM Semantic Cache",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Embedding similarity",
      "Cache invalidation",
      "Cost savings"
    ],
    "companies": [
      "All",
      "GenAI",
      "companies"
    ],
    "answer": "Hash exact queries for cache hit. For semantic caching: embed query → search cache index (cosine similarity > 0.95 threshold) → return cached response. TTL-based expiration. Cache invalidation when underlying data changes (for RAG responses). Metrics: cache hit rate, cost savings, staleness rate. Challenge: balancing cache freshness vs cost savings.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Caching)"
      },
      {
        "url": "https://skphd.medium.com/llm-system-design-interview-questions-and-answers-2a7a16212492",
        "label": "Medium — LLM System Design (Semantic Cache)"
      },
      {
        "url": "https://www.systemdesignhandbook.com/guides/generative-ai-system-design-interview/",
        "label": "System Design Handbook — GenAI (Cache)"
      }
    ],
    "diagramTitle": "Semantic Cache",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Query"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Embed"
      },
      {
        "id": "n2",
        "type": "cache",
        "label": "Cache Index",
        "subtitle": "cos>0.95?"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "Return cached"
      },
      {
        "id": "n4",
        "type": "warning",
        "label": "LLM",
        "subtitle": "generate"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 59,
    "slug": "design-hallucination-detection-system",
    "title": "Design Hallucination Detection System",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "NLI-based verification",
      "Self-consistency",
      "Citation verification"
    ],
    "companies": [
      "Anthropic",
      "OpenAI",
      "Google",
      "Meta"
    ],
    "answer": "Multi-stage: (1) Self-consistency: generate N responses, check agreement across them. (2) NLI verification: check if response is entailed by source documents (for RAG). (3) Citation verification: follow citations, verify claims match source. (4) Confidence scoring: flag low-confidence spans. (5) Fact-checking: cross-reference against knowledge base. Evaluate: FActScore (% atomic facts supported by evidence). Production: confidence threshold → auto-flag → human review for borderline.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Hallucination)"
      },
      {
        "url": "https://www.datacamp.com/blog/rag-interview-questions",
        "label": "DataCamp — RAG Qs (Faithfulness)"
      },
      {
        "url": "https://github.com/amitshekhariitbhu/ai-engineering-interview-questions",
        "label": "GitHub — AI Engineering (Hallucination)"
      }
    ],
    "diagramTitle": "Hallucination Detection",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Response"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Self-consistency",
        "subtitle": "N samples"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "NLI",
        "subtitle": "vs sources"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "Citation Check"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Confidence"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 60,
    "slug": "design-knowledge-graph-for-llm-grounding",
    "title": "Design Knowledge Graph for LLM Grounding",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "Entity extraction",
      "Relation extraction",
      "Graph queries",
      "LLM integration"
    ],
    "companies": [
      "Google",
      "Microsoft",
      "Amazon"
    ],
    "answer": "Build KG from documents: NER extracts entities, RE extracts relations. Store in Neo4j/Neptune. On query: extract entities from question → traverse graph for relevant subgraph → serialize as context for LLM. Advantages over pure RAG: structured relationships, multi-hop reasoning, temporal tracking. Challenges: keeping KG updated, handling ambiguity, entity resolution across sources.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Knowledge Graph)"
      },
      {
        "url": "https://www.datacamp.com/blog/rag-interview-questions",
        "label": "DataCamp — RAG (Graph Retrieval)"
      },
      {
        "url": "https://www.systemdesignhandbook.com/guides/generative-ai-system-design-interview/",
        "label": "System Design Handbook — GenAI (KG)"
      }
    ],
    "diagramTitle": "Knowledge Graph",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Docs"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "NER"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "RE",
        "subtitle": "relations"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "Neo4j"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Query+Traverse"
      },
      {
        "id": "n5",
        "type": "success",
        "label": "LLM",
        "subtitle": "grounded"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 61,
    "slug": "design-embedding-service-at-scale",
    "title": "Design Embedding Service at Scale",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Batch + real-time",
      "Model versioning",
      "Incremental updates"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Cohere",
      "Startups"
    ],
    "answer": "API: text/image → embedding vector. Batch mode: process millions of documents overnight. Real-time: <50ms per embedding for online serving. Model versioning: when embedding model changes, all vectors must be re-indexed (expensive). Solution: gradual migration with dual-index. Handle: long documents (chunking + pooling strategies). Auto-scaling GPU fleet. Caching frequent embeddings.",
    "resources": [
      {
        "url": "https://www.pinecone.io/learn/",
        "label": "Pinecone — Embedding Service Patterns"
      },
      {
        "url": "https://eugeneyan.com/writing/real-time-recommendations/",
        "label": "Eugene Yan — Real-time Retrieval (Embeddings)"
      },
      {
        "url": "https://weaviate.io/developers/weaviate",
        "label": "Weaviate — Embedding Pipeline Docs"
      }
    ],
    "diagramTitle": "Embedding Service",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Text/Image"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Model",
        "subtitle": "encode"
      },
      {
        "id": "n2",
        "type": "success",
        "label": "Vector",
        "subtitle": "768d"
      },
      {
        "id": "n3",
        "type": "cache",
        "label": "Cache",
        "subtitle": "frequent"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 62,
    "slug": "design-ai-data-analyst-agent",
    "title": "Design AI Data Analyst Agent",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Text-to-SQL",
      "Chart generation",
      "Iterative analysis"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Databricks",
      "Startups"
    ],
    "answer": "User asks natural language question → agent generates SQL → executes on warehouse → formats results + generates chart → presents findings. Iterative: user asks follow-ups, agent maintains context. Handle: ambiguous questions (clarify before querying), large result sets (summarize), errors (retry with corrected SQL). Security: read-only access, query cost limits, PII masking in results.",
    "resources": [
      {
        "url": "https://www.datacamp.com/blog/agentic-ai-interview-questions",
        "label": "DataCamp — Agentic AI (Data Analyst Agent)"
      },
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Text-to-SQL)"
      },
      {
        "url": "https://github.com/amitshekhariitbhu/ai-engineering-interview-questions",
        "label": "GitHub — AI Engineering (Data Agent)"
      }
    ],
    "diagramTitle": "Data Analyst Agent",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "NL Question"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Text-to-SQL",
        "subtitle": "LLM"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "Execute",
        "subtitle": "warehouse"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "Format",
        "subtitle": "+ chart"
      },
      {
        "id": "n4",
        "type": "client",
        "label": "Present"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 63,
    "slug": "design-ai-tutor-personalized-learning-system",
    "title": "Design AI Tutor / Personalized Learning System",
    "difficulty": "Medium",
    "frequency": "Medium",
    "tags": [
      "Adaptive difficulty",
      "Knowledge state tracking",
      "Socratic method"
    ],
    "companies": [
      "Google",
      "Duolingo",
      "Khan",
      "Academy"
    ],
    "answer": "Track student's knowledge state (what they know/don't know). Adaptive question selection: target zone of proximal development. LLM generates explanations adapted to student's level. Socratic method: ask guiding questions rather than giving answers directly. Progress tracking: spaced repetition for review scheduling. Multi-modal: text, diagrams, code exercises. Evaluate: learning gains (pre/post test), engagement, retention.",
    "resources": [
      {
        "url": "https://www.educative.io/courses/generative-ai-system-design",
        "label": "Educative — GenAI SD: AI Tutor"
      },
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Adaptive)"
      },
      {
        "url": "https://igotanoffer.com/en/advice/generative-ai-system-design-interview",
        "label": "IGotAnOffer — GenAI (Education AI)"
      }
    ],
    "diagramTitle": "AI Tutor",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Student"
      },
      {
        "id": "n1",
        "type": "database",
        "label": "Knowledge State"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "Adaptive Q",
        "subtitle": "zone of proximal"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Socratic LLM",
        "subtitle": "guide"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 64,
    "slug": "design-tool-using-llm-system",
    "title": "Design Tool-Using LLM System",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "Function calling",
      "Tool selection",
      "Error handling",
      "Parallel tool calls"
    ],
    "companies": [
      "OpenAI",
      "Anthropic",
      "Google"
    ],
    "answer": "LLM decides which tools to call based on user query. Tool definition: name, description, JSON schema for parameters. LLM generates structured function call → execute → return result → LLM incorporates result. Handle: parallel tool calls (independent calls run concurrently), chained calls (output of one feeds into another), tool failures (retry or alternative tool). Tool selection quality: measured by precision/recall of correct tool choice.",
    "resources": [
      {
        "url": "https://www.datacamp.com/blog/agentic-ai-interview-questions",
        "label": "DataCamp — Agentic AI (Tool Use)"
      },
      {
        "url": "https://skphd.medium.com/a2a-vs-mcp-interview-questions-and-answers-dc08bc3c0787",
        "label": "Medium — MCP (Tool Standardization)"
      },
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Function Calling)"
      }
    ],
    "diagramTitle": "Tool-Using LLM",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Query"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "LLM",
        "subtitle": "decide tool"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "Function Call",
        "subtitle": "typed schema"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "Execute"
      },
      {
        "id": "n4",
        "type": "service",
        "label": "Result→LLM",
        "subtitle": "incorporate"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 65,
    "slug": "design-ai-email-writer-assistant",
    "title": "Design AI Email Writer / Assistant",
    "difficulty": "Medium",
    "frequency": "Medium",
    "tags": [
      "Tone adaptation",
      "Context awareness",
      "Thread understanding"
    ],
    "companies": [
      "Google",
      "Microsoft",
      "Apple"
    ],
    "answer": "Input: email thread + user intent ('reply accepting the meeting'). RAG over user's email history for style/tone matching. Generate draft → user edits → learn from edits for personalization. Features: auto-complete sentences, suggest replies, summarize threads. Privacy: on-device processing or encrypted cloud. Handle: formal vs casual detection, CC/BCC awareness, action item extraction from threads.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Personalized Gen)"
      },
      {
        "url": "https://igotanoffer.com/en/advice/generative-ai-system-design-interview",
        "label": "IGotAnOffer — GenAI (Email Assistant)"
      },
      {
        "url": "https://github.com/amitshekhariitbhu/ai-engineering-interview-questions",
        "label": "GitHub — AI Engineering (Email AI)"
      }
    ],
    "diagramTitle": "Email Assistant",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Thread"
      },
      {
        "id": "n1",
        "type": "database",
        "label": "RAG",
        "subtitle": "user style"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "LLM",
        "subtitle": "draft"
      },
      {
        "id": "n3",
        "type": "client",
        "label": "User edits"
      },
      {
        "id": "n4",
        "type": "warning",
        "label": "Personalize"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 66,
    "slug": "design-real-time-streaming-llm-responses",
    "title": "Design Real-time Streaming LLM Responses",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Server-Sent Events",
      "Token streaming",
      "Backpressure",
      "Progressive rendering"
    ],
    "companies": [
      "All",
      "LLM",
      "providers"
    ],
    "answer": "SSE (Server-Sent Events) for token-by-token streaming. Client renders progressively. Handle: connection drops (reconnect with last token position), backpressure (slow client), abort signal (user clicks stop). Batch inference: continuous batching on GPU (vLLM) for throughput. Monitor: time-to-first-token (TTFT), inter-token latency, total generation time.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Streaming)"
      },
      {
        "url": "https://skphd.medium.com/llm-system-design-interview-questions-and-answers-2a7a16212492",
        "label": "Medium — LLM System Design (SSE)"
      },
      {
        "url": "https://www.systemdesignhandbook.com/guides/generative-ai-system-design-interview/",
        "label": "System Design Handbook — GenAI (Streaming)"
      }
    ],
    "diagramTitle": "Streaming LLM",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Request"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "GPU",
        "subtitle": "continuous batch"
      },
      {
        "id": "n2",
        "type": "success",
        "label": "Client",
        "subtitle": "progressive render"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 67,
    "slug": "design-enterprise-rag-with-access-control",
    "title": "Design Enterprise RAG with Access Control",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Document-level ACL",
      "User-scoped retrieval",
      "Audit trail"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Salesforce",
      "Microsoft"
    ],
    "answer": "Challenge: different users should see different documents in RAG results. Implement: document-level ACL metadata in vector DB → filter by user's permissions at retrieval time. Pre-filter (filter before ANN search, may miss relevant docs) vs post-filter (search all, filter results, wastes compute). Group-based permissions: marketing team sees marketing docs. Audit trail: log every retrieval for compliance. Handle: permission changes propagated to vector DB metadata.",
    "resources": [
      {
        "url": "https://www.datacamp.com/blog/rag-interview-questions",
        "label": "DataCamp — RAG Qs (Access Control)"
      },
      {
        "url": "https://www.systemdesignhandbook.com/guides/generative-ai-system-design-interview/",
        "label": "System Design Handbook — GenAI (Enterprise RAG)"
      },
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (RAG ACL)"
      }
    ],
    "diagramTitle": "Enterprise RAG + ACL",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Query+User"
      },
      {
        "id": "n1",
        "type": "database",
        "label": "Vector DB",
        "subtitle": "+ACL metadata"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Relevant Docs",
        "subtitle": "permitted"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "LLM",
        "subtitle": "generate"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 68,
    "slug": "design-ai-content-moderation-for-llm-outputs",
    "title": "Design AI Content Moderation for LLM Outputs",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Output classifiers",
      "Harmful content taxonomy",
      "False positive management"
    ],
    "companies": [
      "Meta",
      "Google",
      "TikTok",
      "OpenAI"
    ],
    "answer": "Pipeline: LLM generates response → output classifier checks for: toxicity, bias, PII leakage, harmful instructions, misinformation. Taxonomy: categories with severity levels. Low-severity: append disclaimer. High-severity: block and log. Handle: context-dependent toxicity (medical info is fine in health context, not in weapon context). False positive management: user feedback loop, periodic classifier updates. Latency: <50ms added to response time.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Output Safety)"
      },
      {
        "url": "https://eugeneyan.com/writing/content-moderation/",
        "label": "Eugene Yan — Content Moderation (LLM Output)"
      },
      {
        "url": "https://github.com/amitshekhariitbhu/ai-engineering-interview-questions",
        "label": "GitHub — AI Engineering (LLM Safety)"
      }
    ],
    "diagramTitle": "LLM Output Moderation",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "LLM Out"
      },
      {
        "id": "n1",
        "type": "warning",
        "label": "Toxicity"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "PII"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Bias"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Disclaimer"
      },
      {
        "id": "n5",
        "type": "warning",
        "label": "Block"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 69,
    "slug": "design-prompt-injection-defense-system",
    "title": "Design Prompt Injection Defense System",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "Input sanitization",
      "Instruction hierarchy",
      "Canary tokens"
    ],
    "companies": [
      "Anthropic",
      "OpenAI",
      "Google",
      "All",
      "companies"
    ],
    "answer": "Attack types: direct injection ('ignore previous instructions'), indirect injection (hidden instructions in retrieved documents), jailbreaking. Defenses: (1) Input classifier trained on injection examples. (2) Instruction hierarchy: system prompt > user prompt > retrieved context. (3) Canary tokens in system prompt to detect if model was manipulated. (4) Sandwich defense: repeat system instructions after user input. (5) Output validation: check if response violates expected format/policy. Defense-in-depth: no single layer is sufficient.",
    "resources": [
      {
        "url": "https://cloudsecurityalliance.org/blog/2025/12/10/how-to-build-ai-prompt-guardrails-an-in-depth-guide-for-securing-enterprise-genai",
        "label": "CSA — Building AI Prompt Guardrails Guide"
      },
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Guardrails)"
      },
      {
        "url": "https://github.com/amitshekhariitbhu/ai-engineering-interview-questions",
        "label": "GitHub — AI Engineering (Prompt Injection)"
      }
    ],
    "diagramTitle": "Prompt Injection Defense",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Input"
      },
      {
        "id": "n1",
        "type": "warning",
        "label": "Classifier"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Instruction Hierarchy",
        "subtitle": "sys>user>ctx"
      },
      {
        "id": "n3",
        "type": "cache",
        "label": "Canary Tokens"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Validated"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 70,
    "slug": "design-ai-voice-assistant-alexasiri-like",
    "title": "Design AI Voice Assistant (Alexa/Siri-like)",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "Wake word detection",
      "ASR + NLU + TTS",
      "Streaming pipeline",
      "On-device"
    ],
    "companies": [
      "Amazon(Alexa)",
      "Apple(Siri)",
      "Google"
    ],
    "answer": "Pipeline: wake word (small on-device model, always listening) → streaming ASR → NLU (intent + slots) → skill routing → response generation → TTS. Low latency: <1s end-to-end. On-device vs cloud tradeoff (privacy vs capability). Multi-turn: context carry-over across turns. Handle: ambient noise, accents, multi-language, music playback interruption. Proactive suggestions based on context (time, location, calendar).",
    "resources": [
      {
        "url": "https://www.educative.io/courses/generative-ai-system-design",
        "label": "Educative — GenAI SD: Voice Assistant"
      },
      {
        "url": "https://eugeneyan.com/writing/llm-patterns/",
        "label": "Eugene Yan — LLM Patterns (Streaming ASR)"
      },
      {
        "url": "https://igotanoffer.com/en/advice/generative-ai-system-design-interview",
        "label": "IGotAnOffer — GenAI (Voice AI)"
      }
    ],
    "diagramTitle": "Voice Assistant",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "service",
        "label": "Wake Word",
        "subtitle": "on-device"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "ASR",
        "subtitle": "streaming"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "NLU",
        "subtitle": "intent+slots"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Skill Router"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "TTS",
        "subtitle": "respond"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 71,
    "slug": "design-a-feature-store-feasttecton",
    "title": "Design a Feature Store (Feast/Tecton)",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Online/Offline serving",
      "Training-serving skew",
      "Point-in-time correctness"
    ],
    "companies": [
      "Google",
      "Meta",
      "Uber",
      "Airbnb",
      "Netflix"
    ],
    "answer": "**Offline store**: S3/HDFS for batch training (point-in-time correct joins). **Online store**: Redis/DynamoDB for real-time serving (<30ms p95). **Feature pipelines**: batch (Spark) or streaming (Flink) compute features from raw data. **Key problems solved**: (1) Training-serving skew prevention (same code path). (2) Feature sharing across teams (registry/catalog). (3) Point-in-time correctness (avoid data leakage). **Tools**: Feast (open-source), Tecton (managed), Hopsworks.",
    "resources": [
      {
        "url": "https://feast.dev/docs/",
        "label": "Feast — Feature Store Documentation"
      },
      {
        "url": "https://www.yuan-meng.com/posts/ml_infra_interviews/",
        "label": "Yuan Meng — ML Infra Interview Prep"
      },
      {
        "url": "https://www.systemdesignhandbook.com/guides/ml-system-design/",
        "label": "System Design Handbook — ML Feature Store"
      }
    ],
    "diagramTitle": "Feature Store",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "database",
        "label": "Raw Data"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Pipeline",
        "subtitle": "Spark/Flink"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "Offline",
        "subtitle": "S3/Hive"
      },
      {
        "id": "n3",
        "type": "cache",
        "label": "Online",
        "subtitle": "Redis <30ms"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 72,
    "slug": "design-model-registry-versioning",
    "title": "Design Model Registry & Versioning",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Model artifacts",
      "Lineage tracking",
      "Deployment history"
    ],
    "companies": [
      "All",
      "FAANG",
      "MLOps",
      "roles"
    ],
    "answer": "Central catalog for all trained models. Store: model artifacts, training data reference, hyperparameters, metrics, code commit hash. Version control: semantic versioning (1.0.0 → 1.1.0). Stages: dev → staging → production → archived. Lineage: trace from production model back to training data + code. Compare versions: side-by-side metrics. Approval workflow before production promotion. Tools: MLflow Model Registry, SageMaker Model Registry, Vertex AI Model Registry.",
    "resources": [
      {
        "url": "https://huyenchip.com/mlops/",
        "label": "Chip Huyen — MLOps Guide (Model Registry)"
      },
      {
        "url": "https://skphd.medium.com/mlops-interview-questions-and-answers-0e25e2200dfc",
        "label": "Medium — MLOps Interview Q&A (Registry)"
      },
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: MLOps"
      }
    ],
    "diagramTitle": "Model Registry",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Train"
      },
      {
        "id": "n1",
        "type": "database",
        "label": "Artifacts"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Registry",
        "subtitle": "versioned"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Staging"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Production"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 73,
    "slug": "design-ml-model-serving-infrastructure",
    "title": "Design ML Model Serving Infrastructure",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "Batch vs real-time",
      "Auto-scaling",
      "A/B/canary deployment"
    ],
    "companies": [
      "All",
      "FAANG",
      "ML",
      "Platform",
      "roles"
    ],
    "answer": "Real-time serving: REST/gRPC API, <100ms p99. Model formats: ONNX, TorchScript, SavedModel. Inference servers: Triton (GPU), TF Serving, TorchServe. Batching: dynamic batching for GPU efficiency. Auto-scaling: based on QPS + GPU utilization. Deployment: blue-green (instant rollback), canary (1%→5%→50%→100% with metric gates), shadow (compare new vs old without serving new). Model warm-up: preload weights before routing traffic. Multi-model serving: multiple models on single GPU with memory management.",
    "resources": [
      {
        "url": "https://www.yuan-meng.com/posts/ml_infra_interviews/",
        "label": "Yuan Meng — ML Infra (Model Serving)"
      },
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems (Serving Ch.)"
      },
      {
        "url": "https://bytebytego.com/courses/machine-learning-system-design-interview",
        "label": "ByteByteGo — ML SD: Model Serving"
      }
    ],
    "diagramTitle": "Model Serving",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Request"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "LB"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Triton/TF Serving",
        "subtitle": "GPU"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "<100ms"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Blue-Green"
      },
      {
        "id": "n5",
        "type": "warning",
        "label": "Canary 1→100%"
      },
      {
        "id": "n6",
        "type": "cache",
        "label": "Shadow",
        "subtitle": "offline"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 74,
    "slug": "design-ml-monitoring-drift-detection-system",
    "title": "Design ML Monitoring & Drift Detection System",
    "difficulty": "Hard",
    "frequency": "Very High",
    "tags": [
      "Data drift",
      "Concept drift",
      "Model degradation",
      "Alerting"
    ],
    "companies": [
      "All",
      "FAANG",
      "Senior",
      "ML",
      "roles"
    ],
    "answer": "**Three layers**: (1) System metrics (latency, throughput, errors). (2) Data quality (schema validation, null rates, distribution stats). (3) Model performance (accuracy, precision, recall on labeled holdout; proxy metrics when ground truth delayed). **Drift types**: Data drift P(X) changes — detect with KS-test, PSI. Concept drift P(Y|X) changes — harder, need labeled data. Prediction drift P(Ŷ) changes — early warning proxy. **Automated response**: alert → investigate → retrain → deploy. Tools: Evidently AI, Fiddler, SageMaker Model Monitor.",
    "resources": [
      {
        "url": "https://www.evidentlyai.com/ml-in-production/data-drift",
        "label": "Evidently AI — Data Drift Detection Guide"
      },
      {
        "url": "https://www.interviewnode.com/post/how-to-discuss-data-leakage-drift-and-model-monitoring-in-ml-interviews",
        "label": "InterviewNode — Drift & Monitoring Prep"
      },
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems (Monitoring Ch.)"
      }
    ],
    "diagramTitle": "Drift Detection",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Prod Data"
      },
      {
        "id": "n1",
        "type": "decision",
        "label": "KS-test / PSI"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "Alert",
        "subtitle": "threshold"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Investigate"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Retrain"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 75,
    "slug": "design-distributed-training-system",
    "title": "Design Distributed Training System",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Data parallelism (DDP)",
      "Model parallelism",
      "Pipeline parallelism"
    ],
    "companies": [
      "Google",
      "Meta",
      "NVIDIA",
      "OpenAI"
    ],
    "answer": "**Data parallelism**: replicate model on N GPUs, split batch, average gradients (Ring AllReduce). **Model parallelism**: split model layers across GPUs (for models too large for single GPU). **Pipeline parallelism**: split model into stages, micro-batch pipelining. **ZeRO** (DeepSpeed): shard optimizer states, gradients, and parameters across GPUs. Network: NVLink (900GB/s intra-node), InfiniBand (400Gb/s inter-node). Checkpoint every ~500 steps. Target: 45-50% MFU. Frameworks: PyTorch DDP, DeepSpeed, Megatron-LM.",
    "resources": [
      {
        "url": "https://www.together.ai/blog/multi-node-gpu-training",
        "label": "Together AI — Multi-Node GPU Training"
      },
      {
        "url": "https://www.designgurus.io/answers/detail/nvidia-distributed-systems-interview-topics",
        "label": "DesignGurus — NVIDIA Distributed Topics"
      },
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems (Distributed)"
      }
    ],
    "diagramTitle": "Distributed Training",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "service",
        "label": "Data Parallel",
        "subtitle": "replicate"
      },
      {
        "id": "n1",
        "type": "warning",
        "label": "Model Parallel",
        "subtitle": "split layers"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "Pipeline",
        "subtitle": "micro-batch"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 76,
    "slug": "design-data-labeling-pipeline",
    "title": "Design Data Labeling Pipeline",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Active learning",
      "Consensus labeling",
      "Quality control"
    ],
    "companies": [
      "All",
      "FAANG",
      "Data/ML",
      "roles"
    ],
    "answer": "Labeling workflow: create task → distribute to annotators → collect labels → consensus (majority vote or expert review) → quality metrics (inter-annotator agreement, Cohen's kappa). Active learning: prioritize labeling samples where model is most uncertain. Pre-labeling: model suggests labels, humans verify (faster). Handle: class imbalance in labeling queue, annotator bias detection, scaling to millions of labels.",
    "resources": [
      {
        "url": "https://eugeneyan.com/writing/bootstrapping-data-labels/",
        "label": "Eugene Yan — Bootstrapping Data Labels"
      },
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems (Labeling Ch.)"
      },
      {
        "url": "https://skphd.medium.com/mlops-interview-questions-and-answers-0e25e2200dfc",
        "label": "Medium — MLOps Q&A (Data Labeling)"
      }
    ],
    "diagramTitle": "Data Labeling",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Unlabeled"
      },
      {
        "id": "n1",
        "type": "decision",
        "label": "Active Learning",
        "subtitle": "uncertain"
      },
      {
        "id": "n2",
        "type": "client",
        "label": "Annotators"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Consensus",
        "subtitle": "vote"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Labeled"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 77,
    "slug": "design-experiment-tracking-system-mlflowwb",
    "title": "Design Experiment Tracking System (MLflow/W&B)",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Run logging",
      "Hyperparameter tracking",
      "Comparison"
    ],
    "companies": [
      "All",
      "FAANG",
      "MLOps"
    ],
    "answer": "Log every training run: hyperparameters, metrics (loss curves), artifacts (model weights, plots), code version, data version, environment. Compare runs: side-by-side metric comparison, parallel coordinates plot for HP search. Organize: projects → experiments → runs. Collaboration: share runs, reproduce results. Integration: auto-log from PyTorch/TF/sklearn. Tools: MLflow, W&B, Neptune, ClearML.",
    "resources": [
      {
        "url": "https://www.zenml.io/blog/mlflow-vs-weights-and-biases",
        "label": "ZenML — MLflow vs W&B Comparison"
      },
      {
        "url": "https://www.wandb.courses/pages/w-b-courses",
        "label": "W&B Academy — Experiment Tracking Course"
      },
      {
        "url": "https://huyenchip.com/mlops/",
        "label": "Chip Huyen — MLOps Guide (Tracking)"
      }
    ],
    "diagramTitle": "Experiment Tracking",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Run"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Log",
        "subtitle": "params+metrics"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "MLflow/W&B"
      },
      {
        "id": "n3",
        "type": "decision",
        "label": "Compare",
        "subtitle": "side-by-side"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 78,
    "slug": "design-model-compression-distillation-pipeline",
    "title": "Design Model Compression / Distillation Pipeline",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Quantization",
      "Pruning",
      "Knowledge distillation"
    ],
    "companies": [
      "Apple",
      "Google",
      "Meta",
      "NVIDIA"
    ],
    "answer": "Quantization: FP32→INT8/INT4 (post-training or quantization-aware training). Target: 4-8x compression, 1-2% accuracy loss. Pruning: structured (remove entire channels) vs unstructured (remove individual weights). Knowledge distillation: train smaller student model to mimic larger teacher's outputs (soft labels). Pipeline: train teacher → distill to student → quantize → benchmark on device → iterate. Edge deployment: TFLite, CoreML, TensorRT.",
    "resources": [
      {
        "url": "https://www.analyticsvidhya.com/blog/2025/09/llm-compression-techniques/",
        "label": "Analytics Vidhya — LLM Compression Techniques"
      },
      {
        "url": "https://mlsysbook.ai/book/contents/core/optimizations/optimizations.html",
        "label": "ML Systems Book — Model Optimizations"
      },
      {
        "url": "https://skphd.medium.com/llm-system-design-interview-questions-and-answers-2a7a16212492",
        "label": "Medium — LLM System Design (Compression)"
      }
    ],
    "diagramTitle": "Model Compression",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "FP32"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Quantize",
        "subtitle": "INT8/4"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "Prune",
        "subtitle": "structured"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Distill",
        "subtitle": "student"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "4-8x smaller",
        "subtitle": "1-2% acc loss"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 79,
    "slug": "design-batch-vs-real-time-inference-platform",
    "title": "Design Batch vs Real-time Inference Platform",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Latency requirements",
      "Cost optimization",
      "Queue management"
    ],
    "companies": [
      "All",
      "FAANG",
      "ML",
      "Platform"
    ],
    "answer": "Real-time: REST/gRPC, <100ms, auto-scaling GPU fleet, model warm-up. Batch: process millions of items offline (Spark + model), scheduled (nightly recs, daily fraud scores). Hybrid: real-time for user-facing, batch for pre-computation. Cost optimization: batch on spot instances, real-time on reserved. Queue-based: SQS/Kafka for async inference when latency is relaxed (seconds not milliseconds).",
    "resources": [
      {
        "url": "https://www.yuan-meng.com/posts/ml_infra_interviews/",
        "label": "Yuan Meng — ML Infra (Batch vs RT)"
      },
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems (Inference Ch.)"
      },
      {
        "url": "https://bytebytego.com/courses/machine-learning-system-design-interview",
        "label": "ByteByteGo — ML SD: Inference Infra"
      }
    ],
    "diagramTitle": "Batch vs RT Inference",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "service",
        "label": "Real-time",
        "subtitle": "<100ms, GPU"
      },
      {
        "id": "n1",
        "type": "queue",
        "label": "Batch",
        "subtitle": "millions, Spark"
      },
      {
        "id": "n2",
        "type": "queue",
        "label": "Async",
        "subtitle": "queue, seconds"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 80,
    "slug": "design-gpu-cluster-management-for-ai-training",
    "title": "Design GPU Cluster Management for AI Training",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "GPU scheduling",
      "Fault tolerance",
      "Multi-tenancy"
    ],
    "companies": [
      "Google",
      "NVIDIA",
      "Meta",
      "Amazon"
    ],
    "answer": "Scheduler: allocate GPU pods to training jobs based on priority, resource requirements, fairness. Multi-tenancy: quota per team, preemption policies. Fault tolerance: checkpointing, auto-restart on GPU failure. Job types: interactive (notebooks), batch training, hyperparameter sweeps. Monitor: GPU utilization, memory usage, network bandwidth. Cost allocation per team. Elastic scaling: expand/contract cluster based on demand.",
    "resources": [
      {
        "url": "https://www.together.ai/blog/multi-node-gpu-training",
        "label": "Together AI — GPU Cluster Training"
      },
      {
        "url": "https://www.interviews.chat/questions/aiml-infrastructure-engineer",
        "label": "interviews.chat — AI/ML Infra Questions"
      },
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems (Training)"
      }
    ],
    "diagramTitle": "GPU Cluster",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Jobs"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Scheduler",
        "subtitle": "priority+quota"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "GPU Pods",
        "subtitle": "multi-tenant"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Checkpoint",
        "subtitle": "fault tolerance"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 81,
    "slug": "design-automl-platform",
    "title": "Design AutoML Platform",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "NAS",
      "Hyperparameter optimization",
      "Feature selection"
    ],
    "companies": [
      "Google(Vertex)",
      "Amazon(SageMaker)",
      "H2O"
    ],
    "answer": "Automated: feature engineering (type inference, encoding, interaction features) → model selection (try multiple algorithms) → hyperparameter optimization (Bayesian optimization, Hyperband) → ensemble → deploy. Neural Architecture Search (NAS) for deep learning. Constraints: training time budget, inference latency budget, model size limit. Explainability: feature importance, SHAP values. User interface for non-ML users.",
    "resources": [
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: AutoML"
      },
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems (AutoML Ch.)"
      },
      {
        "url": "https://bytebytego.com/courses/machine-learning-system-design-interview",
        "label": "ByteByteGo — ML SD: Automation"
      }
    ],
    "diagramTitle": "AutoML",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Data"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Feature Eng",
        "subtitle": "auto"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "Model Select"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "HP Optimize",
        "subtitle": "Bayesian"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Best Model"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 82,
    "slug": "design-federated-learning-system",
    "title": "Design Federated Learning System",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "Privacy preservation",
      "Model aggregation",
      "Communication efficiency"
    ],
    "companies": [
      "Google",
      "Apple",
      "Healthcare"
    ],
    "answer": "Train model across devices without centralizing data. Protocol: server sends model → devices train locally → send only gradients/updates → server aggregates (FedAvg). Privacy: differential privacy (add noise to updates), secure aggregation. Challenges: non-IID data across devices, stragglers (slow devices), communication cost. Compression: gradient quantization, top-k sparsification. Use cases: keyboard prediction (Gboard), health data (cross-hospital models).",
    "resources": [
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Federated Learning"
      },
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems (Privacy Ch.)"
      },
      {
        "url": "https://research.google/pubs/communication-efficient-learning-of-deep-networks-from-decentralized-data/",
        "label": "Google Research — Federated Learning Paper"
      }
    ],
    "diagramTitle": "Federated Learning",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "service",
        "label": "Server",
        "subtitle": "global model"
      },
      {
        "id": "n1",
        "type": "client",
        "label": "Device 1"
      },
      {
        "id": "n2",
        "type": "client",
        "label": "Device 2"
      },
      {
        "id": "n3",
        "type": "client",
        "label": "Device N"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 83,
    "slug": "design-edge-on-device-ml-deployment",
    "title": "Design Edge / On-Device ML Deployment",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "Model optimization",
      "Hardware constraints",
      "OTA updates"
    ],
    "companies": [
      "Apple",
      "Google",
      "Qualcomm"
    ],
    "answer": "Constraints: limited memory (2-4GB), battery, no guaranteed network. Model optimization: quantization (INT8), pruning, architecture search for mobile (MobileNet, EfficientNet). Runtime: CoreML (iOS), TFLite (Android), ONNX Runtime. A/B testing on-device models via feature flags. OTA model updates: download new model in background, swap atomically. Fallback: if on-device fails, fallback to cloud. Privacy: all inference local, no data leaves device.",
    "resources": [
      {
        "url": "https://www.adaface.com/blog/ml-infrastructure-engineer-interview-questions/",
        "label": "Adaface — ML Infra Interview Qs (Edge)"
      },
      {
        "url": "https://mlsysbook.ai/book/contents/core/optimizations/optimizations.html",
        "label": "ML Systems Book — On-Device Optimization"
      },
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems (Edge Ch.)"
      }
    ],
    "diagramTitle": "Edge ML",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Cloud Model"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Quantize",
        "subtitle": "INT8"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "CoreML/TFLite"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "On-Device"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 84,
    "slug": "design-model-fairness-bias-detection-system",
    "title": "Design Model Fairness / Bias Detection System",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "Demographic parity",
      "Equalized odds",
      "Bias mitigation"
    ],
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple"
    ],
    "answer": "Metrics: demographic parity (equal positive rates across groups), equalized odds (equal TPR and FPR), calibration (prediction accuracy equal across groups). Pipeline: define protected attributes → compute metrics per slice → alert on threshold violations. Mitigation: pre-processing (resampling, reweighting), in-processing (fairness constraints in loss), post-processing (threshold adjustment per group). Intersectional analysis: check combinations (race × gender). Regulatory compliance: EU AI Act, ECOA.",
    "resources": [
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Fairness"
      },
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems (Fairness Ch.)"
      },
      {
        "url": "https://www.interviewnode.com/post/top-25-high-level-design-hld-questions-in-ml-interviews-at-faang-companies",
        "label": "InterviewNode — ML HLD (Bias Detection)"
      }
    ],
    "diagramTitle": "Fairness/Bias",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Model"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Slice by Group"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "Compute",
        "subtitle": "parity/odds"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Alert",
        "subtitle": "violated"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Mitigate"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 85,
    "slug": "design-ml-data-pipeline-etl-for-ml",
    "title": "Design ML Data Pipeline (ETL for ML)",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Feature computation",
      "Data validation",
      "Backfill"
    ],
    "companies": [
      "All",
      "FAANG",
      "Data/ML",
      "roles"
    ],
    "answer": "Extract from sources (DB, events, logs) → validate (schema, null checks, distribution checks via Great Expectations) → transform (feature computation, joins, aggregations) → load to feature store + training data store. Orchestration: Airflow DAGs. Idempotent: re-running produces same result. Backfill: recompute features for historical data when logic changes. Monitor: data freshness, pipeline latency, row counts.",
    "resources": [
      {
        "url": "https://huyenchip.com/mlops/",
        "label": "Chip Huyen — MLOps Guide (Data Pipelines)"
      },
      {
        "url": "https://skphd.medium.com/mlops-interview-questions-and-answers-0e25e2200dfc",
        "label": "Medium — MLOps Q&A (ETL for ML)"
      },
      {
        "url": "https://www.yuan-meng.com/posts/ml_infra_interviews/",
        "label": "Yuan Meng — ML Infra (Data Pipeline)"
      }
    ],
    "diagramTitle": "ML Data Pipeline",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "database",
        "label": "Sources"
      },
      {
        "id": "n1",
        "type": "warning",
        "label": "Validate",
        "subtitle": "Great Expectations"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Transform",
        "subtitle": "features"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "Feature Store"
      },
      {
        "id": "n4",
        "type": "database",
        "label": "Training Data"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 86,
    "slug": "design-continuous-training-pipeline",
    "title": "Design Continuous Training Pipeline",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Trigger-based retraining",
      "Data validation",
      "Automated deployment"
    ],
    "companies": [
      "All",
      "FAANG",
      "Senior",
      "ML"
    ],
    "answer": "Triggers: scheduled (weekly), drift-based (data/model drift alert), event-based (new data batch). Pipeline: collect new data → validate (Great Expectations) → retrain (with old + new data) → evaluate against holdout → compare vs production model → auto-deploy if better (with approval gate). Canary deployment: 1% traffic to new model, compare metrics, ramp up. Rollback: instant switch to previous version if metrics degrade.",
    "resources": [
      {
        "url": "https://huyenchip.com/mlops/",
        "label": "Chip Huyen — MLOps Guide (Continuous Training)"
      },
      {
        "url": "https://skphd.medium.com/mlops-interview-questions-and-answers-0e25e2200dfc",
        "label": "Medium — MLOps Q&A (Retraining)"
      },
      {
        "url": "https://www.evidentlyai.com/ml-in-production/data-drift",
        "label": "Evidently AI — Drift-triggered Retraining"
      }
    ],
    "diagramTitle": "Continuous Training",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "warning",
        "label": "Trigger",
        "subtitle": "drift/schedule"
      },
      {
        "id": "n1",
        "type": "client",
        "label": "New Data"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Validate"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Retrain"
      },
      {
        "id": "n4",
        "type": "decision",
        "label": "Eval",
        "subtitle": "vs prod"
      },
      {
        "id": "n5",
        "type": "success",
        "label": "Canary Deploy"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 87,
    "slug": "design-ml-security-adversarial-defense",
    "title": "Design ML Security / Adversarial Defense",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "Adversarial examples",
      "Model extraction",
      "Data poisoning"
    ],
    "companies": [
      "Google",
      "Meta",
      "Apple",
      "Security",
      "roles"
    ],
    "answer": "Attack types: adversarial examples (imperceptible perturbations fool model), model extraction (querying API to steal model), data poisoning (injecting bad training data), membership inference (determining if a sample was in training set). Defenses: adversarial training, input preprocessing, rate limiting API queries, differential privacy for training, model watermarking. Monitor: anomalous query patterns (extraction attempts).",
    "resources": [
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems (Adversarial Ch.)"
      },
      {
        "url": "https://eugeneyan.com/writing/content-moderation/",
        "label": "Eugene Yan — Adversarial ML Patterns"
      },
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Robustness"
      }
    ],
    "diagramTitle": "Adversarial Defense",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "warning",
        "label": "Attacks",
        "subtitle": "perturb/extract/poison"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Adv Training"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Rate Limit"
      },
      {
        "id": "n3",
        "type": "database",
        "label": "DP",
        "subtitle": "training"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 88,
    "slug": "design-multi-tenant-ml-platform",
    "title": "Design Multi-tenant ML Platform",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "Isolation",
      "Resource quotas",
      "Shared infrastructure"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Cloud",
      "providers"
    ],
    "answer": "Multiple teams share ML infrastructure. Isolation: namespace-level (Kubernetes namespaces), resource quotas per team (GPU hours, storage). Shared components: feature store, model registry, experiment tracking, serving infrastructure. Cost allocation: track usage per team/project. Access control: RBAC for datasets, models, endpoints. Standardized interfaces: common training/serving APIs regardless of framework. Self-service: teams can train/deploy without platform team involvement.",
    "resources": [
      {
        "url": "https://www.yuan-meng.com/posts/ml_infra_interviews/",
        "label": "Yuan Meng — ML Infra (Multi-tenant)"
      },
      {
        "url": "https://huyenchip.com/mlops/",
        "label": "Chip Huyen — MLOps Guide (Platform)"
      },
      {
        "url": "https://www.adaface.com/blog/ml-infrastructure-engineer-interview-questions/",
        "label": "Adaface — ML Infra Qs (Platform)"
      }
    ],
    "diagramTitle": "Multi-tenant ML",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Team A"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Shared Infra",
        "subtitle": "K8s ns"
      },
      {
        "id": "n2",
        "type": "client",
        "label": "Team B"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Quotas",
        "subtitle": "GPU hrs"
      },
      {
        "id": "n4",
        "type": "database",
        "label": "RBAC",
        "subtitle": "datasets"
      },
      {
        "id": "n5",
        "type": "service",
        "label": "Cost Track",
        "subtitle": "per project"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 89,
    "slug": "design-training-data-management-system",
    "title": "Design Training Data Management System",
    "difficulty": "Medium",
    "frequency": "Medium",
    "tags": [
      "Data versioning",
      "Lineage",
      "Quality metrics"
    ],
    "companies": [
      "All",
      "FAANG",
      "Data",
      "Platform"
    ],
    "answer": "Version datasets: DVC (Data Version Control) or Delta Lake. Track: which data version trained which model (lineage). Quality metrics: completeness, accuracy, freshness, class balance. Data catalog: discover available datasets, understand schema, read documentation. Access control: PII datasets restricted. Sampling: smart subsets for development/testing. Deduplication: detect and handle duplicate records.",
    "resources": [
      {
        "url": "https://huyenchip.com/mlops/",
        "label": "Chip Huyen — MLOps Guide (Data Versioning)"
      },
      {
        "url": "https://dvc.org/doc",
        "label": "DVC — Data Version Control Documentation"
      },
      {
        "url": "https://skphd.medium.com/mlops-interview-questions-and-answers-0e25e2200dfc",
        "label": "Medium — MLOps Q&A (Data Mgmt)"
      }
    ],
    "diagramTitle": "Data Versioning",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Dataset"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "DVC",
        "subtitle": "hash"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "S3",
        "subtitle": "content-addressed"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Git",
        "subtitle": "track hash"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Reproduce"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 90,
    "slug": "design-ml-workflow-orchestration-kubeflowairflow",
    "title": "Design ML Workflow Orchestration (Kubeflow/Airflow)",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "DAG-based workflows",
      "Caching",
      "Reproducibility"
    ],
    "companies": [
      "All",
      "FAANG",
      "ML",
      "Platform"
    ],
    "answer": "Define ML workflows as DAGs: data prep → feature engineering → training → evaluation → deployment. Orchestrators: Airflow (general), Kubeflow Pipelines (K8s-native), Prefect, Flyte. Caching: skip steps if inputs haven't changed. Parameterized: run same pipeline with different hyperparameters. Monitoring: pipeline health, step durations, failure alerts. Reproducibility: pin versions of code, data, and dependencies.",
    "resources": [
      {
        "url": "https://huyenchip.com/mlops/",
        "label": "Chip Huyen — MLOps Guide (Orchestration)"
      },
      {
        "url": "https://airflow.apache.org/docs/",
        "label": "Apache Airflow — Workflow Documentation"
      },
      {
        "url": "https://skphd.medium.com/mlops-interview-questions-and-answers-0e25e2200dfc",
        "label": "Medium — MLOps Q&A (Kubeflow/Airflow)"
      }
    ],
    "diagramTitle": "ML Orchestration",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "service",
        "label": "DAG",
        "subtitle": "data→feat→train→eval→deploy"
      },
      {
        "id": "n1",
        "type": "warning",
        "label": "Airflow/Kubeflow"
      },
      {
        "id": "n2",
        "type": "cache",
        "label": "Cache",
        "subtitle": "skip unchanged"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 91,
    "slug": "design-model-explainability-debugging-system",
    "title": "Design Model Explainability / Debugging System",
    "difficulty": "Medium",
    "frequency": "Medium",
    "tags": [
      "SHAP",
      "LIME",
      "Attention visualization",
      "Error analysis"
    ],
    "companies": [
      "Google",
      "Apple",
      "Amazon",
      "Regulated",
      "industries"
    ],
    "answer": "Global explanations: feature importance (SHAP summary plots), partial dependence plots. Local explanations: SHAP values for individual predictions, LIME, attention visualization for transformers. Error analysis: slice performance by segments (age, geography, device), find systematic failure modes. Counterfactual explanations: 'if X were different, prediction would change.' Debugging: training data inspection for mislabeled examples, data distribution analysis.",
    "resources": [
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Explainability"
      },
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems (Debug Ch.)"
      },
      {
        "url": "https://www.interviewnode.com/post/top-25-high-level-design-hld-questions-in-ml-interviews-at-faang-companies",
        "label": "InterviewNode — ML HLD (Explainability)"
      }
    ],
    "diagramTitle": "Explainability",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Prediction"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "SHAP",
        "subtitle": "global+local"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "LIME",
        "subtitle": "local"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Attention Viz"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Explanation"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 92,
    "slug": "design-shadow-deployment-dark-launch-system",
    "title": "Design Shadow Deployment / Dark Launch System",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Traffic mirroring",
      "Offline comparison",
      "No user impact"
    ],
    "companies": [
      "Netflix",
      "Google",
      "Meta",
      "Amazon"
    ],
    "answer": "Mirror production traffic to new model (shadow mode). New model processes requests but responses aren't served to users. Compare: new model outputs vs production model outputs offline. Metrics: accuracy difference, latency comparison, error rates. Use for: validating new model before live A/B test, catching regressions, load testing. Handle: async processing to avoid latency impact on production path.",
    "resources": [
      {
        "url": "https://huyenchip.com/mlops/",
        "label": "Chip Huyen — MLOps Guide (Shadow Deploy)"
      },
      {
        "url": "https://netflixtechblog.com/",
        "label": "Netflix Tech Blog — Shadow Testing"
      },
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Deployment"
      }
    ],
    "diagramTitle": "Shadow Deploy",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Prod Traffic"
      },
      {
        "id": "n1",
        "type": "warning",
        "label": "Shadow Model"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "Metrics Diff"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 93,
    "slug": "design-ml-cost-optimization-platform",
    "title": "Design ML Cost Optimization Platform",
    "difficulty": "Medium",
    "frequency": "Medium",
    "tags": [
      "Spot instances",
      "Model efficiency",
      "Resource right-sizing"
    ],
    "companies": [
      "All",
      "cloud",
      "ML",
      "teams"
    ],
    "answer": "Training: spot/preemptible instances (70% cheaper, handle interruptions with checkpointing). Inference: right-size GPU (don't use A100 for a model that fits on T4). Auto-scaling: scale down during low traffic. Model optimization: quantization reduces GPU memory → use cheaper GPUs. Batch inference on spot. Multi-model serving: pack multiple small models on one GPU. Cost dashboards per team/project. Budget alerts.",
    "resources": [
      {
        "url": "https://www.yuan-meng.com/posts/ml_infra_interviews/",
        "label": "Yuan Meng — ML Infra (Cost Optimization)"
      },
      {
        "url": "https://huyenchip.com/mlops/",
        "label": "Chip Huyen — MLOps Guide (Cost)"
      },
      {
        "url": "https://www.adaface.com/blog/ml-infrastructure-engineer-interview-questions/",
        "label": "Adaface — ML Infra Qs (Cost)"
      }
    ],
    "diagramTitle": "ML Cost Optimization",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "warning",
        "label": "Training",
        "subtitle": "spot 70% off"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Inference",
        "subtitle": "right-size GPU"
      },
      {
        "id": "n2",
        "type": "success",
        "label": "Auto-scale",
        "subtitle": "traffic-based"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 94,
    "slug": "design-inference-optimization-pipeline",
    "title": "Design Inference Optimization Pipeline",
    "difficulty": "Hard",
    "frequency": "High",
    "tags": [
      "Quantization",
      "TensorRT",
      "KV cache",
      "Speculative decoding"
    ],
    "companies": [
      "Google",
      "NVIDIA",
      "OpenAI",
      "All",
      "AI"
    ],
    "answer": "Model-level: quantization (INT8/INT4), pruning, distillation. Runtime: TensorRT (NVIDIA), ONNX Runtime. Batching: dynamic batching, continuous batching for LLMs. Memory: KV cache optimization for transformer inference. Speculative decoding: small model drafts tokens, large model verifies (2-3x speedup). Hardware: GPU selection (H100 vs A100 vs L40S), CPU offloading for memory-bound operations. Target metrics: throughput (tokens/sec), latency (TTFT, TPOT), cost per token.",
    "resources": [
      {
        "url": "https://mlsysbook.ai/book/contents/core/optimizations/optimizations.html",
        "label": "ML Systems Book — Inference Optimization"
      },
      {
        "url": "https://skphd.medium.com/llm-system-design-interview-questions-and-answers-2a7a16212492",
        "label": "Medium — LLM Design (Inference Opt)"
      },
      {
        "url": "https://www.analyticsvidhya.com/blog/2025/09/llm-compression-techniques/",
        "label": "Analytics Vidhya — Compression Techniques"
      }
    ],
    "diagramTitle": "Inference Optimization",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Model"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Quantize",
        "subtitle": "INT8"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "TensorRT"
      },
      {
        "id": "n3",
        "type": "cache",
        "label": "KV Cache"
      },
      {
        "id": "n4",
        "type": "success",
        "label": "Speculative Decode",
        "subtitle": "2-3x faster"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 95,
    "slug": "design-data-versioning-system-dvc-like",
    "title": "Design Data Versioning System (DVC-like)",
    "difficulty": "Medium",
    "frequency": "Medium",
    "tags": [
      "Content-addressable storage",
      "Git integration",
      "Reproducibility"
    ],
    "companies": [
      "All",
      "FAANG",
      "Data/ML"
    ],
    "answer": "Track dataset versions alongside code versions. Content-addressable storage: hash file contents, store in S3/GCS, track hash in Git. Commands: dvc add (track), dvc push (upload), dvc pull (download). Pipeline tracking: data version → feature version → model version (full lineage). Handle: large files (TB-scale), incremental updates, schema evolution. Integration: Git branches = different data versions for experiments.",
    "resources": [
      {
        "url": "https://dvc.org/doc",
        "label": "DVC — Data Version Control Docs"
      },
      {
        "url": "https://huyenchip.com/mlops/",
        "label": "Chip Huyen — MLOps Guide (Versioning)"
      },
      {
        "url": "https://skphd.medium.com/mlops-interview-questions-and-answers-0e25e2200dfc",
        "label": "Medium — MLOps Q&A (DVC)"
      }
    ],
    "diagramTitle": "Data Versioning DVC",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Files"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Hash",
        "subtitle": "SHA256"
      },
      {
        "id": "n2",
        "type": "database",
        "label": "S3",
        "subtitle": "content-addressed"
      },
      {
        "id": "n3",
        "type": "warning",
        "label": "Git",
        "subtitle": ".dvc files"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 96,
    "slug": "design-online-learning-real-time-model-update-system",
    "title": "Design Online Learning / Real-time Model Update System",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "Incremental training",
      "Concept drift adaptation",
      "Feature freshness"
    ],
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Ads",
      "teams"
    ],
    "answer": "Update model continuously as new data arrives (not batch retrain). Use cases: ads (user behavior changes hourly), fraud (new attack patterns). Approaches: online gradient descent, incremental tree learning, fine-tune neural net with small LR. Challenges: catastrophic forgetting, feedback loop (model influences data it trains on), delayed labels. Safeguards: validate before deploying each update, rollback if metrics drop, periodic full retrain as baseline.",
    "resources": [
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems (Online Learning)"
      },
      {
        "url": "https://eugeneyan.com/writing/bandits/",
        "label": "Eugene Yan — Bandits (Online Updates)"
      },
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Online Learning"
      }
    ],
    "diagramTitle": "Online Learning",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "New Data"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Incremental",
        "subtitle": "small LR"
      },
      {
        "id": "n2",
        "type": "decision",
        "label": "Validate"
      },
      {
        "id": "n3",
        "type": "success",
        "label": "Deploy"
      },
      {
        "id": "n4",
        "type": "warning",
        "label": "Rollback"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 97,
    "slug": "design-ml-governance-compliance-system",
    "title": "Design ML Governance & Compliance System",
    "difficulty": "Medium",
    "frequency": "Medium",
    "tags": [
      "Model cards",
      "Audit trails",
      "Regulatory compliance"
    ],
    "companies": [
      "All",
      "FAANG",
      "Regulated",
      "industries"
    ],
    "answer": "Model cards: document model purpose, training data, performance across demographics, limitations, intended use. Audit trail: who trained/deployed which model, when, with what data. Approval workflows: human review before production. Compliance: EU AI Act (risk categories), GDPR (right to explanation), FDA (medical AI). Automated checks: fairness metrics, data privacy (no PII in training data), model lineage verification.",
    "resources": [
      {
        "url": "https://huyenchip.com/mlops/",
        "label": "Chip Huyen — MLOps Guide (Governance)"
      },
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Ethics"
      },
      {
        "url": "https://skphd.medium.com/mlops-interview-questions-and-answers-0e25e2200dfc",
        "label": "Medium — MLOps Q&A (Compliance)"
      }
    ],
    "diagramTitle": "ML Governance",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "database",
        "label": "Model Card"
      },
      {
        "id": "n1",
        "type": "warning",
        "label": "Audit Trail"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Approval",
        "subtitle": "human"
      },
      {
        "id": "n3",
        "type": "decision",
        "label": "Compliance",
        "subtitle": "EU AI Act"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 98,
    "slug": "design-data-quality-monitoring-for-ml",
    "title": "Design Data Quality Monitoring for ML",
    "difficulty": "Medium",
    "frequency": "High",
    "tags": [
      "Schema validation",
      "Distribution monitoring",
      "Anomaly detection"
    ],
    "companies": [
      "All",
      "FAANG",
      "Data",
      "Platform"
    ],
    "answer": "Schema validation: enforce column types, required fields, value ranges. Distribution monitoring: track statistics (mean, std, percentiles, cardinality) over time, alert on significant changes (PSI > 0.1). Anomaly detection: sudden spikes/drops in feature values, unexpected nulls, label distribution shifts. Tools: Great Expectations, Deequ, custom monitors. Integration: run checks at pipeline boundaries (after ingestion, before training, before serving).",
    "resources": [
      {
        "url": "https://www.evidentlyai.com/ml-in-production/data-drift",
        "label": "Evidently AI — Data Quality Monitoring"
      },
      {
        "url": "https://huyenchip.com/mlops/",
        "label": "Chip Huyen — MLOps Guide (Data Quality)"
      },
      {
        "url": "https://skphd.medium.com/mlops-interview-questions-and-answers-0e25e2200dfc",
        "label": "Medium — MLOps Q&A (Data Monitoring)"
      }
    ],
    "diagramTitle": "Data Quality",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "client",
        "label": "Pipeline"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Schema",
        "subtitle": "validate"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "Distribution",
        "subtitle": "PSI monitor"
      },
      {
        "id": "n3",
        "type": "decision",
        "label": "Anomaly",
        "subtitle": "alert on shift"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 99,
    "slug": "design-ml-ab-testing-with-interleaving",
    "title": "Design ML A/B Testing with Interleaving",
    "difficulty": "Hard",
    "frequency": "Medium",
    "tags": [
      "Interleaved experiments",
      "Team-Draft",
      "Sensitivity analysis"
    ],
    "companies": [
      "Netflix",
      "Google",
      "Amazon"
    ],
    "answer": "Interleaving: show results from both models mixed in single result list (more sensitive than traditional A/B). Team-Draft interleaving: alternate picks from each model's ranked list. 10x more sensitive than standard A/B (need 10x fewer users). Use for: search ranking, recommendations where user sees a list. Standard A/B still needed for: UI changes, pricing, binary outcomes. Handle: novelty effects, position bias in interleaved results.",
    "resources": [
      {
        "url": "https://netflixtechblog.com/",
        "label": "Netflix Tech Blog — Interleaving Experiments"
      },
      {
        "url": "https://www.hellointerview.com/learn/ml-system-design/core-concepts/evaluation",
        "label": "HelloInterview — ML Evaluation (Interleaving)"
      },
      {
        "url": "https://eugeneyan.com/writing/counterfactual-evaluation/",
        "label": "Eugene Yan — Counterfactual Evaluation"
      }
    ],
    "diagramTitle": "Interleaving A/B",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "service",
        "label": "Model A"
      },
      {
        "id": "n1",
        "type": "decision",
        "label": "Team-Draft",
        "subtitle": "alternate"
      },
      {
        "id": "n2",
        "type": "service",
        "label": "Model B"
      },
      {
        "id": "n3",
        "type": "client",
        "label": "Interleaved list"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 100,
    "slug": "design-responsible-ai-ai-ethics-framework",
    "title": "Design Responsible AI / AI Ethics Framework",
    "difficulty": "Medium",
    "frequency": "Medium",
    "tags": [
      "Fairness assessment",
      "Transparency",
      "Accountability",
      "Contestability"
    ],
    "companies": [
      "All",
      "FAANG",
      "AI",
      "Ethics",
      "roles"
    ],
    "answer": "Framework: (1) Fairness — assess across demographics before launch. (2) Transparency — model cards, documentation, explainability. (3) Accountability — clear ownership for each model in production. (4) Privacy — data minimization, consent, right to deletion. (5) Contestability — mechanism for users to challenge AI decisions. (6) Safety — red-teaming, adversarial testing, kill switch for high-risk systems. Implementation: pre-launch review board, continuous monitoring, incident response plan.",
    "resources": [
      {
        "url": "https://huyenchip.com/machine-learning-systems-design/toc.html",
        "label": "Chip Huyen — ML Systems (Responsible AI)"
      },
      {
        "url": "https://www.educative.io/courses/grokking-the-machine-learning-interview",
        "label": "Educative — Grokking ML: Ethics & Fairness"
      },
      {
        "url": "https://github.com/alirezadir/machine-learning-interviews/blob/main/src/MLSD/ml-system-design.md",
        "label": "GitHub — ML Interview (AI Ethics)"
      }
    ],
    "diagramTitle": "Responsible AI",
    "diagramNodes": [
      {
        "id": "n0",
        "type": "service",
        "label": "Fairness"
      },
      {
        "id": "n1",
        "type": "service",
        "label": "Transparency"
      },
      {
        "id": "n2",
        "type": "warning",
        "label": "Accountability"
      },
      {
        "id": "n3",
        "type": "service",
        "label": "Privacy"
      },
      {
        "id": "n4",
        "type": "warning",
        "label": "Safety",
        "subtitle": "red-team"
      }
    ],
    "bucket": 3,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 1,
    "slug": "your-rag-retrieves-the-correct-chunk-but-the-llm-still-answe",
    "title": "Your RAG retrieves the correct chunk but the LLM still answers wrong. Why?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 2,
    "slug": "semantic-chunking-gives-you-better-retrieval-recall-but-wors",
    "title": "Semantic chunking gives you better retrieval recall but worse end-to-end accuracy than recursive chunking. Explain.",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 3,
    "slug": "bm25-is-beating-your-dense-embedding-retrieval-on-your-domai",
    "title": "BM25 is beating your dense embedding retrieval on your domain. What does that tell you?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 4,
    "slug": "a-rag-system-retrieves-20-candidate-chunks-but-can-only-fit-",
    "title": "A RAG system retrieves 20 candidate chunks but can only fit 5 in context. When do you skip the reranker for efficiency?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 5,
    "slug": "how-do-you-merge-rankings-from-bm25-and-dense-retrieval-into",
    "title": "How do you merge rankings from BM25 and dense retrieval into one result set?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 6,
    "slug": "two-retrieved-chunks-contradict-each-other-how-should-the-sy",
    "title": "Two retrieved chunks contradict each other. How should the system handle it?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 7,
    "slug": "your-rag-works-on-eval-but-fails-on-production-queries-what-",
    "title": "Your RAG works on eval but fails on production queries. What's the gap?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 8,
    "slug": "when-does-lost-in-the-middle-hurt-you-and-what-do-you-do-abo",
    "title": "When does \"lost in the middle\" hurt you, and what do you do about it?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 9,
    "slug": "when-does-rag-fail-and-fine-tuning-win",
    "title": "When does RAG fail and fine-tuning win?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 10,
    "slug": "why-can-t-cross-encoders-pre-compute-like-bi-encoders",
    "title": "Why can't cross-encoders pre-compute like bi-encoders?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 11,
    "slug": "what-is-late-chunking-and-when-would-you-use-it",
    "title": "What is \"late chunking\" and when would you use it?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 12,
    "slug": "your-rag-accuracy-dropped-from-80-to-60-after-an-embedding-m",
    "title": "Your RAG accuracy dropped from 80% to 60% after an embedding model upgrade. Debug.",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 13,
    "slug": "cosine-similarity-vs-dot-product-vs-euclidean-when-does-each",
    "title": "Cosine similarity vs dot product vs Euclidean — when does each fail?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 14,
    "slug": "what-are-matryoshka-embeddings-and-when-would-you-use-them",
    "title": "What are Matryoshka embeddings and when would you use them?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 15,
    "slug": "your-similarity-scores-are-all-0-85-even-for-clearly-unrelat",
    "title": "Your similarity scores are all ~0.85+, even for clearly unrelated queries. What's wrong?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 16,
    "slug": "binary-vs-scalar-vs-product-quantization-tradeoffs-and-when-",
    "title": "Binary vs scalar vs product quantization — tradeoffs and when to pick each.",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 17,
    "slug": "should-queries-and-documents-be-embedded-with-the-same-promp",
    "title": "Should queries and documents be embedded with the same prompt/prefix?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 18,
    "slug": "top-mteb-model-performs-poorly-on-your-data-why-and-what-do-",
    "title": "Top MTEB model performs poorly on your data. Why, and what do you do?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 19,
    "slug": "bi-encoder-vs-cross-encoder-vs-colbert-late-interaction-when",
    "title": "Bi-encoder vs cross-encoder vs ColBERT (late interaction) — when each?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 20,
    "slug": "explain-hyde-hypothetical-document-embeddings-what-problem-d",
    "title": "Explain HyDE (Hypothetical Document Embeddings) — what problem does it solve?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 21,
    "slug": "when-do-you-fine-tune-an-embedding-model-and-how-critical-ar",
    "title": "When do you fine-tune an embedding model, and how critical are hard negatives?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 22,
    "slug": "how-do-you-upgrade-an-embedding-model-in-production-without-",
    "title": "How do you upgrade an embedding model in production without downtime?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 23,
    "slug": "your-multilingual-embedding-model-fails-on-low-resource-lang",
    "title": "Your multilingual embedding model fails on low-resource languages. Why and what's the fix?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 24,
    "slug": "cls-pooling-vs-mean-pooling-vs-last-token-pooling-does-the-c",
    "title": "CLS pooling vs mean pooling vs last-token pooling — does the choice matter?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 25,
    "slug": "how-do-you-search-dates-in-a-rag-chunk-when-text-can-contain",
    "title": "How do you search dates in a RAG chunk when text can contain any date format?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 26,
    "slug": "your-agent-loops-forever-retrying-the-same-failed-tool-what-",
    "title": "Your agent loops forever retrying the same failed tool. What's the fix?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 27,
    "slug": "how-do-you-make-tool-calls-reliable-when-external-apis-fail",
    "title": "How do you make tool calls reliable when external APIs fail?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 28,
    "slug": "when-do-you-choose-hierarchical-planning-over-react-reactive",
    "title": "When do you choose hierarchical planning over ReAct (reactive)?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 29,
    "slug": "chain-of-thought-prompting-isn-t-improving-accuracy-on-your-",
    "title": "Chain-of-thought prompting isn't improving accuracy on your reasoning task. What's wrong?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 30,
    "slug": "how-do-you-test-a-non-deterministic-agent",
    "title": "How do you test a non-deterministic agent?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 31,
    "slug": "when-is-full-autonomy-the-wrong-design-choice-when-should-it",
    "title": "When is \"full autonomy\" the wrong design choice? When should it be a workflow?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 32,
    "slug": "where-does-human-in-the-loop-hitl-belong-in-an-agent-system",
    "title": "Where does human-in-the-loop (HITL) belong in an agent system?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 33,
    "slug": "your-agent-has-200-message-conversations-and-times-out-what-",
    "title": "Your agent has 200-message conversations and times out. What's the architecture issue?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 34,
    "slug": "how-do-you-dynamically-select-tools-from-a-large-registry-10",
    "title": "How do you dynamically select tools from a large registry (100+ tools)?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 35,
    "slug": "your-agent-is-calling-the-wrong-tool-10-of-the-time-how-do-y",
    "title": "Your agent is calling the wrong tool ~10% of the time. How do you debug?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 36,
    "slug": "mcp-vs-a2a-give-a-concrete-example-where-you-need-both",
    "title": "MCP vs A2A — give a concrete example where you need both.",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 37,
    "slug": "in-a-multi-agent-system-how-do-you-share-context-across-agen",
    "title": "In a multi-agent system, how do you share context across agents without a god-object?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 38,
    "slug": "why-not-just-use-one-smart-agent-with-all-the-tools-instead-",
    "title": "Why not just use one smart agent with all the tools, instead of a multi-agent system?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 39,
    "slug": "one-agent-in-your-multi-agent-system-crashes-mid-workflow-wh",
    "title": "One agent in your multi-agent system crashes mid-workflow. What happens to the task?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 40,
    "slug": "mcp-server-security-what-s-the-threat-model",
    "title": "MCP server security — what's the threat model?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 41,
    "slug": "walk-through-a-4-tier-memory-architecture-for-a-long-running",
    "title": "Walk through a 4-tier memory architecture for a long-running agent.",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 42,
    "slug": "short-term-vs-long-term-vs-working-memory-what-s-the-differe",
    "title": "Short-term vs long-term vs working memory — what's the difference in an agent context?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": 1,
    "status": "coming-soon"
  },
  {
    "number": 43,
    "slug": "how-do-you-prevent-one-user-s-memory-from-leaking-to-another",
    "title": "How do you prevent one user's memory from leaking to another in a shared RAG + memory system?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 44,
    "slug": "your-agent-forgets-context-mid-conversation-retrieval-proble",
    "title": "Your agent \"forgets\" context mid-conversation. Retrieval problem or storage problem?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 45,
    "slug": "how-do-you-evaluate-a-rag-system-with-no-ground-truth-answer",
    "title": "How do you evaluate a RAG system with no ground truth answers?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 46,
    "slug": "llm-as-judge-is-biased-how-do-you-detect-and-correct",
    "title": "LLM-as-judge is biased. How do you detect and correct?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 47,
    "slug": "faithfulness-relevance-correctness-how-are-these-three-diffe",
    "title": "Faithfulness, relevance, correctness — how are these three different?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 48,
    "slug": "your-evals-all-pass-but-users-are-complaining-what-s-missing",
    "title": "Your evals all pass but users are complaining. What's missing?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 49,
    "slug": "how-do-you-regression-test-a-prompt-change",
    "title": "How do you regression-test a prompt change?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 50,
    "slug": "your-hallucination-rate-suddenly-spikes-in-production-debug",
    "title": "Your hallucination rate suddenly spikes in production. Debug.",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 51,
    "slug": "an-attacker-poisons-a-document-in-your-rag-corpus-how-does-t",
    "title": "An attacker poisons a document in your RAG corpus. How does the attack work and how do you defend?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 52,
    "slug": "your-agent-leaks-its-system-prompt-to-attackers-what-went-wr",
    "title": "Your agent leaks its system prompt to attackers. What went wrong in the design?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 53,
    "slug": "action-selector-vs-plan-then-execute-security-trade-offs",
    "title": "Action-selector vs plan-then-execute — security trade-offs.",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 54,
    "slug": "how-do-you-prevent-an-agent-with-tool-access-from-exfiltrati",
    "title": "How do you prevent an agent with tool access from exfiltrating data?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 55,
    "slug": "why-does-rag-not-prevent-prompt-injection",
    "title": "Why does RAG not prevent prompt injection?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 56,
    "slug": "break-down-the-real-cost-of-a-rag-request-it-s-not-just-the-",
    "title": "Break down the real cost of a RAG request. It's not just the LLM.",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 57,
    "slug": "semantic-caching-when-does-it-help-when-does-it-mislead",
    "title": "Semantic caching — when does it help, when does it mislead?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 58,
    "slug": "prompt-caching-vs-response-caching-different-problems",
    "title": "Prompt caching vs response caching — different problems.",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 59,
    "slug": "design-a-model-routing-strategy-to-cut-inference-costs-60-80",
    "title": "Design a model routing strategy to cut inference costs 60-80%.",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 60,
    "slug": "your-agent-s-cost-is-10x-budget-where-to-look-first",
    "title": "Your agent's cost is 10x budget. Where to look first?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 61,
    "slug": "lora-vs-full-fine-tuning-for-a-domain-specific-assistant-how",
    "title": "LoRA vs full fine-tuning for a domain-specific assistant — how do you decide?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 62,
    "slug": "your-fine-tuned-model-memorized-training-examples-verbatim-i",
    "title": "Your fine-tuned model memorized training examples verbatim instead of learning patterns. Fix.",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 63,
    "slug": "when-would-you-use-peft-rag-together",
    "title": "When would you use PEFT + RAG together?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 64,
    "slug": "tokenization-gotchas-why-does-the-model-think-strawberry-has",
    "title": "Tokenization gotchas — why does the model think \"strawberry\" has 2 r's?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 65,
    "slug": "your-llm-returns-invalid-json-2-of-the-time-walk-through-you",
    "title": "Your LLM returns invalid JSON 2% of the time. Walk through your options.",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 66,
    "slug": "when-do-you-use-a-reasoning-model-o3r1-instead-of-claude-son",
    "title": "When do you use a reasoning model (o3/R1) instead of Claude-Sonnet/GPT-4o?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 67,
    "slug": "design-rag-over-scanned-invoices-with-tables-ocr-text-vs-col",
    "title": "Design RAG over scanned invoices with tables. OCR + text vs ColPali vs vision-native — trade-offs.",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 68,
    "slug": "advanced-retrieval-patterns-when-do-you-reach-for-self-rag-c",
    "title": "Advanced retrieval patterns — when do you reach for Self-RAG, CRAG, multi-query, parent-doc?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": 1,
    "status": "coming-soon"
  },
  {
    "number": 69,
    "slug": "explain-hnsw-vs-ivf-vs-ivf-pq-how-do-you-tune-them",
    "title": "Explain HNSW vs IVF vs IVF-PQ. How do you tune them?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 70,
    "slug": "how-does-vllm-achieve-20x-throughput-vs-naive-transformers-e",
    "title": "How does vLLM achieve 20x throughput vs naive transformers? Explain the stack.",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 71,
    "slug": "your-thumbs-up-rate-went-from-70-to-72-after-a-prompt-change",
    "title": "Your thumbs-up rate went from 70% to 72% after a prompt change. Is it significant?",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 72,
    "slug": "customer-says-we-leaked-data-from-another-tenant-through-our",
    "title": "\"Customer says we leaked data from another tenant through our chatbot. Explain what might have happened.\"",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 73,
    "slug": "we-want-to-migrate-from-openai-to-an-open-source-model-what-",
    "title": "\"We want to migrate from OpenAI to an open-source model. What breaks?\"",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 74,
    "slug": "legal-wants-us-to-cite-every-source-in-every-response-retrof",
    "title": "\"Legal wants us to cite every source in every response. Retrofit our existing RAG system.\"",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  },
  {
    "number": 75,
    "slug": "design-a-rag-system-for-10m-documents-with-sub-2-second-late",
    "title": "\"Design a RAG system for 10M documents with sub-2-second latency.\"",
    "difficulty": "Medium",
    "frequency": null,
    "tags": [],
    "companies": [],
    "answer": "",
    "resources": [
      {
        "url": "https://github.com/KalyanKS-NLP/RAG-Interview-Questions-and-Answers-Hub",
        "label": "GitHub: 100+ RAG Q&amp;A Hub"
      },
      {
        "url": "https://github.com/llmgenai/LLMInterviewQuestions",
        "label": "GitHub: LLM Interview Q (FAANG)"
      },
      {
        "url": "https://github.com/amitshekhariitbhu/ai-engineering-interview-questions",
        "label": "GitHub: AI Engineering Interview"
      },
      {
        "url": "https://www.datacamp.com/blog/rag-interview-questions",
        "label": "DataCamp: 30 RAG Questions (2026)"
      },
      {
        "url": "https://www.datacamp.com/blog/agentic-ai-interview-questions",
        "label": "DataCamp: 30 Agentic AI Questions"
      },
      {
        "url": "https://www.datacamp.com/blog/llm-interview-questions",
        "label": "DataCamp: 36 LLM Questions (2026)"
      },
      {
        "url": "https://www.analyticsvidhya.com/blog/2026/02/agentic-ai-interview-questions-and-answers/",
        "label": "Analytics Vidhya: 30 Agentic Qs (2026)"
      },
      {
        "url": "https://www.kdnuggets.com/10-essential-agentic-ai-interview-questions-for-ai-engineers",
        "label": "KDnuggets: 10 Agentic Q (Oct 2025)"
      },
      {
        "url": "https://genai.owasp.org/llmrisk/llm01-prompt-injection/",
        "label": "OWASP LLM01: Prompt Injection"
      },
      {
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html",
        "label": "OWASP: Injection Prevention"
      },
      {
        "url": "https://arxiv.org/pdf/2506.08837",
        "label": "arXiv 2506.08837: Design Patterns for Securing LLM Agents"
      },
      {
        "url": "https://arxiv.org/html/2506.13023v1",
        "label": "arXiv: Practical Guide for Evaluating LLMs"
      },
      {
        "url": "https://blog.premai.io/rag-chunking-strategies-the-2026-benchmark-guide/",
        "label": "PremAI: RAG Chunking Benchmarks (2026)"
      },
      {
        "url": "https://weaviate.io/blog/chunking-strategies-for-rag",
        "label": "Weaviate: Chunking Strategies"
      },
      {
        "url": "https://aiengineerplaybook.substack.com/p/rag-that-actually-works-choosing",
        "label": "AI Engineer Playbook: RAG in prod"
      },
      {
        "url": "https://medium.com/@ajayverma23/optimizing-genai-and-agentic-ai-balancing-cost-quality-and-latency-in-production-0242ef84a306",
        "label": "Ajay Verma: GenAI Iron Triangle"
      },
      {
        "url": "https://www.technomanagers.com/p/solving-the-genai-latency-problem",
        "label": "Shailesh Sharma: GenAI Latency"
      },
      {
        "url": "https://myengineeringpath.dev/genai-engineer/system-design-interview/",
        "label": "MyEngineeringPath: GenAI Sys Design"
      },
      {
        "url": "https://thedataexchange.media/a2a-protocol/",
        "label": "Data Exchange: A2A Protocol (Google)"
      },
      {
        "url": "https://www.intuz.com/blog/build-multi-agent-system-with-a2a-mcp-server",
        "label": "Intuz: A2A + MCP Multi-agent"
      },
      {
        "url": "https://www.interviewnode.com/post/evaluating-llm-performance-how-to-talk-about-model-quality-and-hallucinations-in-interviews",
        "label": "InterviewNode: Eval &amp; Hallucinations"
      },
      {
        "url": "https://cresta.com/blog/grounding-reality---how-cresta-tackles-llm-hallucinations-in-enterprise-ai",
        "label": "Cresta: Grounding in Production"
      },
      {
        "url": "https://www.evidentlyai.com/blog/llm-hallucination-examples",
        "label": "EvidentlyAI: Hallucination Cases"
      },
      {
        "url": "https://www.stackoverflowtips.com/posts/top-50-genai-llm-interview-questions-answers-2025",
        "label": "StackOverflowTips: Top 50 GenAI Qs"
      }
    ],
    "diagramTitle": null,
    "diagramNodes": null,
    "bucket": 4,
    "tier": null,
    "status": "coming-soon"
  }
];

export const getQuestion = (slug) => questions.find((q) => q.slug === slug);
export const getQuestionsByBucket = (bucket) => questions.filter((q) => q.bucket === bucket);
