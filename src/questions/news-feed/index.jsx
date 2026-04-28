import Section from '../../components/ui/Section';
import Callout from '../../components/ui/Callout';
import Code from '../../components/ui/Code';
import Stat from '../../components/ui/Stat';
import DeepDiveLayout from '../../components/DeepDiveLayout';
import LifecycleDiagram from './diagrams/LifecycleDiagram';
import FanoutComparisonViz from './diagrams/FanoutComparisonViz';
import CelebrityProblemViz from './diagrams/CelebrityProblemViz';
import RankingFunnelViz from './diagrams/RankingFunnelViz';
import FeedCacheViz from './diagrams/FeedCacheViz';

const SECTIONS = [
  { id: 'requirements',      label: 'Requirements',         phase: 'Foundations' },
  { id: 'architecture',      label: 'Architecture',         phase: 'Foundations' },
  { id: 'fanout-strategies', label: 'Fan-out strategies',   phase: 'Hot path' },
  { id: 'celebrity-problem', label: 'Celebrity problem',    phase: 'Hot path' },
  { id: 'write-path',        label: 'Write path',           phase: 'Hot path' },
  { id: 'feed-cache',        label: 'Feed cache (Redis)',   phase: 'Hot path' },
  { id: 'read-path',         label: 'Read path',            phase: 'Hot path' },
  { id: 'ranking',           label: 'ML ranking funnel',    phase: 'Features' },
  { id: 'live-updates',      label: 'Live updates',         phase: 'Features' },
  { id: 'edits-deletes',     label: 'Edits & deletes',      phase: 'Features' },
  { id: 'pagination',        label: 'Pagination',           phase: 'Features' },
  { id: 'cold-start',        label: 'Cold start',           phase: 'Features' },
  { id: 'failure-modes',     label: 'Failure modes',        phase: 'Production' },
  { id: 'multi-region',      label: 'Multi-region',         phase: 'Production' },
  { id: 'tradeoffs',         label: 'Tradeoffs',            phase: 'Production' },
  { id: 'deployment',        label: 'Deployment',           phase: 'Production' },
];

const PHASES = ['Foundations', 'Hot path', 'Features', 'Production'];

export default function NewsFeed() {
  return (
    <DeepDiveLayout
      documentTitle="Design a News Feed — System Design Bible"
      theme="blue"
      sections={SECTIONS}
      phases={PHASES}
      header={{
        difficulty: 'Hard',
        frequency: 'Very High',
        companies: 'Meta · Google · Twitter/X · LinkedIn',
        title: 'Design a News Feed',
        subtitle: 'Twitter / Instagram / Facebook',
        tags: ['Fan-out', 'Hybrid push/pull', 'Redis sorted set', 'ML ranking', 'Celebrity problem', 'Kafka', 'Cache invalidation'],
      }}
      prev={{ to: '/q/chat-system', label: 'Q2 — Chat System' }}
      next={{ to: '/q/youtube', label: 'Q4 — YouTube' }}
    >
      {/* ── 1. REQUIREMENTS ── */}
      <Section
        id="requirements"
        number={1}
        eyebrow="Start here"
        title="Requirements & scale"
        intro="Feed systems live or die by their fan-out strategy. Pin down scale numbers first — they pick the strategy for you."
      >
        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mb-3">Functional requirements</h3>
        <ul>
          <li><strong>Post creation</strong> — text, images, video. Returns instantly with a "posted!" ack.</li>
          <li><strong>Feed read</strong> — User opens the app, sees a personalized, ML-ranked timeline.</li>
          <li><strong>Follow / unfollow</strong> — directed graph; affects what shows in the feed.</li>
          <li><strong>Engagement</strong> — like, comment, share, hide. Feed back into the ranker.</li>
          <li><strong>Live updates</strong> — banner "show 12 new posts" when new content lands while user is on screen.</li>
          <li><strong>Edits & deletes</strong> — author edits or deletes; feed must reflect within seconds.</li>
        </ul>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Non-functional requirements</h3>
        <ul>
          <li><strong>Feed latency</strong> — &lt; 200ms p99 from app open to first post rendered.</li>
          <li><strong>Freshness</strong> — a regular friend's post must appear within ~5 seconds of being created.</li>
          <li><strong>Availability</strong> — read path is critical (your home tab); writes can fail and be retried.</li>
          <li><strong>Scale</strong> — 500M DAU, 100M posts/day, average user opens feed 10× per day = 5B feed reads/day.</li>
        </ul>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6 not-prose">
          <Stat value="500M"   label="DAU" sub="across the world" accent />
          <Stat value="100M"   label="Posts / day" sub="≈ 1.2K/sec sustained" />
          <Stat value="5B"     label="Feed reads / day" sub="100× the post volume" accent />
          <Stat value="< 200ms" label="p99 feed open" sub="cold start incl. ranker" />
        </div>

        <Callout variant="insight" title="The interviewer's hidden question">
          A news feed is the canonical "read-heavy + ML-personalized + uneven fan-out" problem. The interviewer wants you to: (1) name the push-vs-pull tradeoff, (2) propose a hybrid threshold and defend it, (3) put a sane ML ranker in the read path, (4) show you understand the celebrity problem before they bring it up. Doing all four cleanly is the difference between a passing answer and a strong-hire signal.
        </Callout>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Read/write asymmetry — the central insight</h3>
        <p>
          Feeds are read 50–100× more often than they're written. Every architectural choice falls out of that one ratio: pre-compute on the (rare) write side so the (frequent) read side is cheap. The Redis feed cache, the fan-out distributor, the celebrity threshold — all serve that asymmetry.
        </p>
      </Section>

      {/* ── 2. ARCHITECTURE ── */}
      <Section
        id="architecture"
        number={2}
        eyebrow="The big picture"
        title="End-to-end architecture"
        intro="One animated diagram covers it all: User A posts, fan-out runs, User B opens the app, ranked feed renders. Every later section drills into one slice of this picture."
      >
        <LifecycleDiagram />

        <div className="space-y-3 not-prose mt-4">
          {[
            { n: '1. Post Service', c: '#74b9ff', d: 'Stateless. Saves to Posts DB, uploads media to S3, publishes a PostCreated event to Kafka, then ACKs the client. No work happens on the request thread that doesn\'t have to.' },
            { n: '2. Kafka', c: '#fdcb6e', d: 'Durable buffer between post creation and the slow downstream work (fan-out, indexing, notifications). Three independent consumer groups read the same topic.' },
            { n: '3. Feed Distributor', c: '#74b9ff', d: 'Reads PostCreated events. For regular authors, batches followers and queues fan-out tasks. For celebrities, skips writes entirely. The hybrid threshold lives here.' },
            { n: '4. Worker pool', c: '#74b9ff', d: 'Stateless workers consume the task queue, write postIds to each follower\'s Redis sorted set in parallel. The push half of "hybrid".' },
            { n: '5. Feed Cache', c: '#00cec9', d: 'Redis cluster, one sorted set per user keyed by feed:user_{id}. Holds top ~1000 candidate postIds with score = post timestamp. ZREVRANGE on read = sub-ms.' },
            { n: '6. Feed Service', c: '#74b9ff', d: 'On feed open: read pre-built cache (1 call) + pull celebrity posts on demand + fetch ads. Merge, rank with ML model, return JSON.' },
            { n: '7. Ranker', c: '#a29bfe', d: 'Three-stage funnel — candidate gen, light ranker (GBDT), heavy ranker (DNN). Ships ~10 ranked posts per page in ~50ms.' },
          ].map((layer) => (
            <div
              key={layer.n}
              className="flex gap-3 rounded-lg p-3"
              style={{ background: layer.c + '0A', border: `1px solid ${layer.c}30` }}
            >
              <div className="font-semibold text-[12px] whitespace-nowrap mt-0.5" style={{ color: layer.c }}>{layer.n}</div>
              <div className="text-sm text-ink-700 dark:text-night-700">{layer.d}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 3. FANOUT STRATEGIES ── */}
      <Section
        id="fanout-strategies"
        number={3}
        eyebrow="The defining decision"
        title="Fan-out: push vs pull vs hybrid"
        intro="Every feed system in production uses some flavor of hybrid. Showing you understand why is the single most-watched moment of this interview."
      >
        <FanoutComparisonViz />

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-6 mb-3">When to switch — the threshold math</h3>
        <p>
          The threshold isn't arbitrary. It's set by the worker pool's sustainable write rate. Suppose each worker can do <Code inline>5K Redis SETs/sec</Code>, and you run <Code inline>500</Code> workers. That's <Code inline>2.5M writes/sec</Code> of headroom. With 100M posts/day at peak 5K posts/sec:
        </p>
        <ul>
          <li>Average followers per author × posts/sec ≤ headroom</li>
          <li><strong>500 followers × 5K posts/sec = 2.5M writes/sec</strong> — exactly at capacity if everyone fans out</li>
          <li>Celebrities are the outlier — one 50M-follower post equals 10K average users posting at once</li>
          <li>The threshold is whatever number caps the tail. Twitter once used <strong>~100K</strong>; Instagram tunes around <strong>10K</strong>. Pick a number, log fan-out durations, raise/lower based on tail latency</li>
        </ul>

        <Callout variant="insight" title="The threshold is a knob, not a constant">
          <p className="m-0">
            Make the threshold dynamic. Read a config from a feature-flag service so SREs can lower it during traffic spikes, raise it during quiet periods, or set per-region values. A static constant in code becomes a midnight on-call problem the first time a celebrity does a product launch.
          </p>
        </Callout>
      </Section>

      {/* ── 4. CELEBRITY PROBLEM ── */}
      <Section
        id="celebrity-problem"
        number={4}
        eyebrow="The interview classic"
        title="The celebrity problem"
        intro="Drag the slider — push works fine until it doesn't. The phase change is sharp."
      >
        <CelebrityProblemViz />

        <p className="mt-6">
          The naive answer ("just push to all followers") works perfectly for a long-tail user with 200 followers. Push 200 entries, takes 4ms total, done. The same code path with a 50M-follower account creates a write storm: 50M Redis SETs queue up, Kafka lag climbs into the minutes, the cluster's write side stalls. Worse — the post is <em>still</em> propagating an hour later, so followers see new posts out of order.
        </p>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Why pull alone isn't the answer either</h3>
        <p>
          You can't just give up on push and pull everyone's feed on read. With 5B reads/day and 200 followees average, you'd hit the Posts DB with <strong>1 trillion read queries/day</strong>. Posts DB melts; nobody opens the app fast.
        </p>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">What "hybrid" actually means in code</h3>
        <Code lang="Feed Distributor — pseudocode">
{`async fn handle_post_created(event: PostCreated) {
    let author = event.author_id;
    let follower_count = follower_index.count(author).await?;
    let threshold = config.celebrity_threshold(); // e.g. 10_000

    if follower_count > threshold {
        // SKIP fan-out. Mark this author "pull-mode" so the
        // read path knows to fetch their posts on demand.
        author_mode_cache.set(author, Mode::Pull, ttl=24h);
        return;
    }

    // Regular user: batch followers, queue parallel writes.
    let mut stream = follower_index.stream_followers(author);
    while let Some(batch) = stream.next_batch(BATCH_SIZE = 1000).await {
        task_queue.publish(FanoutTask {
            post_id: event.post_id,
            score: event.timestamp,
            user_ids: batch,
        }).await;
    }
}`}
        </Code>

        <p className="mt-4">
          On the read path, the Feed Service unconditionally fetches the user's pre-built feed from Redis, then asks <Code inline>author_mode_cache</Code> which of the user's followees are pull-mode, and queries those posts directly. Merge, rank, return.
        </p>
      </Section>

      {/* ── 5. WRITE PATH ── */}
      <Section
        id="write-path"
        number={5}
        eyebrow="The infrequent side"
        title="Write path — post creation to fan-out completion"
        intro="The write path is allowed to be slow because it's async after the initial ACK. The user already moved on. Optimize for completeness, not latency."
      >
        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mb-3">Step-by-step</h3>
        <ol>
          <li><strong>Client → Post Service</strong> — POST /posts with text, media references, mentions. Auth, validation, rate-limit. ~10ms.</li>
          <li><strong>Post Service → Posts DB</strong> — INSERT row. Sharded by <Code inline>post_id</Code> (Snowflake). Returns post_id. ~20ms.</li>
          <li><strong>Post Service → S3 + CDN</strong> — Media uploaded via presigned URL (out-of-band, doesn't block this RPC).</li>
          <li><strong>Post Service → Kafka</strong> — Publish <Code inline>PostCreated</Code> event. acks=all. ~5ms.</li>
          <li><strong>Post Service → Client</strong> — Returns 201. The user sees their post on screen. <em>Fan-out has not happened yet.</em></li>
          <li><strong>Kafka → Feed Distributor</strong> — Async. Reads event, decides push vs skip. Enqueues fan-out tasks for regular authors.</li>
          <li><strong>Workers → Redis</strong> — Each worker pops a batch and runs ZADD on each follower's feed. ~50ms per batch of 1000.</li>
          <li><strong>Kafka → Notifications</strong> — Parallel consumer pushes APNS/FCM notifications to interested followers.</li>
          <li><strong>Kafka → Search Index</strong> — Parallel consumer indexes the post for search.</li>
        </ol>

        <Callout variant="warning" title="The author's own feed write is a special case">
          <p className="m-0">
            When User A posts, User A also expects to see their post at the top of their <em>own</em> feed when they refresh. Don't rely on the async fan-out to write to A's own cache — do it inline in the Post Service before returning the ACK. Otherwise A sees stale feed → looks like the post never happened. Tiny extra work, prevents a confusing UX bug.
          </p>
        </Callout>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Idempotency on retries</h3>
        <p>
          ZADD is naturally idempotent — re-adding the same <Code inline>(score, postId)</Code> just no-ops. So fan-out tasks can be retried freely without producing duplicates in the feed. Make Kafka consumers <Code inline>at-least-once</Code> with manual offset commits and let ZADD's set semantics handle dedup.
        </p>
      </Section>

      {/* ── 6. FEED CACHE ── */}
      <Section
        id="feed-cache"
        number={6}
        eyebrow="The pre-built feed"
        title="Feed cache — one Redis sorted set per user"
        intro="Watch ZADD write the cache, then ZREVRANGE read it. The whole architecture is built around making this single read fast."
      >
        <FeedCacheViz />

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-6 mb-3">Why a sorted set, not a list</h3>
        <ul>
          <li><strong>Score-based ordering.</strong> The score is a post timestamp (or a hybrid timestamp+affinity score). New posts naturally sort to the front via ZADD; you never re-sort.</li>
          <li><strong>O(log N) inserts.</strong> ZADD into a sorted set is a skiplist insert — fast even with tens of thousands of entries.</li>
          <li><strong>Bounded</strong>. A periodic <Code inline>ZREMRANGEBYRANK feed:user 0 -1001</Code> trims to the most recent 1000. Old entries fall off automatically.</li>
          <li><strong>Range reads cheap</strong>. <Code inline>ZREVRANGE feed:user 0 19 WITHSCORES</Code> = top 20, sub-millisecond.</li>
        </ul>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Capacity planning</h3>
        <p>
          Per-user state is small: 1000 entries × ~32 bytes/entry (postId + score + skiplist overhead) ≈ <strong>3.2KB</strong>. Times 500M users = <strong>~1.6TB</strong>. A modest Redis Cluster (12 shards × 256GB) holds it with replication. Capacity isn't the constraint; throughput is. At peak we run ~2.5M ZADDs/sec and ~50K ZREVRANGEs/sec — which is what guides shard count.
        </p>

        <Callout variant="insight" title="Don't store the post body in the cache">
          <p className="m-0">
            The cache stores postIds + scores only — not the actual post content. Post bodies live in the Posts DB. On feed open, Feed Service reads top-20 postIds from Redis, then runs a single <em>batched</em> read against Posts DB (<Code inline>SELECT * WHERE post_id IN (...)</Code>) to fetch bodies. This keeps the cache tiny and lets you change post content (edits) without rewriting every follower's cache.
          </p>
        </Callout>
      </Section>

      {/* ── 7. READ PATH ── */}
      <Section
        id="read-path"
        number={7}
        eyebrow="The frequent side"
        title="Read path — feed open in under 200ms"
        intro="The read path runs 100× as often as writes. Everything here is parallelized, cached, or both."
      >
        <Code lang="Feed Service — read flow">
{`async fn get_feed(user_id: UserId, cursor: Option<Cursor>) -> Feed {
    // Fan out 4 calls in parallel — total time = max, not sum.
    let (cache_posts, celebs, ads, user_ctx) = join!(
        redis.zrevrange(format!("feed:{user_id}"), 0, 99),    // ~1ms
        get_celebrity_posts_for_followees(user_id),            // ~15ms (~30 followees × parallel batched)
        ad_service.get_ads(user_id, slot=feed_top),            // ~20ms
        user_features.get(user_id),                            // ~5ms (warm)
    );

    let candidates = merge(cache_posts, celebs);   // ~150 candidates
    let bodies     = posts_db.batch_get(candidates).await?; // 1 query, ~10ms
    let ranked     = ranker.rank(bodies, user_ctx).await?;   // ~47ms (3-stage funnel)
    let final_feed = inject_ads(ranked, ads, slots=[3, 8]);

    Feed { posts: final_feed, next_cursor: cursor.advance() }
}`}
        </Code>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-6 mb-3">Latency budget</h3>
        <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-4 not-prose">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 dark:bg-night-300 text-left text-xs text-ink-500 dark:text-night-600 uppercase tracking-wider border-b border-ink-200 dark:border-night-400">
              <tr>
                <th className="px-4 py-3 font-medium">Step</th>
                <th className="px-4 py-3 font-medium">p50</th>
                <th className="px-4 py-3 font-medium">p99</th>
                <th className="px-4 py-3 font-medium">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-night-400">
              {[
                ['Auth + routing',           '5ms',   '12ms',  'Edge gateway, JWT'],
                ['Redis ZREVRANGE',          '1ms',   '3ms',   'Hot cache hit'],
                ['Celebrity post fetch',     '15ms',  '40ms',  '~30 followees, parallel batched'],
                ['Posts DB batch',           '10ms',  '25ms',  'Single IN clause, primary key'],
                ['Ranker (3-stage funnel)',  '47ms',  '95ms',  'Heavy ranker dominates'],
                ['Ads',                      '20ms',  '50ms',  'Async, joined w/ ranking'],
                ['Serialize + ship',         '8ms',   '15ms',  'JSON + HTTP/2'],
                ['Total (parallel)',         '~80ms', '~180ms', 'Below 200ms target'],
              ].map(([step, p50, p99, note]) => (
                <tr key={step} className="dark:bg-night-200">
                  <td className="px-4 py-3 font-medium text-ink-900 dark:text-night-900">{step}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-700 dark:text-night-800">{p50}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-700 dark:text-night-800">{p99}</td>
                  <td className="px-4 py-3 text-xs text-ink-600 dark:text-night-700">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Callout variant="warning" title="Don't serialize the four parallel calls">
          <p className="m-0">
            New engineers often write the read path as a sequential chain: Redis → DB → ranker → ads. Each is fast in isolation, but in series the budget blows past 200ms easily. The four pre-ranker calls are independent — fan them out with <Code inline>Promise.all</Code>/<Code inline>asyncio.gather</Code>/<Code inline>tokio::join!</Code>. Saving 50–80ms here is the cheapest win in the whole system.
          </p>
        </Callout>
      </Section>

      {/* ── 8. RANKING ── */}
      <Section
        id="ranking"
        number={8}
        eyebrow="The ML pipeline"
        title="ML ranking — the 3-stage funnel"
        intro="Show 10 posts out of millions of candidates in 50ms. Doable only with progressive narrowing — each stage 10× more expensive but 10× fewer items."
      >
        <RankingFunnelViz />

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-6 mb-3">Why three stages, not one</h3>
        <p>
          A naive ranker would score every candidate with the heavy DNN. At 1000 candidates × 30ms/call that's 30 seconds — useless. Progressive narrowing cuts cost 100×:
        </p>
        <ul>
          <li><strong>Cheap models prune early.</strong> ANN search is O(log N); GBDT scoring is microseconds per item.</li>
          <li><strong>Expensive models see only top contenders.</strong> The DNN does sequence modeling, full-text embeddings, and cross-features only on the 100 that survived.</li>
          <li><strong>You retrain stages independently.</strong> A new candidate model can ship without touching the heavy ranker.</li>
        </ul>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Multi-objective optimization</h3>
        <p>
          The heavy ranker outputs not one score but multiple probability heads:
        </p>
        <Code lang="Heavy ranker — multi-head output">
{`{
  "p_like":     0.18,    // probability the user likes this
  "p_comment":  0.04,    // probability of commenting
  "p_share":    0.02,    // probability of sharing
  "p_long_view": 0.41,   // probability of dwelling > 3s
  "p_hide":     0.03,    // probability of hide / negative feedback
}

# Composite score = w_l*p_like + w_c*p_comment + w_s*p_share + w_v*p_long_view - w_h*p_hide
# Weights tuned offline against north-star metric (e.g. 30-day retention).`}
        </Code>

        <Callout variant="insight" title="Why one model serves all 500M users">
          <p className="m-0">
            People assume "personalization" means a model per user. It doesn't. There's <strong>one shared model</strong> that takes the user's recent activity, demographic signals, and friend-graph features as <em>inputs</em>. Personalization comes from the input vector, not from per-user model weights. This is why the same heavy ranker can be served from a single fleet of GPU inference boxes regardless of user count.
          </p>
        </Callout>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Position bias correction</h3>
        <p>
          Click-through is correlated with where the post appears, not just how good it is. If you train naively on logged clicks, you'll learn "post #1 always wins" — a feedback loop that ossifies. Fix: <strong>inverse propensity weighting</strong> during training, plus periodically randomize position for a fraction of impressions to collect unbiased signals.
        </p>
      </Section>

      {/* ── 9. LIVE UPDATES ── */}
      <Section
        id="live-updates"
        number={9}
        eyebrow="What about real-time?"
        title="Live updates — the &quot;12 new posts&quot; banner"
        intro="The user is on screen, friends keep posting. How do you tell them without re-fetching the whole feed?"
      >
        <p>
          When User B has the feed open, two things keep happening:
        </p>
        <ol>
          <li>People B follows post new content. B's Redis cache gets new ZADDs as fan-out runs.</li>
          <li>B sees a banner: <em>"Show 12 new posts"</em> at the top of the feed.</li>
        </ol>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-6 mb-3">Two viable approaches</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 not-prose">
          <div className="bg-white dark:bg-night-200 border border-ink-200 dark:border-night-400 rounded-xl p-5">
            <div className="text-xs font-semibold text-ink-500 dark:text-night-700 uppercase tracking-wider mb-2">Polling — simpler</div>
            <ul className="text-sm space-y-2 text-ink-700 dark:text-night-700 list-disc ml-5">
              <li>Client polls <Code inline>/feed/new-count?since={'{lastSeenScore}'}</Code> every 30s</li>
              <li>Server runs <Code inline>ZCOUNT feed:userId since +inf</Code> — sub-ms</li>
              <li>If count &gt; 0, show the banner</li>
              <li>Battery-cheap; no persistent connection</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-night-200 border border-ink-200 dark:border-night-400 rounded-xl p-5">
            <div className="text-xs font-semibold text-ink-500 dark:text-night-700 uppercase tracking-wider mb-2">WebSocket — instant</div>
            <ul className="text-sm space-y-2 text-ink-700 dark:text-night-700 list-disc ml-5">
              <li>Client opens WS to a Feed Push service</li>
              <li>When fan-out writes to feed:userId, also publish to <Code inline>feed-events:userId</Code> channel</li>
              <li>WS gateway forwards "new post" signal to the open client</li>
              <li>Higher infra cost, used in heavy-engagement apps (Twitter live)</li>
            </ul>
          </div>
        </div>

        <Callout variant="insight" title="Most apps pick polling — and that's correct">
          <p className="m-0">
            WebSocket persistence costs scale with concurrent users (50M concurrent on a feed app = 625 chat-server-equivalent boxes just for "12 new posts"). A 30s poll over HTTP/2 with conditional GETs costs cents in comparison and gives the user the same perceived experience. Reserve real-time push for chat (where it's table stakes) — feed updates are fine on a timer.
          </p>
        </Callout>
      </Section>

      {/* ── 10. EDITS & DELETES ── */}
      <Section
        id="edits-deletes"
        number={10}
        eyebrow="Mutations"
        title="Edits & deletes — cache invalidation done right"
        intro="The cache stores postIds, not bodies. Edits are nearly free; deletes are slightly trickier."
      >
        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mb-3">Edits — automatic</h3>
        <p>
          The feed cache holds postIds + scores. Post bodies live in Posts DB and are fetched fresh on each feed load (cached at the Posts service via short-TTL Redis, ~30s). When User A edits a post:
        </p>
        <ol>
          <li>Update Posts DB row.</li>
          <li>Invalidate the post-body cache: <Code inline>DEL post_body:p7</Code>.</li>
          <li>Done. Next feed open by any follower sees the new content within ~30s (Redis TTL).</li>
        </ol>
        <p>
          Crucially, <strong>no fan-out is needed for edits.</strong> The N follower caches don't get touched at all. This is the payoff of storing only postIds in the feed cache.
        </p>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Deletes — soft delete + filter</h3>
        <p>
          Hard-deleting from N follower caches would require fan-out — the same write storm problem. Instead:
        </p>
        <ol>
          <li>Set <Code inline>posts.deleted_at</Code> on the row.</li>
          <li>Add the postId to a small <Code inline>tombstone:userId</Code> Redis set per author (24h TTL).</li>
          <li>The Feed Service filters tombstoned IDs at read time via a single <Code inline>SMISMEMBER</Code> check.</li>
          <li>Background job sweeps tombstones from feed caches lazily (a few hours later).</li>
        </ol>

        <Callout variant="warning" title="Don't try to be exact about delete latency">
          <p className="m-0">
            Real systems show deleted posts for a few seconds because the read path can be one ZADD ahead of the tombstone. Twitter, Instagram, Facebook all have this — search "deleted tweet still showing" for the user reports. The right answer in an interview is: "ackowledged tradeoff, delete propagates in &lt; 1 minute, and we never serve a deleted body since the Posts DB row is the source of truth."
          </p>
        </Callout>
      </Section>

      {/* ── 11. PAGINATION ── */}
      <Section
        id="pagination"
        number={11}
        eyebrow="Infinite scroll"
        title="Pagination — cursor-based, not offset-based"
        intro="The feed is unstable: new posts arrive while the user scrolls. Offset pagination shows duplicates and skips. Cursors don't."
      >
        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mb-3">Why offset breaks</h3>
        <p>
          Suppose the user just read posts 1–20 (offset=0, limit=20). They scroll down → request offset=20. Between the two calls, fan-out wrote 5 new posts to the top of the cache. Now what was at offset 20 is at offset 25. The user sees the same 5 posts they already read.
        </p>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-6 mb-3">Cursor solution</h3>
        <p>
          Page boundaries are defined by <em>scores</em>, not positions. The cursor is the score of the last post returned:
        </p>
        <Code lang="Cursor pagination">
{`# Page 1
GET /feed?limit=20
→ posts: [...20 items], cursor: { last_score: 1714, last_id: "p99" }

# Page 2 — uses last seen score, not offset
GET /feed?limit=20&before_score=1714&before_id=p99
→ ZREVRANGEBYSCORE feed:user 1714 -inf LIMIT 0 20
→ ranks bodies, returns next 20
→ cursor: { last_score: 1602, last_id: "p87" }`}
        </Code>

        <Callout variant="insight" title="The cursor encodes (score, id), not just score">
          <p className="m-0">
            Two posts can share an exact timestamp. Just using <Code inline>before_score</Code> would skip or duplicate ties. The cursor includes <Code inline>last_id</Code> to break ties deterministically. The query becomes "score &lt; last_score, OR (score = last_score AND id &lt; last_id)". Offset = 0 forever; no shifting reference frame.
          </p>
        </Callout>
      </Section>

      {/* ── 12. COLD START ── */}
      <Section
        id="cold-start"
        number={12}
        eyebrow="The empty feed"
        title="Cold start — new user, no follows yet"
        intro={`A user just signed up. Their Redis feed:user_NEW is empty. The naive answer ("show nothing") is product death. Real systems have three fallbacks.`}
      >
        <ol>
          <li><strong>Onboarding-driven follows.</strong> Sign-up flow asks for interests, suggests popular accounts to follow, syncs phone contacts. 5 follows seeded → fan-out kicks in normally on the next post by any of those 5.</li>
          <li><strong>Trending-feed fallback.</strong> If the personalized feed is empty (cache miss), serve a curated <em>trending</em> feed: top posts from this region in the last 24h, ranked by global engagement. Refreshed every minute by a batch job. This is what Instagram and Twitter both do for first-session users.</li>
          <li><strong>Backfill on follow.</strong> When a new user follows their first 5 accounts, run a synchronous <em>pull</em>: query the most recent 200 posts from those 5 authors, ZADD them into the new user's cache. They scroll and immediately see content.</li>
        </ol>

        <Callout variant="warning" title="The asymmetric cold-start: viral first session">
          <p className="m-0">
            First-session retention is the metric that matters. A user who opens the app and sees an empty feed is gone. The trending-feed fallback isn't a fancy add-on; it's the difference between a 30% and a 70% D1 retention rate. Mention this explicitly in the interview — interviewers love when candidates remember the product reality, not just the system mechanics.
          </p>
        </Callout>
      </Section>

      {/* ── 13. FAILURE MODES ── */}
      <Section
        id="failure-modes"
        number={13}
        eyebrow="Production reality"
        title="Failure modes & recovery"
        intro="Every component fails sometimes. The design must degrade gracefully — a Redis outage shouldn't break feed reads."
      >
        <div className="space-y-4 not-prose">
          {[
            {
              name: 'Feed Cache (Redis) shard outage',
              color: '#EF4444',
              recovery: [
                'Redis Sentinel / Cluster fails over to replica within ~3s',
                'Reads to the failed shard fall through to a pull-mode rebuild: query Posts DB by follower\'s recent followees',
                'Pull-mode rebuild is slow (~2s feed open) but correct — better than 500',
                'Background reconciliation job re-runs ZADDs to repopulate the cold shard from Kafka offset',
                'Mitigation: replication factor ≥ 2; independent shards so an outage is partial, not total',
              ],
            },
            {
              name: 'Kafka backlog during traffic spike',
              color: '#D97706',
              recovery: [
                'Posts continue to ack to clients (Post Service writes to Kafka, not directly to fan-out)',
                'Fan-out latency increases — followers see posts later than usual',
                'Distributor adapts: temporarily lowers celebrity threshold so push storm shrinks',
                'Read path unchanged — pull-mode covers the slack for any author whose fan-out hasn\'t caught up',
                'Recovery: workers scale up, consumer lag drains over minutes',
              ],
            },
            {
              name: 'Posts DB hot shard',
              color: '#7C3AED',
              recovery: [
                'A specific celebrity\'s posts get hammered by pull-mode reads from millions of followers',
                'Body cache (post_body:postId in Redis, 30s TTL) absorbs nearly all reads after the first',
                'Result: 1 read every 30s reaches Posts DB, regardless of how many followers fetch the post',
                'Cache stampede protection: probabilistic early refresh + single-flight on miss',
              ],
            },
            {
              name: 'Ranker model serving down',
              color: '#059669',
              recovery: [
                'Feed Service falls back to chronological order (sort merged candidates by score)',
                'Result: feed still loads, slightly worse engagement, no user-facing error',
                'Degradation logged + paged so SREs investigate',
                'A "no-ML" feed is preferable to a 500',
              ],
            },
          ].map((f) => (
            <div key={f.name} className="rounded-xl border overflow-hidden" style={{ borderColor: f.color + '30' }}>
              <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ background: f.color + '0A', borderColor: f.color + '20' }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: f.color }} />
                <span className="font-semibold text-sm" style={{ color: f.color }}>{f.name}</span>
              </div>
              <div className="px-4 py-3">
                <ol className="space-y-1">
                  {f.recovery.map((step, i) => (
                    <li key={i} className="text-sm text-ink-700 dark:text-night-700 flex gap-2">
                      <span className="font-mono text-[10px] text-ink-400 dark:text-night-600 mt-0.5 flex-shrink-0">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 14. MULTI-REGION ── */}
      <Section
        id="multi-region"
        number={14}
        eyebrow="Geo distribution"
        title="Multi-region — feed cache is regional, posts are global"
        intro="A regional design keeps feeds fast for everyone. Cross-region replication runs on a slightly relaxed timeline."
      >
        <p>
          Each user has a home region. Their Redis feed cache, Feed Service, and ranker fleet all live there. Cross-region adds:
        </p>
        <ul>
          <li><strong>Posts DB — globally replicated.</strong> Spanner / CockroachDB / per-region read replicas. Author writes locally; cross-region replication asynchronously back-fills other regions. ~1–2s replication lag is fine for posts (timestamps don't lie).</li>
          <li><strong>Fan-out runs per-region.</strong> us-east Kafka has its own Distributor + workers, writing only to us-east Redis. Same for ap-south.</li>
          <li><strong>Cross-region followers.</strong> A US author has Indian followers. The post replicates to ap-south Posts DB (~1s), and ap-south's Distributor sees a new event (replicated through MirrorMaker) and fans out to local followers. Indian followers see the post ~2s later than US followers — invisible at human time scales.</li>
          <li><strong>Hot post in another region.</strong> If a US celebrity goes viral and Indian followers pull on read, they hit ap-south's read replica of Posts DB — no cross-ocean trip per-feed-open.</li>
        </ul>

        <Callout variant="insight" title="Globally consistent counters are not your problem">
          <p className="m-0">
            Like-counts, view-counts, share-counts — all the engagement counters — should not be strongly consistent across regions. Each region maintains its own count, syncs every few minutes via a count-aggregator service. Users are fine seeing "1.2M likes" instead of "1,243,891 likes" — and any attempt at strong consistency turns every like into a cross-ocean RTT. Don't fight this; lean into eventual consistency.
          </p>
        </Callout>
      </Section>

      {/* ── 15. TRADEOFFS ── */}
      <Section
        id="tradeoffs"
        number={15}
        eyebrow="Production perspective"
        title="What this design gets right — and what it glosses over"
        intro="Naming the gaps is what turns a good answer into a great one."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 not-prose">
          <div className="bg-teal-50 border border-teal-200 dark:bg-[#071A12] dark:border-teal-900/40 rounded-xl p-5">
            <div className="text-xs font-semibold text-teal-700 dark:text-teal-300 uppercase tracking-wider mb-3">What's solid</div>
            <ul className="space-y-2 text-sm text-ink-800 dark:text-night-800">
              <li>✓ Hybrid push/pull at a tuned threshold — matches real production at Twitter, Instagram, Meta</li>
              <li>✓ Redis sorted set per user — sub-ms reads at any scale</li>
              <li>✓ Three-stage ML funnel — ANN → GBDT → DNN, the industry-standard pattern</li>
              <li>✓ Cursor pagination — handles the "feed shifts under you" problem cleanly</li>
              <li>✓ Edits don't fan-out — postIds in cache, bodies in DB</li>
              <li>✓ Multi-region locality — feeds rebuilt regionally, posts replicated globally</li>
              <li>✓ Cold-start fallback to trending — preserves first-session retention</li>
              <li>✓ Graceful degradation — no ranker → chronological fallback, not a 500</li>
            </ul>
          </div>
          <div className="bg-rust-50 border border-rust-200 dark:bg-[#1F0E07] dark:border-[#3D2012] rounded-xl p-5">
            <div className="text-xs font-semibold text-rust-700 dark:text-[#E8855A] uppercase tracking-wider mb-3">Still under-explored</div>
            <ul className="space-y-2 text-sm text-ink-800 dark:text-night-800">
              <li>⚠ <strong>Spam & abuse</strong> — content moderation pipeline, shadow-bans, rate limits per author. Separate question's worth of design.</li>
              <li>⚠ <strong>Engagement-bait demotion</strong> — anti-clickbait classifier feeding into ranker, separate from spam.</li>
              <li>⚠ <strong>Story-style ephemeral content</strong> — 24h TTL, per-viewer read state, separate from main feed.</li>
              <li>⚠ <strong>Direct messages, replies, threads</strong> — different read pattern, lives in a chat-system-style stack.</li>
              <li>⚠ <strong>Offline cache on device</strong> — feed pre-fetch when on Wi-Fi, smart sync. Mobile-team territory.</li>
              <li>⚠ <strong>Privacy surfaces</strong> — block, mute, audience selectors. Filter at read or write?</li>
            </ul>
          </div>
        </div>

        <Callout variant="interview" title="How to deliver tradeoffs in an interview">
          <p className="m-0">
            <em>"The core fan-out + ranking architecture is solid for the social-feed case. The main production gaps are abuse moderation (entire system in itself), ephemeral content like Stories (different storage model — 24h TTL Redis, per-viewer state), and on-device caching for offline scrolling. I'd be happy to dive into any of those if we have time."</em>
          </p>
        </Callout>
      </Section>

      {/* ── 16. DEPLOYMENT ── */}
      <Section
        id="deployment"
        number={16}
        eyebrow="Topology"
        title="Realistic deployment picture"
        intro="How many boxes, what managed services, where to run them."
      >
        <div className="bg-white dark:bg-night-200 border border-ink-200 dark:border-night-400 rounded-xl overflow-hidden my-6 not-prose">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 text-left text-xs text-ink-500 dark:text-night-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-medium">Component</th>
                <th className="px-4 py-3 font-medium">Sizing</th>
                <th className="px-4 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-night-400">
              {[
                ['L7 Load Balancer / API Gateway', 'Managed (ALB / Envoy)',         'JWT auth, rate-limit, cookie session — request budget tracked here'],
                ['Post Service',                   '40 boxes · autoscale 20–100',   'Stateless. CPU-bound on auth + Snowflake ID gen'],
                ['Posts DB',                       'Sharded by post_id, 24 shards', 'DynamoDB / Cassandra / Vitess. 100M posts/day → ~30TB/yr after compression'],
                ['Kafka',                          '6 brokers × 3 AZs',             '128 partitions for post-events topic; 3-day retention'],
                ['Feed Distributor',               '20 stateless workers',          'Kafka consumer group, autoscale by lag'],
                ['Fan-out Worker pool',            '500 workers · autoscale to 1500','Pulls task queue, executes ZADDs in parallel'],
                ['Feed Cache (Redis)',             '12 shards × 3 replicas',        '~1.6TB hot. Sized for throughput (2.5M ZADD/sec peak), not capacity'],
                ['Feed Service',                   '60 boxes · autoscale 30–200',   'Read fan-out + ranker orchestration. Latency-critical'],
                ['Ranker (heavy)',                 'GPU fleet · 100 nodes',         'TensorRT / ONNX. ~30ms inference at p50'],
                ['Notifications',                  'Managed (SNS / Firebase)',      'Async consumer of post-events'],
                ['Search Index',                   'Managed Elasticsearch',         'Async consumer of post-events'],
                ['Multi-region',                   '4 regions',                     'us-east, us-west, eu-west, ap-south. Per-region everything'],
              ].map(([comp, count, notes], i) => (
                <tr key={i} className="dark:bg-night-200">
                  <td className="px-4 py-3 font-medium text-ink-900 dark:text-night-900">{comp}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-700 dark:text-night-800">{count}</td>
                  <td className="px-4 py-3 text-xs text-ink-600 dark:text-night-700">{notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Callout variant="warning" title="The single biggest cost line: ranker GPUs">
          <p className="m-0">
            The 3-stage funnel sounds elegant, but ranker GPU spend dominates infra cost — usually 60%+ of the feed system's bill. Most teams obsess over reducing inference latency to shrink the fleet (quantization, distillation, model compression). When the interviewer asks "where does the money go?", this is the answer.
          </p>
        </Callout>
      </Section>
    </DeepDiveLayout>
  );
}
