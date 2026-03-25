import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import centroides from '../../data/centroides.json'

const GRAN_CONCEPCION = { lat: -36.8201, lng: -73.0444, zoom: 11 }
const COLOR_JARA = '#E24B4A'
const COLOR_KAST = '#1A56DB'

function getEstiloComuna() {
  return { color: '#ffffff', weight: 0.8, opacity: 0.4, fillColor: '#ffffff', fillOpacity: 0.03 }
}

function crearOndasSismicas(map, lat, lng) {
  const marcadores = []

  // 5 ondas más grandes, alternando rojo y azul
  for (let i = 0; i < 5; i++) {
    const color = i % 2 === 0 ? COLOR_JARA : COLOR_KAST
    const div = L.divIcon({
      className: '',
      html: `<div class="onda-sismica" style="animation-delay:${i * 0.55}s;border-color:${color}"></div>`,
      iconSize: [0, 0], iconAnchor: [0, 0],
    })
    marcadores.push(L.marker([lat, lng], { icon: div, interactive: false }).addTo(map))
  }

  // Epicentro
  const epicDiv = L.divIcon({
    className: '',
    html: `<div class="epicentro-punto"></div>`,
    iconSize: [0, 0], iconAnchor: [5, 5],
  })
  marcadores.push(L.marker([lat, lng], { icon: epicDiv, interactive: false }).addTo(map))

  setTimeout(() => marcadores.forEach(m => map.removeLayer(m)), 7000)
}

function crearParticulasPoligono(map, layer) {
  const marcadores = []
  const bounds = layer.getBounds()
  const latRange = bounds.getNorth() - bounds.getSouth()
  const lngRange = bounds.getEast() - bounds.getWest()

  for (let i = 0; i < 28; i++) {
    const delay = Math.random() * 3500
    setTimeout(() => {
      // Punto aleatorio dentro del bounding box de la comuna
      const pLat = bounds.getSouth() + Math.random() * latRange
      const pLng = bounds.getWest() + Math.random() * lngRange
      const color = Math.random() > 0.5 ? COLOR_JARA : COLOR_KAST
      const size = 2 + Math.random() * 3

      const div = L.divIcon({
        className: '',
        html: `<div class="particula-quake" style="width:${size}px;height:${size}px;background:${color};animation-duration:${1.5 + Math.random()}s"></div>`,
        iconSize: [0, 0], iconAnchor: [size / 2, size / 2],
      })
      const m = L.marker([pLat, pLng], { icon: div, interactive: false }).addTo(map)
      marcadores.push(m)
      setTimeout(() => map.removeLayer(m), 2500)
    }, delay)
  }
}

function animarPoligono(layer) {
  let frame = 0
  const colores = [COLOR_JARA, COLOR_KAST]
  const iv = setInterval(() => {
    frame++
    layer.setStyle({
      fillColor: colores[Math.floor(frame / 4) % 2],
      fillOpacity: 0.04 + Math.abs(Math.sin(frame * 0.18)) * 0.1,
      weight: 1.2,
      opacity: 0.6,
    })
    if (frame > 55) {
      clearInterval(iv)
      layer.setStyle(getEstiloComuna())
    }
  }, 110)
}

const CARTO_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

export default function MapView({ onComunaClick, triggerSimulacion, showMap, focusTarget }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const simulacionPrevRef = useRef(null)
  const capasRef = useRef({}) // cut -> layer
  const sateliteLayerRef = useRef(null)
  const labelsLayerRef = useRef(null)
  const mapaLayerRef = useRef(null)

  useEffect(() => {
    if (mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [GRAN_CONCEPCION.lat, GRAN_CONCEPCION.lng],
      zoom: GRAN_CONCEPCION.zoom,
      zoomControl: false,
      attributionControl: false,
    })

    sateliteLayerRef.current = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    ).addTo(map)

    labelsLayerRef.current = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, opacity: 0.6 }
    ).addTo(map)

    mapaLayerRef.current = L.tileLayer(CARTO_DARK, {
      maxZoom: 19,
      subdomains: 'abcd',
    })

    L.control.zoom({ position: 'bottomleft' }).addTo(map)

    fetch('/chile_comunas.geojson')
      .then(r => r.json())
      .then(data => {
        L.geoJSON(data, {
          style: getEstiloComuna,
          onEachFeature: (feature, layer) => {
            const { nombre, cut } = feature.properties
            capasRef.current[cut] = layer

            layer.bindTooltip(nombre, {
              permanent: false, direction: 'top', className: 'ntropyquake-tooltip',
            })

            layer.on({
              mouseover: (e) => e.target.setStyle({ fillOpacity: 0.25, weight: 2 }),
              mouseout: (e) => e.target.setStyle(getEstiloComuna()),
              click: () => {
                const centroide = centroides[cut]
                if (onComunaClick) onComunaClick({ nombre, cut, centroide })
                const targetZoom = Math.min(map.getZoom(), GRAN_CONCEPCION.zoom)
                const center = centroide
                  ? [centroide.lat, centroide.lng]
                  : layer.getBounds().getCenter()
                map.flyTo(center, targetZoom, { duration: 0.8 })
              },
            })
          },
        }).addTo(map)
      })

    mapInstanceRef.current = map
    return () => { map.remove(); mapInstanceRef.current = null }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!triggerSimulacion || !mapInstanceRef.current) return
    if (simulacionPrevRef.current === triggerSimulacion) return
    simulacionPrevRef.current = triggerSimulacion

    const { cut, centroide } = triggerSimulacion
    const coords = centroide || centroides[cut]
    if (!coords) return

    crearOndasSismicas(mapInstanceRef.current, coords.lat, coords.lng)

    const layer = capasRef.current[cut]
    if (layer) {
      animarPoligono(layer)
      crearParticulasPoligono(mapInstanceRef.current, layer)
    }
  }, [triggerSimulacion])

  // Toggle satellite ↔ map view
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (showMap) {
      if (sateliteLayerRef.current) map.removeLayer(sateliteLayerRef.current)
      if (labelsLayerRef.current) map.removeLayer(labelsLayerRef.current)
      if (mapaLayerRef.current) mapaLayerRef.current.addTo(map)
    } else {
      if (mapaLayerRef.current) map.removeLayer(mapaLayerRef.current)
      if (sateliteLayerRef.current) sateliteLayerRef.current.addTo(map)
      if (labelsLayerRef.current) labelsLayerRef.current.addTo(map)
    }
  }, [showMap])

  // Fly to commune selected from search
  useEffect(() => {
    if (!focusTarget || !mapInstanceRef.current) return
    const coords = focusTarget.centroide || centroides[focusTarget.cut]
    if (!coords) return
    const targetZoom = Math.min(mapInstanceRef.current.getZoom(), GRAN_CONCEPCION.zoom)
    mapInstanceRef.current.flyTo([coords.lat, coords.lng], targetZoom, { duration: 0.8 })
  }, [focusTarget])

  return (
    <>
      <div ref={mapRef} style={{ width: '100vw', height: '100vh' }} />
      <style>{`
        .leaflet-interactive:focus { outline: none; }

        .ntropyquake-tooltip {
          background: rgba(0,0,0,0.75);
          border: 1px solid #E24B4A;
          border-radius: 4px;
          color: white;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 8px;
          white-space: nowrap;
        }
        .ntropyquake-tooltip::before { display: none; }

        @keyframes ondaSismica {
          0%   { width:0;   height:0;   opacity:0.85; margin:0; }
          100% { width:220px; height:220px; opacity:0; margin:-110px; }
        }
        .onda-sismica {
          border: 1.5px solid;
          border-radius: 50%;
          animation: ondaSismica 2.8s ease-out infinite;
          position: absolute;
        }

        @keyframes epicentroPulso {
          0%,100% { transform:scale(1);   opacity:1; }
          50%     { transform:scale(1.8); opacity:0.5; }
        }
        .epicentro-punto {
          width: 10px; height: 10px;
          background: #E24B4A;
          border-radius: 50%;
          animation: epicentroPulso 0.7s ease-in-out infinite;
          position: absolute;
          box-shadow: 0 0 8px #E24B4A;
        }

        @keyframes particulaQuake {
          0%   { opacity: 0.9; transform: scale(1); }
          100% { opacity: 0;   transform: scale(4); }
        }
        .particula-quake {
          border-radius: 50%;
          animation: particulaQuake ease-out forwards;
          position: absolute;
        }
      `}</style>
    </>
  )
}
