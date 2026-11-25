import { renderActivityCard, renderProgramCard } from '../components/ui.js';
import { t } from '../i18n.js';
import {
  ASSETS,
  getSettings,
  getState,
  getTotalBeneficiaries,
  getTotalDistributed,
  getTotalRaised,
} from '../store.js';
import { escHtml, formatNumber, formatRupiah } from '../utils.js';

export function renderHomeView() {
  const state = getState();
  const settings = getSettings();
  const heroImage = settings.heroImage || ASSETS.hero;
  const featured = state.programs.filter((p) => p.unggulan).slice(0, 3);
  const activities = state.acts.slice(0, 3);

  return `
    <section class="hero">
      <img
        class="hero-bg"
        src="${escHtml(heroImage)}"
        alt=""
        referrerpolicy="no-referrer"
        onerror="this.style.display='none'"
      />
      <div class="hero-scrim" aria-hidden="true"></div>
      <div class="wrap hero-inner">
        <div class="hero-kicker">${t('heroKicker')}</div>
        <h1>${escHtml(settings.heroJudul || t('heroTitle'))}</h1>
        <p class="hero-lead">${escHtml(settings.heroTeks || t('heroLead'))}</p>
        <div class="hero-actions">
          <a class="btn btn-gold" href="#donate">${t('donateCta')}</a>
          <a class="btn btn-outline" href="#programs">${t('browsePrograms')}</a>
        </div>
        <div class="kpi-strip">
          <div class="kpi-strip-item">
            <strong>${formatRupiah(getTotalRaised())}</strong>
            <span>${t('statRaised')}</span>
          </div>
          <div class="kpi-strip-item">
            <strong>${formatRupiah(getTotalDistributed())}</strong>
            <span>${t('statDistributed')}</span>
          </div>
          <div class="kpi-strip-item">
            <strong>${formatNumber(state.programs.length)}</strong>
            <span>${t('statPrograms')}</span>
          </div>
          <div class="kpi-strip-item">
            <strong>${formatNumber(getTotalBeneficiaries())}</strong>
            <span>${t('statBeneficiaries')}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="spotlight-box" style="margin-bottom:40px">
          <div>
            <div class="spotlight-kicker">${t('featuredCampaign')}</div>
            <h3 style="margin-bottom:4px">${escHtml(settings.bannerJudul)}</h3>
            <p style="margin:0;color:var(--color-ink-muted)">${escHtml(settings.bannerTeks)}</p>
          </div>
          <a class="btn" href="#donate-1">${t('donateCta')}</a>
        </div>

        <div class="section-header">
          <div>
            <h2>${t('featuredPrograms')}</h2>
          </div>
          <a class="btn btn-outline btn-sm" href="#programs">${t('seeAllPrograms')}</a>
        </div>
        <div class="card-grid">
          ${featured.map(renderProgramCard).join('')}
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="wrap">
        <div class="section-header">
          <div>
            <h2>${t('howItWorksTitle')}</h2>
            <p class="section-subtitle">${t('howItWorksSub')}</p>
          </div>
        </div>
        <div class="steps-grid">
          <div class="step-item">
            <span class="step-num">01.</span>
            <h3>${t('step1Title')}</h3>
            <p class="prose" style="color:var(--color-ink-muted)">${t('step1Desc')}</p>
          </div>
          <div class="step-item">
            <span class="step-num">02.</span>
            <h3>${t('step2Title')}</h3>
            <p class="prose" style="color:var(--color-ink-muted)">${t('step2Desc')}</p>
          </div>
          <div class="step-item">
            <span class="step-num">03.</span>
            <h3>${t('step3Title')}</h3>
            <p class="prose" style="color:var(--color-ink-muted)">${t('step3Desc')}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section-header">
          <h2>${t('categoriesTitle')}</h2>
        </div>
        <div class="segmented-group" style="margin-bottom:44px">
          ${state.cats
            .map(
              (cat) =>
                `<a class="filter-btn" style="text-decoration:none" href="#programs-${encodeURIComponent(
                  cat.namaKategori
                )}">${escHtml(cat.namaKategori)}</a>`
            )
            .join('')}
        </div>

        <div class="two-col">
          <div>
            <h2>${t('whyTitle')}</h2>
            <p class="prose" style="color:var(--color-ink-muted);margin-bottom:18px">${t('whyDesc')}</p>
            <a class="btn btn-outline" href="#report">${t('navReport')}</a>
          </div>
          <div>
            <h2>${t('testimonialsTitle')}</h2>
            <div class="quote-block">
              <p class="quote-text">"Alur donasinya ringkas dan laporan penyalurannya mudah ditelusuri per program."</p>
              <div class="quote-author">Ahmad Fauzi — Donatur Rutin, Banda Aceh</div>
            </div>
            <div class="quote-block">
              <p class="quote-text">"Setiap donasi langsung memiliki kode kuitansi yang bisa dicetak untuk catatan keluarga."</p>
              <div class="quote-author">Siti Rahma — Komunitas Peduli Pendidikan, Medan</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="wrap">
        <div class="section-header">
          <h2>${t('recentActivities')}</h2>
          <a class="btn btn-outline btn-sm" href="#acts">${t('seeAllActivities')}</a>
        </div>
        <div class="card-grid">
          ${activities.map(renderActivityCard).join('')}
        </div>
      </div>
    </section>
  `;
}
