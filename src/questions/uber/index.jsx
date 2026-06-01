import Section from '../../components/ui/Section';
import Callout from '../../components/ui/Callout';
import Code from '../../components/ui/Code';
import Stat from '../../components/ui/Stat';
import DeepDiveLayout from '../../components/DeepDiveLayout';
import ArchitectureDiagram from './diagrams/ArchitectureDiagram';
import H3Honeycomb from './diagrams/H3Honeycomb';
import DispatchTable from './diagrams/DispatchTable';
import TripStateMachine from './diagrams/TripStateMachine';

const SECTIONS = [
  { id: 'clarify',       label: 'Clarify' },
  { id: 'requirements',  label: 'Requirements' },
  { id: 'capacity',      label: 'Capacity' },
  { id: 'api',           label: 'API' },
  { id: 'architecture',  label: 'Architecture' },
  { id: 'h3',            label: 'H3 geospatial' },
  { id: 'dispatch',      label: 'Dispatch' },
  { id: 'eta',           label: 'ETA' },
  { id: 'surge',         label: 'Surge pricing' },
  { id: 'state-machine', label: 'Trip FSM' },
  { id: 'bottlenecks',   label: 'Bottlenecks' },
  { id: 'tradeoffs',     label: 'Tradeoffs' },
];

export default function Uber() {
  return (
    <DeepDiveLayout
      documentTitle="Design Uber / Ride-Sharing — System Design Bible"
      theme="rust"
      sections={SECTIONS}
      header={{
        difficulty: 'Hard',
        frequency: 'Very High',
        companies: 'Uber · Lyft · DoorDash · Grab · Amazon',
        title: 'Design Uber / Ride-Sharing',
        subtitle: 'Geospatial · real-time matching · surge',
      }}
      next={{ to: '/q/youtube', label: 'Q4 — YouTube' }}
      prev={{ to: '/q/news-feed', label: 'Q3 — News Feed' }}
    >

      {/* === 1. CLARIFY === */}
      <Section
        id="clarify"
        number={1}
        eyebrow="Start here"
        title="Clarifying questions"
        intro="Always frame the problem before drawing anything. These four questions narrow scope from “Design Uber” to something you can finish in 45 minutes."
      >
        <ul>
          <li><strong>Scope:</strong> Ride-hailing only (UberX) or full Uber (Eats, Freight)? → Ride-hailing.</li>
          <li><strong>Geo:</strong> Single city or global? → Global, multi-region active-active.</li>
          <li><strong>Trip types:</strong> Real-time only, or also scheduled / Pool? → Real-time + scheduled.</li>
          <li><strong>Maps / routing:</strong> Use a black-box provider or build? → <em>Build</em> (it’s the meat of the problem).</li>
          <li><strong>Payments:</strong> Assume a working PSP (Stripe). Out of scope detail.</li>
        </ul>
      </Section>

      {/* === 2. REQUIREMENTS === */}
      <Section
        id="requirements"
        number={2}
        eyebrow="The product"
        title="Functional & non-functional requirements"
        intro="Pin down what we’re building and the SLAs that drive every technology choice."
      >
        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-2 mb-3">Functional</h3>
        <ul>
          <li>Rider requests a ride A → B; sees ETA + fare estimate up-front.</li>
          <li>Nearby drivers receive offers; one accepts; both see each other’s live location.</li>
          <li>Trip progresses through a strict state machine; auto-fare on completion.</li>
          <li>Surge pricing applies when demand exceeds supply in a zone.</li>
          <li>Cancellation, ratings, receipts, ride history.</li>
        </ul>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Non-functional</h3>
        <ul>
          <li><strong>Time-to-match p95 &lt; 5s</strong> in any active market.</li>
          <li><strong>99.99% availability</strong> per region (active-active across 3 AZs).</li>
          <li><strong>Strong consistency on trip state</strong> — a driver cannot be dispatched twice.</li>
          <li>Sub-second freshness on driver locations during a trip.</li>
        </ul>
      </Section>

      {/* === 3. CAPACITY === */}
      <Section
        id="capacity"
        number={3}
        eyebrow="Back of the envelope"
        title="Capacity estimation"
        intro="Numbers shape every later choice. Do them on the whiteboard before drawing boxes."
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-6 not-prose">
          <Stat value="100M" label="Monthly riders" accent />
          <Stat value="5M" label="Active drivers" sub="globally, peak" />
          <Stat value="25M" label="Trips / day" sub="≈ 290 / sec avg" accent />
          <Stat value="1.25M" label="Loc updates / sec" sub="5M × 1 ping / 4s" />
          <Stat value="125 MB/s" label="Ingest bandwidth" sub="~100B / ping" />
          <Stat value="~45 TB/yr" label="Trip cold storage" sub="S3 + Parquet" />
        </div>

        <Callout variant="insight" title="Why these specific numbers matter">
          <p className="m-0">
            The 1.25M loc updates/sec is the number that breaks naive architectures. A single Postgres instance maxes
            around 20K writes/sec — off by <strong>two orders of magnitude</strong>. That’s why you need a geospatial
            cache (Redis) in the hot path, not your trip DB. The 25M trips/day is comfortable for sharded Postgres;
            don’t over-engineer there.
          </p>
        </Callout>
      </Section>

      {/* === 4. API === */}
      <Section
        id="api"
        number={4}
        eyebrow="The contract"
        title="API design"
        intro="Idempotency on the request endpoint is non-negotiable. Networks fail; retries must not double-charge."
      >
        <Code lang="HTTP / WebSocket">
{`# Rider
POST /v1/rides                  # body: {origin, dest, product}; Header: Idempotency-Key
GET  /v1/rides/{id}
POST /v1/rides/{id}/cancel
WS   /v1/rides/{id}/track       # server pushes driver loc + ETA

# Driver
POST /v1/drivers/status         # {online | offline}
WS   /v1/drivers/location       # client → server, 4s cadence
POST /v1/offers/{id}/respond    # {accept | decline}, deadline 10s`}
        </Code>

        <Callout variant="warning" title="Idempotency in one line">
          <p className="m-0">
            Client generates a UUID per <Code inline>POST /rides</Code>. Server stores
            <Code inline>idempotency_key → ride_id</Code> in Redis with a 24h TTL. Retries return the same
            <Code inline>ride_id</Code> — no double-charge on flaky networks. Same trick works for driver offers
            (<Code inline>offer_id</Code>) to survive WebSocket reconnects.
          </p>
        </Callout>
      </Section>

      {/* === 5. ARCHITECTURE === */}
      <Section
        id="architecture"
        number={5}
        eyebrow="The picture"
        title="High-level architecture"
        intro="Three concurrent flows: driver telemetry (write-heavy), rider request (latency-critical), and trip completion (transactional)."
      >
        <ArchitectureDiagram />

        <p>
          The <strong>tracking lane</strong> is firehose-style: drivers hold a sticky WebSocket to a regional
          Loc Gateway; positions stream into Redis with an H3 cell index. The <strong>request lane</strong> is
          latency-critical: API → Ride Service → Dispatcher (does a 1-ring H3 scan) → Trip FSM. The
          <strong> completion lane</strong> is transactional: Trip FSM emits exactly one
          <Code inline>TRIP_COMPLETED</Code> event, Payment and Notification are idempotent consumers.
        </p>

        <Callout variant="insight" title="Why the lanes don’t share infrastructure">
          Tracking is write-heavy and tolerates ~second-level staleness. Requests need millisecond reads of
          the geo index but rarely write to it. Completion needs strong consistency. Putting all three on the
          same database means whichever load pattern is loudest steals capacity from the others. Separate
          stores per lane lets each scale on its own dimension.
        </Callout>
      </Section>

      {/* === 6. H3 === */}
      <Section
        id="h3"
        number={6}
        eyebrow="The dispatch hot path"
        title="H3 hexagons — why Uber didn’t use Geohash or QuadTree"
        intro={`The dispatch hot path is "find me K drivers near point P in < 50ms," executed thousands of times per second. The data structure choice here determines whether your dispatcher is 5ms or 500ms.`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 not-prose">
          <div className="bg-rust-50 dark:bg-[#1F0E07] border border-rust-200 dark:border-[#3D2012] rounded-lg p-5">
            <div className="text-xs font-mono uppercase tracking-wider text-rust-700 dark:text-[#E8855A] mb-2">❌ Geohash (Z-order)</div>
            <ul className="text-sm text-ink-800 dark:text-night-800 space-y-1.5 ml-4 list-disc">
              <li>Rectangular cells, distortion near poles</li>
              <li>Two points in adjacent cells can be far apart at cell edges</li>
              <li>Neighbor lookup = 8 cells, asymmetric distances</li>
            </ul>
          </div>
          <div className="bg-teal-50 dark:bg-[#071A12] border border-teal-200 dark:border-teal-900/50 rounded-lg p-5">
            <div className="text-xs font-mono uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-2">✅ H3 (Uber, open-sourced 2018)</div>
            <ul className="text-sm text-ink-800 dark:text-night-800 space-y-1.5 ml-4 list-disc">
              <li>Hexagons → <strong>uniform distance</strong> to all 6 neighbors</li>
              <li>16 resolutions; level 9 ≈ 0.1 km²</li>
              <li>1-ring lookup = always 7 cells, predictable</li>
            </ul>
          </div>
        </div>

        <H3Honeycomb />

        <p>
          The rider (purple) lands in the center cell. Dispatcher queries the center plus its 1-ring — exactly
          7 H3 cells — and unions the driver sets. Drivers (orange) drift between cells as GPS pings update
          their cell ID. The red cell is a <strong>hot zone</strong> (airport, stadium) that requires
          sub-sharding so a single Redis key doesn’t become a bottleneck.
        </p>

        <Callout variant="insight" title="Hot-cell sub-sharding">
          <p className="m-0">
            A naive index uses <Code inline>cell_id → SET&lt;driver_id&gt;</Code>. At SFO airport that single Redis key
            holds 10k drivers; every dispatch hits the same hot slot. Fix: sub-shard with
            <Code inline>{`cell_id + bucket(driver_id, 16) → SET<driver_id>`}</Code>. The dispatcher fans out
            16 small reads in parallel and merges. Throughput recovers; the hot key disappears.
          </p>
        </Callout>
      </Section>

      {/* === 7. DISPATCH === */}
      <Section
        id="dispatch"
        number={7}
        eyebrow="The marketplace engine"
        title="Matching algorithm — batched, not greedy"
        intro={`A naive "send the offer to the nearest driver" is greedy and wastes supply. Uber runs batched assignment every 1–5 seconds per region.`}
      >
        <p>The loop, per region per batch window:</p>
        <ol className="ml-6 list-decimal space-y-1 marker:text-ink-400">
          <li>Collect open ride requests received in the last window.</li>
          <li>For each request, query the 1-ring of H3 cells → candidate drivers.</li>
          <li>Score every (request, driver) pair with a learned model.</li>
          <li>Solve the resulting bipartite assignment (Hungarian / approximate min-cost flow).</li>
          <li>Send offers; if declined or ignored within 10s, re-queue for the next batch.</li>
        </ol>

        <DispatchTable />

        <Callout variant="interview" title="The interviewer is fishing for this">
          <p className="m-0">
            <em>“Greedy gives you a local optimum — you might send a closer rider’s request to a driver who
            would’ve been a better match for someone two seconds away. Batching adds 1–5 seconds of latency
            but raises global utility ~15% by solving the assignment problem instead of attacking pairs in
            isolation. Uber publicly attributes much of their efficiency gain to batched matching plus
            fairness terms in the score.”</em>
          </p>
        </Callout>
      </Section>

      {/* === 8. ETA === */}
      <Section
        id="eta"
        number={8}
        eyebrow="Routing"
        title="ETA & shortest path"
        intro="The road network is a weighted directed graph. The interesting part isn’t Dijkstra — it’s how you make Dijkstra fast enough at country scale."
      >
        <ul>
          <li><strong>Dijkstra / A*</strong>: works for a city but is too slow nationwide (millions of nodes).</li>
          <li>
            <strong>Contraction Hierarchies (CH)</strong>: pre-process the graph, add “shortcut” edges that
            skip whole sub-paths. A query that was O(V log V) becomes a handful of memory probes —
            <strong> &lt; 1 ms even cross-country</strong>.
          </li>
          <li>
            <strong>Live traffic</strong>: every active driver’s GPS pings stream through Kafka → Flink →
            rolling p50 travel-time per road edge → updates CH weights.
          </li>
          <li>
            <strong>ML residuals on top</strong>: a gradient-boosted model corrects for time-of-day, weather,
            events, historical patterns the raw graph can’t capture.
          </li>
        </ul>

        <Callout variant="warning" title="Don’t over-promise live re-routing">
          <p className="m-0">
            CH speeds up queries but breaks when edge weights change frequently. Production systems re-build
            CH layers in the background every few minutes and serve queries against the most recent stable
            build. Live traffic adjusts a smaller dynamic overlay rather than the full hierarchy.
          </p>
        </Callout>
      </Section>

      {/* === 9. SURGE === */}
      <Section
        id="surge"
        number={9}
        eyebrow="Marketplace dynamics"
        title="Surge pricing"
        intro="Per H3 cell, per minute, measure demand vs. supply. Raise the multiplier to balance the marketplace — but smooth aggressively so the price doesn’t flicker."
      >
        <Code lang="python (sketch)">
{`def surge(cell_id, t):
    d = open_requests(cell_id, t)            # demand in this minute
    s = available_drivers(cell_id, t)        # supply in this minute
    raw = max(1.0, (d / max(s, 1)) ** 0.5)   # square root keeps it gentle
    return ema(prev_surge[cell_id], raw, alpha=0.3)`}
        </Code>

        <p>
          The multiplier shown at request time is the multiplier <strong>charged</strong> — even if the surge
          changes mid-trip. This “quote-lock” avoids the rage-inducing scenario of a $9 ride turning into
          $24 at drop-off.
        </p>

        <Callout variant="insight" title="Why the square root?">
          <p className="m-0">
            Linear scaling (<Code inline>d / s</Code>) is too aggressive — a 5× demand spike becomes a 5× price spike,
            which trains users to expect price gouging. Square root dampens the response (5× demand → ~2.2×
            price) and gives the EMA room to smooth without lagging the actual market.
          </p>
        </Callout>
      </Section>

      {/* === 10. STATE MACHINE === */}
      <Section
        id="state-machine"
        number={10}
        eyebrow="Lifecycle"
        title="Trip state machine"
        intro="One trip = one strict finite state machine, persisted as an append-only event log. Each active trip pins to a single FSM worker (consistent hash on trip_id) to serialize transitions and avoid races."
      >
        <TripStateMachine />

        <Callout variant="insight" title="Why sticky workers per trip">
          <p className="m-0">
            Trip transitions are causally ordered: <Code inline>ARRIVED</Code> must precede <Code inline>IN_TRIP</Code>.
            If two FSM workers handled the same trip concurrently — one applies a driver-side
            <Code inline> ARRIVED</Code> event while the other applies a rider-side <Code inline>CANCELED</Code> — you
            could land in an impossible state. Consistent hashing routes every event for trip <em>T</em> to
            the same worker; that worker holds the FSM in memory and processes events serially. No locks
            needed inside the trip; cross-trip parallelism is preserved.
          </p>
        </Callout>
      </Section>

      {/* === 11. BOTTLENECKS === */}
      <Section
        id="bottlenecks"
        number={11}
        eyebrow="Where it breaks"
        title="Bottlenecks & mitigations"
        intro="The diagrams above are the happy path. Real systems break in specific places — and naming them is what separates a senior answer from a junior one."
      >
        <ul>
          <li>
            <strong>Hot H3 cells</strong> (SFO airport, stadium post-game): single Redis key holds 10k drivers.
            Sub-shard by <Code inline>cell_id + bucket(driver_id, 16)</Code>; dispatcher fans out and merges.
          </li>
          <li>
            <strong>Driver double-dispatch race</strong>: two riders matched to the same driver in concurrent
            batches. Optimistic CAS on <Code inline>driver.status</Code> in Redis; loser falls back to the second-best
            in their batch.
          </li>
          <li>
            <strong>Reconnect storm</strong> after a region blip: 500k drivers reconnect WebSocket simultaneously.
            Server-side jittered re-auth + token-bucket at the Loc Gateway.
          </li>
          <li>
            <strong>Cross-region trip</strong> (rider in CA, dest in NV): trip pinned to origin region; analytics
            replicate eventually via Kafka MirrorMaker.
          </li>
          <li>
            <strong>GPS drift in dense urban canyons</strong>: client-side Kalman filter; server-side snap-to-road.
          </li>
          <li>
            <strong>Dispatcher as SPoF</strong>: dispatcher is per-region and stateful. Leader election (etcd / ZK)
            + warm standby; in-flight offers idempotent on <Code inline>offer_id</Code>.
          </li>
        </ul>
      </Section>

      {/* === 12. TRADEOFFS === */}
      <Section
        id="tradeoffs"
        number={12}
        eyebrow="What gets asked next"
        title="Trade-offs & common follow-ups"
        intro="Senior loops always end here. Have an answer ready for each."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 not-prose">
          <div className="bg-cream-100 dark:bg-night-300 border border-ink-200 dark:border-night-400 rounded-lg p-5">
            <div className="text-xs font-mono uppercase tracking-wider text-rust-600 dark:text-[#D4724A] mb-2">Q: H3 vs S2 (Google)?</div>
            <ul className="text-sm text-ink-800 dark:text-night-800 space-y-1 ml-4 list-disc">
              <li>H3 hexagons → uniform neighbor distance, simpler dispatch math.</li>
              <li>S2 quad cells → cleaner hierarchical containment.</li>
              <li>Either works; Uber chose H3 for distance uniformity in scoring.</li>
            </ul>
          </div>
          <div className="bg-cream-100 dark:bg-night-300 border border-ink-200 dark:border-night-400 rounded-lg p-5">
            <div className="text-xs font-mono uppercase tracking-wider text-rust-600 dark:text-[#D4724A] mb-2">Q: Why batched, not greedy?</div>
            <ul className="text-sm text-ink-800 dark:text-night-800 space-y-1 ml-4 list-disc">
              <li>Greedy = local optimum; misses better global pairings.</li>
              <li>Batching adds 1–5s latency, raises global utility ~15%.</li>
            </ul>
          </div>
          <div className="bg-cream-100 dark:bg-night-300 border border-ink-200 dark:border-night-400 rounded-lg p-5">
            <div className="text-xs font-mono uppercase tracking-wider text-rust-600 dark:text-[#D4724A] mb-2">Q: WebSocket for everything?</div>
            <ul className="text-sm text-ink-800 dark:text-night-800 space-y-1 ml-4 list-disc">
              <li>Driver loc → yes, cheaper than HTTP at scale.</li>
              <li>Rider tracking → yes, but only during an active trip.</li>
              <li>Cold APIs (history, profile) → plain HTTPS.</li>
            </ul>
          </div>
          <div className="bg-cream-100 dark:bg-night-300 border border-ink-200 dark:border-night-400 rounded-lg p-5">
            <div className="text-xs font-mono uppercase tracking-wider text-rust-600 dark:text-[#D4724A] mb-2">Q: How prevent payment double-charge?</div>
            <ul className="text-sm text-ink-800 dark:text-night-800 space-y-1 ml-4 list-disc">
              <li>Idempotency key on the create-ride call.</li>
              <li>Trip FSM emits exactly one <Code inline>TRIP_COMPLETED</Code> event.</li>
              <li>Payment service is idempotent on <Code inline>trip_id</Code>.</li>
            </ul>
          </div>
        </div>

        <Callout variant="interview" title="How to close the answer">
          <p className="m-0">
            <em>“The architecture trades global consistency for regional active-active availability and a
            tight latency budget on dispatch. The interesting choices — H3 over geohash, batched
            assignment over greedy, sticky FSM workers, hot-cell sub-sharding — all fall out of two
            non-functional requirements: time-to-match under 5 seconds and no double-dispatch ever. Most
            of the rest is plumbing.”</em>
          </p>
        </Callout>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Reference reading</h3>
        <ul>
          <li><a href="https://www.uber.com/en-IN/blog/h3/" target="_blank" rel="noreferrer">Uber Engineering — H3: Uber’s Hexagonal Hierarchical Index</a></li>
          <li><a href="https://www.uber.com/blog/matchmaking-in-marketplaces/" target="_blank" rel="noreferrer">Uber Engineering — Matchmaking in Marketplaces (batched dispatch)</a></li>
          <li><a href="https://www.uber.com/blog/forecasting-introduction/" target="_blank" rel="noreferrer">Uber Engineering — Forecasting &amp; Surge Pricing</a></li>
          <li><a href="https://www.hellointerview.com/learn/system-design/problem-breakdowns/uber" target="_blank" rel="noreferrer">HelloInterview — Design Uber walkthrough</a></li>
          <li><a href="https://bytebytego.com/courses/system-design-interview/proximity-service" target="_blank" rel="noreferrer">ByteByteGo — Proximity Service (Alex Xu)</a></li>
        </ul>
      </Section>

    </DeepDiveLayout>
  );
}
