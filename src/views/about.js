import { showToast } from '../components/ui.js';
import { icon } from '../icons.js';
import { t } from '../i18n.js';
import { getSettings } from '../store.js';
import { buildWhatsAppUrl, copyToClipboard, escHtml } from '../utils.js';

export function renderAboutView() {
  const settings = getSettings();
  const waUrl = buildWhatsAppUrl(
    settings.nomorWhatsApp,
    `Assalamualaikum, saya ingin bertanya mengenai program di ${settings.namaWebsite}.`
  );

  return `
    <section class="section">
      <div class="wrap">
        <div class="section-header">
          <div>
            <h1>${t('aboutTitle')}</h1>
            <p class="section-subtitle">${escHtml(settings.tagline)}</p>
          </div>
        </div>

        <div class="two-col">
          <div class="panel">
            <p class="prose" style="color:var(--color-ink-muted);margin-bottom:22px">${escHtml(settings.deskripsi)}</p>
            <h3 style="margin-bottom:6px">${t('visionTitle')}</h3>
            <p class="prose" style="color:var(--color-ink-muted);margin-bottom:18px">
              Menjadi jembatan kepedulian yang amanah dan transparan bagi pemenuhan pendidikan, gizi, serta pengasuhan anak yatim dan dhuafa.
            </p>
            <h3 style="margin-bottom:6px">${t('missionTitle')}</h3>
            <p class="prose" style="color:var(--color-ink-muted);margin:0">
              Menyediakan informasi program yang terukur, alur donasi yang ringkas, serta laporan penyaluran dana yang dapat diperiksa publik setiap saat.
            </p>
          </div>

          <div class="panel">
            <h3 style="margin-bottom:12px">${t('contactTitle')}</h3>
            <div class="receipt-grid" style="margin-bottom:18px">
              <div class="receipt-row">
                <span>Alamat</span>
                <strong>${escHtml(settings.alamat)}</strong>
              </div>
              <div class="receipt-row">
                <span>Email</span>
                <strong>${escHtml(settings.email)}</strong>
              </div>
              <div class="receipt-row">
                <span>Rekening Donasi</span>
                <strong>${escHtml(settings.rekeningDonasi)}</strong>
              </div>
            </div>

            <div style="display:flex;flex-wrap:wrap;gap:10px">
              <a class="btn" target="_blank" rel="noopener" href="${waUrl}">
                ${icon('share', 16)} Hubungi via WhatsApp
              </a>
              <button type="button" class="btn btn-outline" id="copy-bank-account">
                ${icon('copy', 16)} Salin Rekening
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function mountAboutView() {
  document.getElementById('copy-bank-account')?.addEventListener('click', async () => {
    try {
      await copyToClipboard(getSettings().rekeningDonasi);
      showToast('Nomor rekening disalin.');
    } catch {
      showToast('Gagal menyalin nomor rekening.');
    }
  });
}
