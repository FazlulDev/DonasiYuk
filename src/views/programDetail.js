import { renderMediaFrame, renderStatusBadge, showToast } from '../components/ui.js';
import { icon } from '../icons.js';
import { t } from '../i18n.js';
import { ASSETS, getProgram, getSettings, isFavorite } from '../store.js';
import {
  buildWhatsAppUrl,
  calcDaysLeft,
  calcProgress,
  copyToClipboard,
  escHtml,
  formatRupiah,
} from '../utils.js';

export function renderProgramDetailView(id) {
  const program = getProgram(id);
  if (!program) {
    return `
      <section class="section">
        <div class="wrap">
          <div class="empty-state">
            <h2>${t('notFoundTitle')}</h2>
            <p>${t('notFoundDesc')}</p>
            <a class="btn" href="#programs">${t('navPrograms')}</a>
          </div>
        </div>
      </section>
    `;
  }

  const settings = getSettings();
  const progress = calcProgress(program);
  const fav = isFavorite(program.id);
  const isActive = program.status === 'Aktif';
  const waShareUrl = buildWhatsAppUrl(
    settings.nomorWhatsApp,
    `Mari bantu program "${program.namaProgram}" di ${settings.namaWebsite}: ${window.location.href}`
  );

  return `
    <section class="section">
      <div class="wrap">
        <p style="margin-bottom:20px">
          <button type="button" class="btn btn-outline btn-sm" data-nav-back="#programs">
            ${icon('chevronLeft', 16)} ${t('back')}
          </button>
        </p>

        <div class="two-col-stretch">
          <div>
            ${renderMediaFrame(program.imageUrl || ASSETS.hero, program.namaProgram, program.namaProgram, true)}
            <p class="meta-line" style="margin-top:10px">
              <span>${escHtml(program.lokasi)}</span>
              <span aria-hidden="true">·</span>
              <span>Periode ${escHtml(program.tanggalMulai)} s.d. ${escHtml(program.tanggalSelesai)}</span>
            </p>
          </div>

          <div class="panel">
            <div class="meta-line" style="margin-bottom:10px">
              <span>${escHtml(program.kategori)}</span>
              <span aria-hidden="true">·</span>
              ${renderStatusBadge(program.status)}
            </div>
            <h1 style="font-size:clamp(1.65rem,2.6vw,2.25rem);margin-bottom:12px">${escHtml(program.namaProgram)}</h1>
            <p class="prose" style="color:var(--color-ink-muted);margin-bottom:20px">${escHtml(program.deskripsi)}</p>

            <div class="progress-track" style="margin-bottom:10px" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
              <div class="progress-fill" style="width:${progress}%"></div>
            </div>
            <div class="progress-stats" style="margin-bottom:8px">
              <strong style="font-size:1.125rem">${formatRupiah(program.danaTerkumpul)}</strong>
              <span>${progress}% dari target ${formatRupiah(program.targetDonasi)}</span>
            </div>
            <div class="meta-line" style="margin-bottom:20px">
              <span>${program.jumlahPenerimaManfaat} ${t('beneficiaries')}</span>
              <span aria-hidden="true">·</span>
              <span>${isActive ? `${calcDaysLeft(program)} ${t('daysLeft')}` : program.status}</span>
            </div>

            <div style="border-top:1px solid var(--color-border);padding-top:16px;margin-bottom:22px">
              <h3 style="font-size:1rem;margin-bottom:6px">${t('fundAllocation')}</h3>
              <p style="font-size:0.9375rem;color:var(--color-ink-muted);margin:0">${escHtml(program.rincianPenggunaanDana)}</p>
            </div>

            <div style="display:flex;flex-wrap:wrap;gap:10px">
              ${
                isActive
                  ? `<a class="btn" href="#donate-${program.id}">${t('donateCta')}</a>`
                  : ''
              }
              <a class="btn btn-outline" target="_blank" rel="noopener" href="${waShareUrl}">
                ${icon('share', 16)} ${t('shareWhatsApp')}
              </a>
              <button type="button" class="btn btn-outline" id="copy-program-link">
                ${icon('copy', 16)} ${t('copyLink')}
              </button>
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
        </div>
      </div>
    </section>
  `;
}

export function mountProgramDetailView() {
  document.getElementById('copy-program-link')?.addEventListener('click', async () => {
    try {
      await copyToClipboard(window.location.href);
      showToast(t('linkCopied'));
    } catch {
      showToast('Gagal menyalin tautan.');
    }
  });
}
