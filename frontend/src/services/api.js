import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

export const comunasService = {
  getAll: () => api.get('/comunas/comunas/?page_size=400'),
  getById: (cut) => api.get(`/comunas/comunas/cut/${cut}/`),
  getRegiones: () => api.get('/comunas/regiones/'),
  getMapaCuts: () => api.get('/comunas/comunas/mapa-cuts/'),
}

export const eleccionesService = {
  getAll: () => api.get('/elecciones/elecciones/'),
  getResultadosPorComuna: (comunaId, eleccionId) =>
    api.get(`/elecciones/resultados/?comuna=${comunaId}&eleccion=${eleccionId}&page_size=10`),
  getEntropiaPorComuna: (comunaId) =>
    api.get(`/elecciones/entropia/?comuna=${comunaId}&page_size=2`),
  getFlujos: (params) => api.get('/elecciones/flujos/', { params }),
}

export default api