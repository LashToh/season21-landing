import { FaDiscord, FaTwitter, FaYoutube, FaFacebookF } from 'react-icons/fa';
import './Footer.scss';

const SOCIAL = [
  { icon: FaDiscord, label: 'Discord', href: '#' },
  { icon: FaTwitter, label: 'Twitter', href: '#' },
  { icon: FaYoutube, label: 'YouTube', href: '#' },
  { icon: FaFacebookF, label: 'Facebook', href: '#' },
];

const FOOTER_LINKS = [
  {
    title: 'Game',
    links: ['Download', 'Register', 'Rankings', 'Support'],
  },
  {
    title: 'Community',
    links: ['Forums', 'Discord', 'Events', 'Fan Art'],
  },
  {
    title: 'Legal',
    links: ['Terms of Service', 'Privacy Policy', 'Cookie Policy'],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="footer__logo">
              <span className="footer__logo-mark">MU</span>
              <div>
                <span className="footer__logo-season">Season 21</span>
                <span className="footer__logo-name">Crusader</span>
              </div>
            </div>
            <p className="footer__tagline">
              A fan-made promotional landing page for MU Online Season 21.
              Not affiliated with Webzen Inc.
            </p>
            <div className="footer__social">
              {SOCIAL.map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} aria-label={label} className="footer__social-link">
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div className="footer__links">
            {FOOTER_LINKS.map((group) => (
              <div key={group.title} className="footer__link-group">
                <h4>{group.title}</h4>
                <ul>
                  {group.links.map((link) => (
                    <li key={link}>
                      <a href="#">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; 2026 LashToh. All rights reserved.</p>
          <p className="footer__disclaimer">
            MU Online is a registered trademark of Webzen Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
