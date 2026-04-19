import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Section from '../../components/ui/Section';
import Callout from '../../components/ui/Callout';
import Code from '../../components/ui/Code';
import Stat from '../../components/ui/Stat';
import ArchitectureDiagram from './diagrams/ArchitectureDiagram';
import ReadFunnel from './diagrams/ReadFunnel';
import ConnectionPoolViz from './diagrams/ConnectionPoolViz';
import LSMWriteViz from './diagrams/LSMWriteViz';
import ShardingHashViz from './diagrams/ShardingHashViz';
import RedisPlacementComparison from './diagrams/RedisPlacementComparison';
import KGSRangeDiagram from './diagrams/KGSRangeDiagram';
import ZKTopologyDiagram from './diagrams/ZKTopologyDiagram';
import ConsensusSimulator from './diagrams/ConsensusSimulator';
import CrashRecoveryTimeline from './diagrams/CrashRecoveryTimeline';
import KafkaPipelineDiagram from './diagrams/KafkaPipelineDiagram';

const SECTIONS = [
  { id: 'requirements', label: 'Requirements' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'read-path', label: 'Read path' },
  { id: 'write-path', label: 'Write path' },
  { id: 'sharding', label: 'Sharding' },
  { id: 'caching', label: 'Caching' },
  { id: 'kgs', label: 'Key generation' },
  { id: 'zookeeper', label: 'ZooKeeper' },
  { id: 'consensus', label: 'Consensus' },
  { id: 'crash-recovery', label: 'Crash recovery' },
  { id: 'kafka', label: 'Analytics' },
  { id: 'deep-concepts', label: 'Deep concepts' },
  { id: 'tradeoffs', label: 'Tradeoffs' },
  { id: 'deployment', label: 'Deployment' },
];

function useActiveSection(sectionIds) {
  const [active, setActive] = useState(sectionIds[0]);

  useEffect(() => {
    const observers = [];
    const visibleSections = new Map();

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) visibleSections.set(id, entry.intersectionRatio);
          else visibleSections.delete(id);

          // pick the first visible section in document order
          for (const sid of sectionIds) {
            if (visibleSections.has(sid)) { setActive(sid); break; }
          }
        },
        { rootMargin: '-80px 0px -60% 0px', threshold: [0, 0.25] }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sectionIds]);

  return active;
}

export default function UrlShortener() {
  const contentRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const activeSection = useActiveSection(SECTIONS.map((s) => s.id));

  useEffect(() => {
    document.title = 'Design a URL Shortener — System Design Bible';
  }, []);

  return (
    <div className="gradient-mesh min-h-screen">
      {/* Reading progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rust-400 via-rust-500 to-teal-400 origin-left z-50"
        style={{ scaleX }}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 mb-6 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> All questions
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          className="pb-10 mb-4 border-b border-ink-200/60 dark:border-night-400/40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg glass-pill border-teal-200/60 dark:border-teal-500/30 text-teal-700 dark:text-teal-300">
              Easy
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg glass-pill text-ink-700 dark:text-night-800">
              Very High frequency
            </span>
            <span className="text-xs text-ink-400 dark:text-night-600 ml-2 font-medium">Google · Amazon · Meta · Uber</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-ink-900 dark:text-night-900 tracking-tight mb-3">
            Design a URL Shortener
          </h1>
          <p className="text-lg text-ink-500 dark:text-night-700">TinyURL / Bit.ly</p>
        </motion.header>

        {/* Main layout: sidebar TOC + content */}
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10 mt-8">
          {/* Sticky sidebar TOC */}
          <aside className="hidden lg:block">
            <nav className="sticky top-20">
              <div className="text-[10px] font-semibold text-ink-400 dark:text-night-600 uppercase tracking-widest mb-4">
                On this page
              </div>
              <ul className="space-y-0.5 border-l border-ink-200/50 dark:border-night-400/30">
                {SECTIONS.map((s, i) => {
                  const isActive = activeSection === s.id;
                  return (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className={`flex items-center gap-2 pl-4 py-1.5 text-sm transition-all border-l-2 -ml-[1px] ${
                          isActive
                            ? 'border-rust-500 dark:border-rust-400 text-rust-600 dark:text-rust-300 font-medium'
                            : 'border-transparent text-ink-500 dark:text-night-700 hover:text-ink-800 dark:hover:text-night-800 hover:border-ink-300 dark:hover:border-night-500'
                        }`}
                      >
                        <span className="font-mono text-[10px] tabular-nums opacity-60">{String(i + 1).padStart(2, '0')}</span>
                        {s.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Mobile TOC (collapsible, shows above content on small screens) */}
          <MobileTOC sections={SECTIONS} active={activeSection} />

          {/* Content area */}
          <div ref={contentRef} className="min-w-0">

      {/* === 1. REQUIREMENTS === */}
      <Section
        id="requirements"
        number={1}
        eyebrow="Start here"
        title="Requirements & scale"
        intro="Before drawing anything, pin down the numbers. The scale determines every later decision."
      >
        <p>
          <strong>The product:</strong> generate a short unique alias (like <Code inline>tinyurl.com/abc123</Code>) for a long URL.
          Redirect clicks to the original URL. Track click analytics.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6 not-prose">
          <Stat value="500M" label="New URLs / month" sub="≈ 200 writes/sec" accent />
          <Stat value="100:1" label="Read : write ratio" sub="redirects dominate" />
          <Stat value="200K" label="Redirects / sec" sub="the peak hot path" accent />
          <Stat value="250 GB" label="Storage / month" sub="≈ 500 bytes/record" />
        </div>

        <h3 className="text-xl font-serif font-medium text-ink-900 mt-8 mb-3">Key design decisions</h3>
        <ul>
          <li>
            <strong>Key generation:</strong> hash-based (collisions get worse as space fills) vs. a pre-generated
            Key Generation Service (KGS). <strong>KGS wins</strong> — no collisions, ever.
          </li>
          <li>
            <strong>Storage:</strong> simple key-value mapping <Code inline>shortKey → &#123;longURL, created, userId, expiry&#125;</Code>.
            NoSQL (DynamoDB/Cassandra) for horizontal scale.
          </li>
          <li>
            <strong>Read path:</strong> cache-aside with Redis for the top 20% of hot URLs. Return HTTP 302 (temporary,
            tracks every click) or 301 (permanent, browsers cache).
          </li>
          <li>
            <strong>Write path:</strong> idempotency via hash index on <Code inline>longURL</Code> — submitting the
            same long URL twice returns the same short code.
          </li>
        </ul>
      </Section>

      {/* === 2. ARCHITECTURE === */}
      <Section
        id="architecture"
        number={2}
        eyebrow="The picture"
        title="High-level architecture"
        intro="Three lanes: request flow, key generation, and analytics. Each has its own latency budget and failure characteristics."
      >
        <ArchitectureDiagram />

        <p>
          The request flow is the hot path — <strong>every millisecond counts</strong>. Key generation is off to the side;
          writes consult it, reads don't. The analytics pipeline is asynchronous — click events get fired into Kafka and the
          redirect returns without waiting.
        </p>

        <Callout variant="insight" title="The mental model">
          Three lanes isn't arbitrary. Data plane (hot path) demands low latency and high availability.
          Control plane (key generation) demands consistency, can tolerate latency. Analytics plane
          demands throughput, can tolerate eventual consistency. Each lane picks different technologies because they optimize for
          different things.
        </Callout>
      </Section>

      {/* === 3. READ PATH === */}
      <Section
        id="read-path"
        number={3}
        eyebrow="Deep dive"
        title="Read path — handling 200K requests/sec"
        intro={'A common anxiety: "we can\'t have 200K DB connections open in the same instant." The answer is that you never do — load gets absorbed and reduced at every layer.'}
      >
        <p>
          Walk the funnel. URL shorteners follow a strong <strong>Pareto distribution</strong> — a tiny set of viral
          links dominates traffic. Redis caches the hot 20% of URLs and gets an 85–95% hit rate. So ~180K/sec is served
          entirely from memory, never touching the DB.
        </p>

        <ReadFunnel />

        <p>
          Even the ~20K/sec that falls through to the DB isn't a connection problem. Your app tier is a fleet
          (say 20 instances), each with a connection pool of 50–100. That's ~2,000 pooled sockets total. The critical
          insight is that a connection <strong>isn't held for a whole second</strong> — it's held for the duration of a
          query (~2–5ms).
        </p>

        <ConnectionPoolViz />

        <Callout variant="insight" title="Little's Law — the math candidates miss">
          If each query takes 3ms, one connection sustains ~330 QPS through reuse. 100 connections per app server × 20 servers
          = 2,000 sockets sustaining 600K+ theoretical QPS. You'll be CPU-bound long before you're connection-bound. This is
          why connection pools exist — they decouple "concurrent requests" from "concurrent TCP sockets."
        </Callout>
      </Section>

      {/* === 4. WRITE PATH === */}
      <Section
        id="write-path"
        number={4}
        eyebrow="Deep dive"
        title="Write path — why 2K writes/sec doesn't cause lock contention"
        intro={'Another common anxiety: "if we\'re writing 2,000 requests per second, how do we avoid write locks?" This fear comes from SQL thinking. NoSQL stores don\'t work that way.'}
      >
        <p>There are three reasons writes here don't contend:</p>

        <ul>
          <li>
            <strong>Every write has a unique partition key (shortKey).</strong> Two writes never target the same row,
            so there's nothing to contend for. Fundamentally different from SQL where multiple writers may update the same row.
          </li>
          <li>
            <strong>Partitions are independent.</strong> A write to partition 1 doesn't block partition 2.
            With 100 partitions and 2K writes/sec spread uniformly, each sees ~20 writes/sec. A single
            Cassandra or DynamoDB node comfortably handles 10K+ writes/sec.
          </li>
          <li>
            <strong>LSM-tree storage appends to an in-memory memtable + write-ahead log.</strong> No random disk I/O, no page locks.
          </li>
        </ul>

        <LSMWriteViz />

        <p>
          The only place you could see contention is the <strong>idempotency check</strong> (hash index on <Code inline>longURL</Code>
          to dedupe). Two resolutions:
        </p>
        <ul>
          <li>
            <strong>Accept the race.</strong> Two users submitting the same long URL in the same millisecond each get a unique short
            key. Harmless — the DB has two rows pointing to the same destination.
          </li>
          <li>
            <strong>Conditional writes (<Code inline>IF NOT EXISTS</Code>).</strong> NoSQL engines handle this per-partition
            with local Paxos / Lightweight Transactions. No global lock.
          </li>
        </ul>
      </Section>

      {/* === 5. SHARDING === */}
      <Section
        id="sharding"
        number={5}
        eyebrow="Common confusion"
        title="Sharding — what it actually means"
        intro={'The word "shard" trips people up. In the aggregate view it looks like traffic is split across shards in real time. Not quite — each individual request targets exactly one shard, deterministically.'}
      >
        <ShardingHashViz />

        <p>
          The thing that clicks for most people: <strong>each shard is a completely separate database instance</strong>.
          Shard 1 and Shard 2 live on different physical nodes, different disks, different CPUs, different memory.
          They don't talk at query time. They don't share locks, connection pools, or caches.
        </p>

        <p>
          Routing happens at the driver. Your DynamoDB/Cassandra client SDK holds the hash ring (which shard owns which
          key range). When your app calls <Code inline>db.get("abc123")</Code>, the driver hashes locally and opens a
          connection directly to the right shard. No proxy, no coordinator in the hot path.
        </p>

        <Callout variant="insight" title="The even distribution is statistical">
          The uniform spread isn't engineered request-by-request — it's a <strong>statistical property</strong> of running
          20,000 requests/sec with random Base62 keys. Each key lands deterministically on one shard; across thousands of
          keys, distribution averages out. Change the key, the shard changes. That's the entire model.
        </Callout>
      </Section>

      {/* === 6. CACHING === */}
      <Section
        id="caching"
        number={6}
        eyebrow="Infrastructure choice"
        title="Redis placement — same VPC, but what flavor?"
        intro="Redis must be in the same VPC as your app servers — cross-VPC cache reads defeat the purpose. But within that constraint, there are three real options, and the naive one is the worst."
      >
        <RedisPlacementComparison />

        <Callout variant="interview" title="What to say in an interview">
          <p className="m-0">
            <em>"Managed Redis cluster in the same VPC as the app tier, with cluster mode enabled for horizontal scale
            and multi-AZ replication for availability. Redis in a separate subnet from the app servers, so I can apply
            different security groups and scale them independently."</em>
          </p>
        </Callout>
      </Section>

      {/* === 7. KGS === */}
      <Section
        id="kgs"
        number={7}
        eyebrow="Key generation"
        title="The KGS algorithm — zero collisions, ever"
        intro="The trick is to never generate keys randomly in the first place. Counter-based allocation makes collisions mathematically impossible."
      >
        <p>
          <strong>Core algorithm:</strong> maintain a single monotonic counter. To generate a key, atomically increment
          the counter, then encode the new value in Base62 (0-9, a-z, A-Z).
        </p>

        <Code lang="counter → Base62">
{`counter = 0      → "a"
counter = 61     → "9"
counter = 62     → "ba"
counter = 14234  → "3Rs"
counter = 3.5T   → "zzzzzzz"  // last 7-char key`}
        </Code>

        <p>
          You have <strong>62<sup>7</sup> ≈ 3.5 trillion 7-char keys</strong>. At 500M URLs/month that's ~583 years to
          exhaust. When you do, go to 8 characters (218 trillion more). You never collide because you never reuse a
          counter value.
        </p>

        <h3 className="text-xl font-serif font-medium text-ink-900 mt-8 mb-3">Scaling the counter</h3>
        <p>
          A single global counter serialized through one node would cap throughput at a few thousand/sec. Two fixes:
        </p>

        <ul>
          <li>
            <strong>Range allocation.</strong> A coordinator (ZooKeeper) hands out ranges to workers. Worker A claims
            [0, 1M), Worker B claims [1M, 2M). Each worker increments locally within its range and asks for the next
            range when exhausted. Ranges never overlap.
          </li>
          <li>
            <strong>Snowflake IDs.</strong> 64-bit ID = timestamp bits + worker_id bits + local sequence. Each worker has
            a unique worker_id so its sequence can't collide. No coordinator needed. Tradeoff: longer keys (11-12 Base62
            chars instead of 7) because the ID space is bigger.
          </li>
        </ul>

        <KGSRangeDiagram />

        <Callout variant="warning" title="Privacy note — sequential keys are guessable">
          <p className="m-0">
            If <Code inline>tinyurl.com/abc</Code> exists, <Code inline>tinyurl.com/abd</Code> probably does too.
            Attackers can enumerate. If that matters, run the counter through a <strong>bijective scrambler</strong> (Feistel
            network, or multiply by a large odd number mod 2<sup>64</sup>) before encoding. Bijections preserve uniqueness
            (so still zero collisions), but the output looks random.
          </p>
        </Callout>
      </Section>

      {/* === 8. ZOOKEEPER === */}
      <Section
        id="zookeeper"
        number={8}
        eyebrow="Coordination"
        title="ZooKeeper — where it sits, what it does"
        intro="ZooKeeper is a distributed coordinator. For KGS it holds one integer (next_available) that workers increment atomically. The key design question is where it lives in the topology."
      >
        <p>
          ZooKeeper doesn't sit on the request path at all — it's off to the side, on the <strong>control plane</strong>,
          not the data plane.
        </p>

        <ZKTopologyDiagram />

        <p>Systems have two kinds of traffic:</p>
        <ul>
          <li>
            <strong>Data plane</strong> is user traffic (200K reads/sec, 2K writes/sec). Flows through LB → app → cache → DB.
            Has to be fast, horizontally scalable, tolerant of huge volume.
          </li>
          <li>
            <strong>Control plane</strong> is coordination traffic (a few requests/hour). Low-volume, doesn't need to be
            fast, but has to be strongly consistent. ZooKeeper lives here.
          </li>
        </ul>

        <h3 className="text-xl font-serif font-medium text-ink-900 mt-8 mb-3">How ZK stores next_available</h3>
        <p>
          ZooKeeper is itself the database for this value — not a file you manage, not a separate DB. The value lives
          at a path-like identifier called a <strong>znode</strong>, e.g. <Code inline>/kgs/next_available</Code>.
          Each ZK node internally has three layers:
        </p>

        <ul>
          <li>
            <strong>In-memory znode tree</strong> — entire state lives in RAM for fast reads (microsecond latency).
          </li>
          <li>
            <strong>Transaction log (WAL)</strong> — every write is fsynced to disk before being acknowledged. Survives
            crashes, reboots, power loss.
          </li>
          <li>
            <strong>Periodic snapshots</strong> — full tree dumped to disk every N transactions. On restart: load snapshot,
            replay WAL tail, back up.
          </li>
        </ul>

        <p>Multiply that picture by 3 (or 5) — one copy per ZK node in the ensemble. Each has its own WAL, snapshots,
          and in-memory tree. They stay in sync via consensus: a write isn't acknowledged until it's fsynced to the WAL
          on a majority of nodes. Even if one node's disk corrupts, two other nodes have the same data.</p>
      </Section>

      {/* === 9. CONSENSUS === */}
      <Section
        id="consensus"
        number={9}
        eyebrow="The why behind 3 or 5"
        title="Why consensus needs 3 or 5 nodes — never 2 or 4"
        intro="ZooKeeper works by majority vote. A majority of nodes must acknowledge every write before it's considered durable. Play with the simulator below to see why odd-numbered clusters are optimal."
      >
        <ConsensusSimulator />

        <h3 className="text-xl font-serif font-medium text-ink-900 mt-8 mb-3">The deepest reason: split-brain prevention</h3>
        <p>
          Imagine 4 ZK nodes split by a network partition into two groups of 2. Without the majority rule, each side
          might elect its own leader, accept writes, and hand out conflicting ranges. When the partition heals, you have
          two versions of <Code inline>next_available</Code> with no way to reconcile.
        </p>

        <p>
          <strong>With the majority rule, neither side of a 2+2 split has a quorum. Both sides refuse writes</strong> until
          the partition heals. You lose availability, but you never lose correctness. This is CAP theorem in action —
          ZooKeeper picks C (consistency) over A (availability) during a partition, exactly the right choice for a
          coordinator.
        </p>

        <Callout variant="insight" title="Why the majority rule is unbreakable">
          Two overlapping majorities of a set are mathematically impossible. In a 3-node cluster, no two distinct
          2-node subsets can coexist without sharing at least one node. That shared node is the "anchor" that prevents
          divergence — it was part of the last committed write and will reject any contradictory one.
        </Callout>
      </Section>

      {/* === 10. CRASH RECOVERY === */}
      <Section
        id="crash-recovery"
        number={10}
        eyebrow="The follow-up"
        title="Crash recovery + concurrent claims"
        intro="What happens when Worker A dies mid-range and a replacement Worker D comes up — at the same moment B finishes its range and asks ZK for a new one? The race resolves cleanly, but the design insight is unexpected."
      >
        <CrashRecoveryTimeline />

        <h3 className="text-xl font-serif font-medium text-ink-900 mt-8 mb-3">The key insight — ZK doesn't track ownership</h3>
        <p>
          ZK doesn't know which worker owns which range. <strong>ZK knows exactly one thing: the value of the counter.</strong> When
          a worker "claims" a range, what's happening is "the counter moved forward by 1M; the worker treats that slice as its
          own." There's no registry saying "A owns [0, 1M)". If A dies, ZK doesn't need to be told.
        </p>

        <ul>
          <li><strong>No garbage collection.</strong> ZK never detects dead workers or reclaims ranges.</li>
          <li><strong>No reconciliation.</strong> When D spawns, it just asks for a new range.</li>
          <li><strong>No ambiguity under partition.</strong> If A is merely partitioned (not dead), A keeps generating
            keys in [0, 1M). D generates in [3M, 4M). Both continue safely.</li>
        </ul>

        <Callout variant="warning" title="Why D doesn't resume A's progress">
          <p className="mt-0">For D to resume from 5001, A must have checkpointed its progress somewhere. Three options, all worse than abandoning:</p>
          <ul className="mb-0">
            <li><strong>Checkpoint per key</strong> — defeats the whole purpose of range allocation (5–10ms ZK round-trip per key).</li>
            <li><strong>Checkpoint every 1K keys</strong> — always a gap. If A got to 5100 but only checkpointed 5000, D collides on keys 5001–5100.</li>
            <li><strong>Checkpoint to A's local disk</strong> — useless if D spawns on a different host, which is usually the case.</li>
          </ul>
        </Callout>

        <p>
          The math decides: key space is 3.5 trillion. Losing 1M keys per crash means you can tolerate <strong>3.5 million
          crashes</strong> before running out. The waste is free.
        </p>

        <h3 className="text-xl font-serif font-medium text-ink-900 mt-8 mb-3">How the race is resolved</h3>
        <p>
          ZooKeeper znodes have a <strong>version number</strong>. Every write specifies the expected version; if the
          actual version has moved on, the write fails with <Code inline>BadVersion</Code> and the caller retries.
          The consensus protocol serializes writes at the leader — even if D and B arrive in the same microsecond,
          only one CAS succeeds per version.
        </p>
      </Section>

      {/* === 11. KAFKA === */}
      <Section
        id="kafka"
        number={11}
        eyebrow="Analytics"
        title="Kafka — decoupling the hot path from analytics"
        intro='"Why not just INSERT INTO clicks on every redirect?" Because it doubles the DB load, makes dashboard queries fight with redirects for the same DB, and slows every redirect down to whatever the DB latency is. Kafka fixes all three.'
      >
        <KafkaPipelineDiagram />

        <p>
          The redirect completes at step 2 (returning 302 to client). Steps 3–6 happen behind the scenes. If any part of
          3–6 is slow or broken, the user never knows.
        </p>

        <h3 className="text-xl font-serif font-medium text-ink-900 mt-8 mb-3">What Kafka actually is</h3>
        <p>
          A distributed append-only log. Producers (app servers) append messages to topics. Topics split into partitions
          for parallelism. Consumers track their position with an offset. Messages stay on disk for a configured retention
          period (typically 7 days) regardless of whether anyone reads them.
        </p>

        <ul>
          <li>
            <strong>Append-only writes are stupidly fast.</strong> No locks, no B-trees, no indexes — just <Code inline>write(fd, msg)</Code>
            to the end of a log file. One broker handles 100K+ messages/sec per partition.
          </li>
          <li>
            <strong>Decoupled producers and consumers.</strong> The producer doesn't care if any consumer is reading.
            If BigQuery is down for 2 hours, events pile up in Kafka; when BigQuery recovers, the consumer catches up
            from its last offset. No data loss.
          </li>
        </ul>

        <Callout variant="insight" title="Kafka has its own ZooKeeper (historically)">
          For ~10 years Kafka used ZooKeeper for its internal metadata (leader election, replication state). Since
          Kafka 3.3 (KRaft mode, released 2022), Kafka has its own built-in consensus protocol based on Raft and no
          longer needs ZooKeeper. Note: Kafka's ZK was always a <em>separate cluster</em> from your KGS's ZK — different
          roles, different failure domains.
        </Callout>
      </Section>

      {/* === 12. DEEP CONCEPTS === */}
      <Section
        id="deep-concepts"
        number={12}
        eyebrow="Concepts worth knowing"
        title="MVCC, and why sharding is painful in Postgres"
        intro="Two concepts that come up constantly in follow-up questions. Understanding them explains why NoSQL was chosen and why sharding Postgres is a different animal from sharding Cassandra."
      >
        <h3 className="text-xl font-serif font-medium text-ink-900 mb-3">MVCC — Multi-Version Concurrency Control</h3>
        <p>
          How Postgres, Oracle, and SQL Server let readers and writers not block each other. The problem: transaction A
          is reading row X while transaction B wants to update it. With locks, one waits for the other; for read-heavy
          workloads, throughput collapses.
        </p>

        <p>
          MVCC's trick: keep <strong>multiple versions of each row</strong>. Every transaction sees a snapshot of the DB
          as it looked when the transaction started. Postgres tags each row with two hidden columns — <Code inline>xmin</Code>
          (creating transaction) and <Code inline>xmax</Code> (deleting/updating transaction). A transaction with ID 100
          reads a row if <Code inline>xmin &lt; 100 AND (xmax is null OR xmax &gt; 100)</Code>.
        </p>

        <p>
          When transaction 101 updates row X, it <strong>doesn't overwrite</strong> — it creates a new version and marks
          the old one with <Code inline>xmax = 101</Code>. Transaction 100, still in flight, continues to see the old version.
          No locks held for reads.
        </p>

        <Callout variant="warning" title="The cost — VACUUM and bloat">
          <p className="m-0 mb-2">Dead row versions pile up. Every UPDATE creates a dead row; every DELETE leaves a corpse.
            Postgres has <Code inline>VACUUM</Code>, a garbage collector that reclaims space periodically. If VACUUM falls
            behind, the table <strong>bloats</strong> — logically 10 GB but physically 80 GB on disk. Queries slow down.</p>
          <p className="m-0">
            Modern Postgres's autovacuum usually keeps up. Pain points: very write-heavy workloads, and long-running
            transactions that block VACUUM from cleaning anything. For a URL shortener, MVCC is machinery you don't need.
          </p>
        </Callout>

        <h3 className="text-xl font-serif font-medium text-ink-900 mt-8 mb-3">Why sharding NoSQL is easy, Postgres is painful</h3>
        <p>
          Postgres has features that <strong>actively fight sharding</strong>. NoSQL stores were designed without those
          features, so sharding is trivial.
        </p>

        <ul>
          <li>
            <strong>JOINs.</strong> On one machine, an index lookup. On a sharded cluster, the database must either ship
            rows between shards, replicate tables on every shard, or scatter-gather. No clean answer. NoSQL has no JOIN
            operator — you denormalize up front.
          </li>
          <li>
            <strong>Foreign keys.</strong> Enforced at write time on one node. Across shards, enforcement requires
            cross-shard lookups on every write. Sharded Postgres typically drops FK enforcement.
          </li>
          <li>
            <strong>Cross-row transactions.</strong> Require <strong>two-phase commit</strong> across shards — slow, holds
            locks, notorious failure modes (coordinator crashes mid-transaction).
          </li>
          <li>
            <strong>Global uniqueness.</strong> <Code inline>UNIQUE(email)</Code> requires checking every shard on
            every insert. Sharded Postgres only enforces uniqueness <em>per shard</em>.
          </li>
          <li>
            <strong>Sequences.</strong> <Code inline>SERIAL</Code> uses one counter — bottleneck across shards. NoSQL uses
            UUIDs, Snowflake IDs, or KGS-style allocation.
          </li>
          <li>
            <strong>Rebalancing.</strong> DynamoDB auto-splits hot partitions. Cassandra migrates with <Code inline>nodetool</Code>.
            Sharded Postgres requires custom migration or middleware like Citus.
          </li>
        </ul>

        <p>
          The takeaway: if your workload needs relational features, stay on single-node Postgres — or use a distributed SQL
          database like CockroachDB or Spanner that re-engineered these tradeoffs. If it doesn't, NoSQL is strictly easier.
          URL shorteners fall squarely in the second category.
        </p>
      </Section>

      {/* === 13. TRADEOFFS === */}
      <Section
        id="tradeoffs"
        number={13}
        eyebrow="Production reality"
        title="What the design gets right — and what it glosses over"
        intro="Interviews test for depth. Being able to name what the happy-path diagram ignores is often what separates good candidates from great ones."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 not-prose">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-5">
            <div className="text-xs font-medium text-teal-700 uppercase tracking-wider mb-3">What's solid</div>
            <ul className="space-y-2 text-sm text-ink-800">
              <li>✓ NoSQL fits the workload — simple key lookups, no joins, trivially shardable</li>
              <li>✓ KGS avoids collisions entirely; hash-based approach gets worse as space fills</li>
              <li>✓ Kafka decouples analytics from the hot path</li>
              <li>✓ Cache layer absorbs Pareto-distributed traffic</li>
              <li>✓ 302 vs 301 redirect tradeoff is explicit (analytics vs caching)</li>
            </ul>
          </div>

          <div className="bg-rust-50 border border-rust-200 rounded-lg p-5">
            <div className="text-xs font-medium text-rust-700 uppercase tracking-wider mb-3">What gets glossed over</div>
            <ul className="space-y-2 text-sm text-ink-800">
              <li>⚠ <strong>Hot key problem</strong> — one viral URL destroys uniform distribution</li>
              <li>⚠ <strong>Cache stampede</strong> — TTL expiry causes thundering herd to DB</li>
              <li>⚠ <strong>Multi-region</strong> — single-region design; one AZ outage = down</li>
              <li>⚠ <strong>Abuse & safety</strong> — no phishing/malware filtering</li>
              <li>⚠ <strong>Expiration race</strong> — purge vs. in-flight request for deleted key</li>
              <li>⚠ <strong>Cost</strong> — multi-AZ Redis + Kafka + warehouse is ~$50–100K/mo at scale</li>
            </ul>
          </div>
        </div>

        <Callout variant="interview" title="How to deliver this in an interview">
          <p className="m-0">
            <em>"The architecture trades relational features and strong consistency for horizontal scalability and low-latency
            reads — exactly the right trade for a URL shortener because the workload is read-heavy, simple key lookups, on
            immutable data. The gaps are mostly around edge cases — hot keys, stampedes, cross-region failover — rather
            than core design choices."</em>
          </p>
        </Callout>

        <h3 className="text-xl font-serif font-medium text-ink-900 mt-8 mb-3">Mitigations for the gaps</h3>
        <ul>
          <li>
            <strong>Hot keys:</strong> add a local L1 in-process cache before Redis for the top-K hottest keys. Detect
            hot keys via sampling and replicate them across multiple Redis nodes.
          </li>
          <li>
            <strong>Cache stampede:</strong> single-flight / request coalescing at the app layer (only one DB request per
            key; others wait on the same promise). Or probabilistic early expiration — recompute at random moments before
            TTL so the herd stays disorganized.
          </li>
          <li>
            <strong>Multi-region:</strong> active-active with CRDT-based analytics counts and "first write wins" for
            shortKey creation via a globally-consistent KGS (e.g., regional KGS prefixes).
          </li>
        </ul>
      </Section>

      {/* === 14. DEPLOYMENT === */}
      <Section
        id="deployment"
        number={14}
        eyebrow="Topology"
        title="Realistic deployment picture"
        intro="Going from abstract boxes to concrete infrastructure. Useful when the interviewer asks 'how many servers would you run?'"
      >
        <div className="bg-white dark:bg-night-200 border border-ink-200 dark:border-night-400 rounded-xl overflow-hidden my-6 not-prose">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 text-left text-xs text-ink-500 dark:text-night-700 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-medium">Component</th>
                <th className="px-4 py-3 font-medium">Count</th>
                <th className="px-4 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-night-400">
              <Row comp="Load balancer" count="Managed (ALB / NLB)" notes="Not a self-managed container" />
              <Row comp="App servers" count="10 base · 6–30 autoscale" notes="One container per instance" />
              <Row comp="KGS workers" count="3 across 3 AZs" notes="Overprovisioned for throughput; sized for availability" />
              <Row comp="ZooKeeper" count="3 or 5 nodes" notes="StatefulSet with persistent volumes, own subnet" warn />
              <Row comp="Redis" count="Managed (ElastiCache)" notes="3-node cluster, multi-AZ replication" />
              <Row comp="Database" count="Managed DynamoDB OR 6+ Cassandra nodes" notes="Sharded by shortKey" />
              <Row comp="Kafka" count="3-node cluster" notes="Replication factor 3, KRaft mode (no separate ZK)" />
              <Row comp="Warehouse" count="Managed (BigQuery / Snowflake)" notes="Consumer writes batches" />
            </tbody>
          </table>
        </div>

        <Callout variant="warning" title="One container for ZooKeeper is wrong — and dangerous">
          <p className="m-0">
            The #1 mistake: "I'll run 1 ZK instance." That defeats the entire point of using ZK. With one node,
            you have no consensus, no replication, no majority. If that node dies, all KGS workers stall when they
            run out of range. Always 3 or 5, across different availability zones, with persistent volumes.
          </p>
        </Callout>

        <p className="mt-6 text-ink-600 dark:text-night-700 text-sm">
          <strong>General rule:</strong> any service providing coordination or configuration (ZooKeeper, etcd, Consul,
          schema registries) should run off the request path as a small dedicated cluster. You want them highly available,
          but not in your p99 latency budget.
        </p>
      </Section>

      {/* Footer nav */}
      <motion.div
        className="mt-16 pt-8 border-t border-ink-200/60 dark:border-night-400/40 flex items-center justify-between"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> All questions
        </Link>
        <div className="text-sm text-ink-400 dark:text-night-600">More questions coming soon</div>
      </motion.div>
          </div>{/* end content area */}
        </div>{/* end grid */}
      </div>{/* end max-w container */}
    </div>
  );
}

/* Mobile-only TOC dropdown */
function MobileTOC({ sections, active }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden mb-8">
      <button
        onClick={() => setOpen(!open)}
        className="w-full glass-card rounded-xl px-4 py-3 flex items-center justify-between text-sm font-medium text-ink-700 dark:text-night-800"
      >
        <span>
          <span className="text-ink-400 dark:text-night-600 mr-1.5">§</span>
          {sections.find((s) => s.id === active)?.label || 'On this page'}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-ink-400 dark:text-night-600">▾</motion.span>
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card rounded-xl mt-2 p-3 space-y-0.5 overflow-hidden"
        >
          {sections.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm transition ${
                active === s.id
                  ? 'bg-rust-500/10 text-rust-600 dark:text-rust-300 font-medium'
                  : 'text-ink-600 dark:text-night-700 hover:bg-ink-100/50 dark:hover:bg-night-300/30'
              }`}
            >
              <span className="font-mono text-[10px] opacity-50 mr-2">{String(i + 1).padStart(2, '0')}</span>
              {s.label}
            </a>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function Row({ comp, count, notes, warn }) {
  return (
    <tr className={warn ? 'bg-rust-50/40 dark:bg-[#1F0E07]/40' : 'dark:bg-night-200'}>
      <td className="px-4 py-3 font-medium text-ink-900 dark:text-night-900">{comp}</td>
      <td className="px-4 py-3 font-mono text-xs text-ink-700 dark:text-night-800">{count}</td>
      <td className="px-4 py-3 text-ink-600 dark:text-night-700 text-xs">{notes}</td>
    </tr>
  );
}
