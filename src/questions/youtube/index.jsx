import Section from '../../components/ui/Section';
import Callout from '../../components/ui/Callout';
import Code from '../../components/ui/Code';
import Stat from '../../components/ui/Stat';
import DeepDiveLayout from '../../components/DeepDiveLayout';
import LifecycleDiagram from './diagrams/LifecycleDiagram';
import TranscodeDAGViz from './diagrams/TranscodeDAGViz';
import ABRSimulator from './diagrams/ABRSimulator';
import CDNHierarchyViz from './diagrams/CDNHierarchyViz';
import CodecLadderViz from './diagrams/CodecLadderViz';

const SECTIONS = [
  { id: 'requirements',     label: 'Requirements',           phase: 'Foundations' },
  { id: 'architecture',     label: 'Architecture',           phase: 'Foundations' },
  { id: 'upload-flow',      label: 'Upload flow',            phase: 'Upload' },
  { id: 'transcode-dag',    label: 'Transcode DAG',          phase: 'Upload' },
  { id: 'codecs',           label: 'Codec strategy',         phase: 'Upload' },
  { id: 'storage-tiers',    label: 'Storage tiers',          phase: 'Upload' },
  { id: 'dns-routing',      label: 'DNS & anycast',          phase: 'Watch' },
  { id: 'manifest',         label: 'Manifest & segments',    phase: 'Watch' },
  { id: 'abr',              label: 'ABR algorithm',          phase: 'Watch' },
  { id: 'cdn-hierarchy',    label: 'CDN hierarchy',          phase: 'Watch' },
  { id: 'player-buffer',    label: 'Player buffer',          phase: 'Watch' },
  { id: 'live-streaming',   label: 'Live streaming',         phase: 'Features' },
  { id: 'drm',              label: 'DRM & encryption',       phase: 'Features' },
  { id: 'captions',         label: 'Captions',               phase: 'Features' },
  { id: 'watch-history',    label: 'Watch history',          phase: 'Features' },
  { id: 'cost-economics',   label: 'Cost economics',         phase: 'Production' },
  { id: 'failure-modes',    label: 'Failure modes',          phase: 'Production' },
  { id: 'tradeoffs',        label: 'Tradeoffs',              phase: 'Production' },
  { id: 'deployment',       label: 'Deployment',             phase: 'Production' },
];

const PHASES = ['Foundations', 'Upload', 'Watch', 'Features', 'Production'];

export default function YouTube() {
  return (
    <DeepDiveLayout
      documentTitle="Design YouTube — System Design Bible"
      theme="blue"
      sections={SECTIONS}
      phases={PHASES}
      header={{
        difficulty: 'Hard',
        frequency: 'Very High',
        companies: 'Google · Netflix · Amazon · Meta',
        title: 'Design YouTube',
        subtitle: 'Video upload + global streaming at scale',
        tags: ['CDN', 'Transcoding', 'ABR', 'HTTP/3', 'Object Storage', 'DASH/HLS', 'DRM'],
      }}
      prev={{ to: '/q/news-feed', label: 'Q3 — News Feed' }}
    >
      {/* ── 1. REQUIREMENTS ── */}
      <Section
        id="requirements"
        number={1}
        eyebrow="Start here"
        title="Requirements & scale"
        intro="Video at YouTube scale is two systems glued together: a slow, expensive write side that runs once per video, and a frantic, latency-critical read side that runs billions of times a day."
      >
        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mb-3">Functional requirements</h3>
        <ul>
          <li><strong>Upload</strong> — creator uploads video file, gets a "processing" state, then "live" once transcoded.</li>
          <li><strong>Playback</strong> — viewer clicks play, gets video starting in &lt; 1s with quality matching their bandwidth.</li>
          <li><strong>Search & metadata</strong> — title, description, tags, recommendations.</li>
          <li><strong>Engagement</strong> — like, comment, subscribe, watch-history, resume position.</li>
          <li><strong>Live streaming</strong> — content goes live with seconds of glass-to-glass latency.</li>
          <li><strong>Captions</strong> — auto-generated and uploadable.</li>
        </ul>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Non-functional requirements</h3>
        <ul>
          <li><strong>Time-to-first-frame</strong> — &lt; 1 second from click to playback start.</li>
          <li><strong>Rebuffering rate</strong> — &lt; 0.5% of playback time stalled, even on flaky networks.</li>
          <li><strong>Availability</strong> — 99.99% for the watch path. Upload tolerates more downtime.</li>
          <li><strong>Global</strong> — same experience in Tokyo, Lagos, São Paulo, Mumbai.</li>
          <li><strong>Scale</strong> — 500 hours uploaded per minute · 1 billion hours watched per day · 2.5 billion users.</li>
        </ul>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6 not-prose">
          <Stat value="500hrs/min" label="Upload rate" sub="≈ 30K hrs/hr" accent />
          <Stat value="1B hrs/day" label="Watch volume" sub="globally" />
          <Stat value="3,100+"     label="CDN PoPs" sub="ISP-embedded" accent />
          <Stat value="< 1s"       label="Time to first frame" sub="cold play" />
        </div>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Storage back-of-envelope</h3>
        <p>
          A 10-min 1080p source ≈ 1 GB raw H.264. After transcoding into 6 qualities × 3 codecs (~5× the raw), that's ~5 GB stored per video. With 500 hrs/min ingest:
        </p>
        <ul>
          <li>500 hrs × 60min/hr = 30K min/hr = 1.8M min/day</li>
          <li>180K videos/day × 5 GB = <strong>900 TB/day</strong> new storage</li>
          <li>Yearly: ~330 PB net new — and it accumulates. Total YouTube storage estimated at hundreds of EB.</li>
        </ul>

        <Callout variant="insight" title="The interviewer's hidden question">
          They want to see four things: (1) you understand video is fundamentally a CDN problem, not a database problem; (2) you can describe transcoding as embarrassingly parallel via chunking; (3) you know ABR is what makes streaming feel local; (4) you can talk about CDN tier economics — because at this scale, edge hit rate <em>is</em> the business model. Hit those four cleanly and you're in the strong-hire bucket.
        </Callout>
      </Section>

      {/* ── 2. ARCHITECTURE ── */}
      <Section
        id="architecture"
        number={2}
        eyebrow="The big picture"
        title="End-to-end architecture"
        intro="One animation captures both halves: upload + transcode (write side, runs once), then DNS → manifest → ABR → CDN → buffer (read side, runs constantly)."
      >
        <LifecycleDiagram />

        <div className="space-y-3 not-prose mt-4">
          {[
            { n: '1. Upload API',      c: '#74b9ff', d: 'Stateless. Validates file, generates videoId, registers metadata, hands client a presigned URL for direct multipart upload to GCS.' },
            { n: '2. Pub/Sub',         c: '#fdcb6e', d: 'Decouples upload from transcode. Once raw video lands in GCS, an event fires. Transcoders pick up asynchronously — upload returns instantly.' },
            { n: '3. Transcode DAG',   c: '#a29bfe', d: 'Splitter cuts into 4s chunks. Worker pool encodes each chunk × quality × codec independently. Manifest assembler builds the MPD from chunk URLs. Embarrassingly parallel.' },
            { n: '4. GCS',             c: '#00b894', d: 'Source of truth for all encoded segments. Lifecycle policies move cold segments to cheaper storage tiers automatically.' },
            { n: '5. Google Media CDN', c: '#00cec9', d: 'Three tiers — edge (ISP-local) → regional PoP → origin. Per-segment caching, not per-video. Anycast routing on connect. HTTP/3 (QUIC) on the wire.' },
            { n: '6. Player + ABR',    c: '#74b9ff', d: 'Client downloads manifest, picks quality based on bandwidth + buffer + device, fetches segments at boundaries. Demux + decode + render run on device hardware.' },
            { n: '7. Metadata DB',     c: '#00b894', d: 'BigTable / Spanner. Video metadata, watch state, comments. Read-heavy with eventual consistency for engagement counters.' },
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

      {/* ── 3. UPLOAD FLOW ── */}
      <Section
        id="upload-flow"
        number={3}
        eyebrow="The write side"
        title="Upload flow — direct-to-storage with resumable multipart"
        intro="The upload server never sees video bytes. The client uploads directly to object storage via presigned URLs, while the API tracks state."
      >
        <Code lang="Upload sequence">
{`# 1. Client requests upload slot
POST /uploads { filename, sizeBytes, mime }
→ 200 {
    videoId: "v_8f3a...",
    uploadUrl: "https://storage.googleapis.com/...?X-Goog-Signature=...",
    parts: 24                 # multipart split
  }

# 2. Client uploads parts in parallel directly to GCS
PUT {uploadUrl}&partNumber=1   ← 64 MB chunk
PUT {uploadUrl}&partNumber=2   ← 64 MB chunk
... (parallel, resumable on failure)

# 3. Client tells our API the upload completed
POST /uploads/{videoId}/complete
→ Triggers Pub/Sub event "video.uploaded"

# 4. Transcoder picks up event, processes async
   (creator sees "processing" badge in UI)

# 5. When transcode finishes, status flips
POST internal /videos/{videoId}/ready
→ creator notified, video discoverable in search`}
        </Code>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-6 mb-3">Why direct-to-GCS via presigned URL</h3>
        <ul>
          <li><strong>Bandwidth.</strong> Upload servers don't proxy bytes. A 10 GB upload doesn't tie up an HTTP server for 30 minutes.</li>
          <li><strong>Resumable.</strong> Multipart upload survives WiFi drops. The client retries only the failed parts.</li>
          <li><strong>Cost.</strong> GCS multipart ingestion is much cheaper than running a fleet of upload-proxy servers.</li>
          <li><strong>Auth.</strong> Presigned URL bakes auth into the URL — expires in 15min, single-use, scoped to the videoId path.</li>
        </ul>

        <Callout variant="warning" title="Don't transcode on the upload thread">
          <p className="m-0">
            A common interview mistake: returning "uploaded" after the transcode finishes. Transcoding a 10-min 4K video takes 2–5 minutes even on a strong fleet. The client would time out, retry, and the system would melt. The decoupling via Pub/Sub turns upload into a 30-second operation regardless of video length, with transcoding running async behind a "processing" flag.
          </p>
        </Callout>
      </Section>

      {/* ── 4. TRANSCODE DAG ── */}
      <Section
        id="transcode-dag"
        number={4}
        eyebrow="Embarrassingly parallel"
        title="Transcode DAG — chunking + worker fan-out"
        intro="Watch worker count scale and wall-clock collapse. The whole reason transcoding is fast is that every chunk × quality × codec is independent."
      >
        <TranscodeDAGViz />

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-6 mb-3">Why 2–6 second chunks</h3>
        <ul>
          <li><strong>GOP boundary alignment.</strong> Each chunk must start with a keyframe (I-frame) so it can be decoded standalone. GOP length is typically 2–6s.</li>
          <li><strong>ABR switch granularity.</strong> Quality switches happen at chunk boundaries. Too long → laggy quality response. Too short → manifest bloat + per-request HTTP overhead.</li>
          <li><strong>Encode parallelism.</strong> 10-minute video / 4s chunks = 150 independent encode jobs per quality+codec pair = 150 × 18 = 2700 encode jobs. Linear scaling with worker count up to that ceiling.</li>
        </ul>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">DAG dependencies</h3>
        <Code lang="Pipeline DAG">
{`           ┌─→ H.264 encode chunk_i ┐
           ├─→ VP9 encode chunk_i   ├─→ chunk_i ready (per quality)
Split  ────┤                        │
chunks     └─→ AV1 encode chunk_i   ┘

Audio:    Source → Opus encode (single job, runs in parallel with video)
Thumbs:   Source → Frame extract every 1s → JPEG encode (parallel)

Once ALL chunks for ALL qualities AND audio AND thumbs are ready:
  → Assemble MPD manifest
  → Mark video "ready"
  → Send notification to creator`}
        </Code>

        <Callout variant="insight" title="The scheduling sweet spot — preemptible spot instances">
          <p className="m-0">
            Transcode workloads are bursty (a celebrity drops a long video) and tolerant of failure (re-encode the chunk on another worker). That makes them an ideal fit for spot/preemptible compute — typically 60–90% cheaper than reserved capacity. A worker getting yanked mid-encode loses ~30s of work; the chunk gets rescheduled. Most large video platforms run their entire transcode fleet on spot.
          </p>
        </Callout>
      </Section>

      {/* ── 5. CODECS ── */}
      <Section
        id="codecs"
        number={5}
        eyebrow="The codec ladder"
        title="Codec strategy — H.264, VP9, AV1"
        intro="Three codecs at three points on the bitrate / encode-cost / device-support tradeoff curve. Each pulls its weight."
      >
        <CodecLadderViz />

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-6 mb-3">When to encode AV1</h3>
        <p>
          AV1 encode is 12× more expensive than H.264 in compute. You don't AV1 every video. The rule of thumb:
        </p>
        <ul>
          <li><strong>Always</strong>: H.264 (universal fallback) and VP9 (default for modern clients).</li>
          <li><strong>Conditionally</strong>: AV1 for videos crossing some popularity threshold (~10K views) — the egress savings on ongoing playback pays back the one-time encode cost.</li>
          <li><strong>Live streams</strong>: H.264 only. AV1 encode latency is way too high for live.</li>
        </ul>

        <Callout variant="warning" title="Per-codec encoding ladder, not per-quality">
          <p className="m-0">
            A subtle point: each codec has its own bitrate ladder, not just "same bitrate, different codec." VP9 at 1080p targets 3.5 Mbps for the same visual quality H.264 takes 5 Mbps to hit. The encoder's rate-distortion model (often called the <em>BD-rate</em>) determines the right bitrate at each quality. Hardcoding the same Mbps for all codecs is a beginner mistake — at best wastes bytes, at worst gives users worse quality on better codecs.
          </p>
        </Callout>
      </Section>

      {/* ── 6. STORAGE TIERS ── */}
      <Section
        id="storage-tiers"
        number={6}
        eyebrow="Cost optimization"
        title="Storage tiers — hot, warm, cold, glacial"
        intro="Most videos die after a week of low views. Storage tiering ensures you don't pay hot-storage prices for a long-tail video that gets 12 views per year."
      >
        <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-6 not-prose">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 dark:bg-night-300 text-left text-xs text-ink-500 dark:text-night-600 uppercase tracking-wider border-b border-ink-200 dark:border-night-400">
              <tr>
                <th className="px-4 py-3 font-medium">Tier</th>
                <th className="px-4 py-3 font-medium">Trigger</th>
                <th className="px-4 py-3 font-medium">Latency</th>
                <th className="px-4 py-3 font-medium">$/GB·mo</th>
                <th className="px-4 py-3 font-medium">Use</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-night-400 text-xs">
              {[
                ['Edge cache (in CDN)', 'Most-watched 1%',           '~5ms',   '~$0.10*',   'Hot videos, popular segments'],
                ['Standard',           'Default for ~30 days',       '~50ms',  '$0.020',    'All freshly transcoded videos'],
                ['Standard-IA',        '> 30 days, active',          '~100ms', '$0.013',    'Older but still-viewed videos'],
                ['Coldline',           '> 90 days, low view rate',   '~200ms', '$0.004',    'Long-tail content'],
                ['Archive (Glacier)',  '> 1 year, near-zero views',  '~500ms', '$0.0012',   'Effectively dead, kept for completeness'],
              ].map(([tier, trigger, lat, cost, use]) => (
                <tr key={tier} className="dark:bg-night-200">
                  <td className="px-4 py-3 font-medium text-ink-900 dark:text-night-900">{tier}</td>
                  <td className="px-4 py-3 text-ink-700 dark:text-night-700">{trigger}</td>
                  <td className="px-4 py-3 font-mono text-ink-700 dark:text-night-800">{lat}</td>
                  <td className="px-4 py-3 font-mono text-ink-700 dark:text-night-800">{cost}</td>
                  <td className="px-4 py-3 text-ink-700 dark:text-night-700">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-[11px] text-ink-500 dark:text-night-600 italic">
          * Edge cache "cost" is incremental over Standard — you're paying for in-CDN cache hardware and warming.
        </div>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Lifecycle automation</h3>
        <Code lang="GCS lifecycle policy">
{`{
  "rule": [
    { "condition": { "age": 30,  "matchesStorageClass": ["STANDARD"] },
      "action":    { "type": "SetStorageClass", "storageClass": "NEARLINE" }},
    { "condition": { "age": 90,  "matchesStorageClass": ["NEARLINE"] },
      "action":    { "type": "SetStorageClass", "storageClass": "COLDLINE" }},
    { "condition": { "age": 365, "matchesStorageClass": ["COLDLINE"] },
      "action":    { "type": "SetStorageClass", "storageClass": "ARCHIVE" }},
    { "condition": { "age": 30, "numNewerVersions": 3 },
      "action":    { "type": "Delete" }}     # cleanup of dead encodings
  ]
}`}
        </Code>

        <Callout variant="insight" title="Promotion back to hot is automatic">
          <p className="m-0">
            A 5-year-old video that suddenly goes viral (e.g. picked up by an influencer) gets first-touch latency from cold storage on the very first view, then the segment populates the regional PoP, then the edge. By the second viewer, it's a hot video again. The system doesn't need explicit promotion; the cache hierarchy handles it organically.
          </p>
        </Callout>
      </Section>

      {/* ── 7. DNS & ANYCAST ── */}
      <Section
        id="dns-routing"
        number={7}
        eyebrow="Step 1 of watch path"
        title="DNS & anycast — picking the nearest edge"
        intro="Before a single byte of video moves, DNS routes the request to the right PoP. This is invisible but critical."
      >
        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mb-3">Two layers of routing</h3>
        <ol>
          <li><strong>GeoDNS / EDNS Client-Subnet</strong> — when a viewer's resolver asks Google DNS for <Code inline>r4.googlevideo.com</Code>, Google looks at the resolver's IP (or the client subnet hint), and returns the IP of the nearest CDN edge cluster. ~30 PoPs per region narrow down to one.</li>
          <li><strong>Anycast within the PoP</strong> — the IP returned is anycast: many physical machines share the same IP. BGP routing picks the one with the shortest network path. This balances load across edge servers without DNS having to know about specific machines.</li>
        </ol>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Why this matters</h3>
        <ul>
          <li>The nearest PoP can be in the user's <em>own ISP's data center</em> — Google ships custom hardware ("Google Global Cache" boxes) into ISPs. Latency to a GGC node is &lt; 5ms over local fiber instead of crossing the public internet.</li>
          <li>If a PoP fails, BGP withdraws its routes within ~10 seconds; clients re-resolve and hit the next-nearest PoP. Failover is automatic, no client code changes.</li>
          <li>Geo-routing isn't always perfect — a Sri Lankan user's resolver may be in Singapore, which would route them through Singapore even though Mumbai is closer. EDNS Client-Subnet is the standard fix.</li>
        </ul>
      </Section>

      {/* ── 8. MANIFEST ── */}
      <Section
        id="manifest"
        number={8}
        eyebrow="Step 2 of watch path"
        title="Manifest & segments — the menu of options"
        intro="A manifest is an XML / JSON file listing every quality, codec, and segment URL. The player downloads it once at the start, then makes per-segment decisions."
      >
        <Code lang="Simplified MPEG-DASH MPD">
{`<MPD type="static" mediaPresentationDuration="PT10M3S">
  <Period>
    <!-- Video adaptation set -->
    <AdaptationSet contentType="video" mimeType="video/mp4">
      <Representation id="v_1080p_vp9" codecs="vp09.00.41.08" bandwidth="3500000" width="1920" height="1080">
        <SegmentTemplate timescale="1000" duration="4000" media="v_1080p_vp9_$Number$.m4s" />
      </Representation>
      <Representation id="v_1080p_h264" codecs="avc1.640028" bandwidth="5000000" width="1920" height="1080" />
      <Representation id="v_720p_vp9" ... />
      <Representation id="v_720p_h264" ... />
      <!-- 6 qualities × 3 codecs = 18 video representations -->
    </AdaptationSet>

    <!-- Audio adaptation set -->
    <AdaptationSet contentType="audio" mimeType="audio/mp4">
      <Representation id="a_opus_128k" codecs="opus" bandwidth="128000" />
      <Representation id="a_aac_128k" codecs="mp4a.40.2" bandwidth="128000" />
    </AdaptationSet>
  </Period>
</MPD>`}
        </Code>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-6 mb-3">DASH vs HLS</h3>
        <ul>
          <li><strong>DASH (.mpd)</strong> — MPEG-DASH. Open standard, Google's preferred. XML manifest. Used by YouTube, Netflix.</li>
          <li><strong>HLS (.m3u8)</strong> — Apple's HTTP Live Streaming. Required for native Safari / iOS playback. Plain text manifest.</li>
          <li><strong>In practice</strong> — large platforms ship both. The CDN serves whichever the player asks for; the underlying segments are reused via CMAF (Common Media Application Format) — same fMP4 chunks, two manifests.</li>
        </ul>

        <Callout variant="insight" title="Why per-segment, not per-video">
          <p className="m-0">
            A 10-minute video at 18 representations × 150 segments = 2,700 segment files. The CDN treats each segment as an independent cacheable resource. This means a viewer who watches only the first 30s warms only those segments — the cache footprint matches the actual viewer behavior, not the worst case. Equally important: the CDN can independently expire individual segments, allowing chunk-level optimizations.
          </p>
        </Callout>
      </Section>

      {/* ── 9. ABR ── */}
      <Section
        id="abr"
        number={9}
        eyebrow="The quality decision"
        title="ABR algorithm — quality that matches the network"
        intro="Drag the bandwidth slider — watch the player adapt. ABR is what makes streaming feel local even on a flaky 4G link."
      >
        <ABRSimulator />

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-6 mb-3">What signals does ABR use?</h3>
        <ul>
          <li><strong>Throughput estimate</strong> — moving average of recent segment download times. The most basic input.</li>
          <li><strong>Buffer level</strong> — seconds of pre-loaded video. Low buffer → conservative; high buffer → ambitious.</li>
          <li><strong>Device capability</strong> — viewport size, hardware decode availability. No point sending 4K to a 720p screen.</li>
          <li><strong>Battery level (mobile)</strong> — battery-saver clamps quality to extend playback time.</li>
          <li><strong>Historical patterns (ML)</strong> — YouTube's ABR uses an ML model trained on billions of sessions to predict which quality minimizes rebuffer + maximizes engagement.</li>
        </ul>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">The hysteresis tradeoff</h3>
        <p>
          Switching quality every chunk feels jarring. A naive "always pick best for current bandwidth" thrashes between qualities every 4 seconds in unstable networks. Real ABR adds:
        </p>
        <ul>
          <li><strong>Asymmetric thresholds</strong> — downgrade fast (buffer dipping), upgrade slow (buffer healthy + sustained headroom).</li>
          <li><strong>Buffer-occupancy-based switches</strong> — BOLA, MPC and similar algorithms trade off bitrate vs buffer depth as a constrained optimization rather than a heuristic.</li>
          <li><strong>Switch-cost penalty</strong> — viewers prefer steady 720p over oscillating 1080p ↔ 480p.</li>
        </ul>

        <Callout variant="warning" title="The opening startup is special">
          <p className="m-0">
            On a cold start, you have zero throughput history. Picking 4K immediately would stall — but picking 144p makes the first 2 seconds look terrible. Real systems start at a conservative middle quality (480p), measure the first few segment downloads, then ramp up aggressively if bandwidth is good. The startup phase typically lasts 5–10 seconds before the steady-state algorithm takes over.
          </p>
        </Callout>
      </Section>

      {/* ── 10. CDN HIERARCHY ── */}
      <Section
        id="cdn-hierarchy"
        number={10}
        eyebrow="Where the bytes live"
        title="CDN hierarchy — edge, regional, origin"
        intro="The cache hierarchy is the financial backbone of YouTube. A 1% improvement in edge hit rate is worth millions of dollars annually."
      >
        <CDNHierarchyViz />

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-6 mb-3">What gets pre-warmed where</h3>
        <ul>
          <li><strong>Edge tier</strong> — top ~5% of videos in that region. Pre-pushed nightly based on prediction. The first few segments of trending videos always warmed.</li>
          <li><strong>Regional tier</strong> — top ~25% of videos. Acts as the catch-all when edge misses, populated organically by edge-cache fills.</li>
          <li><strong>Origin</strong> — every segment that exists. Cold reads happen here, ~80% of long-tail content lives only here.</li>
        </ul>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Cache key matters</h3>
        <Code lang="Cache key construction">
{`# Per-segment, fully qualified
cache_key = f"v={video_id}|q={quality}|c={codec}|seg={segment_index}|drm={drm_session_token_class}"

# DRM-protected content gets its own key per session class
# (so a free user's cached segment isn't served to a paying user
#  whose stream is encrypted with a different key)`}
        </Code>

        <Callout variant="insight" title="Cache hit rate vs CDN egress cost">
          <p className="m-0">
            At YouTube scale, ~98% of segment requests hit the edge. The 2% miss rate sounds small, but at billions of requests/day that's still tens of petabytes flowing from regional → edge fills. CDN providers price this carefully: edge serving is included; regional fills cost something; origin fills cost a lot. Designers obsess over hit rate because each percentage point lost costs real money.
          </p>
        </Callout>
      </Section>

      {/* ── 11. PLAYER BUFFER ── */}
      <Section
        id="player-buffer"
        number={11}
        eyebrow="The client side"
        title="Player buffer — demux, decode, render"
        intro="What does 10-20 seconds of pre-loaded video actually look like inside the browser? Understanding this changes how you think about the whole pipeline."
      >
        <Code lang="Player pipeline">
{`Network          ↓  HTTP/3 segment download
                     (parallel, ~4s of video per request)
SourceBuffer     ↓  MediaSource API: append fMP4 segment
                     into the browser's per-codec buffer
Demux            ↓  Separate video frames + audio frames
                     by track ID
Decode (HW)      ↓  GPU video decoder (VP9/AV1/H.264)
                     decompresses frames to YUV
Audio decode     ↓  Opus / AAC → PCM samples
PTS sync         ↓  Match audio sample timestamps to
                     video frame timestamps
Render           ↓  Push frame to <video> element compositor
                     (60fps display)

# Buffer = 2 separate buffers really:
#   videoBuffer.buffered: TimeRanges of decoded-ready video
#   audioBuffer.buffered: TimeRanges of decoded-ready audio
# Player keeps both ahead of currentTime by 10-20s`}
        </Code>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-6 mb-3">Buffer tuning</h3>
        <ul>
          <li><strong>Too small</strong> (&lt; 5s) — every minor network blip causes rebuffer. User sees spinner.</li>
          <li><strong>Too large</strong> (&gt; 60s) — wastes bandwidth on content the user might never watch. Bad on metered connections.</li>
          <li><strong>YouTube default</strong> — ~15s on desktop, 6–10s on mobile. Tuned by network class.</li>
          <li><strong>Battery cost</strong> — keeping decoder hot for too much pre-buffer drains battery. Mobile players de-prioritize.</li>
        </ul>

        <Callout variant="warning" title="Decoder switching is expensive">
          <p className="m-0">
            When ABR switches codecs (e.g. fallback from VP9 to H.264 because VP9 decoder hit an error), the browser must tear down the decoder and instantiate a new one. This causes a visible 100–300ms freeze. Same is true for switching across some quality boundaries (e.g. 1080p → 4K may require a different decoder profile). ABR is biased to switch within the same codec/profile to avoid this.
          </p>
        </Callout>
      </Section>

      {/* ── 12. LIVE STREAMING ── */}
      <Section
        id="live-streaming"
        number={12}
        eyebrow="Real-time variant"
        title="Live streaming — LL-HLS / LL-DASH"
        intro="Same architecture, two key differences: latency target shrinks from minutes to seconds, and segments can't pre-exist."
      >
        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mb-3">The latency budget</h3>
        <ul>
          <li><strong>Glass-to-glass latency</strong> — from the streamer's camera to the viewer's screen. Target depends on use case:</li>
          <li>Sports / news: 5–10s acceptable, &lt; 3s ideal</li>
          <li>Esports / interactive: &lt; 2s required</li>
          <li>Standard live: 10–30s common</li>
        </ul>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-6 mb-3">What changes from VOD</h3>
        <Code lang="Live differences">
{`# Segment duration shrinks
VOD:    4-6s segments (good for ABR granularity)
Live:   1-2s segments (cuts latency by 4-5×)

# Manifest becomes "rolling"
# Player polls manifest every segment for the next URL
GET /manifest.m3u8 → ...
GET /seg_104.m4s
GET /manifest.m3u8 → (now lists seg_105)
GET /seg_105.m4s

# LL-HLS adds part files (~250ms each)
# Viewer joins not at segment boundary but mid-segment
GET /seg_105.4.m4s        # 4th part of segment 105
GET /seg_105.5.m4s        # 5th part as it's still being made
                          # → server uses HTTP/2 push or chunked encoding

# Encoder-to-CDN pipeline
RTMP / WebRTC ingest → live encoder fleet
  → produces fMP4 chunks every ~250ms
  → uploaded to origin via HTTP PUT immediately
  → CDN propagates to edges within <1s`}
        </Code>

        <Callout variant="insight" title="WebRTC is the lower-bound option">
          <p className="m-0">
            For sub-1s latency (live auctions, interactive games, video calls), HLS / DASH are too slow no matter how short you make segments — manifest polling alone adds latency. WebRTC bypasses the segmenting model entirely and ships individual frames over UDP-based SRTP. Tradeoff: WebRTC doesn't ride on a CDN, so scaling to millions of concurrent viewers requires a separate fan-out infrastructure (SFUs, MCUs). YouTube uses LL-DASH for "Live"; products like Twitch are increasingly hybrid (LL-HLS for most, WebRTC for "low-latency mode").
          </p>
        </Callout>
      </Section>

      {/* ── 13. DRM ── */}
      <Section
        id="drm"
        number={13}
        eyebrow="Premium content"
        title="DRM — Widevine, FairPlay, PlayReady"
        intro="Free YouTube videos aren't DRM'd. But YouTube Movies, YouTube TV, and Premium content are — and the architecture has to plug DRM in without breaking the CDN."
      >
        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mb-3">Three DRM ecosystems</h3>
        <ul>
          <li><strong>Widevine</strong> (Google) — Chrome, Android, Edge, Firefox. The dominant choice on the web.</li>
          <li><strong>FairPlay</strong> (Apple) — Safari, iOS, tvOS. Required for Apple device playback.</li>
          <li><strong>PlayReady</strong> (Microsoft) — Edge, Xbox, Windows UWP, smart TVs.</li>
        </ul>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Encrypted segments + license server</h3>
        <Code lang="DRM playback flow">
{`1. Encode pipeline outputs segments encrypted with AES-128 CTR
   The actual content key (CEK) lives only in the License Server.
   CDN sees only ciphertext.

2. Player loads the manifest, sees DRM signaling:
   <ContentProtection schemeIdUri="urn:uuid:edef8ba9-..." ... />

3. Player asks the OS Content Decryption Module (CDM)
   to generate a license challenge:
   challenge = CDM.create_license_request(content_id)

4. Player sends challenge to License Server:
   POST /license { challenge, auth_token }

5. License Server validates auth, geo, device-binding rules,
   then returns a license blob.
   The license is itself encrypted with a device-specific key.

6. Player passes the license to the CDM.
   CDM extracts the CEK, decrypts segments in real time.
   The decrypted bytes never leave the secure decoder hardware.`}
        </Code>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Common Encryption Standard (CENC)</h3>
        <p>
          CENC defines a single encrypted file format that all three DRMs can consume. Same .m4s segment file works for Widevine, FairPlay, and PlayReady — they each decrypt with their own license server but the bytes on disk are identical. This is why the CDN doesn't need separate caches per DRM; segment caching scales as if the content were unencrypted.
        </p>

        <Callout variant="warning" title="DRM and CDN caching can fight">
          <p className="m-0">
            If you mistakenly include the per-session license blob in the segment URL (or vary segments per user), every viewer becomes a unique cache key — destroying the hit rate. The right design: segments are identical for all viewers (same CENC encryption); only the <em>license</em> is per-user. Cache hits stay at 98%; license server takes the per-viewer load (which is tiny in comparison — one license per session, not per segment).
          </p>
        </Callout>
      </Section>

      {/* ── 14. CAPTIONS ── */}
      <Section
        id="captions"
        number={14}
        eyebrow="Accessibility"
        title="Captions — auto-generated and uploaded"
        intro="Two paths feed the same surface: ASR-generated captions and creator-uploaded files. Both end up as separate WebVTT tracks in the manifest."
      >
        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mb-3">Auto-generation pipeline</h3>
        <ol>
          <li><strong>Audio extraction</strong> — pull the audio track from the source after upload.</li>
          <li><strong>ASR (automatic speech recognition)</strong> — feed audio into a speech-to-text model. Modern systems use transformer-based models (e.g. Conformer, Whisper-class).</li>
          <li><strong>Language ID + alignment</strong> — detect language; align text tokens to audio timestamps.</li>
          <li><strong>Punctuation + casing</strong> — separate model adds punctuation, capitalization, paragraph breaks.</li>
          <li><strong>Translation (optional)</strong> — Google Translate adds N additional language tracks.</li>
          <li><strong>Output WebVTT</strong> — serialize as .vtt files, register in manifest as additional text tracks.</li>
        </ol>

        <Code lang="Sample WebVTT">
{`WEBVTT

00:00:01.520 --> 00:00:03.840
Welcome to the system design deep dive.

00:00:03.840 --> 00:00:07.120
Today we're talking about how YouTube
handles a billion hours of video per day.`}
        </Code>

        <Callout variant="insight" title="Captions are searchable content">
          <p className="m-0">
            Once captions exist, they get indexed for search. "Search inside videos" becomes possible — searching for "system design" finds videos where the term appears in captions, even if the title doesn't mention it. This is also how YouTube's "click to chapter" feature works — captions provide the timestamps. The cost of generating captions is recouped multiple times via search relevance and recommendation features.
          </p>
        </Callout>
      </Section>

      {/* ── 15. WATCH HISTORY ── */}
      <Section
        id="watch-history"
        number={15}
        eyebrow="Resume position"
        title="Watch history & resume"
        intro={`The "continue watching" feature is what makes long-form video binge-able. Done wrong it leaks privacy and burns DB writes.`}
      >
        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mb-3">Storage model</h3>
        <Code lang="Watch state schema">
{`CREATE TABLE watch_history (
  user_id      uuid,
  video_id     uuid,
  position_s   int,           -- last known playback position
  total_dur_s  int,
  watched_at   timestamp,
  device_type  text,          -- mobile / desktop / tv
  PRIMARY KEY (user_id, video_id)
);

# Indexed list view: most-recent-first
CREATE INDEX ON watch_history (user_id, watched_at DESC);`}
        </Code>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Update strategy — debounce hard</h3>
        <p>
          A naïve client posts position every second. At 1B watch hours/day, that's 86,400 × 10^9 / 86,400 = <strong>1B writes/sec</strong>. Untenable. Two-stage write:
        </p>
        <ol>
          <li><strong>Client side</strong> — keep position locally, post to server every 30 seconds OR on pause/close.</li>
          <li><strong>Server side</strong> — first write to a Redis hash with TTL=24h (cheap, in-memory). Periodic sweep job persists final positions to the durable DB. The DB only sees one row per video per user per session, not per second.</li>
        </ol>

        <Callout variant="warning" title="The privacy surface is real">
          <p className="m-0">
            Watch history is one of the most sensitive datasets a video platform stores. A user's history reveals far more than their search history — political leanings, mental health, sexuality, religious views. The system must support: incognito mode (don't write), pause/clear history (delete rows + tombstone in recommender), retention policies (auto-delete after N months), and deletion requests under GDPR / similar. Make sure the recommender flushes its caches when a user clears history; otherwise the "deleted" video keeps appearing in their recommendations and the user notices.
          </p>
        </Callout>
      </Section>

      {/* ── 16. COST ECONOMICS ── */}
      <Section
        id="cost-economics"
        number={16}
        eyebrow="Where the money goes"
        title="Cost economics — egress dominates"
        intro="At YouTube scale, the bill is dominated by egress, not storage or compute. Understanding this rewires every architectural choice."
      >
        <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-6 not-prose">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 dark:bg-night-300 text-left text-xs text-ink-500 dark:text-night-600 uppercase tracking-wider border-b border-ink-200 dark:border-night-400">
              <tr>
                <th className="px-4 py-3 font-medium">Cost line</th>
                <th className="px-4 py-3 font-medium">Order of magnitude</th>
                <th className="px-4 py-3 font-medium">Lever</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-night-400">
              {[
                ['CDN egress',    '50–60% of total',     'Higher edge hit rate; better codecs (AV1)'],
                ['Storage',       '15–20%',              'Tiering policies; deduplication'],
                ['Transcode compute', '10–15%',          'Spot/preemptible; AV1 only for popular videos'],
                ['Origin egress (CDN fills)', '5–10%',   'Improve regional → edge prefetch'],
                ['Database + metadata', '< 5%',          'Mostly negligible at this scale'],
                ['Recommendations / ML', '5–10%',        'Model distillation; cache popular candidates'],
              ].map(([line, order, lever]) => (
                <tr key={line} className="dark:bg-night-200">
                  <td className="px-4 py-3 font-medium text-ink-900 dark:text-night-900">{line}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-700 dark:text-night-800">{order}</td>
                  <td className="px-4 py-3 text-xs text-ink-600 dark:text-night-700">{lever}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-night-900 mt-8 mb-3">Why YouTube ships its own CDN hardware</h3>
        <p>
          A third-party CDN charges per byte served. At YouTube's volume that's billions per year. Google instead built Google Global Cache (GGC) — physical cache appliances co-located inside ISPs, with the ISP providing power, rack space, and network in exchange for offloaded peering traffic. The marginal cost of an edge hit drops effectively to electricity and amortized hardware. This is why YouTube can afford to be "free" to viewers in a way pure CDN-rented competitors can't.
        </p>

        <Callout variant="insight" title="Codec efficiency = real money">
          <p className="m-0">
            VP9 saves ~30% bytes vs H.264. AV1 saves ~50%. Multiply by petabytes of egress per day. Even if AV1 encode is 12× more expensive in compute, the egress savings cross over the encode cost at &lt;10K views per video. Above that threshold, AV1 is purely accretive financially. This is why every large platform invests heavily in custom encoder ASICs / FPGAs — they can re-architect cost at the codec layer in ways no on-the-fly software encoder can.
          </p>
        </Callout>
      </Section>

      {/* ── 17. FAILURE MODES ── */}
      <Section
        id="failure-modes"
        number={17}
        eyebrow="Production reality"
        title="Failure modes & recovery"
        intro="The watch path has to keep working through transcode failures, CDN brownouts, and origin outages."
      >
        <div className="space-y-4 not-prose">
          {[
            {
              name: 'Transcode worker crash mid-job',
              color: '#EF4444',
              recovery: [
                'Worker heartbeat to controller every 10s; controller marks task lost after 30s',
                'Lost chunk is rescheduled on a different worker; idempotent because output keys are deterministic',
                'A retry on a duplicate worker simply overwrites identical bytes — no harm',
                'Manifest assembler waits until ALL chunk × quality × codec combinations confirm written',
                'Cumulative rate of transcoder failures: ~1% of uploads encounter at least one chunk failure; user impact: 0',
              ],
            },
            {
              name: 'Edge cache PoP outage',
              color: '#D97706',
              recovery: [
                'BGP withdraws routes within ~10s; viewer DNS re-resolves to next-nearest PoP',
                'Cold cache at the failover PoP: first ~30s of viewers experience higher latency from regional pulls',
                'Edge fills aggressively from regional during recovery to warm the new edge',
                'Mitigation: each region has multiple edge PoPs; failure of one degrades, doesn\'t fail',
              ],
            },
            {
              name: 'Origin (GCS) regional outage',
              color: '#7C3AED',
              recovery: [
                'GCS replicates across regions; a regional outage affects one region\'s storage',
                'Edge + regional caches keep serving 95%+ of segments without origin',
                'The 5% miss traffic fails over to a peer region\'s GCS replica via internal failover',
                'Cold long-tail content in the failed region is the only true outage surface',
              ],
            },
            {
              name: 'License server (DRM) outage',
              color: '#059669',
              recovery: [
                'Free / non-DRM content: unaffected, plays normally',
                'DRM content: licenses are cached in the player CDM with TTL ~24h, so already-watching viewers keep working',
                'New playback sessions for DRM content fail until licenses can be issued',
                'Mitigation: license servers run multi-region with anycast; outages are partial, not total',
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

      {/* ── 18. TRADEOFFS ── */}
      <Section
        id="tradeoffs"
        number={18}
        eyebrow="Production perspective"
        title="What the design gets right — and what it glosses over"
        intro="Naming the gaps separates a strong-hire answer from a passing one."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 not-prose">
          <div className="bg-teal-50 border border-teal-200 dark:bg-[#071A12] dark:border-teal-900/40 rounded-xl p-5">
            <div className="text-xs font-semibold text-teal-700 dark:text-teal-300 uppercase tracking-wider mb-3">What's solid</div>
            <ul className="space-y-2 text-sm text-ink-800 dark:text-night-800">
              <li>✓ Direct-to-storage uploads via presigned URL — no proxy server bottleneck</li>
              <li>✓ Embarrassingly-parallel chunk-based transcoding</li>
              <li>✓ Three-codec ladder balanced against device support</li>
              <li>✓ Per-segment CDN caching, not per-video</li>
              <li>✓ Adaptive bitrate with hysteresis + ML-augmented prediction</li>
              <li>✓ Storage tiering automating cost optimization</li>
              <li>✓ DRM that doesn't poison cache hit rate (CENC + per-user license, not per-user content)</li>
              <li>✓ Live streaming via shorter segments; WebRTC for sub-1s use cases</li>
              <li>✓ Watch history with debounced writes — DB sees 1 write per session, not per second</li>
            </ul>
          </div>
          <div className="bg-rust-50 border border-rust-200 dark:bg-[#1F0E07] dark:border-[#3D2012] rounded-xl p-5">
            <div className="text-xs font-semibold text-rust-700 dark:text-[#E8855A] uppercase tracking-wider mb-3">Still under-explored</div>
            <ul className="space-y-2 text-sm text-ink-800 dark:text-night-800">
              <li>⚠ <strong>Recommendations / Up Next</strong> — own end-to-end ML system, not covered here. See Bucket 3 Q1 for that depth.</li>
              <li>⚠ <strong>Comments at scale</strong> — fan-out, sentiment moderation, threading. Different read pattern than video.</li>
              <li>⚠ <strong>Ad insertion (SSAI)</strong> — server-side ad stitching into the manifest, dynamic creative selection per viewer.</li>
              <li>⚠ <strong>Content moderation</strong> — Content ID, copyright matching, harmful-content classifiers. Entire system on its own.</li>
              <li>⚠ <strong>Monetization & payouts</strong> — view counting, attribution, anti-fraud, revenue split, payment systems.</li>
              <li>⚠ <strong>Geo-restrictions</strong> — region blocks, age gates, parental controls — enforced at manifest serving time.</li>
              <li>⚠ <strong>Analytics pipeline</strong> — view counts (eventual consistency), Studio dashboards, real-time analytics.</li>
            </ul>
          </div>
        </div>

        <Callout variant="interview" title="How to deliver tradeoffs in an interview">
          <p className="m-0">
            <em>"The core upload-transcode-CDN-playback pipeline is solid. The most interesting omitted areas are recommendations (which is its own ML system worth a separate question), Content ID copyright matching (effectively a fingerprint search engine), and SSAI for ad insertion (manifest manipulation per viewer). I'd be happy to dive into any of those if we have time."</em>
          </p>
        </Callout>
      </Section>

      {/* ── 19. DEPLOYMENT ── */}
      <Section
        id="deployment"
        number={19}
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
                ['Upload API',           '40 boxes · autoscale 20–200',       'Stateless. Just generates presigned URLs and tracks state'],
                ['Pub/Sub',              'Managed (GCP Pub/Sub)',             'Durable buffer between upload and transcode'],
                ['Transcode workers',    '5,000+ on spot · burst to 20K',     'Mixed CPU + ASIC fleet. Spot pricing'],
                ['Metadata DB',          'Spanner (multi-region)',            'Strong consistency for video state + ownership'],
                ['Object storage',       'GCS multi-region',                  'Source segments + raw uploads. Lifecycle automation'],
                ['CDN — edge',           '~3,100 PoPs (mostly GGC)',          'In-ISP boxes. Anycast DNS routing'],
                ['CDN — regional PoPs',  '~30 metros × multiple datacenters', 'Tier-2 cache, large SSD-backed servers'],
                ['Manifest service',     '60 boxes per region',               'Stateless. Generates DASH/HLS on-the-fly per request'],
                ['License service (DRM)','100 boxes per region',              'Multi-region anycast. Stateless above the key DB'],
                ['Live encoder fleet',   'GPU + ASIC mixed',                  'Sized to handle peak concurrent streams (e.g. World Cup)'],
                ['Watch state',          'Bigtable (per-region)',             'High-throughput KV. TTL on inactive sessions'],
                ['Recommender',          'GPU fleet · own infrastructure',    'Two-tower retrieval + heavy ranker. See Bucket 3'],
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

        <Callout variant="warning" title="Where the network bandwidth comes from">
          <p className="m-0">
            Google Media CDN moves ~100 Tbps at peak. That capacity exists because Google peers directly with thousands of ISPs (settlement-free peering), runs its own private fiber backbone, and ships GGC boxes inside ISP data centers. Most CDN startups can't replicate this — they buy peering and rent edge. This is why building YouTube competitors at scale is fundamentally an infrastructure problem, not a software problem. Mention this in an interview to show you understand where the moat is.
          </p>
        </Callout>
      </Section>
    </DeepDiveLayout>
  );
}
