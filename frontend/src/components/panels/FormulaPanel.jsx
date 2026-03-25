export default function FormulaPanel({ onClose }) {
  return (
    <div style={{
      position: 'absolute',
      top: '70px',
      right: '16px',
      width: 'min(300px, calc(100vw - 32px))',
      zIndex: 1000,
      background: 'rgba(0,0,0,0.92)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      backdropFilter: 'blur(12px)',
      color: 'white',
      fontFamily: 'sans-serif',
      animation: 'slideInR 0.25s ease-out',
      maxHeight: 'calc(100vh - 90px)',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'sticky', top: 0, background: 'rgba(0,0,0,0.95)',
      }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '1px' }}>MODELO MATEMÁTICO</div>
          <div style={{ fontSize: '10px', color: '#E24B4A', letterSpacing: '1.5px', marginTop: '2px' }}>NTROPYQUAKE</div>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
          cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '4px',
        }}>×</button>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <Seccion
          titulo="INFERENCIA ECOLÓGICA"
          formula="Σᵢ Tᵢⱼ · v¹ᵢ = v²ⱼ"
          desc="Sistema subdeterminado: n×m incógnitas (flujos Tᵢⱼ) y solo n+m ecuaciones de restricción. El modelo bayesiano HMC explora la distribución posterior de flujos plausibles a partir de datos comunales agregados."
        />
        <Seccion
          titulo="PLAUSIBILIDAD POSTERIOR"
          formula="P(T|v¹,v²) ∝ P(v²|T,v¹) · P(T)"
          desc="El modelo HMC estima la distribución posterior
                de flujos dada la evidencia observada. Los sliders
                representan escenarios dentro del espacio de
                soluciones; su densidad posterior determina cuán
                plausibles son."
        />
        <Seccion
          titulo="RESTRICCIONES DE FLUJO"
          formula="Tᵢⱼ ∈ [0,1],  Σⱼ Tᵢⱼ = 1"
          desc="Cada Tᵢⱼ es la fracción de votantes del candidato i que apoyó al candidato j en 2ª vuelta. El generador Monte Carlo cuantifica el volumen del espacio de soluciones válidas."
        />
        <Seccion
          titulo="ENTROPÍA DE SHANNON"
          formula="H = −Σᵢ pᵢ · log₂(pᵢ)"
          desc="Mide la dispersión del voto en cada comuna. H = 0 indica concentración total en un candidato; H máximo refleja votos perfectamente distribuidos entre todos los candidatos."
        />
        <Seccion
          titulo="MAGNITUD QUAKE"
          formula="M = log₁₀(|ΔV| + 1)"
          desc="Análogo sísmico del desplazamiento de votos. ΔV es el desplazamiento total de votos en la comuna entre ambas vueltas, medido como la suma de cambios absolutos por candidato. La escala logarítmica normaliza magnitudes extremas."
        />
        
      </div>

      <style>{`
        @keyframes slideInR {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

function Seccion({ titulo, formula, desc }) {
  return (
    <div>
      <div style={{ fontSize: '9px', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
        {titulo}
      </div>
      <div style={{
        fontFamily: 'monospace', fontSize: '13px', color: '#E24B4A',
        padding: '7px 10px',
        background: 'rgba(226,75,74,0.07)', border: '1px solid rgba(226,75,74,0.2)',
        borderRadius: '6px', marginBottom: '7px', letterSpacing: '0.3px',
      }}>
        {formula}
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.48)', lineHeight: '1.55' }}>
        {desc}
      </div>
    </div>
  )
}
