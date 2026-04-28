import Section from '../../components/ui/Section';
import Callout from '../../components/ui/Callout';
import Code from '../../components/ui/Code';
import Stat from '../../components/ui/Stat';
import DeepDiveLayout from '../../components/DeepDiveLayout';
import ChatArchitectureDiagram from './diagrams/ArchitectureDiagram';
import WebSocketHandshake from './diagrams/WebSocketHandshake';
import MessageRoutingViz from './diagrams/MessageRoutingViz';
import MessageLifecycle from './diagrams/MessageLifecycle';
import CassandraSchemaViz from './diagrams/CassandraSchemaViz';
import GroupFanoutViz from './diagrams/GroupFanoutViz';
import PresenceHeartbeat from './diagrams/PresenceHeartbeat';
import KafkaTopicExplorer from './diagrams/KafkaTopicExplorer';

const SECTIONS = [
  { id: 'requirements',     label: 'Requirements',          phase: 'Foundations' },
  { id: 'architecture',     label: 'Architecture',          phase: 'Foundations' },
  { id: 'websockets',       label: 'WebSockets',            phase: 'Hot path' },
  { id: 'connection-mgr',   label: 'Connection manager',    phase: 'Hot path' },
  { id: 'message-flow',     label: 'Message flow',          phase: 'Hot path' },
  { id: 'kafka',            label: 'Kafka design',          phase: 'Hot path' },
  { id: 'cassandra',        label: 'Cassandra schema',      phase: 'Hot path' },
  { id: 'group-chats',      label: 'Group chats',           phase: 'Features' },
  { id: 'presence',         label: 'Presence & heartbeat',  phase: 'Features' },
  { id: 'typing-receipts',  label: 'Typing & receipts',     phase: 'Features' },
  { id: 'offline',          label: 'Offline delivery',      phase: 'Features' },
  { id: 'media',            label: 'Media pipeline',        phase: 'Features' },
  { id: 'e2e',              label: 'E2E Encryption',        phase: 'Features' },
  { id: 'multi-device',     label: 'Multi-device sync',     phase: 'Features' },
  { id: 'failure',          label: 'Failure modes',         phase: 'Production' },
  { id: 'rate-limit',       label: 'Rate limiting & abuse', phase: 'Production' },
  { id: 'multi-region',     label: 'Multi-region',          phase: 'Production' },
  { id: 'scale-10x',        label: '10× scale follow-up',   phase: 'Production' },
  { id: 'tradeoffs',        label: 'Tradeoffs',             phase: 'Production' },
  { id: 'deployment',       label: 'Deployment',            phase: 'Production' },
];

const PHASES = ['Foundations', 'Hot path', 'Features', 'Production'];

export default function ChatSystem() {
  return (
    <DeepDiveLayout
      documentTitle="Design a Chat System — System Design Bible"
      theme="blue"
      sections={SECTIONS}
      phases={PHASES}
      header={{
        difficulty: 'Medium',
        frequency: 'Very High',
        companies: 'Meta · Google · Amazon · Startups',
        title: 'Design a Chat System',
        subtitle: 'WhatsApp / Messenger / iMessage',
        tags: ['WebSockets', 'Kafka', 'Cassandra', 'Redis Pub/Sub', 'Presence', 'E2E Encryption', 'Fan-out'],
      }}
      prev={{ to: '/q/url-shortener', label: 'Q1 — URL Shortener' }}
      next={{ to: '/q/news-feed', label: 'Q3 — News Feed' }}
    >

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

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">So why size for 80K, not 2M?</h3>
              <p>
                The 2M/box number is a record, not a target. Most teams pick a much lower density on purpose:
              </p>
              <ul>
                <li><strong>Blast radius.</strong> A 2M-conn box that crashes forces 2M clients to reconnect at once — a reconnect storm that can topple the cluster (the surviving boxes get 2M new TCP handshakes plus 2M Redis writes to the Connection Manager). At 80K, the storm is 25× smaller and trivially absorbable.</li>
                <li><strong>Operational headroom.</strong> Rolling deploys, autoscaling decisions, and node draining are all bounded by how many connections need to migrate per machine. 80K drains in under a minute; 2M takes 20+.</li>
                <li><strong>Runtime reality.</strong> 2M required Erlang's ~2KB-per-process model. Most companies have Go (~16KB stack growable) or Java/Kotlin (per-thread cost is far worse) services. 80K matches what those runtimes can hold without tuning the kernel for a million open file descriptors.</li>
                <li><strong>NIC and CPU caps.</strong> 2M idle conns is fine, but if 1% become active in the same second, you have 20K msgs/s on one box — pushing a single NIC and one process's event loop. 80K caps the worst-case burst at 800 msgs/s.</li>
              </ul>
              <p>
                <strong>The tradeoff to articulate:</strong> connection density is a knob between hardware cost (fewer, bigger boxes) and operational risk (smaller blast radius). 80K is a reasonable middle for non-Erlang stacks; the WhatsApp 2M figure is what's possible when you control the entire runtime.
              </p>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Push transport comparison</h3>
              <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-x-auto my-4 not-prose">
                <table className="w-full text-sm">
                  <thead className="bg-cream-100 dark:bg-night-300 text-left text-xs text-ink-500 dark:text-night-600 uppercase tracking-wider border-b border-ink-200 dark:border-night-400">
                    <tr>
                      <th className="px-3 py-3 font-medium">Transport</th>
                      <th className="px-3 py-3 font-medium">Direction</th>
                      <th className="px-3 py-3 font-medium">Latency</th>
                      <th className="px-3 py-3 font-medium">Server cost / conn</th>
                      <th className="px-3 py-3 font-medium">Mobile battery</th>
                      <th className="px-3 py-3 font-medium">Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100 dark:divide-night-400 text-xs">
                    {[
                      ['Long polling',     '⇄ via re-poll',   '~RTT × 2',         'High (many short conns)', 'Bad (frequent radio wake)', '❌'],
                      ['HTTP/2 streaming', '⇄ but framed',    '~RTT',             'Med (multiplexed)',       'OK',                          '⚠'],
                      ['SSE',              '→ server only',   '~RTT',             'Med',                     'OK (one TCP)',                '⚠'],
                      ['WebSocket',        '⇄ full duplex',   '~RTT (one frame)', 'Low (~25–100KB idle)',    'Good (1 conn + pings)',       '✓'],
                      ['MQTT (over TCP)',  '⇄ with QoS',      '~RTT',             'Lowest (~2KB header)',    'Best (designed for mobile)',  '✓ (IoT-leaning)'],
                    ].map(([transport, dir, lat, cost, batt, verdict]) => (
                      <tr key={transport} className="dark:bg-night-200">
                        <td className="px-3 py-2.5 font-medium text-ink-900 dark:text-night-900">{transport}</td>
                        <td className="px-3 py-2.5 text-ink-700 dark:text-night-700">{dir}</td>
                        <td className="px-3 py-2.5 text-ink-700 dark:text-night-700 font-mono">{lat}</td>
                        <td className="px-3 py-2.5 text-ink-700 dark:text-night-700">{cost}</td>
                        <td className="px-3 py-2.5 text-ink-700 dark:text-night-700">{batt}</td>
                        <td className="px-3 py-2.5 text-ink-700 dark:text-night-700">{verdict}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-ink-500 dark:text-night-600 -mt-2">
                MQTT note: WhatsApp historically used a custom protocol that resembles MQTT. For interview purposes, "WebSocket with binary framing" is the canonical answer; mention MQTT as the mobile-optimized alternative when battery is a hard constraint.
              </p>

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
                  Setting <Code inline>acks=1</Code> (leader only) saves ~2ms per write, but the message can be lost if the leader crashes before replicating. For chat, a lost message is permanent — a user sent it, got a single tick, then it vanished. Set <Code inline>acks=all</Code> and <Code inline>min.insync.replicas=2</Code>. The extra latency is invisible to humans.
                </p>
              </Callout>

              <Callout variant="info" title="Modern Kafka: idempotence is default-on">
                <p className="m-0">
                  On Kafka 3.0+ <Code inline>enable.idempotence=true</Code> is the default, and turning it on <em>forces</em> <Code inline>acks=all</Code>, <Code inline>retries=Integer.MAX_VALUE</Code>, and <Code inline>max.in.flight.requests.per.connection ≤ 5</Code>. Listing all four settings as separate knobs is outdated — in an interview, say "I'd leave idempotence on, which gives me acks=all and bounded in-flight automatically." It earns more points than reciting the legacy config.
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

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Back-of-the-envelope storage</h3>
              <p>
                Always size before you draw. Quick math for 2M msgs/sec at ~500 bytes per message (envelope + ciphertext + metadata):
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4 not-prose">
                <Stat value="500B"  label="Per message" sub="ciphertext + envelope" />
                <Stat value="86GB"  label="Per day raw"  sub="2M × 500B × 86,400s" accent />
                <Stat value="2.6PB" label="Per month raw" sub="before replication" />
                <Stat value="7.7PB" label="With RF=3"     sub="three replicas" accent />
              </div>
              <p>
                7.7PB/month is too big to keep hot. The standard pattern: <strong>tier by age</strong>. Last 90 days on NVMe-backed Cassandra (~23PB), older messages compacted into cheaper object storage (S3/GCS) with a pointer table. For a 12-node cluster at RF=3 you want ~4TB NVMe per node × 12 nodes = 48TB hot — sized for ~6 months of working set after LZ4 compression (~2.5×) and tombstone collection.
              </p>

              <Callout variant="warning" title="Don't forget the per-user inbox/state">
                <p className="m-0">
                  The <Code inline>messages_by_chat</Code> table is the bulk of storage, but you also need <Code inline>chat_membership</Code> (user → chat list), <Code inline>read_state</Code> (last-read marker per chat per user), and <Code inline>device_registry</Code> (for multi-device). These are small per row but high cardinality — on the order of 50M users × 100 chats × 8 devices. Plan for ~5% of message storage as state tables, and put them on a different keyspace so compaction doesn't fight with the message firehose.
                </p>
              </Callout>

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

            {/* ── 10. TYPING & RECEIPTS ── */}
            <Section
              id="typing-receipts"
              number={10}
              eyebrow="Ephemeral signals"
              title="Typing indicators & read receipts — the lossy lane"
              intro="Not every signal deserves Kafka. Typing indicators expire in 3 seconds; if one drops no human notices. Treating them like messages would 4× your write load for zero durability gain."
            >
              <p>
                Chat carries two fundamentally different kinds of traffic on the same WebSocket:
              </p>
              <ul>
                <li><strong>Durable messages</strong> — must persist, must reach the recipient, must be ordered. Goes through Kafka → Cassandra.</li>
                <li><strong>Ephemeral signals</strong> — typing indicators, read receipts, presence pings. Lossy is fine. <strong>Skip Kafka entirely.</strong> Send via Redis pub/sub and accept that a dropped signal vanishes forever.</li>
              </ul>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-6 mb-3">Typing indicator flow</h3>
              <Code lang="Typing indicator path">
{`# User A starts typing:
client → WS → Chat Server A
  Chat Server A: lookup B's serverId from Connection Manager (5s cache)
  Chat Server A → Redis PUBLISH inbox:server:B
                  { type: "typing", chatId, userId, expires: now+5s }
  Chat Server B → SUBSCRIBE callback → push WS frame to User B
# Total: 1 Redis lookup + 1 pub/sub fanout. No Kafka. No Cassandra. ~2ms.

# Client throttling:
- Send "typing_start" once when first character entered
- Re-send every 3s while still typing (keep-alive)
- Send "typing_stop" on send or after 5s idle
- Server-side debounce: drop typing_start within 2s window per (chatId, userId)`}
              </Code>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Read receipts — durable, but lazy</h3>
              <p>
                Read receipts ("blue ticks") are different. They <em>are</em> durable (you don't want to keep showing "delivered" forever), but they don't need the message hot path. Two-stage write:
              </p>
              <ol>
                <li>Client sends a <Code inline>read_ack</Code> WS frame for the latest <Code inline>messageId</Code> read in a chat.</li>
                <li>Chat Server fans out via Redis pub/sub to the sender's server (live ✓✓ → 🔵✓✓ tick update).</li>
                <li>Chat Server enqueues a single batched UPDATE to <Code inline>read_state</Code> — one row per <Code inline>(userId, chatId)</Code> with <Code inline>last_read_message_id</Code> — debounced server-side at 1s.</li>
              </ol>
              <p>
                The trick: store one row per chat, not one per message. Reading 50 messages in a row updates a single row 50 times (or once if debounced) — not 50 inserts. This is the difference between scaling to 50M users and DDOSing your own database.
              </p>

              <Callout variant="insight" title="Typing indicators are the canary for your design">
                <p className="m-0">
                  In an interview, if a candidate routes typing indicators through Kafka + Cassandra, they're flunking the lossy/durable distinction. Push back: <em>"What happens at 2M msgs/sec when each typing event is also a message?"</em> The candidate either reaches for Redis pub/sub or doubles the infra. Typing is a great forcing function for separating the two lanes.
                </p>
              </Callout>
            </Section>

            {/* ── 11. OFFLINE DELIVERY ── */}
            <Section
              id="offline"
              number={11}
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

            {/* ── 12. MEDIA PIPELINE ── */}
            <Section
              id="media"
              number={12}
              eyebrow="Out-of-band path"
              title="Media pipeline — keep blobs out of the message bus"
              intro="Photos and videos can be 50MB. Pushing them through Kafka and Cassandra would shred the message pipeline. The right answer is upload-then-reference."
            >
              <p>
                The message pipeline is sized for ~500-byte messages. A 50MB video is 100,000× larger. Two design rules:
              </p>
              <ol>
                <li><strong>Media never travels through Kafka or Cassandra.</strong> Only the <em>reference</em> (URL + content hash + dimensions + thumbnail) does.</li>
                <li><strong>Clients upload directly to object storage</strong> via presigned URLs. Chat servers don't proxy bytes.</li>
              </ol>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-6 mb-3">Upload flow (sender)</h3>
              <Code lang="Media upload path">
{`1. Client → Chat Server: POST /media/upload { sha256, size, mime, chatId }
2. Chat Server → S3: GeneratePresignedURL(PUT, key=media/{uuid}, expires=15min)
3. Chat Server → Client: { uploadUrl, mediaId, getUrl }
4. Client → S3 directly via multipart upload
   - encrypted client-side first (E2E session key derived per chat)
   - S3 only ever stores ciphertext
5. Client → Chat Server: WS msg { type: "media", mediaId, thumbnail }
   - thumbnail is a 5KB blurred placeholder, embedded in the message itself
6. Recipient receives the message, downloads from CDN URL on demand`}
              </Code>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Why presigned URLs, not "upload through chat server"</h3>
              <ul>
                <li><strong>Bandwidth.</strong> A chat server holds 80K WS connections — proxying even 1% of users uploading a 5MB photo simultaneously is 4GB/s through one box. Presigned URLs offload to S3, which is built for this.</li>
                <li><strong>Resumable uploads.</strong> S3 multipart upload survives network drops. Reimplementing on chat servers is busywork.</li>
                <li><strong>Cost.</strong> S3 → CloudFront egress to recipients is cheaper than chat-server egress, and CDN caching dedupes the same blob to multiple recipients.</li>
              </ul>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Storage tiers & lifecycle</h3>
              <div className="bg-white dark:bg-night-200 border border-ink-200 dark:border-night-400 rounded-xl overflow-hidden my-4 not-prose">
                <table className="w-full text-sm">
                  <thead className="bg-cream-100 dark:bg-night-300 text-left text-xs text-ink-500 dark:text-night-600 uppercase tracking-wider border-b border-ink-200 dark:border-night-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Age</th>
                      <th className="px-4 py-3 font-medium">Tier</th>
                      <th className="px-4 py-3 font-medium">Latency</th>
                      <th className="px-4 py-3 font-medium">$/GB·mo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100 dark:divide-night-400">
                    {[
                      ['0–7 days',   'CDN edge cache + S3 Standard', '~30ms',  '~$0.023'],
                      ['7–90 days',  'S3 Standard',                  '~150ms', '~$0.023'],
                      ['90+ days',   'S3 Standard-IA',               '~200ms', '~$0.0125'],
                      ['1 year+',    'S3 Glacier Instant Retrieval', '~300ms', '~$0.004'],
                    ].map(([age, tier, lat, cost]) => (
                      <tr key={age} className="dark:bg-night-200">
                        <td className="px-4 py-3 font-medium text-ink-900 dark:text-night-900">{age}</td>
                        <td className="px-4 py-3 text-ink-700 dark:text-night-700">{tier}</td>
                        <td className="px-4 py-3 font-mono text-xs text-ink-700 dark:text-night-800">{lat}</td>
                        <td className="px-4 py-3 font-mono text-xs text-ink-700 dark:text-night-800">{cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Callout variant="insight" title="Content-addressed storage = free deduplication">
                <p className="m-0">
                  Key media objects by SHA-256 of their plaintext (or, with E2E, by a hash of the encrypted blob plus a per-chat key). The forwarded-meme problem solves itself: a viral image sent to 10M chats stores once. Reference counts on the metadata row track when the underlying blob can be garbage-collected. WhatsApp's "forwarded many times" label is partly UX, partly a side-effect of this dedup-tracking infrastructure.
                </p>
              </Callout>
            </Section>

            {/* ── 13. E2E ENCRYPTION ── */}
            <Section
              id="e2e"
              number={13}
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

              <p className="mt-8 text-sm text-ink-500 dark:text-night-700 italic">
                E2E gets harder when one user has multiple devices — every message must be independently encryptable for each. That problem deserves its own section: see <a href="#multi-device" className="text-blue-600 dark:text-blue-300 not-italic font-medium">Multi-device sync</a>.
              </p>
            </Section>

            {/* ── 14. MULTI-DEVICE SYNC ── */}
            <Section
              id="multi-device"
              number={14}
              eyebrow="The N-device problem"
              title="Multi-device sync — one user, many endpoints"
              intro="An iPhone + iPad + MacBook + WhatsApp Web is four endpoints for one identity. Each must receive every message, send messages all four can decrypt, and stay in order — even if one is offline for a week."
            >
              <p>
                This is the part of chat that breaks the cleanest mental models. The 1:1 design assumes <Code inline>userId → serverId</Code>. With multi-device, it's really <Code inline>(userId, deviceId) → serverId</Code>, and a "user" is a fan-out group of size N.
              </p>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-6 mb-3">Device registry</h3>
              <p>
                A separate Cassandra table tracks every active device per user, plus its public key for E2E:
              </p>
              <Code lang="device_registry table">
{`CREATE TABLE device_registry (
  user_id        uuid,
  device_id      uuid,
  identity_key   blob,         -- public IK for Signal Protocol
  registration_id int,         -- monotonic, incremented on key rotation
  device_type    text,         -- 'ios' | 'android' | 'web' | 'desktop'
  last_seen      timestamp,
  removed_at     timestamp,    -- null = active
  PRIMARY KEY (user_id, device_id)
);

# "What are User B's active devices?"
SELECT device_id, identity_key, registration_id
FROM device_registry
WHERE user_id = ? AND removed_at IS NULL;`}
              </Code>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Send path with N devices</h3>
              <p>
                The sender's client now does the N-device fanout itself (the server can't, because of E2E). For each recipient device:
              </p>
              <ol>
                <li>Fetch the recipient's <strong>device list</strong> + per-device prekey bundle from the server.</li>
                <li>Run X3DH per device → produce N independently encrypted ciphertexts.</li>
                <li>Send N ciphertexts in a single WS frame keyed by <Code inline>deviceId</Code>.</li>
                <li>Message Service writes <strong>one row</strong> with the multi-blob payload, then routes to each <Code inline>(userId, deviceId)</Code> via Connection Manager.</li>
              </ol>
              <p>
                The sender's <em>own</em> other devices are also recipients — sending from your phone must appear on your laptop. This is the "self-fanout" leg: the phone encrypts the same plaintext separately for the laptop's identity key, and the message includes the sender's own deviceId list as recipients.
              </p>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Adding a new device mid-conversation</h3>
              <p>
                User adds a 4th device. Three problems appear immediately:
              </p>
              <ul>
                <li><strong>Backfill.</strong> The new device has no message history. Either fetch from server (works only if the server stored ciphertexts the new device can decrypt — usually it can't, by E2E design) or restore from a primary device (Signal/WhatsApp encrypted-backup pattern).</li>
                <li><strong>Re-keying.</strong> All active sessions must learn the new device's identity key. The next message any peer sends triggers a "device list changed" event, forcing session re-establishment.</li>
                <li><strong>Trust prompt.</strong> Other users see "Alice added a new device — verify?" — exposing the security-number check most users skip.</li>
              </ul>

              <Callout variant="warning" title="Multi-device is where chat designs leak the most">
                <p className="m-0">
                  "Just send to all devices" is the trap. It hides three real problems: (a) ordering across devices when one is offline; (b) read receipts — does it count as read when one device opens it? (c) ephemeral messages and disappearing-message timers — should they expire per-device or globally? Real systems make different choices: WhatsApp ties read state to "any device read it"; Signal expires per-device; Telegram has a "primary device" concept. There's no single correct answer; the answer must be a deliberate product choice.
                </p>
              </Callout>
            </Section>

            {/* ── 15. FAILURE MODES ── */}
            <Section
              id="failure"
              number={15}
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

            {/* ── 16. RATE LIMITING ── */}
            <Section
              id="rate-limit"
              number={16}
              eyebrow="Abuse defense"
              title="Rate limiting & abuse — the WebSocket layer is the front door"
              intro="One compromised account can produce 100K msgs/sec from a single laptop if you let it. Per-user, per-IP, and per-conversation limits at the WS layer are the only thing standing between you and a self-inflicted DDoS."
            >
              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-2 mb-3">Three orthogonal limits</h3>
              <div className="bg-white dark:bg-night-200 border border-ink-200 dark:border-night-400 rounded-xl overflow-hidden my-4 not-prose">
                <table className="w-full text-sm">
                  <thead className="bg-cream-100 dark:bg-night-300 text-left text-xs text-ink-500 dark:text-night-600 uppercase tracking-wider border-b border-ink-200 dark:border-night-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Scope</th>
                      <th className="px-4 py-3 font-medium">Typical limit</th>
                      <th className="px-4 py-3 font-medium">What it stops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100 dark:divide-night-400">
                    {[
                      ['Per user',           '20 msgs/sec, 1000/min', 'Compromised account spamming groups'],
                      ['Per IP',             '50 msgs/sec',           'Bot farm sharing one egress IP'],
                      ['Per (user, chat)',   '5 msgs/sec',            'Floods inside a single conversation'],
                      ['Per group write',    '100 msgs/sec/group',    'Pinned-channel write storms'],
                      ['Per device WS conn', '100 frames/sec',        'Malicious or buggy clients'],
                    ].map(([scope, limit, blocks]) => (
                      <tr key={scope} className="dark:bg-night-200">
                        <td className="px-4 py-3 font-medium text-ink-900 dark:text-night-900">{scope}</td>
                        <td className="px-4 py-3 font-mono text-xs text-ink-700 dark:text-night-800">{limit}</td>
                        <td className="px-4 py-3 text-ink-700 dark:text-night-700">{blocks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Token bucket on Redis</h3>
              <Code lang="Per-user token bucket (Redis Lua)">
{`-- 20 tokens/sec, burst capacity 40
-- Atomic Lua script — no race between check and decrement
local key      = KEYS[1]              -- "rl:user:{userId}"
local capacity = tonumber(ARGV[1])    -- 40
local rate     = tonumber(ARGV[2])    -- 20 (refill/sec)
local now      = tonumber(ARGV[3])

local tokens = tonumber(redis.call('HGET', key, 'tokens')) or capacity
local last   = tonumber(redis.call('HGET', key, 'last'))   or now
tokens = math.min(capacity, tokens + (now - last) * rate)

if tokens < 1 then return 0 end       -- reject
tokens = tokens - 1
redis.call('HMSET', key, 'tokens', tokens, 'last', now)
redis.call('EXPIRE', key, 60)
return 1                              -- accept`}
              </Code>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Where to enforce — the WebSocket frame, not the API gateway</h3>
              <p>
                A typical mistake: putting rate limits at the HTTP API gateway. WebSocket connections upgrade <em>once</em>, then every message frame bypasses the gateway entirely. The Chat Server must enforce per-frame, in-process, before publishing to Kafka. A single Redis Lua check is ~0.1ms — well within the latency budget.
              </p>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Abuse signals beyond rate</h3>
              <ul>
                <li><strong>New-account velocity.</strong> Account &lt; 24h old + 50 different recipients = almost always spam. Step up to CAPTCHA or shadow-block.</li>
                <li><strong>Forward-frequency tagging.</strong> WhatsApp's "forwarded many times" UI is rate-limit theater for users — but it's backed by the same content-hash counter that detects mass-forwarded misinformation.</li>
                <li><strong>Reported-spammer feedback loop.</strong> User reports flow into a moderation Kafka topic; an abuse model rescores accounts every minute and tightens their limits.</li>
              </ul>

              <Callout variant="warning" title="E2E forces metadata-only moderation">
                <p className="m-0">
                  You can't read content with E2E enabled. Spam classification has to work from metadata alone: account age, recipient diversity, send rate, network ASN, device fingerprint, recipient reports. The model is necessarily weaker than a content classifier — accept that and bias toward false negatives over false positives. Aggressive false-positive rate-limiting is how WhatsApp got into trouble in India during elections.
                </p>
              </Callout>
            </Section>

            {/* ── 17. MULTI-REGION ── */}
            <Section
              id="multi-region"
              number={17}
              eyebrow="Geo distribution"
              title="Multi-region — what stays local, what crosses oceans"
              intro="A 50M-user chat system with a single region works for a hackathon and nothing else. Multi-region forces hard choices: latency vs consistency for the Connection Manager, replication topology for messages, and a clear story for cross-region delivery."
            >
              <p>
                The single-region design is roughly right for one continent. Going global adds three problems and one easy win.
              </p>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-6 mb-3">Home-region pinning</h3>
              <p>
                Each user has a <strong>home region</strong> (registered or nearest by latency). All long-lived state — Connection Manager entry, Cassandra rows, presence — lives there. WebSocket connections from elsewhere in the world get routed back home via Anycast or GeoDNS at connect time.
              </p>
              <ul>
                <li><strong>Pro:</strong> One source of truth per user. No multi-region writes to coordinate. Cassandra stays inside one region's <Code inline>NetworkTopologyStrategy</Code> replica set.</li>
                <li><strong>Con:</strong> A user traveling Tokyo→London adds 200ms RTT to every message. Acceptable for chat (humans tolerate it); not acceptable for video calls (route those separately via WebRTC TURN servers in the local region).</li>
              </ul>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Cross-region delivery</h3>
              <p>
                Alice (home: us-east) messages Bob (home: ap-south). Single-region path no longer applies:
              </p>
              <ol>
                <li>Alice's Chat Server writes to <strong>us-east Kafka</strong> as usual (key=chatId, durable locally).</li>
                <li>A region-bridge consumer in us-east publishes to a <strong>cross-region topic</strong> (Kafka MirrorMaker 2 or Confluent Cluster Linking) replicating to ap-south.</li>
                <li>ap-south's Message Service reads, writes to ap-south Cassandra, then routes to Bob via ap-south's Connection Manager.</li>
              </ol>
              <p>
                Replication adds ~100–250ms cross-ocean. For 1:1 messages that's invisible. For typing indicators it isn't — so typing indicators <em>do not cross regions</em>. Each region drops them at the edge.
              </p>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Connection Manager — local-only</h3>
              <p>
                The Connection Manager is <strong>per-region</strong>, never replicated globally. The router asks "does the local region have a WS for Bob?" If no, it forwards via the cross-region topic. Trying to keep a global Connection Manager consistent at WebSocket connect/disconnect rates (50M × multi-toggle/day = billions of ops/day, multi-region quorum on each = nope) is impossible.
              </p>

              <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Cassandra: local writes, async global replication</h3>
              <p>
                Each region has its own keyspace replicated within the region (<Code inline>{'NetworkTopologyStrategy {us-east: 3}'}</Code>). For cross-region history (Bob switches devices and lands in ap-south for the first time), the same MirrorMaker pipeline back-fills ap-south's Cassandra. The recipient device sees a small "loading older messages" delay.
              </p>

              <Callout variant="insight" title="The easy win: PoP-terminated WebSockets">
                <p className="m-0">
                  Even before adding multiple home regions, terminate WebSockets at the nearest CloudFront/Cloudflare PoP and tunnel back to the chat-server region over a warm pre-established connection. Saves the TLS handshake's 4 RTTs for international users (~300ms → ~30ms first byte). This is what pushed WhatsApp's perceived latency from "fine" to "feels local" in Asia and Africa. Single-region behind a global PoP layer is the right second step before going truly multi-region.
                </p>
              </Callout>
            </Section>

            {/* ── 18. 10× SCALE ── */}
            <Section
              id="scale-10x"
              number={18}
              eyebrow="The follow-up question"
              title="What changes at 500M concurrent users?"
              intro={'"OK, now make it 10× bigger." This is the most common follow-up. Most parts of the design hold up; a handful break in surprising ways.'}
            >
              <div className="bg-white dark:bg-night-200 border border-ink-200 dark:border-night-400 rounded-xl overflow-hidden my-4 not-prose">
                <table className="w-full text-sm">
                  <thead className="bg-cream-100 dark:bg-night-300 text-left text-xs text-ink-500 dark:text-night-600 uppercase tracking-wider border-b border-ink-200 dark:border-night-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Component</th>
                      <th className="px-4 py-3 font-medium">At 50M</th>
                      <th className="px-4 py-3 font-medium">At 500M — what breaks</th>
                      <th className="px-4 py-3 font-medium">Fix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100 dark:divide-night-400 text-xs">
                    {[
                      ['Chat Servers',       '625 boxes',                 'Linear → 6,250 boxes. Manageable.',                            'Keep going. Hot/warm pool by region.'],
                      ['Connection Manager', 'Single Redis Cluster, 3×3', '25GB hot. Single Redis cluster strained, cross-shard latency.','Shard by userId hash; one cluster per region; second tier of regional Redis proxies.'],
                      ['Kafka',              '64 partitions',             'Partition count too low; head-of-line blocking on hot chats.', 'Partitions × 10 → 640. Tune num.replica.fetchers; tiered storage.'],
                      ['Cassandra writes',   '12 nodes',                  'Write amplification at 20M msgs/sec saturates compaction I/O.','Migrate to ScyllaDB (shard-per-core), or split keyspace by region.'],
                      ['Push (APNS/FCM)',    'Direct integration',        'Per-app token rate limits hit; APNS chokes during peak events.','Aggregator/batcher tier (one connection per million tokens) + provider-side fanout with collapsing.'],
                      ['Cross-region',       'us-east + ap-south',        'Two regions cover ~60% of traffic, rest sees 200ms+ RTT.',     '8+ regions; Anycast CM routing; per-region warm caches at PoP.'],
                    ].map(([comp, atSmall, breaks, fix]) => (
                      <tr key={comp} className="dark:bg-night-200">
                        <td className="px-4 py-3 font-medium text-ink-900 dark:text-night-900">{comp}</td>
                        <td className="px-4 py-3 font-mono text-xs text-ink-700 dark:text-night-800">{atSmall}</td>
                        <td className="px-4 py-3 text-ink-700 dark:text-night-700">{breaks}</td>
                        <td className="px-4 py-3 text-ink-700 dark:text-night-700">{fix}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Callout variant="interview" title="The question behind the question">
                <p className="m-0">
                  <em>"What changes at 10×?"</em> isn't really about 10×. The interviewer wants to see whether you know which components scale linearly (chat servers, message-service consumers, push workers) and which hit non-linear walls (compaction I/O, cross-shard transactions, push-provider rate caps). Answer the linear ones in one sentence each and spend the time on the non-linear ones — Cassandra compaction, cross-region replication, push aggregation. Those are the parts that require <em>different</em> systems, not just more boxes.
                </p>
              </Callout>
            </Section>

            {/* ── 19. TRADEOFFS ── */}
            <Section
              id="tradeoffs"
              number={19}
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
                  <div className="text-xs font-semibold text-rust-700 uppercase tracking-wider mb-3">Still under-explored</div>
                  <ul className="space-y-2 text-sm text-ink-800">
                    <li>⚠ <strong>Message search</strong> — full-text search over E2E ciphertext is fundamentally hard; needs client-side index synced across devices.</li>
                    <li>⚠ <strong>Voice / video calls</strong> — separate WebRTC pipeline (signaling on chat infra, media via TURN). Not covered here.</li>
                    <li>⚠ <strong>Disappearing messages & retention</strong> — TTL on messages, per-chat policy, GDPR right-to-erasure interplay with E2E backups.</li>
                    <li>⚠ <strong>Story / status / reactions</strong> — short-lived broadcast surface, separate read model from messaging.</li>
                    <li>⚠ <strong>Bot / business APIs</strong> — different rate limits, different consent UX, different metadata exposure.</li>
                  </ul>
                  <div className="text-[11px] text-ink-500 mt-3 italic">
                    Multi-device, multi-region, media, rate limiting, and abuse moderation each have their own section above.
                  </div>
                </div>
              </div>

              <Callout variant="interview" title="How to deliver tradeoffs in an interview">
                <p className="m-0">
                  <em>"The core architecture is solid for the 1:1 and small group case. The main production gaps are multi-device sync (client-side complexity), content moderation with E2E encryption (fundamentally hard), and multi-region (requires carefully thinking about consistency vs latency tradeoffs for Connection Manager)."</em>
                </p>
              </Callout>
            </Section>

            {/* ── 20. DEPLOYMENT ── */}
            <Section
              id="deployment"
              number={20}
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

              <Callout variant="warning" title="Graceful shutdown — the deploy gotcha NLB hides from you">
                <p className="m-0">
                  An L4 NLB doesn't speak HTTP, so there's no <Code inline>Connection: close</Code> primitive — you can't ask clients to drain. When you deploy a new chat-server version, naïvely terminating a host kicks 80K clients into reconnect (WS code 1006 ≈ "abnormal close"). The fix is app-level: send a custom <Code inline>{'{"type":"server_going_away","reconnect_in":3000}'}</Code> WS frame before the process exits, with a randomized 0–30s delay so all 80K don't reconnect in the same second. Then deregister from the NLB target group, wait for the drain timeout, and exit. WhatsApp and Slack both do this; without it, every deploy looks like a partial outage.
                </p>
              </Callout>
            </Section>

    </DeepDiveLayout>
  );
}
