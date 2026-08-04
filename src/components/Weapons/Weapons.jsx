import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGsapReveal } from '../../hooks/useGsapReveal';
import './Weapons.scss';

const WEAPONS = [
  {
    id: 'hammer',
    title: 'Sacred War Hammer',
    subtitle: 'Divine Judgment',
    description:
      'Forged in the fires of the Celestial Forge, the Sacred War Hammer channels the wrath of the heavens. Each swing sends shockwaves of holy energy that shatter the defenses of even the most fortified demons.',
    stats: ['+450 Attack Power', 'Holy Damage', 'Area Impact', 'Stun Effect'],
    image: '/assets/war-hammer.svg',
    align: 'left',
  },
  {
    id: 'shield',
    title: 'Aegis of Faith',
    subtitle: 'Unbreakable Bastion',
    description:
      'The Aegis of Faith is no ordinary shield — it is a conduit of divine protection. Blessed by the High Priests of MU, it absorbs incoming damage and reflects a portion back as holy light, turning aggression into salvation.',
    stats: ['+380 Defense', 'Damage Reflect', 'Party Buff', 'Holy Barrier'],
    image: '/assets/shield.svg',
    align: 'right',
  },
];

function WeaponCard({ weapon, index }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -15, y: x * 15 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      ref={cardRef}
      className={`weapons__card weapons__card--${weapon.align}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2, duration: 0.8 }}
    >
      <div className="weapons__card-glow" />
      <div className="weapons__card-inner">
        <div className="weapons__card-visual">
          <img src={weapon.image} alt={weapon.title} loading="lazy" />
        </div>
        <div className="weapons__card-content">
          <span className="weapons__card-subtitle">{weapon.subtitle}</span>
          <h3 className="weapons__card-title">{weapon.title}</h3>
          <p className="weapons__card-desc">{weapon.description}</p>
          <ul className="weapons__card-stats">
            {weapon.stats.map((stat) => (
              <li key={stat}>{stat}</li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export default function Weapons() {
  const headerRef = useRef(null);
  useGsapReveal(headerRef);

  return (
    <section id="weapons" className="weapons">
      <div className="weapons__inner">
        <div className="section-header" ref={headerRef}>
          <span className="section-label">Arsenal</span>
          <h2 className="section-title">Weapons of Light</h2>
          <div className="divider" />
          <p className="section-subtitle">
            Two instruments of divine justice. One to smite, one to protect.
          </p>
        </div>

        <div className="weapons__grid">
          {WEAPONS.map((weapon, i) => (
            <WeaponCard key={weapon.id} weapon={weapon} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
