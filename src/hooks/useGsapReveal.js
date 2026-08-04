import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useGsapReveal(ref, options = {}) {
  const {
    y = 60,
    duration = 1,
    delay = 0,
    start = 'top 85%',
    stagger = 0,
    children = false,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = children ? el.children : el;

    gsap.fromTo(
      targets,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration,
        delay,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill();
      });
    };
  }, [ref, y, duration, delay, start, stagger, children]);
}

export function useGsapHero(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(
      el.querySelector('.hero__label'),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8 },
      0.3
    )
      .fromTo(
        el.querySelector('.hero__title-line'),
        { opacity: 0, y: 80 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.15 },
        0.5
      )
      .fromTo(
        el.querySelector('.hero__subtitle'),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8 },
        1
      )
      .fromTo(
        el.querySelector('.hero__actions'),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 },
        1.2
      )
      .fromTo(
        el.querySelector('.hero__character'),
        { opacity: 0, x: 100, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 1.4 },
        0.6
      );

    return () => tl.kill();
  }, [ref]);
}
