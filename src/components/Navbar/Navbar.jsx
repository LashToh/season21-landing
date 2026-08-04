import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import './Navbar.scss';

const NAV_LINKS = [
  { label: 'Crusader', href: '#crusader' },
  { label: 'Arsenal', href: '#weapons' },
  { label: 'Skills', href: '#skills' },
  { label: 'Features', href: '#features' },
  { label: 'Media', href: '#gallery' },
  { label: 'Timeline', href: '#timeline' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleNav = (href) => {
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <nav className="navbar__inner">
        <a href="#hero" className="navbar__logo" onClick={(e) => { e.preventDefault(); handleNav('#hero'); }}>
          <span className="navbar__logo-mark">MU</span>
          <span className="navbar__logo-text">
            <span className="navbar__logo-season">Season 21</span>
            <span className="navbar__logo-sub">Crusader</span>
          </span>
        </a>

        <ul className="navbar__links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={(e) => { e.preventDefault(); handleNav(link.href); }}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a href="#download" className="btn btn--primary navbar__cta" onClick={(e) => { e.preventDefault(); handleNav('#download'); }}>
          Play Now
        </a>

        <button
          className="navbar__toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <HiX /> : <HiMenuAlt3 />}
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="navbar__mobile"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <ul className="navbar__mobile-links">
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <a href={link.href} onClick={(e) => { e.preventDefault(); handleNav(link.href); }}>
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <a href="#download" className="btn btn--primary btn--large" onClick={(e) => { e.preventDefault(); handleNav('#download'); }}>
              Play Now
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
