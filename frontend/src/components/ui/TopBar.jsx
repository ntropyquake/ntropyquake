import LogoAnimado from './LogoAnimado'

export default function TopBar({ onSearchClick, onLayersClick, onInfoClick, searchActive, formulaActive, showMap }) {
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px clamp(12px, 4vw, 20px)',
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)',
      pointerEvents: 'none',
    }}>
      <div style={{ pointerEvents: 'auto' }}>
        <LogoAnimado />
      </div>

      <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
        <IconButton onClick={onSearchClick} title="Buscar comuna" active={searchActive}>
          <SearchIcon />
        </IconButton>
        <IconButton onClick={onLayersClick} title={showMap ? 'Ver satélite' : 'Ver mapa'} active={showMap}>
          <LayersIcon />
        </IconButton>
        <IconButton onClick={onInfoClick} title="Modelo matemático" active={formulaActive}>
          <SigmaIcon />
        </IconButton>
      </div>
    </div>
  )
}

function IconButton({ onClick, title, children, active = false }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: '38px', height: '38px',
        borderRadius: '8px',
        border: `1px solid ${active ? 'rgba(226,75,74,0.7)' : 'rgba(255,255,255,0.15)'}`,
        background: active ? 'rgba(226,75,74,0.2)' : 'rgba(0,0,0,0.6)',
        color: active ? '#E24B4A' : 'white',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        transition: 'border-color 0.2s, background 0.2s, color 0.2s',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.borderColor = '#E24B4A'
          e.currentTarget.style.background = 'rgba(226,75,74,0.15)'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
          e.currentTarget.style.background = 'rgba(0,0,0,0.6)'
        }
      }}
    >
      {children}
    </button>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

function LayersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  )
}

function SigmaIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 4H6L13 12L6 20H18"/>
    </svg>
  )
}
