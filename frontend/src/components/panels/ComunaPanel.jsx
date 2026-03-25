import { useEffect, useState } from 'react'
import { comunasService, eleccionesService } from '../../services/api'
import GraficaComuna from './GraficaComuna'

const PROVINCIAS = {
  '011': 'Iquique',            '014': 'Tamarugal',
  '021': 'Antofagasta',        '022': 'El Loa',            '023': 'Tocopilla',
  '031': 'Copiapó',            '032': 'Chañaral',          '033': 'Huasco',
  '041': 'Elqui',              '042': 'Choapa',            '043': 'Limarí',
  '051': 'Valparaíso',         '052': 'Isla de Pascua',    '053': 'Los Andes',
  '054': 'Petorca',            '055': 'Quillota',          '056': 'San Antonio',
  '057': 'San Felipe de Aconcagua',                        '058': 'Marga Marga',
  '061': 'Cachapoal',          '062': 'Cardenal Caro',     '063': 'Colchagua',
  '071': 'Talca',              '072': 'Cauquenes',         '073': 'Curicó',   '074': 'Linares',
  '081': 'Concepción',         '082': 'Arauco',            '083': 'Biobío',
  '091': 'Cautín',             '092': 'Malleco',
  '101': 'Llanquihue',         '102': 'Chiloé',            '103': 'Osorno',   '104': 'Palena',
  '111': 'Coyhaique',          '112': 'Aysén',             '113': 'Capitán Prat', '114': 'General Carrera',
  '121': 'Magallanes',         '122': 'Antártica Chilena', '123': 'Tierra del Fuego', '124': 'Última Esperanza',
  '131': 'Santiago',           '132': 'Cordillera',        '133': 'Chacabuco',
  '134': 'Maipo',              '135': 'Melipilla',         '136': 'Talagante',
  '141': 'Valdivia',           '142': 'Ranco',
  '151': 'Arica',              '152': 'Parinacota',
  '161': 'Diguillín',          '162': 'Itata',             '163': 'Punilla',
}

const DISTRITOS = {
  // Distrito 1 — Arica y Parinacota
  '15101': 1, '15102': 1, '15201': 1, '15202': 1,
  // Distrito 2 — Tarapacá
  '01101': 2, '01107': 2, '01401': 2, '01402': 2, '01403': 2, '01404': 2, '01405': 2,
  // Distrito 3 — Antofagasta
  '02101': 3, '02102': 3, '02103': 3, '02104': 3,
  '02201': 3, '02202': 3, '02203': 3,
  '02301': 3, '02302': 3,
  // Distrito 4 — Atacama
  '03101': 4, '03102': 4, '03103': 4,
  '03201': 4, '03202': 4,
  '03301': 4, '03302': 4, '03303': 4, '03304': 4,
  // Distrito 5 — Coquimbo
  '04101': 5, '04102': 5, '04103': 5, '04104': 5, '04105': 5, '04106': 5,
  '04201': 5, '04202': 5, '04203': 5, '04204': 5,
  '04301': 5, '04302': 5, '04303': 5, '04304': 5, '04305': 5,
  // Distrito 6 — Valparaíso interior
  '05301': 6, '05302': 6, '05303': 6, '05304': 6,
  '05401': 6, '05402': 6, '05403': 6, '05404': 6, '05405': 6,
  '05501': 6, '05502': 6, '05503': 6, '05504': 6, '05506': 6,
  '05701': 6, '05702': 6, '05703': 6, '05704': 6, '05705': 6, '05706': 6,
  '05801': 6, '05802': 6, '05803': 6, '05804': 6,
  '05105': 6, '05107': 6,
  // Distrito 7 — Valparaíso costa
  '05101': 7, '05102': 7, '05103': 7, '05104': 7, '05109': 7,
  '05201': 7,
  '05601': 7, '05602': 7, '05603': 7, '05604': 7, '05605': 7, '05606': 7,
  // Distrito 8 — RM poniente
  '13102': 8, '13106': 8, '13119': 8, '13124': 8, '13125': 8,
  '13301': 8, '13302': 8, '13303': 8,
  // Distrito 9 — RM norte
  '13103': 9, '13104': 9, '13107': 9, '13108': 9,
  '13117': 9, '13126': 9, '13127': 9, '13128': 9,
  // Distrito 10 — RM centro
  '13101': 10, '13111': 10, '13118': 10, '13120': 10, '13123': 10, '13129': 10,
  // Distrito 11 — RM oriente
  '13113': 11, '13114': 11, '13115': 11, '13122': 11, '13132': 11,
  // Distrito 12 — RM suroriente
  '13110': 12, '13112': 12,
  '13201': 12, '13202': 12, '13203': 12,
  // Distrito 13 — RM sur
  '13105': 13, '13109': 13, '13116': 13, '13121': 13, '13130': 13, '13131': 13,
  // Distrito 14 — RM rural
  '13401': 14, '13402': 14, '13403': 14, '13404': 14,
  '13501': 14, '13502': 14, '13503': 14, '13504': 14, '13505': 14,
  '13601': 14, '13602': 14, '13603': 14, '13604': 14, '13605': 14,
  // Distrito 15 — O'Higgins norte
  '06101': 15, '06102': 15, '06103': 15, '06104': 15, '06105': 15,
  '06106': 15, '06108': 15, '06109': 15, '06110': 15, '06111': 15,
  '06114': 15, '06115': 15, '06116': 15,
  // Distrito 16 — O'Higgins sur
  '06107': 16, '06112': 16, '06113': 16, '06117': 16,
  '06201': 16, '06202': 16, '06203': 16, '06204': 16, '06205': 16, '06206': 16,
  '06301': 16, '06302': 16, '06303': 16, '06304': 16, '06305': 16,
  '06306': 16, '06307': 16, '06308': 16, '06309': 16, '06310': 16,
  // Distrito 17 — Maule norte
  '07101': 17, '07102': 17, '07103': 17, '07104': 17, '07105': 17,
  '07106': 17, '07107': 17, '07108': 17, '07109': 17, '07110': 17,
  '07301': 17, '07302': 17, '07303': 17, '07304': 17, '07305': 17,
  '07306': 17, '07307': 17, '07308': 17, '07309': 17,
  // Distrito 18 — Maule sur
  '07201': 18, '07202': 18, '07203': 18,
  '07401': 18, '07402': 18, '07403': 18, '07404': 18,
  '07405': 18, '07406': 18, '07407': 18, '07408': 18,
  // Distrito 19 — Ñuble
  '16101': 19, '16102': 19, '16103': 19, '16104': 19, '16105': 19,
  '16106': 19, '16107': 19, '16108': 19, '16109': 19,
  '16201': 19, '16202': 19, '16203': 19, '16204': 19, '16205': 19,
  '16206': 19, '16207': 19,
  '16301': 19, '16302': 19, '16303': 19, '16304': 19, '16305': 19,
  // Distrito 20 — Biobío Gran Concepción
  '08101': 20, '08102': 20, '08103': 20, '08104': 20, '08105': 20,
  '08107': 20, '08108': 20, '08109': 20, '08110': 20, '08111': 20, '08112': 20,
  // Distrito 21 — Biobío sur/interior
  '08106': 21,
  '08201': 21, '08202': 21, '08203': 21, '08204': 21, '08205': 21,
  '08206': 21, '08207': 21,
  '08301': 21, '08302': 21, '08303': 21, '08304': 21, '08305': 21,
  '08306': 21, '08307': 21, '08308': 21, '08309': 21, '08310': 21,
  '08311': 21, '08312': 21, '08313': 21, '08314': 21,
  // Distrito 22 — Araucanía norte
  '09106': 22, '09108': 22, '09110': 22, '09113': 22, '09119': 22,
  '09201': 22, '09202': 22, '09203': 22, '09204': 22, '09205': 22,
  '09206': 22, '09207': 22, '09208': 22, '09209': 22, '09210': 22, '09211': 22,
  // Distrito 23 — Araucanía sur
  '09101': 23, '09102': 23, '09103': 23, '09104': 23, '09105': 23,
  '09107': 23, '09109': 23, '09111': 23, '09112': 23, '09114': 23,
  '09115': 23, '09116': 23, '09117': 23, '09118': 23, '09120': 23, '09121': 23,
  // Distrito 24 — Los Ríos
  '14101': 24, '14102': 24, '14103': 24, '14104': 24, '14105': 24,
  '14106': 24, '14107': 24, '14108': 24,
  '14201': 24, '14202': 24, '14203': 24, '14204': 24,
  // Distrito 25 — Los Lagos norte
  '10104': 25, '10105': 25, '10106': 25, '10107': 25, '10109': 25,
  '10301': 25, '10302': 25, '10303': 25, '10304': 25, '10305': 25, '10306': 25, '10307': 25,
  // Distrito 26 — Los Lagos sur
  '10101': 26, '10102': 26, '10103': 26, '10108': 26,
  '10201': 26, '10202': 26, '10203': 26, '10204': 26, '10205': 26,
  '10206': 26, '10207': 26, '10208': 26, '10209': 26, '10210': 26,
  '10401': 26, '10402': 26, '10403': 26, '10404': 26,
  // Distrito 27 — Aysén
  '11101': 27, '11102': 27,
  '11201': 27, '11202': 27, '11203': 27,
  '11301': 27, '11302': 27, '11303': 27,
  '11401': 27, '11402': 27,
  // Distrito 28 — Magallanes
  '12101': 28, '12102': 28, '12103': 28, '12104': 28,
  '12201': 28, '12202': 28,
  '12301': 28, '12302': 28, '12303': 28,
  '12401': 28, '12402': 28,
}

export default function ComunaPanel({ comuna, onClose, onResultados1vCargados, onResultados2vCargados }) {
  const [datos, setDatos] = useState(null)
  const [resultados1v, setResultados1v] = useState([])
  const [resultados2v, setResultados2v] = useState([])
  const [entropia, setEntropia] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [vuelta, setVuelta] = useState(1)

  useEffect(() => {
    if (!comuna) return

    let cancelado = false
    setCargando(true) // eslint-disable-line react-hooks/set-state-in-effect
    setDatos(null)
    setResultados1v([])
    setResultados2v([])
    setEntropia(null)

    const id = comuna.id
    if (!id) {
      setCargando(false)
      return
    }

    Promise.all([
      comunasService.getById(comuna.cut),
      eleccionesService.getResultadosPorComuna(id, 1),
      eleccionesService.getResultadosPorComuna(id, 2),
      eleccionesService.getEntropiaPorComuna(id),
    ])
      .then(([comunaRes, res1v, res2v, entropiaRes]) => {
        if (cancelado) return
        setDatos(comunaRes.data)
        const ordenados1v = [...res1v.data.results].sort((a, b) => b.votos - a.votos)
        setResultados1v(ordenados1v)
        onResultados1vCargados?.(ordenados1v)
        const ordenados2v = [...res2v.data.results].sort((a, b) => b.votos - a.votos)
        setResultados2v(ordenados2v)
        onResultados2vCargados?.(ordenados2v)
        setEntropia(entropiaRes.data.results.find(e => e.eleccion === 1) || null)
      })
      .catch(err => console.error('Error:', err))
      .finally(() => { if (!cancelado) setCargando(false) })

    return () => { cancelado = true }
  }, [comuna]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!comuna) return null

  const totalVotos1v = resultados1v.reduce((s, r) => s + r.votos, 0)
  const totalVotos2v = resultados2v.reduce((s, r) => s + r.votos, 0)
  const participacion = datos?.padron_electoral && totalVotos1v > 0
    ? (totalVotos1v / datos.padron_electoral * 100)
    : null

  const pCode = (datos?.provincia_nombre ?? '').replace(/^Provincia\s+/i, '').trim()
  const provinciaDisplay = PROVINCIAS[pCode] ?? datos?.provincia_nombre
  const distritoNum = DISTRITOS[String(comuna?.cut)]

  return (
    <div style={{
      position: 'absolute',
      top: '70px',
      left: '16px',
      width: 'min(290px, calc(100vw - 32px))',
      zIndex: 1000,
      background: 'rgba(0,0,0,0.88)',
      border: '1px solid rgba(226,75,74,0.4)',
      borderRadius: '12px',
      backdropFilter: 'blur(12px)',
      color: 'white',
      fontFamily: 'sans-serif',
      overflow: 'hidden',
      animation: 'slideIn 0.25s ease-out',
      maxHeight: 'calc(100vh - 90px)',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: 0,
        background: 'rgba(0,0,0,0.95)',
        zIndex: 1,
      }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>{comuna.nombre}</div>
          <div style={{ fontSize: '11px', color: '#E24B4A', letterSpacing: '1px', marginTop: '2px' }}>
            {distritoNum != null ? `DISTRITO ${distritoNum}` : `CUT ${comuna.cut}`}
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.5)',
          cursor: 'pointer', fontSize: '20px',
          lineHeight: 1, padding: '4px',
        }}>×</button>
      </div>

      <div style={{ padding: '16px' }}>
        {cargando ? (
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', height: '100px',
            color: 'rgba(255,255,255,0.3)', fontSize: '12px',
            letterSpacing: '1px',
          }}>
            CARGANDO...
          </div>
        ) : (
          <>
            {/* Datos demográficos */}
            {datos && (
              <>
                <DataRow label="Región" value={datos.region_nombre} className="hide-mobile" />
                <DataRow label="Provincia" value={provinciaDisplay} className="hide-mobile" />
                <DataRow
                  label="Padrón (2025)"
                  value={datos.padron_electoral?.toLocaleString('es-CL') + ' electores'}
                />
                {participacion != null && (
                  <DataRow
                    label="Participación"
                    value={`${participacion.toFixed(1)}%`}
                  />
                )}
                {/*totalVotos1v > 0 && (
                  <DataRow
                    label="Votos válidamente emitidos (1v)"
                    value={totalVotos1v.toLocaleString('es-CL')}
                  />
                )*/}
              </>
            )}

            
            {/* Entropía}
            {entropia && (
              <DataRow
                label="Entropía Shannon (1v)"
                value={Number(entropia.entropia_shannon).toFixed(4)}
                accent
              />
            )*/}
            

            {/* Selector vuelta */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '14px',
              marginBottom: '10px',
            }}>
              {[1, 2].map(v => (
                <button
                  key={v}
                  onClick={() => setVuelta(v)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '6px',
                    border: `1px solid ${vuelta === v ? '#E24B4A' : 'rgba(255,255,255,0.1)'}`,
                    background: vuelta === v ? 'rgba(226,75,74,0.15)' : 'transparent',
                    color: vuelta === v ? 'white' : 'rgba(255,255,255,0.4)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    letterSpacing: '0.5px',
                  }}
                >
                  {v}ª VUELTA
                </button>
              ))}
            </div>

            {/* Resultados primera vuelta */}
            {vuelta === 1 && resultados1v.length > 0 && (
              <div>
                {resultados1v.map(r => (
                  <CandidatoRow
                    key={r.id}
                    sigla={r.candidato_sigla}
                    color={r.candidato_color}
                    votos={r.votos}
                    pct={r.porcentaje}
                    total={totalVotos1v}
                  />
                ))}
                <GraficaComuna resultados={resultados1v} vuelta={1} />
              </div>
            )}

            {/* Resultados segunda vuelta */}
            {vuelta === 2 && resultados2v.length > 0 && (
              <div>
                {resultados2v.map(r => (
                  <CandidatoRow
                    key={r.id}
                    sigla={r.candidato_sigla}
                    color={r.candidato_color}
                    votos={r.votos}
                    pct={r.porcentaje}
                    total={totalVotos2v}
                  />
                ))}
                <GraficaComuna resultados={resultados2v} vuelta={2} />
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @media (max-width: 520px) {
          .hide-mobile { display: none; }
        }
      `}</style>
    </div>
  )
}

function DataRow({ label, value, accent = false, className = '' }) {
  return (
    <div className={className} style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '5px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{label}</span>
      <span style={{ fontSize: '12px', fontWeight: '500', color: accent ? '#E24B4A' : 'white' }}>
        {value || '—'}
      </span>
    </div>
  )
}

// eslint-disable-next-line no-unused-vars
function CandidatoRow({ sigla, color, votos, pct, total }) {
  // eslint-disable-next-line no-unused-vars
  const ancho = total > 0 ? (votos / total) * 100 : 0
  return (
    <div style={{ marginBottom: '0.4px' }}>
      
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '0.4px',
      }}>
        {/* ROLLBACK — solo sigla y color (reemplazado por GraficaComuna)
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: color, flexShrink: 0,
          }} />
          <span style={{ fontSize: '12px', fontWeight: '500' }}>{sigla}</span>
        </div>
        */}
        {/* ROLLBACK — porcentaje y votos en texto (reemplazado por GraficaComuna)
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
          {pct.toFixed(1)}% · {votos.toLocaleString('es-CL')}
        </span>
        */}
      </div>
      {/* ROLLBACK — barra de progreso por candidato (reemplazada por GraficaComuna)
      <div style={{
        height: '3px', borderRadius: '2px',
        background: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${ancho}%`,
          background: color,
          borderRadius: '2px',
          transition: 'width 0.5s ease',
        }} />
      </div>
      */}
    </div>
  )
}
