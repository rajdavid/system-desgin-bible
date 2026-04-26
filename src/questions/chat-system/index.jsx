import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Section from '../../components/ui/Section';
import Callout from '../../components/ui/Callout';
import Code from '../../components/ui/Code';
import Stat from '../../components/ui/Stat';
import ChatArchitectureDiagram from './diagrams/ArchitectureDiagram';
import WebSocketHandshake from './diagrams/WebSocketHandshake';
import MessageRoutingViz from './diagrams/MessageRoutingViz';
import MessageLifecycle from './diagrams/MessageLifecycle';
import CassandraSchemaViz from './diagrams/CassandraSchemaViz';
import GroupFanoutViz from './diagrams/GroupFanoutViz';
import PresenceHeartbeat from './diagrams/PresenceHeartbeat';
import KafkaTopicExplorer from './diagrams/KafkaTopicExplorer';

const SECTIONS = [
  { id: 'requirements',   label: 'Requirements' },
  { id: 'architecture',   label: 'Architecture' },
  { id: 'websockets',     label: 'WebSockets' },
  { id: 'connection-mgr', label: 'Connection manager' },
  { id: 'message-flow',   label: 'Message flow' },
  { id: 'kafka',          label: 'Kafka design' },
  { id: 'cassandra',      label: 'Cassandra schema' },
  { id: 'group-chats',    label: 'Group chats' },
  { id: 'presence',       label: 'Presence & heartbeat' },
  { id: 'offline',        label: 'Offline delivery' },
  { id: 'e2e',            label: 'E2E Encryption' },
  { id: 'failure',        label: 'Failure modes' },
  { id: 'tradeoffs',      label: 'Tradeoffs' },
  { id: 'deployment',     label: 'Deployment' },
];

function useActiveSection(sectionIds) {
  const [active, setActive] = useState(sectionIds[0]);
  useEffect(() => {
    const observers = [];
    const visible = new Map();
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) visible.set(id, entry.intersectionRatio);
          else visible.delete(id);
          for (const sid of sectionIds) {
            if (visible.has(sid)) { setActive(sid); break; }
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

export default function ChatSystem() {
  const contentRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const activeSection = useActiveSection(SECTIONS.map((s) => s.id));

  useEffect(() => {
    document.title = 'Design a Chat System — System Design Bible';
  }, []);

  return (
    <div className="gradient-mesh min-h-screen">
      {/* Reading progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-purple-500 to-teal-400 origin-left z-50"
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
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            All questions
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
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg glass-pill border-amber-200/60 dark:border-amber-500/30 text-amber-700 dark:text-amber-300">
              Medium
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg glass-pill text-ink-700 dark:text-night-800">
              Very High frequency
            </span>
            <span className="text-xs text-ink-400 dark:text-night-600 ml-2 font-medium">
              Meta · Google · Amazon · Startups
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-ink-900 dark:text-night-900 tracking-tight mb-3">
            Design a Chat System
          </h1>
          <p className="text-lg text-ink-500 dark:text-night-700">WhatsApp / Messenger / iMessage</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {['WebSockets', 'Kafka', 'Cassandra', 'Redis Pub/Sub', 'Presence', 'E2E Encryption', 'Fan-out'].map((tag) => (
              <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium">
                {tag}
              </span>
            ))}
          </div>
        </motion.header>

        {/* Main layout */}
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
                            ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-300 font-medium'
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

          {/* Mobile TOC */}
          <MobileTOC sections={SECTIONS} active={activeSection} />

          {/* Content area */}
          <div ref={contentRef} className="min-w-0">

            {/* ── 1. REQUIREMENTS ── */}
            <Section
              id="requirements"
              number={1}
              eyebrow="Start here"
              title="Requirements & scale"
              intro="Chat systems span a huge design space — before drawing anything, lock down what you're actually building."
            >
              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mb-3">Functional requirements</h3>
              <ul>
                <li><strong>1-on-1 messaging</strong> — real-time delivery, delivery receipts, read receipts.</li>
                <li><strong>Group chats</strong> — up to 500 members (WhatsApp limit). Each member gets the message.</li>
                <li><strong>Online presence</strong> — show friends as online/offline, "last seen X ago".</li>
                <li><strong>Media sharing</strong> — images, videos, documents (out-of-band via CDN, not inline in the message pipeline).</li>
                <li><strong>Push notifications</strong> — when the app is backgrounded.</li>
                <li><strong>End-to-end encryption</strong> — the server must never see plaintext message content.</li>
              </ul>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Non-functional requirements</h3>
              <ul>
                <li><strong>Low latency</strong> — &lt; 100ms end-to-end delivery for online recipients.</li>
                <li><strong>High availability</strong> — 99.99% uptime. Message loss is unacceptable.</li>
                <li><strong>Durability</strong> — once a message is acknowledged, it must survive any single node failure.</li>
                <li><strong>Scale</strong> — 50M peak concurrent users, 2M messages/sec.</li>
              </ul>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6 not-prose">
                <Stat value="50M"    label="Peak concurrent users" sub="WebSocket connections" accent />
                <Stat value="2M"     label="Messages / sec" sub="peak throughput" />
                <Stat value="625"    label="Chat servers" sub="at 80K conn/server" accent />
                <Stat value="< 100ms" label="E2E latency" sub="for online recipients" />
              </div>

              <Callout variant="insight" title="The interviewer's hidden question">
                When they say "design a chat system," they're really asking: how do you push messages to 50M open connections without polling, route a message to exactly the right server out of 625, guarantee delivery even when the recipient is offline, and do it all in under 100ms? Those four problems drive every decision below.
              </Callout>
            </Section>

            {/* ── 2. ARCHITECTURE ── */}
            <Section
              id="architecture"
              number={2}
              eyebrow="The big picture"
              title="Six-layer architecture"
              intro="Chat has a fundamentally different shape from REST APIs. Connections are long-lived. The server pushes, not just responds. Walk through each layer."
            >
              <ChatArchitectureDiagram />

              <div className="space-y-3 not-prose mt-4">
                {[
                  { n: '1. Edge', c: '#4A6CF7', d: 'Layer 4 load balancer + TLS termination. Routes new WebSocket upgrade requests to the least-loaded chat server. After the handshake, the LB is out of the hot path — the connection is pinned to one server.' },
                  { n: '2. Chat Servers', c: '#7C3AED', d: 'Stateful. Each holds 80K long-lived WebSocket connections. Receives frames from clients, validates session, hands to the message pipeline.' },
                  { n: '3. Connection Manager', c: '#D97706', d: 'Redis cluster. Maps userId → serverId. Every lookup is a single Redis GET (~0.1ms). Without this, routing a message would require broadcasting to all 625 servers.' },
                  { n: '4. Message Pipeline', c: '#059669', d: 'Stateless Message Service + Kafka. Kafka durably buffers 2M msgs/sec. Message Service reads and writes to Cassandra. Entirely decoupled from WebSocket lifecycle.' },
                  { n: '5. Persistence', c: '#059669', d: 'Cassandra wide-column cluster. One row per message partitioned by (chatId, bucket). Sub-millisecond append, efficient paginated range reads.' },
                  { n: '6. Out-of-band', c: '#2D8B66', d: 'APNS / FCM push notifications for offline users. Presence service (Redis TTL expiry = auto-offline). These run completely asynchronously.' },
                ].map((layer) => (
                  <div
                    key={layer.n}
                    className="flex gap-3 rounded-lg p-3"
                    style={{ background: layer.c + '0A', border: `1px solid ${layer.c}20` }}
                  >
                    <div className="font-semibold text-[12px] whitespace-nowrap mt-0.5" style={{ color: layer.c }}>{layer.n}</div>
                    <div className="text-sm text-ink-700 dark:text-night-700">{layer.d}</div>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── 3. WEBSOCKETS ── */}
            <Section
              id="websockets"
              number={3}
              eyebrow="Protocol deep dive"
              title="WebSockets — why not HTTP polling or SSE?"
              intro="Chat needs server-initiated push. HTTP is request-response. Three alternatives exist — only one actually works at this scale."
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 not-prose">
                {[
                  { name: 'Long Polling', verdict: '❌ Avoid', color: '#EF4444', desc: 'Client holds a request open. Server responds when a message arrives, client immediately re-polls. Issues: doubled latency (re-poll RTT), high server connection count, difficult to scale, message loss between reconnects.' },
                  { name: 'Server-Sent Events (SSE)', verdict: '⚠ Partial', color: '#D97706', desc: 'Unidirectional server→client push over HTTP. Works for notifications. Fatal flaw for chat: client messages must go through separate HTTP POST requests — no true bidirectional. Awkward to multiplex.' },
                  { name: 'WebSocket', verdict: '✓ Correct', color: '#2D8B66', desc: 'Full-duplex binary channel over a single persistent TCP connection. Both sides can send at any time. One socket handles all messages in both directions. Industry standard for chat (WhatsApp, Slack, Discord all use it).' },
                ].map((opt) => (
                  <div key={opt.name} className="rounded-xl border overflow-hidden" style={{ borderColor: opt.color + '40' }}>
                    <div className="px-4 py-2.5 border-b" style={{ background: opt.color + '0F', borderColor: opt.color + '30' }}>
                      <div className="text-xs font-semibold" style={{ color: opt.color }}>{opt.name}</div>
                      <div className="text-[11px] font-medium text-ink-600 dark:text-night-700 mt-0.5">{opt.verdict}</div>
                    </div>
                    <div className="p-4 text-xs text-ink-700 dark:text-night-700">{opt.desc}</div>
                  </div>
                ))}
              </div>

              <WebSocketHandshake />

              <p>
                A WebSocket's wire cost is tiny. An open idle connection costs <strong>~25–100KB of RAM</strong> (TCP send/recv buffers + TLS state + per-connection app struct). At 100KB/conn, one server with 8GB heap holds ~80K connections. With 50M concurrent users: <Code inline>50M ÷ 80K = 625 chat servers</Code>.
              </p>

              <Callout variant="insight" title="Why WhatsApp ran 2M connections per box">
                At 100KB/conn Java would need 200GB per server for 2M conns — impossible. The BEAM (Erlang VM) uses green threads (processes) costing <strong>~2–4KB each</strong>, not OS threads. Combined with <Code inline>epoll</Code> for async I/O, each Erlang process blocks cheaply. WhatsApp ran FreeBSD + Erlang and hit 2M concurrent WebSocket connections per physical machine. Go goroutines get close (~8–64KB stack, growable). JVM threads at ~512KB each cannot compete here.
              </Callout>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">WebSocket frame anatomy</h3>
              <p>
                After the upgrade, the TCP socket becomes a raw binary framing protocol. Every message is a frame with a small header:
              </p>
              <Code lang="WS Frame Header">
{`Byte 0: FIN(1) RSV(3) OPCODE(4)
         FIN=1: this is the final frame of a message
         OPCODE: 0x1=text, 0x2=binary, 0x8=close, 0x9=ping, 0xA=pong
Byte 1: MASK(1) PAYLOAD_LEN(7)
         MASK=1: client must mask (XOR with 4-byte key)
         MASK=0: server sends unmasked

For chat messages:
  Client→Server: FIN=1, OPCODE=0x2 (binary), MASK=1
  Server→Client: FIN=1, OPCODE=0x2 (binary), MASK=0`}
              </Code>
              <p className="mt-3">
                Chat messages are always &lt;1KB and always fit in one frame (FIN always set; no fragmentation needed).
                The masking requirement (client→server only) prevents <strong>cache-poisoning attacks</strong> on misbehaving HTTP forward proxies that might buffer WebSocket frames.
              </p>
            </Section>

            {/* ── 4. CONNECTION MANAGER ── */}
            <Section
              id="connection-mgr"
              number={4}
              eyebrow="Core component"
              title="Connection Manager — routing without broadcasting"
              intro={'"Where is User B right now?" — that simple question determines whether you need to broadcast to all 625 servers or make one Redis lookup. The Connection Manager answers it.'}
            >
              <p>
                Every time a user connects, the Chat Server writes a Redis entry:
              </p>
              <Code lang="Redis connection registration">
{`# On WebSocket connect:
SET conn:{userId} {serverId} EX 90   # 90-second TTL

# On disconnect:
DEL conn:{userId}

# Routing lookup (from Message Service):
GET conn:{userId}   → "server-42"    # online, deliver via pub/sub
                    → null            # offline, push notification path`}
              </Code>

              <p>
                The TTL (90s) is the safety net. If a chat server crashes and can't clean up, the Redis entry expires
                automatically. The client reconnects (WebSocket close code 1006 triggers reconnect with exponential backoff),
                and the new server registers a fresh entry.
              </p>

              <Callout variant="insight" title="Why a separate Connection Manager, not the chat server's own memory?">
                Each Chat Server only knows about its own connections. With 625 servers, looking up User B requires either (a) broadcasting a "who has user B?" query to all 625 servers — O(N) network calls — or (b) maintaining a centralized directory. Redis cluster is the directory. O(1) lookup, sub-millisecond latency, handles 2M lookups/sec easily. The directory is the entire point of this component.
              </Callout>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Redis cluster sizing</h3>
              <p>
                Each entry is ~50 bytes (<Code inline>conn:userId</Code> as key, serverId as value). At 50M concurrent
                users: <Code inline>50M × 50B = 2.5GB</Code>. A single 8GB Redis node holds this comfortably. In practice,
                you run Redis Cluster (3 primary shards + 3 replicas) for availability, not capacity — the data is tiny.
              </p>
            </Section>

            {/* ── 5. MESSAGE FLOW ── */}
            <Section
              id="message-flow"
              number={5}
              eyebrow="The hot path"
              title="End-to-end message flow — from send to double-tick"
              intro="Walk the full request. Every millisecond matters on the hot path. The design keeps the critical path short and makes the slow parts async."
            >
              <MessageLifecycle />

              <MessageRoutingViz />

              <Callout variant="insight" title="Idempotency via clientMsgId">
                <p className="m-0">Every message the client sends includes a <Code inline>clientMsgId</Code> — a UUID generated on the device before the first send attempt. If the network drops after the server ACKs to Kafka but before the WS ACK reaches the client, the client retries. The server deduplicates on <Code inline>clientMsgId</Code> — the second write returns the existing <Code inline>messageId</Code> without creating a duplicate row. This is the standard pattern for "at-least-once delivery + idempotent consumer."</p>
              </Callout>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Delivery receipt states</h3>
              <p>The classic WhatsApp tick system maps to distinct events in the pipeline:</p>
              <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-4 not-prose">
                <table className="w-full text-sm">
                  <thead className="bg-cream-100 dark:bg-night-300 text-left text-xs text-ink-500 dark:text-night-600 uppercase tracking-wider border-b border-ink-200 dark:border-night-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Symbol</th>
                      <th className="px-4 py-3 font-medium">Meaning</th>
                      <th className="px-4 py-3 font-medium">Triggered by</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100 dark:divide-night-400">
                    {[
                      ['⏳ Clock', 'Queued locally', 'Message created on device, not yet sent to server'],
                      ['✓ Single tick', 'Sent to server', 'Kafka ACK received by Chat Server A'],
                      ['✓✓ Double tick', 'Delivered to device', 'Chat Server B pushed WS frame to User B'],
                      ['🔵✓✓ Blue ticks', 'Read by recipient', 'User B opened the chat (read_ack WS sent back)'],
                    ].map(([sym, meaning, trigger]) => (
                      <tr key={sym} className="dark:bg-night-200">
                        <td className="px-4 py-3 font-mono text-ink-800 dark:text-night-800">{sym}</td>
                        <td className="px-4 py-3 font-medium text-ink-900 dark:text-night-900">{meaning}</td>
                        <td className="px-4 py-3 text-xs text-ink-600 dark:text-night-700">{trigger}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* ── 6. KAFKA ── */}
            <Section
              id="kafka"
              number={6}
              eyebrow="Message pipeline"
              title="Kafka — durable backbone of the message pipeline"
              intro='"Why Kafka? Why not just write directly to Cassandra?" Because Cassandra writes are fast but not instant, and at 2M msgs/sec you cannot afford to make the client wait for Cassandra before returning an ACK. Kafka absorbs the burst.'
            >
              <p>
                Kafka is a <strong>distributed append-only log</strong>. Producers (Chat Servers) append messages.
                Consumers (Message Service instances) read and process asynchronously. Messages persist for a configured
                retention period regardless of whether consumers are keeping up.
              </p>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-6 mb-3">Why Kafka, not a message queue (RabbitMQ/SQS)?</h3>
              <ul>
                <li>
                  <strong>Replay.</strong> Kafka consumers track their position with an offset. If the Message Service is down for 30 minutes, it resumes from where it left off — no messages lost. A queue deletes messages after consumption; if the consumer crashes before writing to Cassandra, the message is gone.
                </li>
                <li>
                  <strong>Ordering within a partition.</strong> Kafka preserves message order within a partition. By partitioning on <Code inline>chatId</Code>, all messages in one conversation are ordered. Queues don't guarantee order across concurrent consumers.
                </li>
                <li>
                  <strong>Fan-out.</strong> Multiple consumer groups can read the same Kafka topic independently — one for Cassandra persistence, one for analytics, one for moderation. Queue message is consumed by exactly one worker.
                </li>
              </ul>

              <KafkaTopicExplorer />

              <Code lang="Core Kafka config (broker)">
{`# chat-messages topic
num.partitions                = 64
replication.factor            = 3
min.insync.replicas           = 2        # quorum write
retention.ms                  = 604800000 # 7 days
compression.type              = lz4       # ~3× compression on text

# Producer (Chat Server)
acks                          = all       # wait for all ISR replicas
enable.idempotence            = true      # no duplicate messages on retry
max.in.flight.requests.per.connection = 5 # pipeline without reordering

# Consumer (Message Service)
enable.auto.commit            = false     # manual commit after Cassandra write
max.poll.records              = 500       # batch Cassandra writes
isolation.level               = read_committed`}
              </Code>

              <Callout variant="warning" title="acks=all is mandatory — do not compromise">
                <p className="m-0">
                  Setting <Code inline>acks=1</Code> (leader only) saves ~2ms per write, but the message can be lost if the leader crashes before replicating. For chat, a lost message is a permanent — a user sent it, got a single tick, then it vanished. Set <Code inline>acks=all</Code> and <Code inline>min.insync.replicas=2</Code>. The extra latency is invisible to humans.
                </p>
              </Callout>
            </Section>

            {/* ── 7. CASSANDRA ── */}
            <Section
              id="cassandra"
              number={7}
              eyebrow="Persistence layer"
              title="Cassandra — why wide-column wins for chat"
              intro="The dominant query for chat is: 'give me the last 50 messages in this conversation before timestamp T.' That's a sorted range scan on a known partition key — exactly what wide-column stores are built for."
            >
              <p>
                Cassandra's data model: rows sit within partitions. The <strong>partition key</strong> determines
                which node owns the data (via consistent hashing). The <strong>clustering key</strong> sorts rows
                within a partition on disk. This physical layout is why chat range reads are sub-millisecond.
              </p>

              <CassandraSchemaViz />

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Why <Code inline>(chat_id, bucket)</Code> and not just <Code inline>chat_id</Code>?</h3>
              <p>
                Cassandra has a soft limit of ~100MB per partition. An active group chat with 500 members sending
                all day could accumulate millions of rows. Partitioned only by <Code inline>chat_id</Code>, one
                chat becomes a giant partition that:
              </p>
              <ul>
                <li>Exceeds the 100MB soft limit → slow reads (Cassandra must scan more SSTables)</li>
                <li>Creates a hot partition — one node absorbs disproportionate I/O</li>
                <li>Can't be split without a schema migration</li>
              </ul>
              <p>
                Adding <Code inline>bucket = 'YYYYMM'</Code> as part of the partition key caps any single partition at 30 days × that chat's message rate.
                A fanatic group sending 1000 msgs/day × 30 days = 30,000 msgs × 500B = ~15MB. Comfortably within limits.
              </p>

              <Callout variant="insight" title="TWCS — Time Window Compaction Strategy">
                Chat data has an inherent time dimension. TWCS groups SSTables by time window (7 days) and compacts within-window only. The result: after a window closes, its SSTables are never touched again — no compaction I/O on historical data. Read performance stays flat as the dataset grows. Contrast with STCS (default) which compacts all SSTables together and gets slower as the table grows.
              </Callout>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Tombstones — the silent killer</h3>
              <p>
                Cassandra deletes write tombstones, not actual deletions. When you delete a message, a tombstone row
                is written. Reads must wade through tombstones — a conversation where users frequently delete messages
                can have thousands of tombstones mixed in with real rows, slowing reads significantly.
              </p>
              <p>
                For individual message deletes (rare in chat), tombstones are fine — they expire after
                <Code inline>gc_grace_seconds</Code> (default 10 days). For bulk deletes (GDPR, account deletion),
                do <strong>not</strong> delete row-by-row. Use a background job that identifies affected partitions and
                drops them entirely (<Code inline>TRUNCATE</Code> or partition-level delete), then rewrite any partial
                partitions needed.
              </p>
            </Section>

            {/* ── 8. GROUP CHATS ── */}
            <Section
              id="group-chats"
              number={8}
              eyebrow="Fan-out strategy"
              title="Group chats — fan-out on write vs. fan-out on read"
              intro="A group message is N parallel 1:1 deliveries. The design falls apart at large N. The threshold between strategies is ~500 members."
            >
              <GroupFanoutViz />

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Fan-out on write (≤ 500 members)</h3>
              <p>
                Sender publishes <strong>one message</strong> to Kafka with <Code inline>key=groupId</Code>.
                The persister writes one row to Cassandra (the group's own partition).
                The router fetches the group's member list from Redis
                (<Code inline>SMEMBERS group:{'{'}groupId{'}'}:members</Code>),
                then for each member:
              </p>
              <ol>
                <li>Lookup Connection Manager → is member online?</li>
                <li>If online: <Code inline>PUBLISH inbox:server:{'{'}serverId{'}'} msg</Code> via Redis pub/sub</li>
                <li>If offline: write to <Code inline>offline-deliveries</Code> Kafka topic</li>
              </ol>
              <p>
                One Cassandra write, N pub/sub delivers. The Cassandra write is O(1); the delivers are O(online_members) but
                happen asynchronously and in parallel.
              </p>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Fan-out on read ({'>'} 500 members)</h3>
              <p>
                Above ~500 members, fan-out on write creates write storms. Every message triggers 500+ async delivers,
                500+ Connection Manager lookups, and 500+ possible push notifications. At high message rates in large
                groups, this overwhelms the router tier.
              </p>
              <p>
                Switch to fan-out on read: store the message <strong>once</strong> in Cassandra. Members fetch messages
                when they open the channel, not when the message is sent. Online members receive a lightweight
                "new message in channel X" signal via pub/sub and pull on receiving it. This is the Slack/Discord
                channel model — covered separately for very large groups (10K+ members).
              </p>

              <Callout variant="interview" title="How to present this in an interview">
                <p className="m-0">
                  <em>"For groups up to 500 members I'd use fan-out on write — the router tier can handle it, delivery is immediate, and we avoid the read-latency hit. Above 500 I'd switch to fan-out on read to avoid write storms. The threshold can be tuned — WhatsApp uses 512, Slack uses a lower threshold for direct channels vs. workspaces. The key insight is both strategies use the same Cassandra schema — the message is always stored once. The difference is only in how we notify members."</em>
                </p>
              </Callout>
            </Section>

            {/* ── 9. PRESENCE ── */}
            <Section
              id="presence"
              number={9}
              eyebrow="Online status"
              title="Presence & heartbeat — the right level of freshness"
              intro={`"Show online/offline status" sounds trivial. It isn't. Naïve push-to-all-friends creates write amplification that can exceed the message load itself.`}
            >
              <PresenceHeartbeat />

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Why TTL expiry beats explicit offline events</h3>
              <p>
                Clients can disconnect in two ways: graceful (app closed cleanly — sends WS close frame) and ungraceful
                (killed by OS, battery died, network dropped). You can only detect ungraceful disconnects via missed heartbeats.
                If the server waits for the client to explicitly say "I'm going offline," ungraceful disconnects leave
                ghost presence entries.
              </p>
              <p>
                The Redis TTL approach handles both cases identically: every heartbeat refreshes the TTL; when heartbeats stop
                (for any reason, graceful or not), the TTL expires and the user appears offline within 60–90 seconds. This is
                acceptable — users tolerate "last seen a minute ago" staleness. Every major chat app uses this pattern.
              </p>

              <Callout variant="warning" title="Do not eagerly push presence to all friends">
                <p className="m-0">
                  If User A has 500 friends and all 500 subscribe to A's presence, every time A comes online you write
                  500 cache entries or push 500 WS frames. Scale that to 50M users each toggling presence a few times per
                  hour: you're looking at billions of writes/hour just for presence. Instead, friends pull presence
                  on-demand (when opening a chat) with a short Redis cache TTL. Cost drops from O(friends²) to O(active conversations).
                </p>
              </Callout>
            </Section>

            {/* ── 10. OFFLINE DELIVERY ── */}
            <Section
              id="offline"
              number={10}
              eyebrow="The offline case"
              title="Offline delivery — push notifications & message queue"
              intro="At any given moment, most users are offline. The system must reliably deliver their messages when they reconnect, and notify them now via APNS/FCM."
            >
              <p>
                When the Connection Manager returns null for a recipient, the router takes two actions simultaneously:
              </p>
              <ol>
                <li>
                  <strong>Write to the offline queue.</strong> Kafka topic <Code inline>offline-deliveries</Code>,
                  partitioned by <Code inline>recipientId</Code>. One partition per user means one consumer thread owns
                  one user's queue — preserving delivery order and avoiding concurrent writes.
                </li>
                <li>
                  <strong>Trigger a push notification.</strong> APNS (iOS) or FCM (Android) with an encrypted payload:
                  a "wake signal" and sender name, but never plaintext message content (E2E encryption forbids it).
                </li>
              </ol>

              <Code lang="Push notification payload (APNs)">
{`{
  "aps": {
    "alert": {
      "title": "Alice",
      "body": "New message"   // no plaintext content
    },
    "badge": 3,
    "sound": "default",
    "content-available": 1    // wakes app in background to pull
  },
  "chatId": "abc123",         // hint to pull correct chat
  "sender": "alice_user_id"
}`}
              </Code>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Reconnect drain</h3>
              <p>
                When User B reconnects, the new Chat Server:
              </p>
              <ol>
                <li>Registers B's presence in Connection Manager → <Code inline>SET conn:{'{'}userId{'}'} {'{'}newServerId{'}'} EX 90</Code></li>
                <li>Reads B's offline partition in <Code inline>offline-deliveries</Code> Kafka topic from B's last committed offset</li>
                <li>Streams messages to B's new WebSocket in order</li>
                <li>Commits offset as each batch is delivered</li>
              </ol>

              <Callout variant="insight" title="Why Kafka for offline queue, not Redis lists?">
                <p className="m-0">
                  Redis lists (RPUSH / LPOP) are the intuitive choice. The problem: Redis is in-memory, so a Redis node failure during the offline window loses all queued messages. Kafka persists to disk with replication — messages survive anything short of losing two replicas simultaneously. The cost is the Kafka overhead (~2ms per produce), but offline-delivery latency isn't human-perceptible — the message was already sent when the recipient was offline.
                </p>
              </Callout>
            </Section>

            {/* ── 11. E2E ENCRYPTION ── */}
            <Section
              id="e2e"
              number={11}
              eyebrow="Security layer"
              title="End-to-end encryption — the Signal Protocol"
              intro="E2E encryption means the server stores ciphertext it cannot decrypt. Even if Cassandra is compromised, message content is safe. The Signal Protocol (used by WhatsApp, Signal, iMessage) is the industry standard."
            >
              <p>
                The Signal Protocol uses a chain of cryptographic primitives that together give <strong>forward secrecy</strong>
                (past messages can't be decrypted even if long-term keys are stolen) and <strong>break-in recovery</strong>
                (future messages are safe even if current keys are stolen).
              </p>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-6 mb-3">Key exchange overview</h3>
              <Code lang="Signal Protocol — simplified">
{`# Device registration (one-time):
Alice uploads to server:
  - Identity key (IK)        long-term public key
  - Signed pre-key (SPK)     medium-term, rotated monthly
  - One-time pre-keys (OPKs) ephemeral, each used once

# Session initiation (X3DH — Extended Triple Diffie-Hellman):
Bob wants to message Alice:
  1. Downloads Alice's IK, SPK, OPK from server
  2. Generates ephemeral key pair (EK)
  3. Computes 4 DH operations → master secret → root key

# Message encryption (Double Ratchet):
  - Each message advances a ratchet → new message key
  - Asymmetric ratchet step on every reply → forward secrecy
  - Old message keys immediately deleted after use`}
              </Code>

              <p>
                What the server sees: a blob of ciphertext + metadata (sender, recipient, timestamp).
                The server routes the blob without being able to read it. This is fundamentally different from
                <strong>transport encryption</strong> (HTTPS) where the server terminates TLS and can see plaintext.
              </p>

              <Callout variant="warning" title="The key distribution problem — the server is a directory, not a vault">
                <p className="m-0">
                  E2E encryption trusts the server to correctly distribute public keys (IK, SPK, OPK). If the server substitutes Alice's public key with its own, it can MITM the session. Real implementations show a "safety number" — a hash of both parties' identity keys — that users can verify out-of-band. WhatsApp calls this the security code; Signal calls it the safety number. Most users never check it, which is a real-world limitation of E2E encryption.
                </p>
              </Callout>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Multi-device challenge</h3>
              <p>
                If Alice uses WhatsApp on both an iPhone and a MacBook, messages must be independently decryptable on both devices.
                The Signal Protocol handles this with <strong>sender keys</strong>: the sender encrypts the message once using
                a shared group key, then encrypts the group key separately for each device. Each device decrypts the group key
                with its own identity key, then decrypts the message.
              </p>
            </Section>

            {/* ── 12. FAILURE MODES ── */}
            <Section
              id="failure"
              number={12}
              eyebrow="Production reality"
              title="Failure modes & recovery"
              intro="Every major component can fail. The design must degrade gracefully — a crashed chat server must not mean message loss."
            >
              <div className="space-y-4 not-prose">
                {[
                  {
                    name: 'Chat server crash',
                    color: '#EF4444',
                    recovery: [
                      'Health check fails (LB stops routing new WS upgrades to it)',
                      'Existing clients see WS close code 1006 → reconnect with exponential backoff (1s, 2s, 4s, …)',
                      'Within 1–2s, clients have connected to a different server',
                      'New server registers in Connection Manager',
                      'In-flight messages: either already Kafka-ACKed (durable, will deliver) or never reached Kafka (client has unacked send → retries with same clientMsgId → idempotent)',
                      'Old Connection Manager entry expires in 90s max (TTL)',
                    ],
                  },
                  {
                    name: 'Redis (Connection Manager) failure',
                    color: '#D97706',
                    recovery: [
                      'Primary fails → sentinel promotes a replica within ~3s',
                      'During those 3s: all message routing fails — new messages can\'t find recipients',
                      'Router falls back to broadcasting to all chat servers (high cost, emergency mode)',
                      'Or router queues in offline-deliveries Kafka topic (safe, adds latency)',
                      'After failover: Connection Manager repopulates as clients heartbeat',
                      'Mitigation: run Redis Cluster (3 shards × 3 replicas) — tolerates any single node failure',
                    ],
                  },
                  {
                    name: 'Kafka broker failure',
                    color: '#7C3AED',
                    recovery: [
                      'With replication factor 3, min.insync.replicas=2: tolerate 1 broker failure with no data loss',
                      'Controller re-elects partition leaders for affected partitions (KRaft mode: sub-second)',
                      'Producers retry with backoff — message delivery is delayed but not lost',
                      'Consumers pause and resume from last committed offset after leader re-election',
                    ],
                  },
                  {
                    name: 'Cassandra node failure',
                    color: '#059669',
                    recovery: [
                      'With replication factor 3 and LOCAL_QUORUM (requires 2/3): tolerate 1 node failure',
                      'Reads/writes succeed against the remaining 2 replicas with quorum',
                      'Hinted handoff: coordinator stores writes for the failed node, replays when it recovers',
                      'Read repair: on quorum read, if replicas diverge, coordinator writes the missing data back → eventual consistency',
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

            {/* ── 13. TRADEOFFS ── */}
            <Section
              id="tradeoffs"
              number={13}
              eyebrow="Production perspective"
              title="What the design gets right — and what it glosses over"
              intro="Being able to articulate the gaps is what separates a good candidate from a great one."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 not-prose">
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
                  <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-3">What's solid</div>
                  <ul className="space-y-2 text-sm text-ink-800">
                    <li>✓ WebSocket over HTTP — the only correct protocol for bidirectional real-time</li>
                    <li>✓ Connection Manager avoids O(N) broadcast to 625 servers</li>
                    <li>✓ Kafka decouples hot path from Cassandra write latency</li>
                    <li>✓ Cassandra buckets prevent hot partitions</li>
                    <li>✓ Fan-out threshold (500 members) matches industry practice</li>
                    <li>✓ Lazy presence avoids O(friends²) write amplification</li>
                    <li>✓ clientMsgId idempotency prevents duplicate messages on retry</li>
                    <li>✓ Redis TTL expiry catches ungraceful disconnects</li>
                  </ul>
                </div>

                <div className="bg-rust-50 border border-rust-200 rounded-xl p-5">
                  <div className="text-xs font-semibold text-rust-700 uppercase tracking-wider mb-3">What gets glossed over</div>
                  <ul className="space-y-2 text-sm text-ink-800">
                    <li>⚠ <strong>Multi-device sync</strong> — messages sent from phone must appear on laptop. Sender keys + device registry.</li>
                    <li>⚠ <strong>Message search</strong> — full-text search over E2E-encrypted messages requires client-side index (tricky).</li>
                    <li>⚠ <strong>Spam / abuse</strong> — content moderation can't use plaintext content with E2E-enc. Must use metadata signals.</li>
                    <li>⚠ <strong>Multi-region</strong> — this is single-region. Cross-region adds replication lag + conflict resolution for presence.</li>
                    <li>⚠ <strong>Media pipeline</strong> — images/video go through a separate upload/CDN path not shown here.</li>
                    <li>⚠ <strong>Rate limiting</strong> — nothing stops one user from flooding 2M msgs/sec alone. Per-user quota at the WS layer.</li>
                  </ul>
                </div>
              </div>

              <Callout variant="interview" title="How to deliver tradeoffs in an interview">
                <p className="m-0">
                  <em>"The core architecture is solid for the 1:1 and small group case. The main production gaps are multi-device sync (client-side complexity), content moderation with E2E encryption (fundamentally hard), and multi-region (requires carefully thinking about consistency vs latency tradeoffs for Connection Manager)."</em>
                </p>
              </Callout>
            </Section>

            {/* ── 14. DEPLOYMENT ── */}
            <Section
              id="deployment"
              number={14}
              eyebrow="Topology"
              title="Realistic deployment picture"
              intro="How many servers, what managed services, where to run them."
            >
              <div className="bg-white dark:bg-night-200 border border-ink-200 dark:border-night-400 rounded-xl overflow-hidden my-6 not-prose">
                <table className="w-full text-sm">
                  <thead className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 text-left text-xs text-ink-500 dark:text-night-600 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-medium">Component</th>
                      <th className="px-4 py-3 font-medium">Count</th>
                      <th className="px-4 py-3 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100 dark:divide-night-400">
                    {[
                      ['L4 Load Balancer', 'Managed (NLB)', 'Layer 4 (not L7) — must support TCP pass-through for WebSockets. Not ALB with HTTP termination.'],
                      ['Chat Servers', '625 base · autoscale 400–1000', 'One process per host. Erlang/Go for high conn density. Stateful — don\'t containerize behind a restart-happy orchestrator.'],
                      ['Connection Manager', 'Redis Cluster 3 shards × 3 replicas', '2.5GB data total. Sized for availability, not capacity.'],
                      ['Kafka', '6 brokers (2 per AZ × 3 AZs)', '64 partitions × RF3 = 192 replicas. KRaft mode (no ZooKeeper).'],
                      ['Message Service', '20 stateless workers', 'Kafka consumer group. Autoscale by consumer lag metric.'],
                      ['Cassandra', '12 nodes (4 per AZ × 3 AZs)', 'RF3, LOCAL_QUORUM. 4TB NVMe per node.'],
                      ['Presence Service', 'Redis Cluster (shared w/ Conn Mgr)', 'Separate keyspace, same cluster.'],
                      ['Push (APNS/FCM)', 'Managed gateway (3rd party or cloud)', 'AWS SNS, or Firebase directly.'],
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

              <Callout variant="warning" title="Layer 4 vs Layer 7 load balancer for WebSockets">
                <p className="m-0">
                  WebSockets require TCP-level pass-through. An L7 (HTTP) load balancer that doesn't explicitly support WebSocket upgrades will terminate the connection and fail the handshake. AWS ALB supports WebSockets (since 2018) via "sticky sessions" targeting — but for 50M concurrent connections, an L4 NLB with IP pass-through is more appropriate. The LB must also not timeout long-idle WebSocket connections — configure idle timeout to at least 30 minutes (or disable, relying on WS PING/PONG).
                </p>
              </Callout>
            </Section>

            {/* Footer nav */}
            <motion.div
              className="mt-16 pt-8 border-t border-ink-200/60 dark:border-night-400/40 flex items-center justify-between"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Link
                to="/q/url-shortener"
                className="inline-flex items-center gap-1.5 text-sm text-ink-500 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                Q1 — URL Shortener
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm text-ink-500 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 group"
              >
                All questions
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>{/* end content */}
        </div>{/* end grid */}
      </div>{/* end container */}
    </div>
  );
}

/* Mobile TOC */
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
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-300 font-medium'
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
