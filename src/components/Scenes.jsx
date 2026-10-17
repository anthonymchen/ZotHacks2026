// Personalized anteater scenes for each page header (original characters, not a mascot).
// Every scene is decorative and hidden from screen readers.

const C = {
  body: '#e3d2b2',
  belly: '#f3ead8',
  far: '#cdb791',
  snout: '#d6c29c',
  tail: '#cfb98f',
  tailLight: '#eadcc0',
  ear: '#f3d9c6',
  ink: '#0c2340',
  navySoft: '#16365c',
  gold: '#ffc72c',
  goldTint: '#fff4d1',
  cream: '#f6f1e6',
  sky: '#e8edf4',
  red: '#b42318',
  blush: '#f4a99d',
  mouth: '#8c3b2f',
}

const LINE = { stroke: C.ink, strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' }

let uid = 0
const nextId = () => `sc${(uid += 1)}`

// An arm drawn as a thick outlined stroke ending in a paw.
function Arm({ d, paw, clawAngle = 0 }) {
  return (
    <g>
      <path d={d} fill="none" stroke={C.ink} strokeWidth="19" strokeLinecap="round" />
      <path d={d} fill="none" stroke={C.body} strokeWidth="13" strokeLinecap="round" />
      <g transform={`translate(${paw[0]} ${paw[1]}) rotate(${clawAngle})`}>
        <circle r="8.5" fill={C.far} {...LINE} />
        <path d="M-4 -6 v-3 M0 -7 v-3.5 M4 -6 v-3" stroke={C.ink} strokeWidth="2.2" strokeLinecap="round" />
      </g>
    </g>
  )
}

const ARMS = {
  down: [
    { d: 'M40 112 C30 124 26 138 28 150', paw: [28, 152], clawAngle: 190 },
    { d: 'M106 112 C116 124 120 138 118 150', paw: [118, 152], clawAngle: 170 },
  ],
  wave: [
    { d: 'M40 110 C24 102 14 88 12 70', paw: [12, 64], clawAngle: -15 },
    { d: 'M106 112 C116 124 120 138 118 150', paw: [118, 152], clawAngle: 170 },
  ],
  hold: [
    { d: 'M40 112 C42 128 50 138 60 142', paw: [62, 142], clawAngle: 70 },
    { d: 'M106 112 C104 128 96 138 86 142', paw: [84, 142], clawAngle: -70 },
  ],
  hug: [
    { d: 'M42 110 C26 104 12 102 0 104', paw: [-3, 104], clawAngle: -80 },
    { d: 'M106 112 C116 124 120 138 118 150', paw: [118, 152], clawAngle: 170 },
  ],
}

// One front-facing anteater. Draws in a 160 x 200 box; place it with x, y, scale.
export function Character({
  x = 0,
  y = 0,
  scale = 1,
  flip = false,
  tilt = 0,
  eyes = 'happy',
  glasses = false,
  arms = 'down',
  hat = null,
  item = null,
  itemAbovePaws = false,
}) {
  const clip = nextId()
  const sx = flip ? -scale : scale
  const tx = flip ? x + 160 * scale : x
  const [left, right] = ARMS[arms]
  return (
    <g transform={`translate(${tx} ${y}) scale(${sx} ${scale})`}>
      <defs>
        <clipPath id={clip}>
          <path d="M30 140 C30 104 50 88 72 88 C96 88 116 104 116 140 C116 172 98 192 72 192 C46 192 30 172 30 140 Z" />
        </clipPath>
      </defs>

      {/* bushy tail */}
      <path
        d="M42 162 C12 154 0 118 12 88 C18 72 34 70 38 84 C42 70 58 74 56 92 C62 104 58 128 54 148 Z"
        fill={C.tail}
        {...LINE}
      />
      <path d="M22 96 C18 116 24 136 38 150 M36 92 C34 112 38 130 46 146" stroke={C.tailLight} strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* feet */}
      <ellipse cx="56" cy="190" rx="15" ry="8" fill={C.far} {...LINE} />
      <ellipse cx="90" cy="190" rx="15" ry="8" fill={C.far} {...LINE} />

      {/* body, belly and the signature shoulder stripe */}
      <path
        d="M30 140 C30 104 50 88 72 88 C96 88 116 104 116 140 C116 172 98 192 72 192 C46 192 30 172 30 140 Z"
        fill={C.body}
      />
      <g clipPath={`url(#${clip})`}>
        <ellipse cx="74" cy="152" rx="27" ry="31" fill={C.belly} />
        <path d="M22 100 L42 90 L124 150 L122 172 Z" fill={C.cream} />
        <path d="M26 104 L40 97 L124 156 L122 166 Z" fill={C.ink} />
      </g>
      <path
        d="M30 140 C30 104 50 88 72 88 C96 88 116 104 116 140 C116 172 98 192 72 192 C46 192 30 172 30 140 Z"
        fill="none"
        {...LINE}
      />

      {/* head (tilts as a group) */}
      <g transform={`rotate(${tilt} 72 90)`}>
        <ellipse cx="46" cy="32" rx="9" ry="11.5" transform="rotate(-20 46 32)" fill={C.body} {...LINE} />
        <ellipse cx="46" cy="33" rx="4" ry="6.5" transform="rotate(-20 46 33)" fill={C.ear} />
        <ellipse cx="92" cy="28" rx="9" ry="11.5" transform="rotate(22 92 28)" fill={C.body} {...LINE} />
        <ellipse cx="92" cy="29" rx="4" ry="6.5" transform="rotate(22 92 29)" fill={C.ear} />
        {/* long snout curving down and right, tucked behind the head */}
        <path
          d="M84 44 C108 50 126 64 142 84 C146 90 141 96 134 93 C118 85 100 80 82 78 Z"
          fill={C.snout}
          {...LINE}
        />
        <ellipse cx="140" cy="89" rx="6" ry="5" fill={C.ink} />
        <ellipse cx="70" cy="60" rx="34" ry="31" fill={C.body} {...LINE} />
        {/* muzzle where the snout meets the face */}
        <path d="M92 50 C100 54 104 62 102 74 C98 77 94 78 90 78" fill={C.snout} />
        {/* smile */}
        <path d="M84 80 q8 10 18 3 q-8 -1 -18 -3 Z" fill={C.mouth} {...LINE} strokeWidth="2.2" />
        {/* eyes */}
        {eyes === 'happy' ? (
          <path d="M51 58 q6 -8 12 0 M71 54 q6 -8 12 0" fill="none" stroke={C.ink} strokeWidth="3.2" strokeLinecap="round" />
        ) : eyes === 'sleep' ? (
          <path d="M51 55 q6 7 12 0 M71 51 q6 7 12 0" fill="none" stroke={C.ink} strokeWidth="3.2" strokeLinecap="round" />
        ) : (
          <>
            <circle cx="57" cy="56" r="4.6" fill={C.ink} />
            <circle cx="77" cy="52" r="4.6" fill={C.ink} />
            <circle cx="58.6" cy="54.4" r="1.6" fill="#fff" />
            <circle cx="78.6" cy="50.4" r="1.6" fill="#fff" />
          </>
        )}
        <ellipse cx="50" cy="70" rx="6" ry="3.6" fill={C.blush} opacity="0.7" />
        <ellipse cx="86" cy="66" rx="5" ry="3" fill={C.blush} opacity="0.55" />
        {glasses ? (
          <g fill="none" stroke={C.ink} strokeWidth="2.6">
            <circle cx="57" cy="56" r="10.5" fill="rgba(255,255,255,0.35)" />
            <circle cx="78" cy="52" r="10.5" fill="rgba(255,255,255,0.35)" />
            <path d="M67.3 54.6 q0.5 -2.5 0 -0.6" />
            <path d="M66.5 54.8 l1.4 -0.6" />
            <path d="M46.6 57.5 L38 54" />
          </g>
        ) : null}
        {hat}
      </g>

      {/* arms, with anything held drawn between arms and paws */}
      {itemAbovePaws ? (
        <>
          <Arm {...left} />
          <Arm {...right} />
          {item}
        </>
      ) : (
        <>
          <path d={left.d} fill="none" stroke={C.ink} strokeWidth="19" strokeLinecap="round" />
          <path d={left.d} fill="none" stroke={C.body} strokeWidth="13" strokeLinecap="round" />
          <path d={right.d} fill="none" stroke={C.ink} strokeWidth="19" strokeLinecap="round" />
          <path d={right.d} fill="none" stroke={C.body} strokeWidth="13" strokeLinecap="round" />
          {item}
          <Arm {...left} />
          <Arm {...right} />
        </>
      )}
    </g>
  )
}

// Little decorations
function Sparkle({ x, y, size = 1, color = C.gold }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${size})`}
      d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z"
      fill={color}
      stroke={C.ink}
      strokeWidth={1.6 / size}
      strokeLinejoin="round"
    />
  )
}

function Heart({ x, y, size = 1 }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${size})`}
      d="M0 6 C-10 -2 -10 -10 -5 -10 C-2 -10 0 -7 0 -5 C0 -7 2 -10 5 -10 C10 -10 10 -2 0 6 Z"
      fill={C.red}
      stroke={C.ink}
      strokeWidth={1.8 / size}
      strokeLinejoin="round"
    />
  )
}

function Shadow({ cx, cy, rx }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry="7" fill="rgba(12,35,64,0.12)" />
}

// A rounded speech bubble with a tail at the bottom right.
function bubblePath(x, y, w, h, r) {
  const right = x + w
  const bottom = y + h
  return `M${x + r} ${y} H${right - r} A${r} ${r} 0 0 1 ${right} ${y + r} V${bottom - r} A${r} ${r} 0 0 1 ${right - r} ${bottom} H${right - 12} L${right - 4} ${bottom + 13} L${right - 26} ${bottom} H${x + r} A${r} ${r} 0 0 1 ${x} ${bottom - r} V${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} Z`
}

// Waving hello (or goodbye) with a speech bubble.
export function WaveScene({ className = '', text = 'Zot!' }) {
  const width = Math.max(64, text.length * 13 + 28)
  return (
    <svg className={`illo scene ${className}`} viewBox="0 0 240 212" aria-hidden="true" focusable="false">
      <Shadow cx="136" cy="202" rx="58" />
      <Character x={64} y={6} eyes="happy" arms="wave" tilt={4} />
      <g className="scene-bubble">
        <path d={bubblePath(4, 8, width, 40, 13)} fill="#ffffff" {...LINE} strokeWidth="2.6" />
        <text x={4 + width / 2} y="35" textAnchor="middle" fontFamily="'Bricolage Grotesque', sans-serif" fontWeight="800" fontSize="20" fill={C.ink}>
          {text}
        </text>
      </g>
      <Sparkle x={44} y={104} size={0.75} />
    </svg>
  )
}

// Find Study Buddies: two smart anteaters hugging.
export function HugScene({ className = '' }) {
  return (
    <svg className={`illo scene ${className}`} viewBox="0 -8 300 222" aria-hidden="true" focusable="false">
      <Shadow cx="150" cy="204" rx="112" />
      {/* right buddy first so the left buddy's arm drapes over its shoulders */}
      <Character x={136} y={10} glasses eyes="happy" arms="hug" tilt={-10} />
      <Character x={4} y={10} flip glasses eyes="happy" arms="hug" tilt={-10} />
      <Heart x={164} y={20} size={1.25} />
      <Heart x={138} y={6} size={0.7} />
      <Heart x={192} y={8} size={0.8} />
    </svg>
  )
}

function BookStackItem() {
  return (
    <g>
      <rect x="40" y="148" width="66" height="14" rx="3" fill={C.navySoft} {...LINE} strokeWidth="2.4" />
      <rect x="44" y="151" width="50" height="2.5" rx="1" fill={C.cream} />
      <rect x="36" y="134" width="70" height="14" rx="3" fill={C.gold} {...LINE} strokeWidth="2.4" />
      <rect x="44" y="139" width="34" height="3" rx="1.5" fill={C.ink} opacity="0.7" />
      <rect x="42" y="120" width="62" height="14" rx="3" fill={C.sky} {...LINE} strokeWidth="2.4" />
      <rect x="92" y="120" width="5" height="14" fill={C.red} />
      <text x="60" y="131" fontFamily="'Bricolage Grotesque', sans-serif" fontWeight="800" fontSize="9" fill={C.ink}>
        A+
      </text>
    </g>
  )
}

// Study Sessions: glasses on, arms full of books.
export function BooksScene({ className = '' }) {
  return (
    <svg className={`illo scene ${className}`} viewBox="0 0 220 210" aria-hidden="true" focusable="false">
      <Shadow cx="100" cy="200" rx="60" />
      <Character x={24} y={6} glasses eyes="open" arms="hold" item={<BookStackItem />} />
      <Sparkle x={196} y={40} size={0.9} />
      <Sparkle x={182} y={70} size={0.55} />
      <Sparkle x={22} y={40} size={0.6} />
    </svg>
  )
}

function ClipboardItem() {
  return (
    <g>
      <rect x="38" y="112" width="70" height="66" rx="6" fill="#ffffff" {...LINE} strokeWidth="2.6" />
      <rect x="58" y="106" width="30" height="12" rx="4" fill={C.gold} {...LINE} strokeWidth="2.2" />
      <rect x="44" y="124" width="58" height="10" rx="3" fill={C.ink} />
      <g fill="#d9e0ea">
        <rect x="46" y="140" width="9" height="8" rx="2" />
        <rect x="59" y="140" width="9" height="8" rx="2" />
        <rect x="85" y="140" width="9" height="8" rx="2" />
        <rect x="46" y="152" width="9" height="8" rx="2" />
        <rect x="59" y="152" width="9" height="8" rx="2" />
        <rect x="72" y="152" width="9" height="8" rx="2" />
        <rect x="85" y="152" width="9" height="8" rx="2" />
        <rect x="46" y="164" width="9" height="7" rx="2" />
      </g>
      <path d="M76.5 139 l1.6 3.3 3.6 .5 -2.6 2.5 .6 3.6 -3.2 -1.7 -3.2 1.7 .6 -3.6 -2.6 -2.5 3.6 -.5 Z" fill={C.gold} stroke={C.ink} strokeWidth="1.2" strokeLinejoin="round" />
    </g>
  )
}

// Create a session: planning on a clipboard calendar, pencil behind the ear.
export function PlanScene({ className = '' }) {
  const pencil = (
    <g transform="rotate(-35 104 26)">
      <rect x="96" y="20" width="34" height="9" rx="2" fill={C.gold} {...LINE} strokeWidth="2.2" />
      <path d="M130 20 l10 4.5 -10 4.5 Z" fill={C.cream} {...LINE} strokeWidth="2.2" />
      <rect x="90" y="20" width="7" height="9" rx="2" fill={C.blush} {...LINE} strokeWidth="2.2" />
    </g>
  )
  return (
    <svg className={`illo scene ${className}`} viewBox="0 0 220 210" aria-hidden="true" focusable="false">
      <Shadow cx="100" cy="200" rx="60" />
      <Character x={24} y={6} eyes="open" arms="hold" hat={pencil} item={<ClipboardItem />} />
      <Sparkle x={196} y={50} size={0.8} />
    </svg>
  )
}

// My Profile cover: graduation cap and a diploma.
export function GradScene({ className = '' }) {
  const cap = (
    <g>
      <path d="M50 30 v12 q22 12 44 0 v-12" fill={C.navySoft} stroke={C.ink} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M30 26 L72 8 L114 24 L72 42 Z" fill={C.ink} stroke={C.ink} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M72 25 q22 0 30 18" fill="none" stroke={C.gold} strokeWidth="3" strokeLinecap="round" />
      <path d="M102 43 l-3 9 h7 Z" fill={C.gold} stroke={C.ink} strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="72" cy="25" r="3" fill={C.gold} />
    </g>
  )
  const diploma = (
    <g transform="rotate(-12 74 140)">
      <rect x="40" y="132" width="68" height="16" rx="8" fill="#ffffff" {...LINE} strokeWidth="2.4" />
      <ellipse cx="44" cy="140" rx="5" ry="8" fill={C.cream} {...LINE} strokeWidth="2" />
      <path d="M72 132 v16" stroke={C.red} strokeWidth="5" />
      <path d="M70 148 l-3 8 M74 148 l3 8" stroke={C.red} strokeWidth="3" strokeLinecap="round" />
    </g>
  )
  return (
    <svg className={`illo scene ${className}`} viewBox="0 0 220 210" aria-hidden="true" focusable="false">
      <Character x={24} y={8} eyes="happy" arms="hold" hat={cap} item={diploma} />
      <Sparkle x={194} y={44} size={0.9} />
      <Sparkle x={26} y={60} size={0.6} />
    </svg>
  )
}

// Settings: tinkering with a wrench next to a gear.
export function TinkerScene({ className = '' }) {
  const wrench = (
    <g transform="translate(12 64) rotate(-20)">
      <rect x="-6" y="-46" width="12" height="54" rx="5" fill="#c9d3e0" {...LINE} strokeWidth="2.4" />
      <path d="M-13 -46 a14 14 0 1 1 26 0 l-6 -2 -3 8 h-8 l-3 -8 Z" fill="#c9d3e0" {...LINE} strokeWidth="2.4" />
    </g>
  )
  return (
    <svg className={`illo scene ${className}`} viewBox="0 0 240 210" aria-hidden="true" focusable="false">
      <Shadow cx="116" cy="200" rx="60" />
      <g className="scene-gear" transform="translate(206 154)">
        <path
          d="M-4 -30 h8 l2 7 a24 24 0 0 1 6 2.6 l6.4 -3.6 5.6 5.6 -3.6 6.4 a24 24 0 0 1 2.6 6 l7 2 v8 l-7 2 a24 24 0 0 1 -2.6 6 l3.6 6.4 -5.6 5.6 -6.4 -3.6 a24 24 0 0 1 -6 2.6 l-2 7 h-8 l-2 -7 a24 24 0 0 1 -6 -2.6 l-6.4 3.6 -5.6 -5.6 3.6 -6.4 a24 24 0 0 1 -2.6 -6 l-7 -2 v-8 l7 -2 a24 24 0 0 1 2.6 -6 l-3.6 -6.4 5.6 -5.6 6.4 3.6 a24 24 0 0 1 6 -2.6 Z"
          fill={C.gold}
          {...LINE}
          strokeWidth="2.6"
        />
        <circle r="9" fill={C.cream} {...LINE} strokeWidth="2.6" />
      </g>
      <Character x={30} y={6} eyes="open" arms="wave" item={wrench} />
    </svg>
  )
}

// Searching with a magnifying glass (nothing found).
export function SearchScene({ className = '' }) {
  const glass = (
    <g transform="translate(12 64) rotate(-25)">
      <rect x="-4" y="-6" width="8" height="30" rx="4" fill={C.navySoft} {...LINE} strokeWidth="2.4" />
      <circle cx="0" cy="-22" r="17" fill="rgba(232,237,244,0.75)" {...LINE} strokeWidth="3" />
      <path d="M-8 -28 a10 10 0 0 1 8 -5" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
    </g>
  )
  return (
    <svg className={`illo scene ${className}`} viewBox="-10 -14 220 226" aria-hidden="true" focusable="false">
      <Shadow cx="110" cy="202" rx="58" />
      <Character x={30} y={6} eyes="open" arms="wave" item={glass} tilt={6} />
      <text x="176" y="40" fontFamily="'Bricolage Grotesque', sans-serif" fontWeight="800" fontSize="30" fill={C.gold} stroke={C.ink} strokeWidth="1.4">?</text>
    </svg>
  )
}

// Fast asleep (coming soon, ending a session).
export function SleepScene({ className = '' }) {
  return (
    <svg className={`illo scene ${className}`} viewBox="0 0 220 212" aria-hidden="true" focusable="false">
      <Shadow cx="100" cy="202" rx="58" />
      <Character x={24} y={6} eyes="sleep" arms="down" tilt={-8} />
      <g fontFamily="'Bricolage Grotesque', sans-serif" fontWeight="800" fill={C.navySoft}>
        <text x="150" y="40" fontSize="24">z</text>
        <text x="168" y="24" fontSize="18">z</text>
        <text x="182" y="12" fontSize="13">z</text>
      </g>
    </svg>
  )
}

// Puzzled, with a question mark (time conflicts).
export function ThinkScene({ className = '' }) {
  return (
    <svg className={`illo scene ${className}`} viewBox="0 0 220 212" aria-hidden="true" focusable="false">
      <Shadow cx="100" cy="202" rx="58" />
      <Character x={24} y={6} eyes="open" arms="down" tilt={-6} />
      <g>
        <circle cx="180" cy="34" r="22" fill={C.goldTint} {...LINE} strokeWidth="2.6" />
        <text x="180" y="44" textAnchor="middle" fontFamily="'Bricolage Grotesque', sans-serif" fontWeight="800" fontSize="28" fill={C.ink}>?</text>
      </g>
      <Sparkle x={150} y={70} size={0.55} />
    </svg>
  )
}
