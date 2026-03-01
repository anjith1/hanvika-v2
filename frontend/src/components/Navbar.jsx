// src/components/Navbar.jsx
import React, { useState, useEffect, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';


const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">

        {/* Logo */}
        <div className="navbar-logo">
          <NavLink to="/" onClick={closeMenu}>
            HanVika -AG
          </NavLink>
        </div>

        {/* Menu items */}
        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            onClick={() => {
              closeMenu();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Home
          </NavLink>

          <NavLink
            to="/"
            className="nav-item no-underline"
            onClick={(e) => {
              e.preventDefault();
              closeMenu();
              const workersSection = document.getElementById('workers-availability');
              if (workersSection) {
                workersSection.scrollIntoView({ behavior: 'smooth' });
              } else {
                navigate('/');
                setTimeout(() => {
                  const section = document.getElementById('workers-availability');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
          >
            Request Service
          </NavLink>



          {/* Reviews - Dropdown */}
          <div className="nav-dropdown">
            <NavLink
              to="/reviews"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              onClick={closeMenu}
            >
              Client Feedback
            </NavLink>
            <div className="dropdown-content">
              <NavLink to="/reviews" onClick={closeMenu}>View Feedback</NavLink>
              <NavLink to="/add-review" onClick={closeMenu}>Submit Feedback</NavLink>
            </div>
          </div>



          {/* Authentication */}
          {isAuthenticated ? (
            <button className="nav-item logoff-btn" onClick={handleLogout}>
              Logoff
            </button>
          ) : (
            <NavLink
              to="/select"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              onClick={closeMenu}
            >
              Login
            </NavLink>
          )}

          <NavLink
            to="/contact"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            onClick={closeMenu}
          >
            Contact
          </NavLink>


        </div>

        {/* Mobile Toggle */}
        <div className={`navbar-toggle ${menuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
