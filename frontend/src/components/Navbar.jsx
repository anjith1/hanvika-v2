// frontend/src/components/Navbar.jsx
import React, { useState, useEffect, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const close = () => setMenuOpen(false);
  const handleLogout = () => { logout(); close(); navigate('/'); };

  return (
    <nav className={`nb ${scrolled ? 'nb--solid' : ''}`}>
      <div className="nb-inner">
        <NavLink to="/" className="nb-logo" onClick={close}>
          <div className="nb-mark">H</div>
          <span>HanVika</span>
        </NavLink>

        <div className={`nb-menu ${menuOpen ? 'nb-menu--open' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => `nb-link${isActive ? ' nb-link--on' : ''}`} onClick={close}>Home</NavLink>
          <NavLink to="/reviews" className={({ isActive }) => `nb-link${isActive ? ' nb-link--on' : ''}`} onClick={close}>Feedback</NavLink>
          <NavLink to="/contact" className={({ isActive }) => `nb-link${isActive ? ' nb-link--on' : ''}`} onClick={close}>Contact</NavLink>
          {isAuthenticated
            ? <button className="nb-link nb-link--out" onClick={handleLogout}>Logout</button>
            : <NavLink to="/select" className="nb-cta" onClick={close}>Login →</NavLink>
          }
        </div>

        <button className={`nb-burger ${menuOpen ? 'nb-burger--x' : ''}`} onClick={() => setMenuOpen(p => !p)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
