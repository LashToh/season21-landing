import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlay } from 'react-icons/fa';
import { useGsapReveal } from '../../hooks/useGsapReveal';
import './Skills.scss';

const SKILLS = [
  {
    id: 'judgment',
    name: 'Divine Judgment',
    type: 'Active',
    description: 'Leaps into the air and slams the war hammer down, creating a shockwave of holy energy that damages all enemies in a wide radius.',
    icon: '⚡',
    color: '#C61717',
  },
  {
    id: 'aegis',
    name: 'Aegis Barrier',
    type: 'Defensive',
    description: 'Raises the shield to create an impenetrable holy barrier, absorbing all damage for the party and reflecting 30% back to attackers.',
    icon: '🛡',
    color: '#F0D08A',
  },
  {
    id: 'consecration',
    name: 'Consecration',
    type: 'Area',
    description: 'Consecrates the ground beneath, dealing continuous holy damage to enemies while healing allies standing within the sacred circle.',
    icon: '✦',
    color: '#C61717',
  },
  {
    id: 'crusade',
    name: 'Crusade Charge',
    type: 'Mobility',
    description: 'Charges forward with shield raised, knocking back enemies and gaining temporary invulnerability during the dash.',
    icon: '→',
    color: '#F0D08A',
  },
  {
    id: 'smite',
    name: 'Hammer of Smite',
    type: 'Single Target',
    description: 'A devastating overhead strike that deals massive holy damage to a single target, with increased damage against dark-aligned enemies.',
    icon: '🔨',
    color: '#C61717',
  },
  {
    id: 'blessing',
    name: 'Blessing of Light',
    type: 'Support',
    description: 'Channels divine light to buff all party members with increased attack power and defense for a duration.',
    icon: '☀',
    color: '#F0D08A',
  },
];

function SkillCard({ skill, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="skills__card glass-card"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.6 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="skills__card-glow" style={{ '--skill-color': skill.color }} />
      <div className="skills__card-header">
        <span className="skills__card-icon">{skill.icon}</span>
        <span className="skills__card-type">{skill.type}</span>
      </div>
      <h3 className="skills__card-name">{skill.name}</h3>
      <p className="skills__card-desc">{skill.description}</p>
      <motion.div
        className="skills__card-preview"
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
        transition={{ duration: 0.3 }}
      >
        <div className="skills__card-video-placeholder">
          <FaPlay />
          <span>Preview</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Skills() {
  const headerRef = useRef(null);
  useGsapReveal(headerRef);

  return (
    <section id="skills" className="skills">
      <div className="skills__bg" />
      <div className="skills__inner">
        <div className="section-header" ref={headerRef}>
          <span className="section-label">Combat</span>
          <h2 className="section-title">Holy Skills</h2>
          <div className="divider" />
          <p className="section-subtitle">
            Master the divine arts of war. Each skill forged in faith, tempered in battle.
          </p>
        </div>

        <div className="skills__grid">
          {SKILLS.map((skill, i) => (
            <SkillCard key={skill.id} skill={skill} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
