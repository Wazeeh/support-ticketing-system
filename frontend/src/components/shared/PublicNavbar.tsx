import type { CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function PublicNavbar() {
  const location = useLocation();

  const getLinkStyle = (path: string): CSSProperties => {
    const isActive = location.pathname === path;

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '42px',
      padding: '0 18px',
      borderRadius: '8px',
      border: isActive
        ? '1px solid #2563eb'
        : '1px solid #4b5563',
      backgroundColor: isActive
        ? '#2563eb'
        : 'transparent',
      color: '#ffffff',
      textDecoration: 'none',
      fontSize: '15px',
      fontWeight: 600,
      transition:
        'background-color 0.2s ease, border-color 0.2s ease',
    };
  };

  return (
    <header
      style={{
        width: '100%',
        borderBottom: '1px solid #2f3340',
        backgroundColor: '#16171d',
      }}
    >
      <nav
        aria-label="Public navigation"
        style={{
          width: '100%',
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
          boxSizing: 'border-box',
        }}
      >
        <Link
          to="/"
          style={{
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '-0.3px',
          }}
        >
          Support Ticket System
        </Link>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <Link to="/" style={getLinkStyle('/')}>
            Submit Ticket
          </Link>

          <Link to="/track" style={getLinkStyle('/track')}>
            Track Ticket
          </Link>

          <Link to="/login" style={getLinkStyle('/login')}>
            Admin / Staff Login
          </Link>
        </div>
      </nav>
    </header>
  );
}