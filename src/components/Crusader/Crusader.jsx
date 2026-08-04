import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useGsapReveal } from '../../hooks/useGsapReveal';
import './Crusader.scss';

const STATS = [
  { label: 'Strength', value: 95, icon: '⚔' },
  { label: 'Defense', value: 98, icon: '🛡' },
  { label: 'Faith', value: 100, icon: '✦' },
  { label: 'Vitality', value: 88, icon: '♥' },
];

export default function Crusader() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  useGsapReveal(contentRef, { children: true, stagger: 0.15 });

  return (
    <section id="crusader" className="crusader" ref={sectionRef}>
      <div className="crusader__bg">
        <div className="crusader__bg-light" />
      </div>

      <div className="crusader__inner">
        <div className="crusader__visual" ref={contentRef}>
          <div className="crusader__frame">
            <div className="crusader__frame-glow" />
            <img
              src="/assets/crusader-portrait.svg"
              alt="Crusader portrait — Holy Knight"
              className="crusader__portrait"
              loading="lazy"
            />
          </div>
          <div className="crusader__badge">
            <span>New Class</span>
          </div>
        </div>

        <div className="crusader__info">
          <span className="section-label">New Hero</span>
          <h2 className="section-title">The Crusader</h2>
          <div className="divider divider--left" />

          <p className="crusader__lore">
            Born from the sacred orders of ancient MU, the Crusader is a holy knight
            sworn to protect the realm against darkness. Clad in silver armor adorned
            with golden sacred symbols, draped in a crimson cape of martyrdom, this
            warrior channels divine wrath through a massive war hammer and an
            impenetrable shield.
          </p>

          <p className="crusader__lore crusader__lore--secondary">
            Where others falter, the Crusader stands unyielding. Each strike of the
            hammer carries the weight of consecrated steel. Each block of the shield
            echoes with the prayers of a thousand saints.
          </p>

          <div className="crusader__stats">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="crusader__stat glass-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <span className="crusader__stat-icon">{stat.icon}</span>
                <div className="crusader__stat-info">
                  <span className="crusader__stat-label">{stat.label}</span>
                  <div className="crusader__stat-bar">
                    <motion.div
                      className="crusader__stat-fill"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${stat.value}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="crusader__stat-value">{stat.value}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
