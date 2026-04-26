import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* Simulates the WebSocket handshake frames step by step */
const HANDSHAKE_STEPS = [
  {
    label: 'TCP SYN',
    dir: 'client→server',
    color: '#6B7280',
    desc: 'Client initiates a TCP connection to port 443.',
    bytes: 'SYN seq=x',
  },
  {
    label: 'TCP SYN-ACK',
    dir: 'server→client',
    color: '#6B7280',
    desc: 'Server acknowledges, sends its own SYN.',
    bytes: 'SYN-ACK ack=x+1 seq=y',
  },
  {
    label: 'TLS ClientHello',
    dir: 'client→server',
    color: '#7C3AED',
    desc: 'Client proposes TLS 1.3, sends cipher suites + random nonce.',
    bytes: 'ClientHello TLS 1.3 ciphers=[AES-256-GCM…]',
  },
  {
    label: 'TLS ServerHello + Cert',
    dir: 'server→client',
    color: '#7C3AED',
    desc: 'Server picks cipher, sends certificate chain, key share.',
    bytes: 'ServerHello cert chain key_share',
  },
  {
    label: 'HTTP Upgrade Request',
    dir: 'client→server',
    color: '#2D8B66',
    desc: "Client sends the magic HTTP/1.1 upgrade — this is what makes it a WebSocket.",
    bytes: `GET /chat HTTP/1.1\nUpgrade: websocket\nConnection: Upgrade\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\nSec-WebSocket-Version: 13`,
  },
  {
    label: 'HTTP 101 Switching Protocols',
    dir: 'server→client',
    color: '#2D8B66',
    desc: 'Server accepts. From this point on, the socket is raw frames — no more HTTP.',
    bytes: `HTTP/1.1 101 Switching Protocols\nUpgrade: websocket\nSec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=`,
  },
  {
    label: 'WS Frame: Message',
    dir: 'client→server',
    color: '#4A6CF7',
    desc: 'Client sends a masked binary frame. FIN=1 (full message). MASK bit = 1 (required client→server).',
    bytes: `FIN=1 OPCODE=0x2 MASK=1\nPAYLOAD_LEN=42\nMASKING_KEY: 0xA3B2C1D0\n{"type":"msg","chatId":"…","text":"hi"}`,
  },
  {
    label: 'WS Frame: ACK',
    dir: 'server→client',
    color: '#4A6CF7',
    desc: 'Server confirms receipt. Server→client frames are unmasked.',
    bytes: `FIN=1 OPCODE=0x2 MASK=0\n{"type":"ack","msgId":"m_9z2k","ts":1745000000123}`,
  },
];

export default function WebSocketHandshake() {
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    if (step >= HANDSHAKE_STEPS.length - 1) { setRunning(false); return; }
    timerRef.current = setTimeout(() => setStep((s) => s + 1), 1500);
    return () => clearTimeout(timerRef.current);
  }, [running, step]);

  const start = () => { setStep(0); setRunning(true); };
  const reset = () => { setStep(-1); setRunning(false); clearTimeout(timerRef.current); };

  const current = step >= 0 ? HANDSHAKE_STEPS[step] : null;

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">Animated simulation</div>
          <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">WebSocket Handshake — TCP → TLS → HTTP → WS</div>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="text-xs px-2.5 py-1.5 rounded-lg bg-ink-100 dark:bg-night-400 text-ink-600 dark:text-night-700 hover:bg-ink-200 transition">Reset</button>
          <button onClick={start} disabled={running} className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium disabled:opacity-50">
            {running ? 'Running…' : '▶ Simulate'}
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Timeline */}
        <div className="flex justify-between text-xs font-semibold text-ink-500 dark:text-night-700 mb-3 px-2">
          <span>CLIENT</span>
          <span>SERVER</span>
        </div>
        <div className="relative">
          {/* Center spine */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-ink-100 dark:bg-night-400 transform -translate-x-1/2" />

          <div className="space-y-2">
            {HANDSHAKE_STEPS.map((s, i) => {
              const isClient = s.dir === 'client→server';
              const isDone = step >= i;
              const isCurrent = step === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isDone ? 1 : 0.2 }}
                  transition={{ duration: 0.4 }}
                  className={`flex items-center gap-2 ${isClient ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Label side */}
                  <div className={`flex-1 text-right ${!isClient && 'text-left'}`}>
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                      style={{
                        background: isDone ? s.color + '18' : 'transparent',
                        color: isDone ? s.color : '#9CA3AF',
                        border: `1px solid ${isDone ? s.color + '40' : 'transparent'}`,
                      }}
                    >
                      {s.label}
                    </span>
                  </div>

                  {/* Arrow across center */}
                  <div className="w-16 flex-shrink-0 flex items-center justify-center relative">
                    <motion.div
                      className="h-[2px] w-full"
                      style={{ background: s.color, opacity: isDone ? 1 : 0.15 }}
                    />
                    {isDone && (
                      <span
                        className="absolute text-[8px]"
                        style={{ color: s.color, [isClient ? 'right' : 'left']: -3 }}
                      >
                        {isClient ? '▶' : '◀'}
                      </span>
                    )}
                    {isCurrent && (
                      <motion.div
                        className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
                        style={{ background: s.color, [isClient ? 'left' : 'right']: 0 }}
                        animate={{ x: isClient ? [0, 56, 56] : [0, -56, -56] }}
                        transition={{ duration: 0.8, times: [0, 0.7, 1] }}
                      />
                    )}
                  </div>

                  {/* Empty right side */}
                  <div className="flex-1" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Current step detail */}
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-6"
            >
              <div className="text-sm font-medium mb-2" style={{ color: current.color }}>
                Step {step + 1}/{HANDSHAKE_STEPS.length} — {current.label}
              </div>
              <div className="text-sm text-ink-700 dark:text-night-700 mb-3">{current.desc}</div>
              <pre
                className="text-[11px] font-mono rounded-lg p-4 overflow-auto leading-relaxed"
                style={{
                  background: current.color + '0D',
                  border: `1px solid ${current.color}30`,
                  color: current.color,
                }}
              >
                {current.bytes}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {step === -1 && (
          <div className="mt-6 text-sm text-ink-500 dark:text-night-600 text-center">
            Hit Simulate to watch the full WebSocket handshake from TCP SYN to first message frame.
          </div>
        )}
      </div>
    </div>
  );
}
