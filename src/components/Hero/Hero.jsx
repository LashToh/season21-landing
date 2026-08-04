import { useRef } from 'react';
import { FaPlay, FaDownload } from 'react-icons/fa';
import Embers from '../Embers';
import { useGsapHero } from '../../hooks/useGsapReveal';
import { useParallax } from '../../hooks/useParallax';
import './Hero.scss';

export default function Hero() {
  const sectionRef = useRef(null);
  const bgRef = useParallax(0.03);
  const charRef = useParallax(0.06);
  useGsapHero(sectionRef);

  return (
    <section id="hero" className="hero" ref={sectionRef}>
      <div className="hero__bg" ref={bgRef}>
        <div className="hero__bg-gradient" />
        <div className="hero__bg-vignette" />
        <div className="hero__fog hero__fog--1" />
        <div className="hero__fog hero__fog--2" />
      </div>

      <Embers intensity={1.2} />

      <div className="hero__content">
        <div className="hero__text">
          <span className="hero__label section-label">MU Online</span>
          <h1 className="hero__title">
            <span className="hero__title-line">Season 21</span>
            <span className="hero__title-line hero__title-line--accent">The Crusader Awakens</span>
          </h1>
          <p className="hero__subtitle">
            A holy warrior rises from the ashes of war. Wield the sacred war hammer
            and divine shield. Unbreakable faith meets unstoppable fury.
          </p>
          <div className="hero__actions">
            <button className="btn btn--primary btn--large">
              <FaPlay /> Watch Trailer
            </button>
            <a href="#download" className="btn btn--secondary btn--large">
              <FaDownload /> Download
            </a>
          </div>
        </div>

        <div className="hero__character" ref={charRef}>
          <div className="hero__character-glow" />
          <img
            src="/assets/crusader-hero.svg"
            alt="The Crusader — Holy Knight with War Hammer and Shield"
            className="hero__character-img"
            loading="eager"
          />
          <div className="hero__character-smoke" />
        </div>
      </div>

      <div className="hero__scroll">
        <span>Scroll</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
}
