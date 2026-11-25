import { renderActivityCard, renderMediaFrame } from '../components/ui.js';
import { icon } from '../icons.js';
import { t } from '../i18n.js';
import { ASSETS, getActivity, getState } from '../store.js';
import { escHtml } from '../utils.js';

export function renderActivitiesView() {
  const state = getState();
  return `
    <section class="section">
      <div class="wrap">
        <div class="section-header">
          <div>
            <h1>${t('navActs')}</h1>
            <p class="section-subtitle">Dokumentasi kegiatan penyaluran dan pendampingan lapangan.</p>
          </div>
        </div>
        ${
          state.acts.length
            ? `<div class="card-grid">${state.acts.map(renderActivityCard).join('')}</div>`
            : `<div class="empty-state"><h3>Belum ada kegiatan tercatat</h3><p>Dokumentasi kegiatan lapangan akan ditampilkan di sini.</p></div>`
        }
      </div>
    </section>
  `;
}

export function renderActivityDetailView(id) {
  const activity = getActivity(id);
  if (!activity) {
    return `
      <section class="section">
        <div class="wrap">
          <div class="empty-state">
            <h2>${t('notFoundTitle')}</h2>
            <p>${t('notFoundDesc')}</p>
            <a class="btn" href="#acts">${t('navActs')}</a>
          </div>
        </div>
      </section>
    `;
  }

  const related = getState().acts.filter((a) => Number(a.id) !== Number(activity.id)).slice(0, 3);

  return `
    <section class="section">
      <div class="wrap">
        <p style="margin-bottom:20px">
          <button type="button" class="btn btn-outline btn-sm" data-nav-back="#acts">
            ${icon('chevronLeft', 16)} ${t('back')}
          </button>
        </p>

        <div class="two-col-stretch">
          <div>
            ${renderMediaFrame(activity.imageUrl || ASSETS.hero, activity.namaKegiatan, activity.namaKegiatan, true)}
          </div>
          <div class="panel">
            <div class="meta-line" style="margin-bottom:10px">
              <span>${escHtml(activity.tanggal)}</span>
              <span aria-hidden="true">·</span>
              <span>${escHtml(activity.lokasi)}</span>
            </div>
            <h1 style="font-size:clamp(1.65rem,2.6vw,2.2rem);margin-bottom:14px">${escHtml(activity.namaKegiatan)}</h1>
            <p class="prose" style="color:var(--color-ink-muted);margin-bottom:24px">${escHtml(activity.deskripsi)}</p>
            <a class="btn" href="#programs">${t('browsePrograms')}</a>
          </div>
        </div>

        ${
          related.length
            ? `
              <div style="margin-top:48px">
                <h2 style="margin-bottom:20px">Kegiatan Lainnya</h2>
                <div class="card-grid">${related.map(renderActivityCard).join('')}</div>
              </div>
            `
            : ''
        }
      </div>
    </section>
  `;
}
