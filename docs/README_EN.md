<div align="right">
  <a href="../README.md">🇪🇸 Versión en español</a>
</div>

<p align="center">
  <img src="https://github.com/user-attachments/assets/d888b7ca-fb6e-44c1-acc6-f8829bb4bb62" width="250" alt="Ntropyquake Logo" />
</p>

<p align="center">
  <em>Where did the votes of the six eliminated first-round candidates actually go?</em>
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

## 🚀 Overview

**Ntropyquake** is a web platform for analyzing Chilean electoral vote flows using **Bayesian ecological inference**. It lets you explore how the votes of the six eliminated first-round candidates were redistributed toward Jeannette Jara or José Antonio Kast in the 2025 Chilean presidential runoff.

The data is real: sourced from SERVEL for all **346 communes of Chile**, with INE 2025 electoral rolls. The platform lets you select any commune on an interactive map, view disaggregated results, and simulate or manually adjust vote transition matrices.

---

## 🧠 Why Ntropyquake?

Looking at raw results across two rounds doesn't answer the most interesting question: *how* did the vote redistribute? Communal aggregation hides individual flows, and reconstructing them exactly is mathematically impossible.

The problem is **underdetermined**: with 8 first-round candidates and 2 in the runoff, the transition matrix has 8×2 = 16 unknowns, but the communal totals provide only 8+2 = 10 constraint equations. There are infinitely many matrices compatible with the observed data.

Ntropyquake doesn't claim "the right answer" — it explores the **space of mathematically plausible solutions**. The Monte Carlo generator quantifies how many distinct vote flows are mathematically valid given the real evidence from each commune. The sliders let you navigate that space interactively, comparing projections against the actual SERVEL results.

---

## 🧪 How It Works

1. **Select a commune** on the interactive map — satellite or dark mode, with GeoJSON coverage of all 346 Chilean communes. Clicking shows the panel with electoral roll, turnout, per-candidate results, and animated ECharts graphs.

2. **Open the transition panel** with the floating button — the OrbQuantica animates while analyzing the solution space and generates a plausible scenario compatible with the commune's real results. The map animates seismic waves and particles over the commune polygon.

3. **Adjust the sliders manually or regenerate** — each bicolor slider represents what fraction of a given eliminated candidate's votes went to Jara (red) or Kast (blue). The panel computes the projected outcome in real time and compares it against the official SERVEL result.

---

## 📚 Features

| Feature | Status |
|---|---|
| Interactive choropleth map with GeoJSON of 346 communes | ✅ |
| Dual view: satellite (ArcGIS) + dark map (CartoDB) | ✅ |
| Search panel with autocomplete and keyboard navigation | ✅ |
| Side panel with demographics, electoral roll, and electoral district | ✅ |
| Animated ECharts bar charts for per-candidate results (1st and 2nd round) | ✅ |
| OrbQuantica animation with quantum counter of plausible scenarios | ✅ |
| Monte Carlo generator of compatible vote transition flows | ✅ |
| Interactive bicolor sliders per eliminated candidate | ✅ |
| Real-time manual projection vs. official SERVEL result | ✅ |
| CSS seismic waves + Leaflet particles on simulation | ✅ |
| Mathematical model formula panel | ✅ |
| Real SERVEL 2025 data (346 communes, 1st and 2nd round) | ✅ |
| Shannon entropy computed per commune per round | ✅ |
| Quake magnitude computed per commune | ✅ |
| Paginated REST API with filters and search | ✅ |
| JWT authentication for administrative endpoints | ✅ |

---

## 🔬 Mathematical Model

The in-app formula panel exposes the model directly. Summary below:

**Ecological inference**
```
Σᵢ Tᵢⱼ · v¹ᵢ = v²ⱼ
```
Underdetermined system: `n×m` unknowns (flows `Tᵢⱼ`) and only `n+m` constraint equations. The Bayesian HMC model explores the posterior distribution of plausible flows from aggregated communal data.

**Posterior plausibility**
```
P(T|v¹,v²) ∝ P(v²|T,v¹) · P(T)
```
The sliders represent scenarios within the space of valid solutions; their posterior density determines how plausible they are.

**Flow constraints**
```
Tᵢⱼ ∈ [0,1],   Σⱼ Tᵢⱼ = 1
```
Each `Tᵢⱼ` is the fraction of candidate `i`'s voters who supported candidate `j` in the runoff. The Monte Carlo generator quantifies the volume of the valid solution space.

**Shannon entropy**
```
H = −Σᵢ pᵢ · log₂(pᵢ)
```
Measures vote dispersion within each commune. `H = 0` means all votes concentrated on one candidate; maximum `H` means votes perfectly distributed across all candidates.

**Quake magnitude**
```
M = log₁₀(|ΔV| + 1)
```
Seismic analogue of vote displacement. `ΔV` is the absolute change in Jara's votes between rounds. The logarithmic scale normalizes extreme magnitudes.

---

## 🧭 Installation

### 1. Clone the repository

```bash
git clone https://github.com/rmardonesa/ntropyquake.git
cd ntropyquake
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file with the required environment variables:

```env
DJANGO_SECRET_KEY=your_secret_key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgres://user:password@localhost:5432/ntropyquake
CORS_ALLOWED_ORIGINS=http://localhost:5173
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
```

Apply migrations and load data:

```bash
python manage.py migrate

# Load the 346 communes from the INE/SERVEL CSV
python manage.py cargar_comunas

# Create the elections (1st and 2nd round 2025) and the 8 candidates
python manage.py cargar_elecciones

# Load real SERVEL results (1st and 2nd round, 346 communes)
python manage.py cargar_resultados_reales

python manage.py runserver
```

> `simular_resultados` is available to generate test data when the real CSVs are not present.

### 3. Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
```

```bash
npm run dev
```

---

## 🧰 Tech Stack

| Category | Technology | Description |
|---|---|---|
| Frontend framework | React 19 | Reactive UI with hooks |
| Build tool | Vite 8 | Ultra-fast bundler with HMR |
| Styles | Tailwind CSS 4 | Utility-first CSS with Vite plugin |
| Maps | Leaflet 1.9 + react-leaflet 5 | Interactive map with GeoJSON |
| Charts | ECharts 6 + echarts-for-react | Animated bar charts |
| HTTP client | Axios | REST API calls |
| DOM animations | jQuery 4 | slideDown on chart reveal |
| Backend framework | Django 5.2 | ORM + admin + management commands |
| REST API | Django REST Framework 3.16 | ViewSets, pagination, filters |
| Authentication | SimpleJWT 5.5 | JWT with refresh and rotation |
| CORS | django-cors-headers | Cross-origin request control |
| Filters | django-filter | Declarative filtering on ViewSets |
| Database | PostgreSQL | Primary data store |
| DB driver | psycopg2-binary | Python connector for PostgreSQL |
| Config | python-decouple | Typed environment variables |
| DB URL | dj-database-url | DATABASE_URL parser |
| WSGI server | Gunicorn | Production application server |
| Static files | WhiteNoise | Static file serving in production |
| Frontend deploy | Cloudflare Pages | Global CDN with CI/CD |
| Backend deploy | Koyeb | PaaS with GitHub deployment |

---

## 📊 Data Sources

- **SERVEL** — Official electoral data from the 2025 Chilean presidential election (first and second rounds)
- **INE** — CUT codes for communal crossmatching and 2025 electoral roll

---

## ⚖️ License

This project is licensed under the [Functional Source License 1.1 with Apache 2.0 Additional Use Grant (FSL-1.1-ALv2)](../LICENSE).

Under FSL-1.1-ALv2: the software is free to use for non-commercial purposes. Two years after each release, the code automatically relicenses to Apache 2.0. Commercial use requires a separate license from the author.

---

## 🌎 Live Demo

Available at **[ntropyquake.xyz](https://ntropyquake.xyz)**

<p align="center">
  <img src="https://github.com/user-attachments/assets/b9f7bbca-fc07-44ea-ae89-a534e6bcb850" alt="Ntropyquake screenshot" width="800" />
</p>

---
