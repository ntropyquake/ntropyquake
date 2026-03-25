import { useState, useEffect, useRef } from 'react'
import centroides from '../../data/centroides.json'

export default function SearchPanel({ comunas, onSelect, onClose }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleChange = (e) => {
    const q = e.target.value
    setQuery(q)
    setActiveIdx(-1)
    const q_lower = q.trim().toLowerCase()
    if (q_lower.length < 2) { setSuggestions([]); return }
    const filtered = comunas
      .filter(c => c.nombre.toLowerCase().includes(q_lower))
      .sort((a, b) => {
        const aS = a.nombre.toLowerCase().startsWith(q_lower)
        const bS = b.nombre.toLowerCase().startsWith(q_lower)
        if (aS && !bS) return -1
        if (!aS && bS) return 1
        return a.nombre.localeCompare(b.nombre, 'es')
      })
      .slice(0, 8)
    setSuggestions(filtered)
  }

  const handleSelect = (c) => {
    onSelect({ nombre: c.nombre, cut: c.cut, centroide: centroides[c.cut] || null })
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(p => Math.min(p + 1, suggestions.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(p => Math.max(p - 1, -1)) }
    if (e.key === 'Enter' && activeIdx >= 0) handleSelect(suggestions[activeIdx])
  }

  const hasSuggestions = suggestions.length > 0

  return (
    <div style={{
      position: 'absolute',
      top: '70px',
      left: '16px',
      right: '16px',
      maxWidth: '420px',
      zIndex: 1001,
      fontFamily: 'sans-serif',
      animation: 'searchSlideDown 0.2s ease-out',
    }}>
      {/* Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(0,0,0,0.92)',
        border: '1px solid rgba(226,75,74,0.55)',
        borderRadius: hasSuggestions ? '10px 10px 0 0' : '10px',
        backdropFilter: 'blur(14px)',
        padding: '0 12px',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Buscar comuna..."
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: 'white', fontSize: '14px', padding: '13px 0', fontFamily: 'sans-serif',
          }}
        />
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
          cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '4px', flexShrink: 0,
        }}>×</button>
      </div>

      {/* Suggestions */}
      {hasSuggestions && (
        <div style={{
          background: 'rgba(0,0,0,0.92)',
          border: '1px solid rgba(226,75,74,0.55)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '0 0 10px 10px',
          backdropFilter: 'blur(14px)',
          overflow: 'hidden',
        }}>
          {suggestions.map((c, i) => (
            <div
              key={c.cut}
              onClick={() => handleSelect(c)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background: activeIdx === i ? 'rgba(226,75,74,0.15)' : 'transparent',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(226,75,74,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.background = activeIdx === i ? 'rgba(226,75,74,0.15)' : 'transparent' }}
            >
              <span style={{ fontSize: '13px', color: 'white' }}>{c.nombre}</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.5px', flexShrink: 0, marginLeft: '8px' }}>
                CUT {c.cut}
              </span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes searchSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
