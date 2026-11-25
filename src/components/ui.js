import { icon } from '../icons.js';
import { getLang, t } from '../i18n.js';
import { ASSETS, getSettings, isFavorite, LOGO_URL } from '../store.js';
import { buildWhatsAppUrl, calcDaysLeft, calcProgress, escHtml, formatRupiah } from '../utils.js';

let toastTimer = null;

export function showToast(message) {
  const region = document.getElementById('toast-region');
  if (!region) return;
  region.innerHTML = `<div class="toast">${escHtml(message)}</div>`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    region.innerHTML = '';
  }, 3600);
}

export function openConfirmModal({
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  danger = false,
  onConfirm,
}) {
  const root = document.getElementById('modal-root');
  if (!root) return;

  const previousFocus = document.activeElement;
  root.innerHTML = `
    <div class="modal-backdrop" data-modal-backdrop>
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h3 id="modal-title">${escHtml(title)}</h3>
        <p>${escHtml(message)}</p>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" data-modal-cancel>${escHtml(cancelLabel)}</button>
          <button type="button" class="btn ${danger ? 'btn-danger' : ''}" data-modal-confirm>${escHtml(confirmLabel)}</button>
        </div>
      </div>
    </div>
  `;

  const close = () => {
    root.innerHTML = '';
    document.removeEventListener('keydown', onKeyDown);
    if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus();
    }
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      close();
    }
  };

  document.addEventListener('keydown', onKeyDown);
  root.querySelector('[data-modal-cancel]')?.addEventListener('click', close);
  root.querySelector('[data-modal-backdrop]')?.addEventListener('click', (event) => {
    if (event.target.hasAttribute('data-modal-backdrop')) close();
  });
  root.querySelector('[data-modal-confirm]')?.addEventListener('click', () => {
    close();
    if (typeof onConfirm === 'function') onConfirm();
  });

  root.querySelector('[data-modal-confirm]')?.focus();
}

export function renderMediaFrame(src, alt, fallbackTitle, heroAspect = false) {
  const safeSrc = escHtml(src || ASSETS.hero);
  const safeAlt = escHtml(alt || fallbackTitle || '');
  const safeFallback = escHtml(fallbackTitle || 'Mari Berdonasi');
  return `
    <div class="media-frame ${heroAspect ? 'is-hero-aspect' : ''}">
      <div class="media-fallback" aria-hidden="true">
        ${icon('layers', 24)}
        <span>${safeFallback}</span>
      </div>
      <img
        src="${safeSrc}"
        alt="${safeAlt}"
        loading="lazy"
        referrerpolicy="no-referrer"
        onerror="this.style.display='none'"
      />
    </div>
  `;
}

export function renderStatusBadge(status) {
  const value = String(status || '').toLowerCase();
  if (value === 'berhasil' || value === 'tersalurkan' || value === 'selesai' || value === 'aktif') {
    const cls = value === 'aktif' ? 'status-info' : 'status-ok';
    return `<span class="status-badge ${cls}">${icon('check', 13)} ${escHtml(status)}</span>`;
  }
  if (value.includes('menunggu') || value.includes('proses')) {
    return `<span class="status-badge status-wait">${escHtml(status)}</span>`;
  }
  if (value.includes('batal')) {
    return `<span class="status-badge status-bad">${icon('close', 13)} ${escHtml(status)}</span>`;
  }
  return `<span class="status-badge status-info">${escHtml(status)}</span>`;
}

export function renderProgramCard(program) {
  const progress = calcProgress(program);
  const fav = isFavorite(program.id);
  const isActive = program.status === 'Aktif';
  const timeInfo = isActive ? `${calcDaysLeft(program)} ${t('daysLeft')}` : program.status;

  return `
    <article class="card">
      <a href="#program-${program.id}" tabindex="-1" aria-hidden="true">
        ${renderMediaFrame(program.imageUrl || ASSETS.hero, program.namaProgram, program.namaProgram)}
      </a>
      <div class="card-body">
        <div class="meta-line">
          <span>${escHtml(program.kategori)}</span>
          <span aria-hidden="true">·</span>
          <span>${escHtml(timeInfo)}</span>
        </div>
        <h3 class="card-title">
          <a href="#program-${program.id}">${escHtml(program.namaProgram)}</a>
        </h3>
        <p class="card-desc">${escHtml(program.deskripsi)}</p>
        <div class="progress-track" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100" aria-label="${escHtml(program.namaProgram)}">
          <div class="progress-fill" style="width:${progress}%"></div>
        </div>
        <div class="progress-stats">
          <strong>${formatRupiah(program.danaTerkumpul)}</strong>
          <span>${progress}% · ${formatRupiah(program.targetDonasi)}</span>
        </div>
        <div class="meta-line">
          <span>${program.jumlahPenerimaManfaat} ${t('beneficiaries')}</span>
          <span aria-hidden="true">·</span>
          <span>${escHtml(program.lokasi)}</span>
        </div>
        <div class="card-actions">
          <a class="btn btn-outline btn-sm" href="#program-${program.id}">${t('detail')}</a>
          ${
            isActive
              ? `<a class="btn btn-sm" href="#donate-${program.id}">${t('donateShort')}</a>`
              : ''
          }
          <button
            type="button"
            class="btn btn-outline btn-icon ${fav ? 'is-active' : ''}"
            data-fav-id="${program.id}"
            aria-pressed="${fav}"
            aria-label="${fav ? t('unfavorite') : t('favorite')}"
            title="${fav ? t('unfavorite') : t('favorite')}"
          >
            ${icon('heart', 18, fav)}
          </button>
        </div>
      </div>
    </article>
  `;
}

export function renderActivityCard(activity) {
  return `
    <article class="card">
      <a href="#act-${activity.id}" tabindex="-1" aria-hidden="true">
        ${renderMediaFrame(activity.imageUrl || ASSETS.hero, activity.namaKegiatan, activity.namaKegiatan)}
      </a>
      <div class="card-body">
        <div class="meta-line">
          <span>${escHtml(activity.tanggal)}</span>
          <span aria-hidden="true">·</span>
          <span>${escHtml(activity.lokasi)}</span>
        </div>
        <h3 class="card-title">
          <a href="#act-${activity.id}">${escHtml(activity.namaKegiatan)}</a>
        </h3>
        <p class="card-desc">${escHtml(activity.deskripsi)}</p>
        <div class="card-actions">
          <a class="btn btn-outline btn-sm" href="#act-${activity.id}">${t('detail')}</a>
        </div>
      </div>
    </article>
  `;
}

export function renderHeader(activeRoute) {
  const settings = getSettings();
  const header = document.getElementById('site-header');
  if (!header) return;

  header.innerHTML = `
    <div class="wrap header-inner">
      <a class="brand-lockup" href="#home">
        <span class="brand-logo-frame">
          <img src="${LOGO_URL}" alt="Logo ${escHtml(settings.namaWebsite)}" />
        </span>
        <span class="brand-wordmark">${escHtml(settings.namaWebsite)}</span>
      </a>
      <div class="header-actions">
        <div class="header-secondary-links">
          <a href="#acts" ${activeRoute === 'acts' || activeRoute === 'act' ? 'aria-current="page"' : ''}>${t('navActs')}</a>
          <a href="#about" ${activeRoute === 'about' ? 'aria-current="page"' : ''}>${t('navAbout')}</a>
        </div>
        <a class="btn btn-gold btn-sm header-donate-cta" href="#donate">${t('donateCta')}</a>
      </div>
    </div>
  `;
}

export function renderBottomNav(activeRoute) {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;

  const isProgramRoute = activeRoute === 'programs' || activeRoute === 'program';
  const isDonateRoute = activeRoute === 'donate' || activeRoute === 'tx';

  const tabs = [
    { key: 'home', href: '#home', iconName: 'home', label: t('navHome'), active: activeRoute === 'home' },
    { key: 'programs', href: '#programs', iconName: 'layers', label: t('navPrograms'), active: isProgramRoute },
    {
      key: 'donate',
      href: '#donate',
      iconName: 'heart',
      label: t('donateShort'),
      active: isDonateRoute,
      isDonate: true,
    },
    { key: 'report', href: '#report', iconName: 'shield', label: t('navReport'), active: activeRoute === 'report' },
    { key: 'history', href: '#history', iconName: 'clock', label: t('navHistory'), active: activeRoute === 'history' },
  ];

  nav.innerHTML = tabs
    .map(
      (tab) => `
        <a
          href="${tab.href}"
          class="bottom-tab ${tab.isDonate ? 'is-donate' : ''}"
          ${tab.active ? 'aria-current="page"' : ''}
        >
          ${icon(tab.iconName, 21, tab.active && tab.key === 'donate')}
          <span>${escHtml(tab.label)}</span>
        </a>
      `
    )
    .join('');
}

export function renderFooter() {
  const settings = getSettings();
  const footer = document.getElementById('site-footer');
  if (!footer) return;
  const lang = getLang();

  footer.innerHTML = `
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <div class="footer-brand-row">
            <span class="brand-logo-frame">
              <img src="${LOGO_URL}" alt="" aria-hidden="true" />
            </span>
            <div class="footer-brand">${escHtml(settings.namaWebsite)}</div>
          </div>
          <p style="max-width:44ch;font-size:0.9375rem;margin-bottom:12px">${escHtml(settings.deskripsi)}</p>
          <p style="font-size:0.875rem;opacity:0.9">${escHtml(settings.alamat)}<br>${escHtml(settings.email)}</p>
        </div>
        <div>
          <div class="footer-heading">${t('footerQuickLinks')}</div>
          <ul class="footer-links">
            <li><a href="#home">Beranda</a></li>
            <li><a href="#programs">${t('navPrograms')}</a></li>
            <li><a href="#acts">${t('navActs')}</a></li>
            <li><a href="#history">${t('navHistory')}</a></li>
            <li><a href="#about">${t('navAbout')}</a></li>
          </ul>
        </div>
        <div>
          <div class="footer-heading">${t('footerGovernance')}</div>
          <ul class="footer-links">
            <li><a href="#report">${t('navReport')}</a></li>
            <li><a href="#donate">${t('donateCta')}</a></li>
            <li><a target="_blank" rel="noopener" href="${buildWhatsAppUrl(settings.nomorWhatsApp, 'Halo Mari Berdonasi, saya ingin bertanya mengenai program donasi.')}">WhatsApp</a></li>
            <li><a href="#admin">${t('adminLink')}</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>${escHtml(settings.namaWebsite)} · ${t('simDisclaimer')}</span>
        <div class="lang-switch" role="group" aria-label="Pilihan bahasa">
          <button type="button" data-set-lang="id" class="${lang === 'id' ? 'is-active' : ''}">Indonesia</button>
          <button type="button" data-set-lang="en" class="${lang === 'en' ? 'is-active' : ''}">English</button>
        </div>
      </div>
    </div>
  `;
}
