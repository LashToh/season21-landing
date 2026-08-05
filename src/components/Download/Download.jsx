import { useRef } from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaDiscord, FaUserPlus } from 'react-icons/fa';
import Embers from '../Embers';
import { useGsapReveal } from '../../hooks/useGsapReveal';
import './Download.scss';

export default function Download() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  useGsapReveal(contentRef, { y: 80, duration: 1 });

  return (
    <section id="download" className="download" ref={sectionRef}>
      <Embers intensity={0.6} />
      <div className="download__bg">
        <div className="download__bg-glow" />
      </div>

      <div className="download__inner" ref={contentRef}>
        <span className="section-label">Join the Battle</span>
        <h2 className="download__title">
          The Crusader<br />Awaits You
        </h2>
        <div className="divider" />
        <p className="download__subtitle">
          Download the client, create your account, and step into Season 21.
          The holy war begins now.
        </p>

        <div className="download__actions">
          <motion.a
            href="#"
            className="btn btn--primary btn--large download__btn-main"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaDownload /> Download Client
          </motion.a>

          <div className="download__secondary">
            <a href="#" className="btn btn--secondary">
              <FaUserPlus /> Register Account
            </a>
            <a href="#" className="btn btn--ghost">
              <FaDiscord /> Join Discord
            </a>
          </div>
        </div>

        <div className="download__requirements glass-card">
          <h3>System Requirements</h3>
          <div className="download__req-grid">
            <div>
              <h4>Minimum</h4>
              <ul>
                <li>OS: Windows 10 64-bit</li>
                <li>CPU: Intel i3 / AMD Ryzen 3</li>
                <li>RAM: 4 GB</li>
                <li>GPU: GTX 750 Ti</li>
                <li>Storage: 8 GB</li>
              </ul>
            </div>
            <div>
              <h4>Recommended</h4>
              <ul>
                <li>OS: Windows 11 64-bit</li>
                <li>CPU: Intel i5 / AMD Ryzen 5</li>
                <li>RAM: 8 GB</li>
                <li>GPU: GTX 1060</li>
                <li>Storage: 12 GB SSD</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
