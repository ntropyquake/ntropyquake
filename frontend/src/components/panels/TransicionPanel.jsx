import { useState, useEffect, useRef } from 'react'

const COLOR_JARA = '#E24B4A'
const COLOR_KAST = '#1A56DB'

const CANDIDATOS_ELIMINADOS = [
  { sigla: 'PARISI',  nombre: 'Parisi' },
  { sigla: 'KAISER',  nombre: 'Kaiser' },
  { sigla: 'MATTHEI', nombre: 'Matthei' },
  { sigla: 'MAYNE',   nombre: 'Mayne' },
  { sigla: 'MEO',     nombre: 'MEO' },
  { sigla: 'ARTES',   nombre: 'Artes' },
]

function generarEscenario(pcts1v, jara2v) {
  const jaraBase = pcts1v['JARA'] || 0
  const kastBase = pcts1v['KAST'] || 0
  const elimPcts = CANDIDATOS_ELIMINADOS.map(c => pcts1v[c.sigla] || 0)
  const total = jaraBase + kastBase + elimPcts.reduce((s, v) => s + v, 0)
  const target = (total * jara2v / 100) - jaraBase
  const solverIdx = elimPcts.indexOf(Math.max(...elimPcts))
  const otherIdxs = elimPcts.map((_, i) => i).filter(i => i !== solverIdx)
  for (let a = 0; a < 1000; a++) {
    const T = new Array(6).fill(0)
    let sum = 0
    for (const idx of otherIdxs) { T[idx] = Math.random(); sum += T[idx] * elimPcts[idx] }
    if (elimPcts[solverIdx] > 0) {
      T[solverIdx] = (target - sum) / elimPcts[solverIdx]
      if (T[solverIdx] >= 0 && T[solverIdx] <= 1) return T.map(t => Math.round(t * 100))
    }
  }
  return CANDIDATOS_ELIMINADOS.map(() => Math.round(jara2v))
}

function estimarEscenarios(pcts1v, jara2v) {
  const jaraBase = pcts1v['JARA'] || 0
  const kastBase = pcts1v['KAST'] || 0
  const elimPcts = CANDIDATOS_ELIMINADOS.map(c => pcts1v[c.sigla] || 0)
  const total = jaraBase + kastBase + elimPcts.reduce((s, v) => s + v, 0)
  const target = (total * jara2v / 100) - jaraBase
  const solverIdx = elimPcts.indexOf(Math.max(...elimPcts))
  const otherIdxs = elimPcts.map((_, i) => i).filter(i => i !== solverIdx)
  let valid = 0
  const N = 3000
  for (let i = 0; i < N; i++) {
    let sum = 0
    for (const idx of otherIdxs) sum += Math.random() * elimPcts[idx]
    if (elimPcts[solverIdx] > 0) {
      const T = (target - sum) / elimPcts[solverIdx]
      if (T >= 0 && T <= 1) valid++
    }
  }
  return Math.max(1000000, Math.round((valid / N) * Math.pow(101, 5)))
}

export default function TransicionPanel({ comuna, visible, onSimular }) {
  const [tab, setTab] = useState('generado')
  const [pcts1v, setPcts1v] = useState({})
  const [pcts2v, setPcts2v] = useState({})
  const [escenario, setEscenario] = useState(null)
  const [numEscenarios, setNumEscenarios] = useState(0)
  const [displayNum, setDisplayNum] = useState(0)
  const [fase, setFase] = useState('idle')
  const [sliders, setSliders] = useState(
    Object.fromEntries(CANDIDATOS_ELIMINADOS.map(c => [c.sigla, 50]))
  )
  const timerRef = useRef(null)
  const generadoParaRef = useRef(null)

  // Reset cuando el panel se cierra
  useEffect(() => {
    if (!visible) {
      generadoParaRef.current = null
      setFase('idle')
      setDisplayNum(0)
    }
  }, [visible])

  // Reset cuando cambia la comuna
  useEffect(() => {
    generadoParaRef.current = null
    setFase('idle')
    setEscenario(null)
    setDisplayNum(0)
  }, [comuna?.cut])

  useEffect(() => {
    if (!comuna?.resultados1v?.length) return
    const map = {}
    for (const r of comuna.resultados1v) map[r.candidato_sigla] = r.porcentaje
    setPcts1v(map)
  }, [comuna?.cut, comuna?.resultados1v])

  useEffect(() => {
    if (!comuna?.resultados2v?.length) return
    const map = {}
    for (const r of comuna.resultados2v) map[r.candidato_sigla] = r.porcentaje
    setPcts2v(map)
  }, [comuna?.cut, comuna?.resultados2v])

  useEffect(() => {
    const key = comuna?.cut
    if (!visible || !key || !Object.keys(pcts1v).length || !pcts2v.JARA) return
    if (generadoParaRef.current === key) return
    generadoParaRef.current = key
    lanzarAnimacion(pcts1v, pcts2v.JARA)
  }, [visible, pcts1v, pcts2v, comuna?.cut])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const lanzarAnimacion = (p1v, jara2v) => {
    const n = estimarEscenarios(p1v, jara2v)
    setNumEscenarios(n)
    setDisplayNum(0)
    setFase('analizando')
    clearTimeout(timerRef.current)

    // Fase 1: analizando (1200ms con orb)
    timerRef.current = setTimeout(() => {
      setFase('contando')
      let step = 0
      const steps = 80
      const duration = 4300
      const iv = setInterval(() => {
        step++
        // easing cuadrático — arranca lento, acelera al final
        const t = step / steps
        setDisplayNum(Math.round(n * t * t))
        if (step >= steps) {
          clearInterval(iv)
          setDisplayNum(n)
          setFase('colapsando')
          timerRef.current = setTimeout(() => {
            const esc = generarEscenario(p1v, jara2v)
            setEscenario(esc)
            setSliders(Object.fromEntries(CANDIDATOS_ELIMINADOS.map((c, i) => [c.sigla, esc[i]])))
            setFase('listo')
          }, 500)
        }
      }, duration / steps)
    }, 1200)
  }

  const handleRegenerar = () => {
    if (!pcts2v.JARA) return
    lanzarAnimacion(pcts1v, pcts2v.JARA)
  }

  const handleUsarComoBase = () => {
    if (escenario)
      setSliders(Object.fromEntries(CANDIDATOS_ELIMINADOS.map((c, i) => [c.sigla, escenario[i]])))
    setTab('manual')
  }

  const calcularManual = () => {
    const jaraBase = pcts1v['JARA'] || 0
    const kastBase = pcts1v['KAST'] || 0
    let je = 0, ke = 0
    for (const c of CANDIDATOS_ELIMINADOS) {
      const p = pcts1v[c.sigla] || 0
      je += p * (sliders[c.sigla] / 100)
      ke += p * (1 - sliders[c.sigla] / 100)
    }
    const total = jaraBase + kastBase + CANDIDATOS_ELIMINADOS.reduce((s, c) => s + (pcts1v[c.sigla] || 0), 0)
    return { jara: (jaraBase + je) / total * 100, kast: (kastBase + ke) / total * 100 }
  }

  if (!visible) return null
  const resultadoManual = calcularManual()

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.93)', borderTop: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(16px)', padding: 'clamp(8px, 2vw, 10px) clamp(12px, 4vw, 20px) 14px',
      fontFamily: 'sans-serif', animation: 'slideUp 0.25s ease-out',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '10px', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)' }}>
          TRANSICIÓN DE VOTOS — 2ª VUELTA
          {comuna?.nombre && <span style={{ color: 'rgba(255,255,255,0.2)', marginLeft: '8px' }}>{comuna.nombre}</span>}
        </span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Leyenda color={COLOR_JARA} label="JARA" />
          <Leyenda color={COLOR_KAST} label="KAST" />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
        {[['generado', 'FLUJO GENERADO'], ['manual', 'FLUJO MANUAL']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '4px 14px', borderRadius: '4px', cursor: 'pointer',
            border: `1px solid ${tab === key ? 'rgba(226,75,74,0.6)' : 'rgba(255,255,255,0.1)'}`,
            background: tab === key ? 'rgba(226,75,74,0.12)' : 'transparent',
            color: tab === key ? 'white' : 'rgba(255,255,255,0.35)',
            fontSize: '10px', letterSpacing: '1px',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'generado'
        ? <TabGenerado fase={fase} escenario={escenario} numEscenarios={numEscenarios}
            displayNum={displayNum} pcts1v={pcts1v} pcts2v={pcts2v}
            onRegenerar={handleRegenerar} onUsarComoBase={handleUsarComoBase} />
        : <TabManual pcts1v={pcts1v} sliders={sliders} setSliders={setSliders}
            resultado={resultadoManual}
            onSimular={() => onSimular?.({ sliders, resultado: resultadoManual })} />
      }

      <style>{`
        .tp-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px 24px;
        }
        .tp-acciones {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .tp-vs {
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          flex-shrink: 0;
        }
        .tp-btns {
          margin-left: auto;
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        @media (max-width: 520px) {
          .tp-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 4px 12px;
          }
          .tp-acciones {
            flex-wrap: wrap;
            gap: 8px;
          }
          .tp-btns {
            margin-left: 0;
            width: 100%;
            justify-content: flex-end;
          }
        }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulso { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes quantumColor {
          0%   { background:${COLOR_JARA}; box-shadow:0 0 18px ${COLOR_JARA}99,0 0 40px ${COLOR_JARA}44; }
          50%  { background:${COLOR_KAST}; box-shadow:0 0 18px ${COLOR_KAST}99,0 0 40px ${COLOR_KAST}44; }
          100% { background:${COLOR_JARA}; box-shadow:0 0 18px ${COLOR_JARA}99,0 0 40px ${COLOR_JARA}44; }
        }
        @keyframes waveRojo {
          0%   { width:0;height:0;opacity:0.7;border-color:${COLOR_JARA};margin:0; }
          100% { width:90px;height:90px;opacity:0;border-color:${COLOR_JARA};margin:-45px; }
        }
        @keyframes waveAzul {
          0%   { width:0;height:0;opacity:0.7;border-color:${COLOR_KAST};margin:0; }
          100% { width:90px;height:90px;opacity:0;border-color:${COLOR_KAST};margin:-45px; }
        }
        @keyframes quantumCollapse {
          0%   { transform:scale(1);opacity:1; }
          40%  { transform:scale(3.5);opacity:0.8;background:white;box-shadow:0 0 40px white; }
          100% { transform:scale(0);opacity:0; }
        }
        @keyframes litoBars { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:translateY(0);} }
        input[type=range].bicolor-slider { -webkit-appearance:none;width:100%;height:4px;border-radius:2px;outline:none;cursor:pointer; }
        input[type=range].bicolor-slider::-webkit-slider-thumb { -webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:white;border:1.5px solid rgba(255,255,255,0.5);cursor:pointer; }
      `}</style>
    </div>
  )
}

function OrbQuantica({ fase, displayNum, numEscenarios }) {
  const colapsando = fase === 'colapsando'
  const contando = fase === 'contando'
  const analizando = fase === 'analizando'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0 10px', gap: '10px' }}>
      {/* Orb + waves container */}
      <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Ondas alternando rojo/azul */}
        {!colapsando && [
          { color: 'Rojo', delay: '0s' },
          { color: 'Azul', delay: '0.52s' },
          { color: 'Rojo', delay: '1.04s' },
          { color: 'Azul', delay: '1.56s' },
        ].map((w, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            border: '1.5px solid',
            animation: `wave${w.color} 2.08s ease-out ${w.delay} infinite`,
          }} />
        ))}

        {/* Orb central */}
        <div style={{
          width: '16px', height: '16px', borderRadius: '50%', zIndex: 2, position: 'relative',
          animation: colapsando
            ? 'quantumCollapse 0.45s ease-out forwards'
            : 'quantumColor 1.6s ease-in-out infinite',
        }} />
      </div>

      {/* Contador */}
      {(contando || colapsando) && (
        <div style={{ fontSize: '22px', fontWeight: '600', color: 'white', fontVariantNumeric: 'tabular-nums', letterSpacing: '1px', lineHeight: 1 }}>
          {displayNum.toLocaleString('es-CL')}
        </div>
      )}

      {/* Texto */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '10px', letterSpacing: '1.8px', color: 'rgba(255,255,255,0.4)',
          animation: analizando ? 'pulso 1.5s ease-in-out infinite' : 'none',
        }}>
          {analizando ? 'ANALIZANDO ESPACIO DE SOLUCIONES' : 'GENERANDO ESCENARIO'}
        </div>
        {numEscenarios > 0 && (
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.22)', letterSpacing: '1px', marginTop: '4px' }}>
            ENTRE {numEscenarios.toLocaleString('es-CL')} FLUJOS PLAUSIBLES
          </div>
        )}
      </div>
    </div>
  )
}

function TabGenerado({ fase, escenario, numEscenarios, displayNum, pcts1v, pcts2v, onRegenerar, onUsarComoBase }) {
  const mostrarOrb = fase === 'analizando' || fase === 'contando' || fase === 'colapsando'

  return (
    <>
      {mostrarOrb && <OrbQuantica fase={fase} displayNum={displayNum} numEscenarios={numEscenarios} />}

      {fase === 'listo' && (
        <div style={{ animation: 'litoBars 0.4s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', minWidth: 0 }}>
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '1px', flexShrink: 0 }}>
              ESC. 1 DE {numEscenarios.toLocaleString('es-CL')}
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)', minWidth: '8px' }} />
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.5px', flexShrink: 0 }}>SERVEL</span>
          </div>

          <div className="tp-grid" style={{ marginBottom: '10px' }}>
            {CANDIDATOS_ELIMINADOS.map((c, i) => (
              <BarraEstatica key={c.sigla} sigla={c.sigla} pctReal={pcts1v[c.sigla]} val={escenario?.[i] ?? 50} />
            ))}
          </div>

          <div className="tp-acciones">
            <ResultadoCard label="JARA" color={COLOR_JARA} pct={pcts2v.JARA || 0}
              gana={(pcts2v.JARA || 0) > (pcts2v.KAST || 0)} etiqueta="SERVEL" />
            <span className="tp-vs">VS</span>
            <ResultadoCard label="KAST" color={COLOR_KAST} pct={pcts2v.KAST || 0}
              gana={(pcts2v.KAST || 0) > (pcts2v.JARA || 0)} etiqueta="SERVEL" />
            <div className="tp-btns">
              <BtnAccion onClick={onRegenerar} outline>REGENERAR</BtnAccion>
              <BtnAccion onClick={onUsarComoBase}>USAR COMO BASE</BtnAccion>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function TabManual({ pcts1v, sliders, setSliders, resultado, onSimular }) {
  const jaraGana = resultado.jara > resultado.kast
  return (
    <>
      <div className="tp-grid">
        {CANDIDATOS_ELIMINADOS.map(c => (
          <SliderRow key={c.sigla} sigla={c.sigla} pctReal={pcts1v[c.sigla]} val={sliders[c.sigla]}
            onChange={v => setSliders(prev => ({ ...prev, [c.sigla]: parseInt(v) }))} />
        ))}
      </div>
      <div className="tp-acciones" style={{ marginTop: '10px' }}>
        <ResultadoCard label="JARA" color={COLOR_JARA} pct={resultado.jara} gana={jaraGana} etiqueta="PROYECCIÓN" />
        <span className="tp-vs">VS</span>
        <ResultadoCard label="KAST" color={COLOR_KAST} pct={resultado.kast} gana={!jaraGana} etiqueta="PROYECCIÓN" />
        <div className="tp-btns">
          <BtnAccion onClick={onSimular}>APLICAR AL MAPA</BtnAccion>
        </div>
      </div>
    </>
  )
}

function BarraEstatica({ sigla, pctReal, val }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 0' }}>
      <span style={{ fontSize: '10px', fontWeight: '600', color: 'white', width: '52px', flexShrink: 0 }}>
        {sigla}
        {pctReal != null && <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '400', marginLeft: '3px' }}>{pctReal.toFixed(1)}%</span>}
      </span>
      <span style={{ fontSize: '10px', color: COLOR_JARA, width: '28px', textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{val}%</span>
      <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: `linear-gradient(to right, ${COLOR_JARA} ${val}%, ${COLOR_KAST} ${val}%)` }} />
      <span style={{ fontSize: '10px', color: COLOR_KAST, width: '28px', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{100 - val}%</span>
    </div>
  )
}

function SliderRow({ sigla, pctReal, val, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 0' }}>
      <span style={{ fontSize: '10px', fontWeight: '600', color: 'white', width: '52px', flexShrink: 0 }}>
        {sigla}
        {pctReal != null && <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '400', marginLeft: '3px' }}>{pctReal.toFixed(1)}%</span>}
      </span>
      <span style={{ fontSize: '10px', color: COLOR_JARA, width: '28px', textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{val}%</span>
      <input type="range" className="bicolor-slider" min="0" max="100" step="1" value={val}
        style={{ flex: 1, background: `linear-gradient(to right, ${COLOR_JARA} ${val}%, ${COLOR_KAST} ${val}%)` }}
        onChange={e => onChange(e.target.value)} />
      <span style={{ fontSize: '10px', color: COLOR_KAST, width: '28px', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{100 - val}%</span>
    </div>
  )
}

function ResultadoCard({ label, color, pct, gana, etiqueta }) {
  return (
    <div style={{
      flex: 1, borderRadius: '8px', padding: '6px 12px', textAlign: 'center',
      background: gana ? `${color}22` : 'rgba(255,255,255,0.04)',
      border: `1px solid ${gana ? color : 'rgba(255,255,255,0.08)'}`,
      transition: 'all 0.3s ease',
    }}>
      <div style={{ fontSize: '10px', color, letterSpacing: '1px', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>{pct.toFixed(1)}%</div>
      {gana && <div style={{ fontSize: '9px', color, letterSpacing: '1px', marginTop: '1px' }}>{etiqueta}</div>}
    </div>
  )
}

function BtnAccion({ onClick, children, outline = false, style: extra = {} }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', flexShrink: 0,
      border: `1px solid ${outline ? 'rgba(255,255,255,0.2)' : COLOR_JARA}`,
      background: outline ? 'transparent' : 'rgba(226,75,74,0.15)',
      color: outline ? 'rgba(255,255,255,0.6)' : 'white',
      fontSize: '10px', letterSpacing: '1.5px', ...extra,
    }}
      onMouseEnter={e => e.currentTarget.style.background = outline ? 'rgba(255,255,255,0.08)' : 'rgba(226,75,74,0.3)'}
      onMouseLeave={e => e.currentTarget.style.background = outline ? 'transparent' : 'rgba(226,75,74,0.15)'}
    >{children}</button>
  )
}

function Leyenda({ color, label }) {
  return (
    <span style={{ fontSize: '10px', color, display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, display: 'inline-block' }} />
      {label}
    </span>
  )
}
