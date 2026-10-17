// Original anteater illustrations for ZotStudy (generic animals, not a mascot).
// Two tones: "day" (sand fur + navy outline, for light backgrounds) and
// "night" (soft shadow silhouettes, for the navy sidebar). All decorative.

const TONES = {
  day: {
    body: '#e3d2b2',
    shade: '#cdb791',
    far: '#b9a27c',
    face: '#f1e7d3',
    snout: '#d6c29c',
    tail: '#cfb98f',
    tailLight: '#eadcc0',
    stripe: '#0c2340',
    edge: '#f6f1e6',
    ear: '#f3d9c6',
    eye: '#0c2340',
    nose: '#0c2340',
    blush: '#ffc72c',
    blushOpacity: 0.45,
    line: '#0c2340',
    lineWidth: 2.4,
    shadow: 'rgba(12,35,64,0.10)',
  },
  night: {
    body: '#1f4673',
    shade: '#183a61',
    far: '#16365c',
    face: '#28537f',
    snout: '#25507d',
    tail: '#1b3f69',
    tailLight: '#2c5a89',
    stripe: '#0c2340',
    edge: '#3a6898',
    ear: '#36638f',
    eye: '#c9d3e0',
    nose: '#8fa1b8',
    blush: '#ffc72c',
    blushOpacity: 0.3,
    line: '#2f5f93',
    lineWidth: 1.4,
    shadow: 'transparent',
  },
}

let uid = 0
const nextId = () => `aa${(uid += 1)}`

const BODY =
  'M70 66 C76 44 110 34 140 36 C168 38 186 52 186 74 C186 96 160 104 130 104 C104 104 84 98 74 88 Z'

// Side view, facing left, nose down sniffing.
export function Anteater({ className = '', sleeping = false, shadow = true, tone = 'day' }) {
  const t = TONES[tone]
  const clip = nextId()
  const outline = { stroke: t.line, strokeWidth: t.lineWidth, strokeLinejoin: 'round' }
  return (
    <svg className={`illo anteater ${className}`} viewBox="-4 -2 248 144" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clip}>
          <path d={BODY} />
        </clipPath>
      </defs>
      {shadow ? <ellipse cx="122" cy="130" rx="86" ry="6" fill={t.shadow} /> : null}

      {/* bushy tail */}
      <g className="anteater-tail">
        <path
          d="M170 72 C172 44 196 20 226 22 C236 23 239 33 233 41 C240 49 236 60 227 62 C234 72 228 85 217 84 C215 95 200 99 191 92 C183 95 173 88 170 80 Z"
          fill={t.tail}
          {...outline}
        />
        <path
          d="M182 70 C188 50 204 36 222 32 M188 80 C198 66 212 58 226 52 M196 88 C206 80 216 74 222 70"
          stroke={t.tailLight}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* far legs */}
      <path d="M104 92 L102 122 Q102 126 108 126 L116 126 Q118 123 116 121 L116 94 Z" fill={t.far} {...outline} />
      <path d="M170 86 L170 122 Q170 126 176 126 L184 126 Q186 123 184 121 L182 84 Z" fill={t.far} {...outline} />

      {/* body with soft belly shading and the shoulder stripe */}
      <path d={BODY} fill={t.body} />
      <g clipPath={`url(#${clip})`}>
        <ellipse cx="132" cy="112" rx="64" ry="26" fill={t.shade} />
        <path d="M72 92 L92 98 L150 34 L128 30 Z" fill={t.edge} />
        <path d="M78 93 L88 96 L143 33 L134 31 Z" fill={t.stripe} />
      </g>
      <path d={BODY} fill="none" {...outline} />

      {/* near legs */}
      <path d="M84 86 L80 121 Q80 126 86 126 L98 126 Q101 123 98 120 L98 92 Z" fill={t.body} {...outline} />
      <path d="M150 92 L148 121 Q148 126 154 126 L166 126 Q169 123 166 120 L168 90 Z" fill={t.body} {...outline} />

      {/* head + long snout */}
      <path d="M54 55 C40 61 25 75 13 91 C11 94 14 97 17 95 C29 86 43 79 58 75 Z" fill={t.snout} {...outline} />
      <ellipse cx="68" cy="64" rx="21" ry="17" fill={t.face} {...outline} />
      <circle cx="14.5" cy="93" r="3.4" fill={t.nose} />

      {/* ear */}
      <ellipse cx="78" cy="49" rx="6" ry="8" transform="rotate(-18 78 49)" fill={t.body} {...outline} />
      <ellipse cx="78" cy="50" rx="2.8" ry="4.2" transform="rotate(-18 78 50)" fill={t.ear} />

      {/* face */}
      {sleeping ? (
        <path d="M57 62 q4 4 8 0" stroke={t.eye} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      ) : (
        <>
          <circle cx="61" cy="61" r="3.2" fill={t.eye} />
          <circle cx="62.2" cy="59.8" r="1" fill="#fff" />
        </>
      )}
      <ellipse cx="61" cy="71" rx="4.5" ry="2.6" fill={t.blush} opacity={t.blushOpacity} />
    </svg>
  )
}

// Side profile peeking over an edge (the edge is the bottom of the svg),
// snout resting on the edge as if sniffing it.
export function AnteaterPeek({ className = '', tone = 'day' }) {
  const t = TONES[tone]
  const outline = { stroke: t.line, strokeWidth: t.lineWidth, strokeLinejoin: 'round' }
  return (
    <svg className={`illo anteater-peek ${className}`} viewBox="0 -2 172 96" aria-hidden="true" focusable="false">
      <path d="M118 94 C120 70 134 58 150 60 C162 62 168 76 166 94 Z" fill={t.body} {...outline} />
      <ellipse cx="128" cy="48" rx="8" ry="11" transform="rotate(-15 128 48)" fill={t.body} {...outline} />
      <ellipse cx="128" cy="49" rx="3.6" ry="6" transform="rotate(-15 128 49)" fill={t.ear} />
      <path d="M98 58 C78 64 46 76 16 84 C11 85 11 91 16 91 C48 90 78 86 100 82 Z" fill={t.snout} {...outline} />
      <ellipse cx="116" cy="70" rx="27" ry="22" fill={t.face} {...outline} />
      <circle cx="13" cy="87.5" r="3.8" fill={t.nose} />
      <path d="M103 64 q5 -5 10 0" stroke={t.eye} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <ellipse cx="106" cy="76" rx="5" ry="2.8" fill={t.blush} opacity={t.blushOpacity} />
      <ellipse cx="138" cy="88" rx="13" ry="7" fill={t.body} {...outline} />
      <path d="M131 92 v-5 M138 93 v-6 M145 92 v-5" stroke={t.line} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

// Two shadowy anteaters peeking over the ZotStudy wordmark, sharing an idea.
// The bottom of the svg sits on the top of the letters.
export function BrandPeekers({ className = '' }) {
  const t = TONES.night
  const outline = { stroke: t.line, strokeWidth: 1.2, strokeLinejoin: 'round' }
  const eye = { stroke: t.eye, strokeWidth: 1.6, strokeLinecap: 'round', fill: 'none' }
  return (
    <svg className={`illo brand-peekers ${className}`} viewBox="0 0 150 52" aria-hidden="true" focusable="false">
      {/* idea bulb between them */}
      <g className="brand-bulb">
        <path
          d="M78 1.5 v2.5 M69.5 5 l1.8 1.8 M86.5 5 l-1.8 1.8 M66.5 13 h2.5 M87 13 h2.5"
          stroke="#ffc72c"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="78" cy="13" r="5" fill="#ffc72c" />
        <rect x="75.6" y="17.4" width="4.8" height="3" rx="1" fill="#c9d3e0" />
      </g>

      {/* left anteater, with glasses, sniffing toward the idea */}
      <ellipse cx="17" cy="32" rx="4" ry="5.5" transform="rotate(-25 17 32)" fill={t.body} {...outline} />
      <ellipse cx="17" cy="32.5" rx="1.8" ry="3" transform="rotate(-25 17 32.5)" fill={t.ear} />
      <path d="M38 35 C48 32 58 28 67 23 C70 21.5 72 24.5 69.5 26 C60 32 50 39 40 45 Z" fill={t.snout} {...outline} />
      <circle cx="69.5" cy="24.4" r="2" fill={t.nose} />
      <ellipse cx="28" cy="43" rx="15" ry="13" fill={t.face} {...outline} />
      <circle cx="24.5" cy="40.5" r="3.9" fill="none" stroke="#c9d3e0" strokeWidth="1.1" />
      <circle cx="33.5" cy="39.5" r="3.9" fill="none" stroke="#c9d3e0" strokeWidth="1.1" />
      <path d="M28.3 40 h1.4" stroke="#c9d3e0" strokeWidth="1.1" />
      <path d="M22.8 41.3 q1.7 -2 3.4 0 M31.8 40.3 q1.7 -2 3.4 0" {...eye} />
      <ellipse cx="36" cy="46" rx="2.6" ry="1.4" fill={t.blush} opacity={t.blushOpacity} />
      <ellipse cx="16" cy="50.5" rx="5.5" ry="3.2" fill={t.body} {...outline} />
      <ellipse cx="39" cy="50.5" rx="5.5" ry="3.2" fill={t.body} {...outline} />

      {/* right anteater, sniffing toward the idea from the other side */}
      <ellipse cx="139" cy="32" rx="4" ry="5.5" transform="rotate(25 139 32)" fill={t.body} {...outline} />
      <ellipse cx="139" cy="32.5" rx="1.8" ry="3" transform="rotate(25 139 32.5)" fill={t.ear} />
      <path d="M118 35 C108 32 98 28 89 23 C86 21.5 84 24.5 86.5 26 C96 32 106 39 116 45 Z" fill={t.snout} {...outline} />
      <circle cx="86.5" cy="24.4" r="2" fill={t.nose} />
      <ellipse cx="128" cy="43" rx="15" ry="13" fill={t.face} {...outline} />
      <path d="M120.8 40.3 q1.7 -2 3.4 0 M129.8 41.3 q1.7 -2 3.4 0" {...eye} />
      <ellipse cx="120" cy="46" rx="2.6" ry="1.4" fill={t.blush} opacity={t.blushOpacity} />
      <ellipse cx="117" cy="50.5" rx="5.5" ry="3.2" fill={t.body} {...outline} />
      <ellipse cx="140" cy="50.5" rx="5.5" ry="3.2" fill={t.body} {...outline} />
    </svg>
  )
}

// A tiny ant, facing left.
export function Ant({ className = '' }) {
  return (
    <svg className={`illo ant ${className}`} viewBox="0 0 26 16" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none">
        <path d="M9 9 l-3 5 M13 9 l0 6 M17 9 l3 5 M9 8 l-3 -4 M13 8 l0 -5 M17 8 l3 -4" />
        <path d="M4 4 q-2 -3 -4 -3 M5 4 q0 -3 1 -4" />
      </g>
      <circle cx="5" cy="7" r="3" fill="currentColor" />
      <ellipse cx="12" cy="8" rx="3" ry="2.4" fill="currentColor" />
      <ellipse cx="20" cy="8" rx="5" ry="3.6" fill="currentColor" />
    </svg>
  )
}

// A few ants marching left along the ground.
export function AntTrail({ className = '', count = 3 }) {
  return (
    <span className={`ant-trail ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <Ant key={index} className={`ant-${index}`} />
      ))}
    </span>
  )
}

const INK = '#0c2340'
const ink = { stroke: INK, strokeWidth: 2, strokeLinejoin: 'round' }

// A stack of textbooks with a coffee mug.
export function BookStack({ className = '' }) {
  return (
    <svg className={`illo book-stack ${className}`} viewBox="0 0 120 84" aria-hidden="true" focusable="false">
      <ellipse cx="56" cy="80" rx="52" ry="3.5" fill="rgba(12,35,64,0.10)" />
      <rect x="8" y="58" width="86" height="18" rx="3" fill="#16365c" {...ink} />
      <rect x="12" y="62" width="70" height="2.5" rx="1" fill="#f6f1e6" />
      <rect x="16" y="40" width="76" height="18" rx="3" fill="#ffc72c" {...ink} />
      <rect x="22" y="47" width="40" height="3" rx="1.5" fill="#0c2340" opacity="0.7" />
      <rect x="4" y="22" width="80" height="18" rx="3" fill="#e8edf4" {...ink} />
      <rect x="70" y="22" width="5" height="18" fill="#b42318" />
      <path d="M86 52 h16 v18 a6 6 0 0 1 -6 6 h-4 a6 6 0 0 1 -6 -6 Z" fill="#f6f1e6" {...ink} />
      <path d="M102 56 q8 0 8 7 q0 7 -8 7" fill="none" {...ink} />
      <path d="M90 44 q-2 -4 1 -7 M96 44 q-2 -4 1 -7" fill="none" stroke="#c9d3e0" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// A calendar page with a gold star (for creating a session).
export function CalendarArt({ className = '' }) {
  return (
    <svg className={`illo calendar-art ${className}`} viewBox="0 0 100 92" aria-hidden="true" focusable="false">
      <ellipse cx="50" cy="88" rx="40" ry="3.5" fill="rgba(12,35,64,0.10)" />
      <rect x="12" y="14" width="76" height="70" rx="10" fill="#ffffff" {...ink} />
      <path d="M12 24 a10 10 0 0 1 10 -10 h56 a10 10 0 0 1 10 10 v8 h-76 Z" fill="#0c2340" />
      <rect x="28" y="6" width="6" height="16" rx="3" fill="#ffc72c" {...ink} />
      <rect x="66" y="6" width="6" height="16" rx="3" fill="#ffc72c" {...ink} />
      <g fill="#d9e0ea">
        <rect x="22" y="42" width="10" height="9" rx="2" />
        <rect x="37" y="42" width="10" height="9" rx="2" />
        <rect x="52" y="42" width="10" height="9" rx="2" />
        <rect x="67" y="42" width="10" height="9" rx="2" />
        <rect x="22" y="57" width="10" height="9" rx="2" />
        <rect x="37" y="57" width="10" height="9" rx="2" />
        <rect x="67" y="57" width="10" height="9" rx="2" />
        <rect x="22" y="71" width="10" height="7" rx="2" />
        <rect x="37" y="71" width="10" height="7" rx="2" />
      </g>
      <path
        d="M57 52 l3.2 6.4 7 1 -5.1 5 1.2 7 -6.3 -3.3 -6.3 3.3 1.2 -7 -5.1 -5 7 -1 Z"
        fill="#ffc72c"
        {...ink}
        strokeWidth="1.6"
      />
    </svg>
  )
}

// A small gear (for settings).
export function GearArt({ className = '' }) {
  return (
    <svg className={`illo gear-art ${className}`} viewBox="0 0 60 60" aria-hidden="true" focusable="false">
      <path
        d="M30 6 l4 0 1.6 6.2 a18 18 0 0 1 5.4 2.2 l5.5 -3.3 2.8 2.8 -3.3 5.5 a18 18 0 0 1 2.2 5.4 L54 26 v8 l-6.2 1.6 a18 18 0 0 1 -2.2 5.4 l3.3 5.5 -2.8 2.8 -5.5 -3.3 a18 18 0 0 1 -5.4 2.2 L34 54 h-8 l-1.6 -6.2 a18 18 0 0 1 -5.4 -2.2 l-5.5 3.3 -2.8 -2.8 3.3 -5.5 a18 18 0 0 1 -2.2 -5.4 L6 34 v-8 l6.2 -1.6 a18 18 0 0 1 2.2 -5.4 l-3.3 -5.5 2.8 -2.8 5.5 3.3 a18 18 0 0 1 5.4 -2.2 L26 6 Z"
        fill="#ffc72c"
        {...ink}
      />
      <circle cx="30" cy="30" r="8" fill="#f6f1e6" {...ink} />
    </svg>
  )
}

// Two anteaters greeting each other, with a little gold spark between them.
export function BuddyPair({ className = '' }) {
  return (
    <span className={`buddy-pair ${className}`} aria-hidden="true">
      <span className="buddy-left">
        <Anteater shadow />
      </span>
      <svg className="illo buddy-spark" viewBox="0 0 30 30" aria-hidden="true" focusable="false">
        <path
          d="M15 2 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3 Z"
          fill="#ffc72c"
          stroke={INK}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span className="buddy-right">
        <Anteater shadow />
      </span>
    </span>
  )
}
