import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useGsapReveal } from '../../hooks/useGsapReveal';
import './Timeline.scss';

const EVENTS = [
  {
    date: 'January 2026',
    title: 'Teaser Reveal',
    description: 'First glimpse of the Crusader silhouette. Community speculation begins.',
    active: false,
  },
  {
    date: 'February 2026',
    title: 'Class Deep Dive',
    description: 'Full Crusader abilities, lore, and gameplay mechanics revealed in a special livestream.',
    active: false,
  },
  {
    date: 'March 2026',
    title: 'Closed Beta',
    description: 'Selected players get early access to test the Crusader class and new Season 21 content.',
    active: false,
  },
  {
    date: 'April 2026',
    title: 'Open Beta',
    description: 'All players can experience Season 21 content before the official launch.',
    active: true,
  },
  {
    date: 'May 2026',
    title: 'Season 21 Launch',
    description: 'The Crusader Awakens. Full release with all new content, zones, and systems live.',
    active: false,
  },
];

export default function Timeline() {
  const headerRef = useRef(null);
  const lineRef = useRef(null);
  useGsapReveal(headerRef);
  useGsapReveal(lineRef, { children: true, stagger: 0.15, y: 40 });

  return (
    <section id="timeline" className="timeline">
      <div className="timeline__bg" />
      <div className="timeline__inner">
        <div className="section-header" ref={headerRef}>
          <span className="section-label">Roadmap</span>
          <h2 className="section-title">Season Timeline</h2>
          <div className="divider" />
          <p className="section-subtitle">
            The path to awakening. Mark your calendar for every milestone.
          </p>
        </div>

        <div className="timeline__track" ref={lineRef}>
          <div className="timeline__line" aria-hidden="true" />

          {EVENTS.map((event, i) => (
            <motion.div
              key={event.title}
              className={`timeline__event ${event.active ? 'timeline__event--active' : ''}`}
            >
              <div className="timeline__dot">
                {event.active && <div className="timeline__dot-pulse" />}
              </div>
              <div className="timeline__card glass-card">
                <time className="timeline__date">{event.date}</time>
                <h3 className="timeline__title">{event.title}</h3>
                <p className="timeline__desc">{event.description}</p>
                {event.active && (
                  <span className="timeline__badge">Current</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
