import { useState, useEffect, useRef } from 'react'
import MapView from './components/Map/MapView'
import TopBar from './components/ui/TopBar'
import FloatingButton from './components/ui/FloatingButton'
import ComunaPanel from './components/panels/ComunaPanel'
import TransicionPanel from './components/panels/TransicionPanel'
import SearchPanel from './components/panels/SearchPanel'
import FormulaPanel from './components/panels/FormulaPanel'
import { comunasService } from './services/api'
import './index.css'

function App() {
  const [comunaSeleccionada, setComunaSeleccionada] = useState(null)
  const [triggerSimulacion, setTriggerSimulacion] = useState(null)
  const [panelTransicion, setPanelTransicion] = useState(false)
  const [resultados1v, setResultados1v] = useState([])
  const [resultados2v, setResultados2v] = useState([])
  const [modoSearch, setModoSearch] = useState(false)
  const [modoFormula, setModoFormula] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [focusTarget, setFocusTarget] = useState(null)
  const [comunasList, setComunasList] = useState([])
  const mapaCutsRef = useRef({})

  useEffect(() => {
    comunasService.getMapaCuts()
      .then(res => {
        mapaCutsRef.current = res.data
        const lista = Object.entries(res.data)
          .map(([cut, info]) => ({ cut, id: info.id, nombre: info.nombre }))
          .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
        setComunasList(lista)
      })
      .catch(err => console.error('Error cargando mapa cuts:', err))
  }, [])

  const handleComunaClick = (comuna) => {
    const info = mapaCutsRef.current[comuna.cut]
    if (comunaSeleccionada?.cut !== comuna.cut) {
      setPanelTransicion(false)
      setResultados1v([])
      setResultados2v([])
    }
    setComunaSeleccionada({ ...comuna, id: info?.id || null })
  }

  const handleSearchSelect = (comuna) => {
    handleComunaClick(comuna)
    setFocusTarget({ ...comuna, ts: Date.now() })
    setModoSearch(false)
  }

  const handleSearchClick = () => {
    setModoSearch(prev => !prev)
    setModoFormula(false)
  }

  const handleFormulaClick = () => {
    setModoFormula(prev => !prev)
    setModoSearch(false)
  }

  const handleSimular = () => {
    if (!comunaSeleccionada) return
    setTriggerSimulacion({ ...comunaSeleccionada, ts: Date.now() })
    setPanelTransicion(true)
  }

  const handleAplicarMapa = ({ sliders, resultado }) => {
    setTriggerSimulacion({ ...comunaSeleccionada, sliders, resultado, ts: Date.now() })
  }

  const uiVisible = !modoSearch && !modoFormula

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <MapView
        onComunaClick={handleComunaClick}
        triggerSimulacion={triggerSimulacion}
        showMap={showMap}
        focusTarget={focusTarget}
      />
      <TopBar
        onSearchClick={handleSearchClick}
        onLayersClick={() => setShowMap(prev => !prev)}
        onInfoClick={handleFormulaClick}
        searchActive={modoSearch}
        formulaActive={modoFormula}
        showMap={showMap}
      />

      {modoSearch && (
        <SearchPanel
          comunas={comunasList}
          onSelect={handleSearchSelect}
          onClose={() => setModoSearch(false)}
        />
      )}

      {modoFormula && (
        <FormulaPanel onClose={() => setModoFormula(false)} />
      )}

      {uiVisible && (
        <>
          <ComunaPanel
            comuna={comunaSeleccionada}
            onResultados1vCargados={setResultados1v}
            onResultados2vCargados={setResultados2v}
            onClose={() => {
              setComunaSeleccionada(null)
              setPanelTransicion(false)
              setResultados1v([])
              setResultados2v([])
            }}
          />
          <TransicionPanel
            comuna={{ ...comunaSeleccionada, resultados1v, resultados2v }}
            visible={panelTransicion}
            onSimular={handleAplicarMapa}
          />
          <FloatingButton
            onClick={handleSimular}
            disabled={!comunaSeleccionada}
            visible={!panelTransicion}
          />
        </>
      )}
    </div>
  )
}

export default App
