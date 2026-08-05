import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  GiCrossedSwords,
  GiCastle,
  GiTreasureMap,
  GiShield,
  GiCrystalGrowth,
  GiDragonHead,
} from 'react-icons/gi';
import { useGsapReveal } from '../../hooks/useGsapReveal';
import './Features.scss';

const FEATURES = [
  {
    icon: GiCrossedSwords,
    title: 'Crusader Class',
    description: 'The first holy knight class in MU Online history. War hammer and shield combat with unique faith-based mechanics.',
  },
  {
    icon: GiCastle,
    title: 'Castle Siege Revamp',
    description: 'Completely redesigned siege warfare with new defensive structures, siege weapons, and strategic depth.',
  },
  {
    icon: GiTreasureMap,
    title: 'New Hunting Grounds',
    description: 'Three new zones of dark fantasy landscapes filled with powerful monsters and legendary loot drops.',
  },
  {
    icon: GiShield,
    title: 'Guardian System',
    description: 'Enhanced companion system with Crusader-specific guardian spirits that amplify holy abilities.',
  },
  {
    icon: GiCrystalGrowth,
    title: 'Artifact Awakening',
    description: 'Unlock the true power of ancient artifacts with the new awakening system and visual transformations.',
  },
  {
    icon: GiDragonHead,
    title: 'World Boss Events',
    description: 'Epic world boss encounters requiring coordinated raids. New loot tables with Crusader-exclusive gear.',
  },
];

export default function Features() {
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  useGsapReveal(headerRef);
  useGsapReveal(gridRef, { children: true, stagger: 0.1 });

  return (
    <section id="features" className="features">
      <div className="features__inner">
        <div className="section-header" ref={headerRef}>
          <span className="section-label">Season XXI</span>
          <h2 className="section-title">What's New</h2>
          <div className="divider" />
          <p className="section-subtitle">
            Season 21 brings the largest content update in MU Online history.
          </p>
        </div>

        <div className="features__grid" ref={gridRef}>
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="features__card glass-card"
              whileHover={{ scale: 1.03, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              <div className="features__card-icon">
                <feature.icon />
              </div>
              <h3 className="features__card-title">{feature.title}</h3>
              <p className="features__card-desc">{feature.description}</p>
              <span className="features__card-number">
                {String(i + 1).padStart(2, '0')}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
