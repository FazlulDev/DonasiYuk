import { renderBottomNav, renderFooter, renderHeader, showToast } from './components/ui.js';
import { t, setLang } from './i18n.js';
import { toggleFavorite } from './store.js';
import { mountAboutView, renderAboutView } from './views/about.js';
import { renderActivitiesView, renderActivityDetailView } from './views/activities.js';
import { mountAdminView, renderAdminView } from './views/admin.js';
import { mountDonateView, renderDonateView } from './views/donate.js';
import { mountHistoryView, renderHistoryView } from './views/history.js';
import { renderHomeView } from './views/home.js';
import { mountProgramDetailView, renderProgramDetailView } from './views/programDetail.js';
import { mountProgramsView, renderProgramsView } from './views/programs.js';
import { mountReportView, renderReportView } from './views/report.js';
import { mountTransactionView, renderTransactionView } from './views/transaction.js';

let navHistoryCount = 0;

function parseRoute() {
  const raw = (window.location.hash || '#home').slice(1);
  const [name, ...rest] = raw.split('-');
  return {
    route: name || 'home',
    arg: rest.join('-'),
  };
}

export function navigate(hash) {
  window.location.hash = hash;
}

export function renderCurrentRoute(preserveScroll = false) {
  const { route, arg } = parseRoute();
  const appEl = document.getElementById('app');
  if (!appEl) return;

  document.body.classList.toggle('is-admin', route === 'admin');

  if (route !== 'admin') {
    renderHeader(route);
    renderBottomNav(route);
    renderFooter();
  }

  let html = '';
  let afterMount = null;

  switch (route) {
    case 'home':
      html = renderHomeView();
      break;
    case 'programs':
      html = renderProgramsView(arg);
      afterMount = () => mountProgramsView();
      break;
    case 'program':
      html = renderProgramDetailView(arg);
      afterMount = () => mountProgramDetailView();
      break;
    case 'donate':
      html = renderDonateView(arg);
      afterMount = () => mountDonateView(navigate);
      break;
    case 'tx':
      html = renderTransactionView(arg);
      afterMount = () => mountTransactionView(arg, () => renderCurrentRoute(true));
      break;
    case 'history':
      html = renderHistoryView();
      afterMount = () => mountHistoryView();
      break;
    case 'report':
      html = renderReportView();
      afterMount = () => mountReportView();
      break;
    case 'acts':
      html = renderActivitiesView();
      break;
    case 'act':
      html = renderActivityDetailView(arg);
      break;
    case 'about':
      html = renderAboutView();
      afterMount = () => mountAboutView();
      break;
    case 'admin':
      html = renderAdminView();
      afterMount = () => mountAdminView(() => renderCurrentRoute(true), navigate);
      break;
    default:
      html = `
        <section class="section">
          <div class="wrap">
            <div class="empty-state">
              <h1>${t('notFoundTitle')}</h1>
              <p>${t('notFoundDesc')}</p>
              <a class="btn" href="#home">${t('backHome')}</a>
            </div>
          </div>
        </section>
      `;
      break;
  }

  appEl.innerHTML = html;
  if (typeof afterMount === 'function') {
    afterMount();
  }

  if (!preserveScroll) {
    window.scrollTo(0, 0);
  }
}

export function initRouter() {
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const favBtn = target.closest('[data-fav-id]');
    if (favBtn) {
      const id = favBtn.getAttribute('data-fav-id');
      const added = toggleFavorite(id);
      showToast(added ? 'Program ditambahkan ke favorit.' : 'Program dihapus dari favorit.');
      renderCurrentRoute(true);
      return;
    }

    const backBtn = target.closest('[data-nav-back]');
    if (backBtn) {
      const fallback = backBtn.getAttribute('data-nav-back') || '#home';
      if (navHistoryCount > 0) {
        window.history.back();
      } else {
        navigate(fallback);
      }
      return;
    }

    const langBtn = target.closest('[data-set-lang]');
    if (langBtn) {
      const nextLang = langBtn.getAttribute('data-set-lang');
      setLang(nextLang);
      renderCurrentRoute(true);
      return;
    }
  });

  window.addEventListener('hashchange', () => {
    navHistoryCount += 1;
    renderCurrentRoute(false);
  });

  renderCurrentRoute(false);
}
