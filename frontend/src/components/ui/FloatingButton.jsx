import iconoNE from '../../assets/Ntropyquake_NE.png'

export default function FloatingButton({ onClick, disabled = false, visible = true }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 'calc(2vh + 20px)',
      right: '32px',
      zIndex: 1000,
      width: '64px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: visible ? 1 : 0,
      transform: visible ? 'scale(1)' : 'scale(0.85)',
      transition: 'opacity 0.35s ease, transform 0.35s ease',
      pointerEvents: visible ? 'auto' : 'none',
    }}>

      {/* Fondo oscuro para contraste con vista satelital */}
      <div style={{
        position: 'absolute',
        width: '110px', height: '110px',
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.45)',
        pointerEvents: 'none',
      }} />

      {/* Anillo orbital exterior — azul, gira CW */}
      {!disabled && (
        <div style={{
          position: 'absolute',
          width: '84px', height: '84px',
          borderRadius: '50%',
          border: '1px dashed rgba(26,86,219,0.55)',
          animation: 'orbitCW 8s linear infinite',
          pointerEvents: 'none',
        }}>
          {/* Punto orbital azul */}
          <div style={{
            position: 'absolute',
            top: '-3px', left: '50%', marginLeft: '-3px',
            width: '6px', height: '6px',
            borderRadius: '50%',
            background: '#1A56DB',
            boxShadow: '0 0 8px #1A56DB',
          }} />
        </div>
      )}

      {/* Anillo orbital interior — rojo, gira CCW */}
      {!disabled && (
        <div style={{
          position: 'absolute',
          width: '74px', height: '74px',
          borderRadius: '50%',
          border: '1px dashed rgba(226,75,74,0.45)',
          animation: 'orbitCCW 5s linear infinite',
          pointerEvents: 'none',
        }}>
          {/* Punto orbital rojo */}
          <div style={{
            position: 'absolute',
            bottom: '-3px', left: '50%', marginLeft: '-3px',
            width: '5px', height: '5px',
            borderRadius: '50%',
            background: '#E24B4A',
            boxShadow: '0 0 8px #E24B4A',
          }} />
        </div>
      )}

      {/* Botón central */}
      <button
        onClick={disabled ? undefined : onClick}
        title={disabled ? 'Selecciona una comuna primero' : 'Generar flujo de transición'}
        style={{
          width: '60px', height: '60px',
          borderRadius: '50%',
          border: `1.5px solid ${disabled ? 'rgba(255,255,255,0.1)' : 'rgba(226,75,74,0.7)'}`,
          background: disabled ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.85)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          boxShadow: disabled ? 'none' : '0 0 18px rgba(226,75,74,0.25), inset 0 0 12px rgba(226,75,74,0.05)',
          opacity: disabled ? 0.35 : 1,
          transition: 'box-shadow 0.3s, transform 0.2s',
          position: 'relative',
          zIndex: 1,
        }}
        onMouseEnter={e => {
          if (disabled) return
          e.currentTarget.style.transform = 'scale(1.08)'
          e.currentTarget.style.boxShadow = '0 0 32px rgba(226,75,74,0.55), inset 0 0 16px rgba(226,75,74,0.1)'
        }}
        onMouseLeave={e => {
          if (disabled) return
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 0 18px rgba(226,75,74,0.25), inset 0 0 12px rgba(226,75,74,0.05)'
        }}
      >
        <img
          src={iconoNE}
          alt="Flujo"
          style={{
            width: '34px', height: '34px',
            objectFit: 'contain',
            animation: disabled ? 'none' : 'iconGlow 3.5s ease-in-out infinite',
            opacity: disabled ? 0.4 : 1,
          }}
        />
      </button>

      <style>{`
        @keyframes orbitCW  { from { transform: rotate(0deg);    } to { transform: rotate(360deg);   } }
        @keyframes orbitCCW { from { transform: rotate(0deg);    } to { transform: rotate(-360deg);  } }
        @keyframes iconGlow {
          0%,100% { filter: drop-shadow(0 0 3px rgba(226,75,74,0.3)); }
          50%     { filter: drop-shadow(0 0 10px rgba(226,75,74,0.8)); }
        }
      `}</style>
    </div>
  )
}
