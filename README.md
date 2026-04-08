<div align="right">
  <a href="docs/README_EN.md">🇬🇧 English version</a>
</div>

<p align="center">
  <img src="https://github.com/user-attachments/assets/d888b7ca-fb6e-44c1-acc6-f8829bb4bb62" width="250" alt="Ntropyquake Logo" />
</p>

<p align="center">
  <em>¿Hacia dónde fueron los votos de los seis candidatos eliminados en primera vuelta?</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Django-5.2-092E20?style=for-the-badge&logo=django&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Leaflet-1.9-199900?style=for-the-badge&logo=leaflet&logoColor=white" />
  <img src="https://img.shields.io/badge/ECharts-6-AA344D?style=for-the-badge&logo=apacheecharts&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" />
  <img src="https://img.shields.io/badge/Koyeb-121212?style=for-the-badge&logo=koyeb&logoColor=white" />
</p>

---

## 🚀 Descripción general

**Ntropyquake** es una plataforma web de análisis de flujos electorales chilenos basada en **inferencia ecológica bayesiana**. Permite explorar cómo se redistribuyeron los votos de los seis candidatos eliminados en la primera vuelta presidencial de Chile 2025 hacia Jeannette Jara o José Antonio Kast en la segunda vuelta.

Los datos son reales: provienen del SERVEL para las **346 comunas del país**, con padrón electoral INE 2025. La plataforma permite seleccionar cualquier comuna en un mapa interactivo, ver sus resultados desagregados, y simular o ajustar manualmente las matrices de transición de votos.



---

## 🧠 ¿Por qué Ntropyquake?

Mirar los resultados brutos de una elección en dos vueltas no responde la pregunta más interesante: ¿*cómo* se redistribuyó el voto? La agregación por comuna oculta los flujos individuales, y reconstruirlos es matemáticamente imposible de forma exacta.

El problema es **subdeterminado**: si hay 8 candidatos en primera vuelta y 2 en segunda, la matriz de transición tiene 8×2 = 16 incógnitas, pero los totales comunales solo entregan 8+2 = 10 ecuaciones de restricción. Existen infinitas matrices compatibles con los datos observados.

Ntropyquake explora el **espacio de soluciones matemáticamente plausibles**. El generador Monte Carlo cuantifica cuántos flujos distintos son matemáticamente válidos dada la evidencia real de cada comuna. Los sliders permiten navegar ese espacio de forma interactiva, comparando proyecciones con el resultado SERVEL.

---

## 🧪 Cómo funciona

1. **Selecciona una comuna** en el mapa interactivo — satelital o dark, con GeoJSON de todas las 346 comunas de Chile. Al hacer clic, se muestra el panel con padrón electoral, participación, resultados por candidato y gráficos ECharts.

2. **Activa el panel de transición** con el botón flotante — la OrbQuantica analiza el espacio de soluciones y genera automáticamente un escenario plausible compatible con los resultados reales de la commune. El mapa anima ondas sísmicas y partículas sobre el polígono de la comuna.

3. **Ajusta los sliders manualmente o regenera** — cada slider bicolor representa qué fracción de los votos de ese candidato eliminado fue hacia Jara (rojo) o Kast (azul). El panel calcula en tiempo real la proyección y la compara con el resultado oficial SERVEL.

---

## 📚 Características

| Característica | Estado |
|---|---|
| Mapa coroplético interactivo con GeoJSON de 346 comunas | ✅ |
| Vista dual: satélite (ArcGIS) + mapa dark (CartoDB) | ✅ |
| Panel de búsqueda con autocompletado y navegación por teclado | ✅ |
| Panel lateral con datos demográficos, padrón y distrito electoral | ✅ |
| Gráficos ECharts animados de resultados por candidato (1ª y 2ª vuelta) | ✅ |
| Animación OrbQuantica con contador cuántico de escenarios plausibles | ✅ |
| Generador Monte Carlo de flujos de transición compatibles | ✅ |
| Sliders bicolor interactivos por candidato eliminado | ✅ |
| Proyección manual en tiempo real vs. resultado real SERVEL | ✅ |
| Ondas sísmicas CSS + partículas Leaflet al simular | ✅ |
| Panel de fórmulas matemáticas del modelo | ✅ |
| Datos reales SERVEL 2025 (346 comunas, 1ª y 2ª vuelta) | ✅ |
| Entropía de Shannon calculada por comuna y vuelta | ✅ |
| Magnitud Quake calculada por comuna | ✅ |
| API REST paginada con filtros y búsqueda | ✅ |
| Autenticación JWT para endpoints de administración | ✅ |

---

## 🔬 Modelo matemático

El panel de fórmulas de la aplicación expone el modelo directamente. Aquí el resumen:

**Inferencia ecológica**
```
Σᵢ Tᵢⱼ · v¹ᵢ = v²ⱼ
```
Sistema subdeterminado: `n×m` incógnitas (flujos `Tᵢⱼ`) y solo `n+m` ecuaciones de restricción. El modelo HMC bayesiano explora la distribución posterior de flujos plausibles a partir de datos comunales agregados.

**Plausibilidad posterior**
```
P(T|v¹,v²) ∝ P(v²|T,v¹) · P(T)
```
Los sliders representan escenarios dentro del espacio de soluciones válidas; su densidad posterior determina cuán plausibles son.

**Restricciones de flujo**
```
Tᵢⱼ ∈ [0,1],   Σⱼ Tᵢⱼ = 1
```
Cada `Tᵢⱼ` es la fracción de votantes del candidato `i` que apoyó al candidato `j` en segunda vuelta. El generador Monte Carlo cuantifica el volumen del espacio de soluciones válidas.

**Entropía de Shannon**
```
H = −Σᵢ pᵢ · log₂(pᵢ)
```
Mide la dispersión del voto en cada comuna. `H = 0` indica concentración total en un candidato; `H` máximo refleja votos perfectamente distribuidos entre todos los candidatos.

**Magnitud Quake**
```
M = log₁₀(|ΔV| + 1)
```
Análogo sísmico del desplazamiento de votos. `ΔV` es el cambio absoluto de votos de Jara entre ambas vueltas. La escala logarítmica normaliza magnitudes extremas.

---

## 🧭 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/rmardonesa/ntropyquake.git
cd ntropyquake
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
```

Crear el archivo `.env` con las variables de entorno:

```env
DJANGO_SECRET_KEY=tu_clave_secreta
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgres://usuario:contraseña@localhost:5432/ntropyquake
CORS_ALLOWED_ORIGINS=http://localhost:5173
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
```

Aplicar migraciones y cargar datos:

```bash
python manage.py migrate

# Cargar las 346 comunas desde el CSV INE/SERVEL
python manage.py cargar_comunas

# Crear las elecciones (1ª y 2ª vuelta 2025) y los 8 candidatos
python manage.py cargar_elecciones

# Cargar resultados reales SERVEL (1ª y 2ª vuelta, 346 comunas)
python manage.py cargar_resultados_reales

python manage.py runserver
```

> `simular_resultados` está disponible para generar datos de prueba mientras no se dispone de los CSVs reales.

### 3. Frontend

```bash
cd frontend
npm install
```

Crear el archivo `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

```bash
npm run dev
```

---

## 🧰 Tech Stack

| Categoría | Tecnología | Descripción |
|---|---|---|
| Framework frontend | React 19 | UI reactiva con hooks |
| Build tool | Vite 8 | Bundler ultrarrápido con HMR |
| Estilos | Tailwind CSS 4 | Utilidades CSS con plugin Vite |
| Mapas | Leaflet 1.9 + react-leaflet 5 | Mapa interactivo con GeoJSON |
| Gráficos | ECharts 6 + echarts-for-react | Gráficos de barras animados |
| HTTP client | Axios | Llamadas a la API REST |
| Animaciones DOM | jQuery 4 | slideDown en aparición de gráficos |
| Framework backend | Django 5.2 | ORM + admin + gestión de comandos |
| API REST | Django REST Framework 3.16 | ViewSets, paginación, filtros |
| Autenticación | SimpleJWT 5.5 | JWT con refresh y rotación |
| CORS | django-cors-headers | Control de orígenes cruzados |
| Filtros | django-filter | Filtrado declarativo en ViewSets |
| Base de datos | PostgreSQL | Almacenamiento principal |
| Driver BD | psycopg2-binary | Conector Python para PostgreSQL |
| Config | python-decouple | Variables de entorno tipadas |
| BD URL | dj-database-url | Parseo de DATABASE_URL |
| Servidor WSGI | Gunicorn | Servidor de producción |
| Archivos estáticos | WhiteNoise | Servicio de estáticos en producción |
| Deploy frontend | Cloudflare Pages | CDN global con CI/CD |
| Deploy backend | Koyeb | PaaS con despliegue desde GitHub |

---

## 📊 Datos y fuentes

- **SERVEL** — Datos electorales oficiales de las elecciones presidenciales 2025 (primera y segunda vuelta)
- **INE** — Códigos CUT para crossmatching comunal y padrón electoral 2025

---

## ⚖️ Licencia

Este proyecto está bajo la [Functional Source License 1.1 con licencia adicional Apache 2.0 (FSL-1.1-ALv2)](LICENSE).

Bajo FSL-1.1-ALv2: el software es de uso libre para propósitos no comerciales. Dos años después de cada lanzamiento, el código pasa automáticamente a la licencia Apache 2.0. El uso comercial requiere una licencia separada del autor.

---

## 🌎 Live Demo

Disponible en **[ntropyquake.xyz](https://ntropyquake.xyz)**

<p align="center">
  <img src="https://github.com/user-attachments/assets/b9f7bbca-fc07-44ea-ae89-a534e6bcb850" alt="Ntropyquake screenshot" width="800" />
</p>

---
