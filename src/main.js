import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/admin.css';

import { icon } from './icons.js';
import { getLang } from './i18n.js';
import { initRouter } from './router.js';

function initApp() {
  document.documentElement.lang = getLang();

  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.innerHTML = icon('arrowUp', 20);
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const toggleVisibility = () => {
      backToTopBtn.hidden = window.scrollY < 360;
    };
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();
  }

  initRouter();
}

initApp();
