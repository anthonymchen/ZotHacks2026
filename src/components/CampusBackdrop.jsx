// Decorative background: a dusk sky (faint pattern of books, lightbulbs and
// paw prints, a moon and twinkling stars) behind every page, plus a gold
// line-art campus with a little anteater strolling along the path at the
// bottom of each page. Original artwork; purely decorative.
// Turn it off in Settings → Appearance → Campus Background.
import './CampusBackdrop.css'

function WalkingAnteater() {
  return (
    <g className="bd-walker">
      <g transform="scale(1.45)">
      <g className="bd-bob">
        {/* tail */}
        <path className="bd-gold" d="M-46 -26 C-70 -40 -76 -10 -60 2 C-54 7 -44 4 -40 -4" />
        {/* body */}
        <path className="bd-gold" d="M-44 -6 C-46 -30 -18 -40 6 -34 C22 -30 30 -22 34 -16" />
        <path className="bd-gold" d="M-44 -6 C-38 4 -10 6 14 2 C24 0 30 -6 34 -10" />
        {/* head and long snout */}
        <path className="bd-gold" d="M34 -16 C40 -22 50 -20 54 -16 L84 -7 C86 -6 86 -4 84 -4 L50 -6 C44 -6 38 -8 34 -10" />
        <circle className="bd-gold-fill" cx="46" cy="-15" r="1.6" />
        <path className="bd-gold" d="M40 -20 C40 -26 44 -27 45 -22" />
        {/* stripe */}
        <path className="bd-gold" d="M-6 -36 C2 -24 10 -16 22 -10" />
        {/* legs */}
        <g className="bd-leg bd-leg-a">
          <path className="bd-gold" d="M-28 0 L-30 14" />
          <path className="bd-gold" d="M18 0 L20 14" />
        </g>
        <g className="bd-leg bd-leg-b">
          <path className="bd-gold" d="M-18 2 L-16 14" />
          <path className="bd-gold" d="M8 2 L6 14" />
        </g>
        {/* tiny book under the arm */}
        <rect className="bd-gold" x="12" y="-12" width="10" height="8" rx="1" />
      </g>
      </g>
    </g>
  )
}

export default function CampusBackdrop() {
  return (
    <div className="campus-backdrop" aria-hidden="true">
      <svg className="bd-pattern" width="100%" height="100%">
        <defs>
          <pattern id="bd-icons" width="180" height="180" patternUnits="userSpaceOnUse">
            {/* open book */}
            <path className="bd-pat" d="M20 40 C30 34 40 34 48 40 C56 34 66 34 76 40 V66 C66 60 56 60 48 66 C40 60 30 60 20 66 Z M48 40 V66" />
            {/* lightbulb */}
            <path className="bd-pat" d="M128 108 C128 96 146 96 146 108 C146 116 140 118 140 124 H134 C134 118 128 116 128 108 Z M134 128 H140" />
            <path className="bd-pat" d="M137 88 V84 M152 94 L155 91 M122 94 L119 91" />
            {/* paw print */}
            <circle className="bd-pat" cx="52" cy="140" r="7" />
            <circle className="bd-pat" cx="40" cy="126" r="3" />
            <circle className="bd-pat" cx="50" cy="121" r="3" />
            <circle className="bd-pat" cx="61" cy="123" r="3" />
            {/* sparkle */}
            <path className="bd-pat" d="M136 30 V46 M128 38 H144" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bd-icons)" />
      </svg>

      <svg className="bd-scene" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
        <defs>
          <radialGradient id="bd-glow" cx="78%" cy="18%" r="45%">
            <stop offset="0%" className="bd-glow-stop-a" />
            <stop offset="100%" className="bd-glow-stop-b" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#bd-glow)" />

        {/* moon and stars */}
        <path className="bd-gold" d="M1150 120 A46 46 0 1 0 1196 182 A36 36 0 1 1 1150 120 Z" />
        <g>
          <circle className="bd-star" cx="703" cy="117" r="1.6" style={{ animationDelay: '3.9s' }} />
          <circle className="bd-star" cx="188" cy="460" r="2.2" style={{ animationDelay: '0.6s' }} />
          <circle className="bd-star" cx="1233" cy="69" r="2.2" style={{ animationDelay: '1.3s' }} />
          <circle className="bd-star" cx="216" cy="262" r="1.6" style={{ animationDelay: '0.4s' }} />
          <circle className="bd-star" cx="225" cy="322" r="1.6" style={{ animationDelay: '0.4s' }} />
          <circle className="bd-star" cx="1198" cy="103" r="1.2" style={{ animationDelay: '3.8s' }} />
          <circle className="bd-star" cx="1233" cy="71" r="2.2" style={{ animationDelay: '3.5s' }} />
          <circle className="bd-star" cx="141" cy="153" r="1.2" style={{ animationDelay: '3.3s' }} />
          <circle className="bd-star" cx="312" cy="188" r="1.6" style={{ animationDelay: '0.9s' }} />
          <circle className="bd-star" cx="281" cy="332" r="1.6" style={{ animationDelay: '3.4s' }} />
          <circle className="bd-star" cx="410" cy="92" r="2.2" style={{ animationDelay: '3.4s' }} />
          <circle className="bd-star" cx="424" cy="230" r="1.2" style={{ animationDelay: '3.3s' }} />
          <circle className="bd-star" cx="168" cy="328" r="1.2" style={{ animationDelay: '3.7s' }} />
          <circle className="bd-star" cx="1056" cy="388" r="2.2" style={{ animationDelay: '2.6s' }} />
          <circle className="bd-star" cx="683" cy="278" r="2.2" style={{ animationDelay: '5.5s' }} />
          <circle className="bd-star" cx="780" cy="193" r="1.2" style={{ animationDelay: '4.8s' }} />
          <circle className="bd-star" cx="539" cy="81" r="2.2" style={{ animationDelay: '1.8s' }} />
          <circle className="bd-star" cx="1053" cy="215" r="2.2" style={{ animationDelay: '2.7s' }} />
          <circle className="bd-star" cx="1287" cy="77" r="1.2" style={{ animationDelay: '3.1s' }} />
          <circle className="bd-star" cx="377" cy="427" r="1.6" style={{ animationDelay: '0.9s' }} />
          <circle className="bd-star" cx="1041" cy="255" r="1.2" style={{ animationDelay: '5.8s' }} />
          <circle className="bd-star" cx="198" cy="431" r="2.2" style={{ animationDelay: '3.4s' }} />
          <circle className="bd-star" cx="682" cy="214" r="2.2" style={{ animationDelay: '2.1s' }} />
          <circle className="bd-star" cx="1057" cy="336" r="1.6" style={{ animationDelay: '0.4s' }} />
          <circle className="bd-star" cx="231" cy="178" r="1.6" style={{ animationDelay: '4.2s' }} />
          <circle className="bd-star" cx="173" cy="71" r="2.2" style={{ animationDelay: '4.2s' }} />
          <circle className="bd-star" cx="1365" cy="335" r="2.2" style={{ animationDelay: '4.9s' }} />
          <circle className="bd-star" cx="622" cy="406" r="1.6" style={{ animationDelay: '5.3s' }} />
          <circle className="bd-star" cx="750" cy="51" r="1.6" style={{ animationDelay: '2.1s' }} />
          <circle className="bd-star" cx="1291" cy="99" r="1.6" style={{ animationDelay: '0.4s' }} />
          <circle className="bd-star" cx="628" cy="106" r="2.2" style={{ animationDelay: '1.5s' }} />
          <circle className="bd-star" cx="840" cy="294" r="1.2" style={{ animationDelay: '1.0s' }} />
          <circle className="bd-star" cx="862" cy="321" r="1.6" style={{ animationDelay: '5.3s' }} />
          <circle className="bd-star" cx="921" cy="321" r="1.6" style={{ animationDelay: '4.2s' }} />
        </g>

      </svg>
    </div>
  )
}

// The campus itself, shown at the bottom of every page (below the content)
// so it's always fully visible when you scroll down.
export function CampusSkyline() {
  return (
    <div className="campus-skyline" aria-hidden="true">
      <svg viewBox="0 500 1440 400" preserveAspectRatio="xMidYMax slice">
        {/* distant hills */}
        <path className="bd-line" d="M0 790 C180 750 320 770 480 752 C660 732 820 772 980 756 C1140 740 1300 768 1440 750" />

        {/* library with columns */}
        <g className="bd-line">
          <path d="M170 860 V720 H430 V860" />
          <path d="M160 720 L300 664 L440 720 Z" />
          <path d="M196 730 V850 M232 730 V850 M268 730 V850 M332 730 V850 M368 730 V850 M404 730 V850" />
          <path d="M282 860 V790 C282 774 318 774 318 790 V860" />
          <path d="M150 860 H450 M160 852 H440" />
        </g>
        <circle className="bd-gold" cx="300" cy="700" r="9" />

        {/* clock tower */}
        <g className="bd-line">
          <path d="M560 860 V600 H616 V860" />
          <path d="M552 600 L588 548 L624 600" />
          <path d="M588 548 V522" />
          <path d="M574 700 H602 V730 H574 Z M574 770 H602 V800 H574 Z" />
        </g>
        <circle className="bd-gold" cx="588" cy="636" r="14" />
        <path className="bd-gold" d="M588 636 V626 M588 636 L595 640" />

        {/* modern hall with window grid */}
        <g className="bd-line">
          <path d="M680 860 V730 H900 V860" />
          <path d="M680 730 L900 712" />
          <path d="M710 760 H870 M710 790 H870 M710 820 H870" />
          <path d="M740 750 V840 M780 750 V840 M820 750 V840 M860 750 V840" />
        </g>

        {/* domed building */}
        <g className="bd-line">
          <path d="M980 860 V760 H1160 V860" />
          <path d="M1000 760 C1000 690 1140 690 1140 760" />
          <path d="M1070 696 V676" />
          <path d="M1010 790 H1130 M1040 790 V860 M1100 790 V860" />
        </g>
        <circle className="bd-gold" cx="1070" cy="672" r="5" />

        {/* trees */}
        <g className="bd-line">
          <path d="M100 860 V808" />
          <circle cx="100" cy="790" r="26" />
          <path d="M484 860 V812" />
          <circle cx="484" cy="796" r="22" />
          <path d="M640 860 V800" />
          <path d="M640 800 C626 790 616 792 606 798 M640 800 C652 786 664 786 674 792 M640 800 C636 784 640 774 648 770" />
          <path d="M942 860 V806" />
          <circle cx="942" cy="788" r="24" />
          <path d="M1220 860 V800" />
          <path d="M1220 800 C1206 790 1196 792 1186 798 M1220 800 C1232 786 1244 786 1254 792 M1220 800 C1216 784 1220 774 1228 770" />
          <path d="M1330 860 V812" />
          <circle cx="1330" cy="794" r="22" />
        </g>

        {/* lamp posts with warm light */}
        <g className="bd-line">
          <path d="M530 860 V808 M1190 860 V808" />
        </g>
        <circle className="bd-lamp" cx="530" cy="804" r="5" />
        <circle className="bd-lamp" cx="1190" cy="804" r="5" />

        {/* path */}
        <path className="bd-line" d="M0 872 H1440" />
        <path className="bd-line bd-dash" d="M0 884 H1440" />

        <g transform="translate(0 852)">
          <WalkingAnteater />
        </g>
      </svg>
    </div>
  )
}
