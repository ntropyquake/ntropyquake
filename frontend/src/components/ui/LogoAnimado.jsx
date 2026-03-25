import { useEffect, useRef } from 'react'
import $ from 'jquery'

const ROJO = '#E24B4A'
const AZUL = '#1A56DB'
const LETRAS = 'tropyquake'.split('')

export default function LogoAnimado() {
  const containerRef = useRef(null)
  const symbolRef   = useRef(null)
  const waveRef     = useRef(null)
  const rafRef      = useRef(null)

  // ── Onda de entropía animada — manipulación directa del DOM (sin re-renders) ──
  useEffect(() => {
    let t = 0
    const loop = () => {
      t += 0.038
      if (waveRef.current) {
        const pts = []
        for (let x = 0; x <= 38; x++) {
          const y = 19 + Math.sin((x / 38) * Math.PI * 4.5 + t) * 3.2
          pts.push(`${x},${y.toFixed(2)}`)
        }
        waveRef.current.setAttribute('points', pts.join(' '))
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    // Empieza tras el trazo del símbolo N
    const delay = setTimeout(() => { rafRef.current = requestAnimationFrame(loop) }, 950)
    return () => { clearTimeout(delay); cancelAnimationFrame(rafRef.current) }
  }, [])

  // ── jQuery: paralaje suave al mover el cursor sobre el logo ──────────────────
  useEffect(() => {
    if (!containerRef.current || !symbolRef.current) return
    const $c   = $(containerRef.current)
    const $sym = $(symbolRef.current)

    $c.on('mousemove.logo', function (e) {
      const r = this.getBoundingClientRect()
      const dx = ((e.clientX - r.left) / r.width  - 0.5) * 8
      const dy = ((e.clientY - r.top)  / r.height - 0.5) * 5
      $sym.css('transform', `translate(${dx}px, ${dy}px) scale(1.04)`)
    })
    $c.on('mouseleave.logo', function () {
      $sym.css('transform', '')
    })

    return () => $c.off('.logo')
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ display: 'flex', alignItems: 'center', gap: '7px', userSelect: 'none', cursor: 'default' }}
    >
      {/* ── Símbolo N vectorial ──────────────────────────────────────────── */}
      <svg
        ref={symbolRef}
        width="38" height="38"
        viewBox="0 0 38 38"
        fill="none"
        style={{ flexShrink: 0, transition: 'transform 0.28s ease' }}
      >
        <defs>
          <linearGradient id="lgDiag" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={ROJO} />
            <stop offset="100%" stopColor={AZUL} />
          </linearGradient>
          <clipPath id="lgClip">
            <rect x="5" y="5" width="28" height="28" />
          </clipPath>
        </defs>

        {/* Fondo oscuro del símbolo para contraste con el fondo satelital */}
        <circle cx="19" cy="19" r="17.5" fill="rgba(0,0,0,0.52)" />

        {/* Anillos decorativos */}
        <circle cx="19" cy="19" r="17.5" stroke={`${ROJO}30`} strokeWidth="0.7" />
        <circle cx="19" cy="19" r="17.5" stroke={`${AZUL}25`} strokeWidth="0.5" strokeDasharray="3 5" />

        {/* Onda de entropía — puntos actualizados con rAF */}
        <polyline
          ref={waveRef}
          points="0,19 38,19"
          fill="none"
          stroke="rgba(255,255,255,0.32)"
          strokeWidth="1"
          clipPath="url(#lgClip)"
        />

        {/* N — trazo izquierdo (rojo) */}
        <path
          d="M 11 9 L 11 29"
          stroke={ROJO}
          strokeWidth="2.3"
          strokeLinecap="round"
          style={{
            strokeDasharray: 20,
            strokeDashoffset: 20,
            animation: 'lgDraw 0.38s ease 0.18s forwards',
          }}
        />
        {/* N — diagonal (gradiente rojo→azul) */}
        <path
          d="M 11 9 L 27 29"
          stroke="url(#lgDiag)"
          strokeWidth="2.1"
          strokeLinecap="round"
          style={{
            strokeDasharray: 27,
            strokeDashoffset: 27,
            animation: 'lgDraw 0.48s ease 0.32s forwards',
          }}
        />
        {/* N — trazo derecho (azul) */}
        <path
          d="M 27 9 L 27 29"
          stroke={AZUL}
          strokeWidth="2.3"
          strokeLinecap="round"
          style={{
            strokeDasharray: 20,
            strokeDashoffset: 20,
            animation: 'lgDraw 0.38s ease 0.48s forwards',
          }}
        />

        {/* Puntos de acento en esquinas del N */}
        <circle cx="11" cy="9"  r="1.6" fill={ROJO} opacity="0"
          style={{ animation: 'lgFade 0.25s ease 0.65s forwards' }} />
        <circle cx="27" cy="29" r="1.6" fill={AZUL} opacity="0"
          style={{ animation: 'lgFade 0.25s ease 0.75s forwards' }} />
        <circle cx="11" cy="29" r="0.9" fill={`${ROJO}60`} opacity="0"
          style={{ animation: 'lgFade 0.2s ease 0.85s forwards' }} />
        <circle cx="27" cy="9"  r="0.9" fill={`${AZUL}60`} opacity="0"
          style={{ animation: 'lgFade 0.2s ease 0.9s forwards' }} />
      </svg>

      {/* ── Bloque de texto ───────────────────────────────────────────────── */}
      <div style={{ lineHeight: 1.15 }}>
        {/* Nombre */}
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{
            fontSize: '19px', fontWeight: 800,
            color: ROJO, letterSpacing: '-0.5px',
            fontFamily: 'sans-serif',
            animation: 'lgFade 0.3s ease 0.15s both',
            opacity: 0,
          }}>N</span>
          {LETRAS.map((l, i) => (
            <span key={i} style={{
              fontSize: '17px', fontWeight: 600,
              color: 'white', fontFamily: 'sans-serif',
              opacity: 0,
              animation: `lgLetterUp 0.22s ease ${0.52 + i * 0.052}s both`,
            }}>{l}</span>
          ))}
        </div>
        {/* Subtítulo */}
        <div style={{
          fontSize: '8px', letterSpacing: '2px',
          fontWeight: 600,
          color: `${ROJO}CC`, fontFamily: 'sans-serif',
          textShadow: '0 0 6px rgba(0,0,0,1), 0 1px 3px rgba(0,0,0,1), -1px -1px 0 rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,0.8)',
          opacity: 0,
          animation: 'lgFade 0.55s ease 1.35s both',
        }}>
          BEHAVIOR FLOW ANALYSIS
        </div>
      </div>

      <style>{`
        @keyframes lgDraw     { to { stroke-dashoffset: 0; } }
        @keyframes lgFade     { to { opacity: 1; } }
        @keyframes lgLetterUp {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
