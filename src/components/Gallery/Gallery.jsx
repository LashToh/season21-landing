import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaTimes, FaExpand } from 'react-icons/fa';
import { useGsapReveal } from '../../hooks/useGsapReveal';
import './Gallery.scss';

const GALLERY_ITEMS = [
  { id: 1, type: 'image', title: 'Crusader Reveal', gradient: 'linear-gradient(135deg, #1B0000, #6D0000)' },
  { id: 2, type: 'video', title: 'Combat Showcase', gradient: 'linear-gradient(135deg, #121212, #1B0000)' },
  { id: 3, type: 'image', title: 'Sacred Armor Set', gradient: 'linear-gradient(135deg, #6D0000, #C61717)' },
  { id: 4, type: 'image', title: 'Castle Siege', gradient: 'linear-gradient(135deg, #090909, #6D0000)' },
  { id: 5, type: 'video', title: 'Skill Preview', gradient: 'linear-gradient(135deg, #1B0000, #121212)' },
  { id: 6, type: 'image', title: 'New Zone — Ashen Vale', gradient: 'linear-gradient(135deg, #C61717, #1B0000)' },
];

function Lightbox({ item, onClose }) {
  if (!item) return null;

  return (
    <motion.div
      className="gallery__lightbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="gallery__lightbox-content"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="gallery__lightbox-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
        <div
          className="gallery__lightbox-visual"
          style={{ background: item.gradient }}
        >
          {item.type === 'video' ? (
            <div className="gallery__lightbox-play">
              <FaPlay />
              <span>Video Preview</span>
            </div>
          ) : (
            <div className="gallery__lightbox-placeholder">
              <span>{item.title}</span>
            </div>
          )}
        </div>
        <h3 className="gallery__lightbox-title">{item.title}</h3>
      </motion.div>
    </motion.div>
  );
}

export default function Gallery() {
  const headerRef = useRef(null);
  const [activeItem, setActiveItem] = useState(null);
  useGsapReveal(headerRef);

  return (
    <section id="gallery" className="gallery">
      <div className="gallery__inner">
        <div className="section-header" ref={headerRef}>
          <span className="section-label">Media</span>
          <h2 className="section-title">Gallery</h2>
          <div className="divider" />
          <p className="section-subtitle">
            Witness the power of Season 21 through screenshots and cinematic previews.
          </p>
        </div>

        <div className="gallery__grid">
          {GALLERY_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              className={`gallery__item gallery__item--${item.type}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveItem(item)}
            >
              <div className="gallery__item-visual" style={{ background: item.gradient }}>
                {item.type === 'video' && (
                  <div className="gallery__item-play">
                    <FaPlay />
                  </div>
                )}
              </div>
              <div className="gallery__item-overlay">
                <span className="gallery__item-title">{item.title}</span>
                <FaExpand className="gallery__item-expand" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeItem && (
          <Lightbox item={activeItem} onClose={() => setActiveItem(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
