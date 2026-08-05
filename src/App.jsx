import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { useLenis } from './hooks/useLenis';

const Crusader = lazy(() => import('./components/Crusader'));
const Weapons = lazy(() => import('./components/Weapons'));
const Skills = lazy(() => import('./components/Skills'));
const Features = lazy(() => import('./components/Features'));
const Gallery = lazy(() => import('./components/Gallery'));
const Timeline = lazy(() => import('./components/Timeline'));
const Download = lazy(() => import('./components/Download'));
const Footer = lazy(() => import('./components/Footer'));

function SectionLoader() {
  return <div className="section-loader" aria-hidden="true" />;
}

export default function App() {
  useLenis();

  return (
    <ErrorBoundary>
      <Navbar />
      <main>
        <Hero />
        <Suspense fallback={<SectionLoader />}>
          <Crusader />
          <Weapons />
          <Skills />
          <Features />
          <Gallery />
          <Timeline />
          <Download />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </ErrorBoundary>
  );
}
