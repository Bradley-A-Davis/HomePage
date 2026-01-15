import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const panelStyle = {
    position: 'fixed',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 1000,
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.04))',
    borderRadius: '22px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.28)',
    backdropFilter: 'blur(16px) saturate(140%)',
    WebkitBackdropFilter: 'blur(16px) saturate(140%)',
    overflow: 'hidden',
    width: open ? 'fit-content' : '44px',
    padding: open ? '20px 28px 20px 18px' : '10px 0',
    transition: 'width 0.2s ease, padding 0.2s ease',
  };

  const arrowStyle = {
    display: 'block',
    width: '14px',
    height: '14px',
    borderRight: '2px solid rgba(255, 255, 255, 0.85)',
    borderBottom: '2px solid rgba(255, 255, 255, 0.85)',
    borderRadius: '2px',
    transform: open ? 'rotate(135deg)' : 'rotate(-45deg)',
    filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.35))',
  };

  return (
    <div style={panelStyle}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={open ? 'Hide navigation' : 'Show navigation'}
        style={{
          position: open ? 'absolute' : 'relative',
          right: open ? '4px' : 'auto',
          left: open ? 'auto' : '50%',
          top: open ? '50%' : '0',
          transform: open ? 'translateY(-50%)' : 'translateX(-50%)',
          background: 'transparent',
          borderRadius: 0,
          padding: 0,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span style={arrowStyle} />
      </button>

      {open && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: '16px' }}>
            <a href="#home" style={{
              textDecoration: 'none',
              color: 'rgba(255, 255, 255, 0.92)',
              fontWeight: 600,
              fontSize: '15px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              transition: 'color 0.3s ease, text-shadow 0.3s ease'
            }} onMouseEnter={(e) => e.target.style.color = 'var(--color-gray)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-white)'}>
              Home
            </a>
          </li>
          <li style={{ marginBottom: '16px' }}>
            <a href="#about" style={{
              textDecoration: 'none',
              color: 'rgba(255, 255, 255, 0.92)',
              fontWeight: 600,
              fontSize: '15px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              transition: 'color 0.3s ease, text-shadow 0.3s ease'
            }} onMouseEnter={(e) => e.target.style.color = 'var(--color-gray)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-white)'}>
              About
            </a>
          </li>
          <li style={{ marginBottom: '16px' }}>
            <a href="#services" style={{
              textDecoration: 'none',
              color: 'rgba(255, 255, 255, 0.92)',
              fontWeight: 600,
              fontSize: '15px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              transition: 'color 0.3s ease, text-shadow 0.3s ease'
            }} onMouseEnter={(e) => e.target.style.color = 'var(--color-gray)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-white)'}>
              Services
            </a>
          </li>
          <li>
            <a href="#contact" style={{
              textDecoration: 'none',
              color: 'rgba(255, 255, 255, 0.92)',
              fontWeight: 600,
              fontSize: '15px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              transition: 'color 0.3s ease, text-shadow 0.3s ease'
            }} onMouseEnter={(e) => e.target.style.color = 'var(--color-gray)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-white)'}>
              Contact
            </a>
          </li>
        </ul>
      )}
    </div>
  );
}
