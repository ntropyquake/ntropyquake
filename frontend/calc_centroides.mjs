import { readFileSync, writeFileSync } from 'fs'

const data = JSON.parse(readFileSync('public/chile_comunas.geojson', 'utf-8'))

function centroide(geometry) {
  let coords = []
  if (geometry.type === 'Polygon') {
    coords = geometry.coordinates[0]
  } else if (geometry.type === 'MultiPolygon') {
    // Usar el polígono más grande
    let maxLen = 0
    for (const poly of geometry.coordinates) {
      if (poly[0].length > maxLen) {
        maxLen = poly[0].length
        coords = poly[0]
      }
    }
  }
  const lat = coords.reduce((s, c) => s + c[1], 0) / coords.length
  const lng = coords.reduce((s, c) => s + c[0], 0) / coords.length
  return { lat: parseFloat(lat.toFixed(5)), lng: parseFloat(lng.toFixed(5)) }
}

const centroides = {}
for (const f of data.features) {
  const cut = f.properties.cut
  centroides[cut] = centroide(f.geometry)
}

writeFileSync('src/data/centroides.json', JSON.stringify(centroides, null, 2), 'utf-8')
console.log(`Centroides calculados: ${Object.keys(centroides).length}`)
console.log('Ejemplo Concepción:', centroides['08101'])
console.log('Ejemplo Santiago:', centroides['13101'])