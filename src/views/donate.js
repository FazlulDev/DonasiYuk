import { renderMediaFrame } from '../components/ui.js';
import { icon } from '../icons.js';
import { t } from '../i18n.js';
import {
  ASSETS,
  createDonationTransaction,
  getDonationDraft,
  getProgram,
  getState,
  setDonationDraft,
} from '../store.js';
import { calcDaysLeft, calcProgress, escHtml, formatRupiah } from '../utils.js';

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];

function renderProgramSummary(program) {
  if (!program) {
    return '<p style="color:var(--color-ink-muted)">Belum ada program aktif yang tersedia.</p>';
  }
  const progress = calcProgress(program);
  return `
    <div class="checkout-summary-media">
      ${renderMediaFrame(program.imageUrl || ASSETS.hero, program.namaProgram, program.namaProgram)}
    </div>
    <div class="meta-line">
      <span>${escHtml(program.kategori)}</span>
      <span aria-hidden="true">·</span>
      <span>${escHtml(program.lokasi)}</span>
    </div>
    <h3 style="margin-top:6px;margin-bottom:8px">${escHtml(program.namaProgram)}</h3>
    <p class="checkout-summary-extra" style="font-size:0.9rem;color:var(--color-ink-muted);margin-bottom:14px">${escHtml(program.deskripsi)}</p>
    <div class="progress-track" style="margin-bottom:8px">
      <div class="progress-fill" style="width:${progress}%"></div>
    </div>
    <div class="progress-stats" style="margin-bottom:8px">
      <strong>${formatRupiah(program.danaTerkumpul)}</strong>
      <span>${progress}% · ${formatRupiah(program.targetDonasi)}</span>
    </div>
    <div class="meta-line">
      <span>${program.jumlahPenerimaManfaat} ${t('beneficiaries')}</span>
      <span aria-hidden="true">·</span>
      <span>${calcDaysLeft(program)} ${t('daysLeft')}</span>
    </div>
    <div class="checkout-summary-extra" style="border-top:1px solid var(--color-border);padding-top:12px;margin-top:14px">
      <div style="font-size:0.8125rem;font-weight:700;color:var(--color-navy-900);margin-bottom:4px">${t('fundAllocation')}</div>
      <p style="font-size:0.875rem;color:var(--color-ink-muted);margin:0">${escHtml(program.rincianPenggunaanDana)}</p>
    </div>
  `;
}

export function renderDonateView(programIdArg) {
  const state = getState();
  const activePrograms = state.programs.filter((p) => p.status === 'Aktif');
  const existingDraft = getDonationDraft();
  const draft = existingDraft || {
    pid: programIdArg || (activePrograms[0]?.id ?? ''),
    nom: '',
    jenis: 'Donasi umum',
    nama: '',
    email: '',
    wa: '',
    anon: false,
    pesan: '',
    met: 'QRIS',
  };

  if (programIdArg) {
    draft.pid = programIdArg;
  }

  const validSelected = activePrograms.some((p) => Number(p.id) === Number(draft.pid));
  if (!validSelected && activePrograms.length > 0) {
    draft.pid = activePrograms[0].id;
  }
  setDonationDraft(draft);

  const selectedProgram = getProgram(draft.pid);
  const fixedProgram = Boolean(programIdArg) && activePrograms.some((p) => Number(p.id) === Number(programIdArg));

  return `
    <section class="section">
      <div class="wrap">
        <p style="margin-bottom:18px">
          <button type="button" class="btn btn-outline btn-sm" data-nav-back="#programs">
            ${icon('chevronLeft', 16)} ${t('back')}
          </button>
        </p>
        <div class="section-header" style="margin-bottom:20px">
          <div>
            <h1>${t('donatePageTitle')}</h1>
            <p class="section-subtitle">${t('receiptNote')}</p>
          </div>
        </div>

        <div class="checkout-grid">
          <aside class="panel sticky-summary" id="donate-program-summary">
            ${renderProgramSummary(selectedProgram)}
          </aside>

          <div>
            <form id="donate-form" class="panel" novalidate>
              ${
                fixedProgram
                  ? `<input type="hidden" id="f_pid" value="${escHtml(draft.pid)}" />`
                  : `<div class="field-group">
                      <label for="f_pid">${t('selectProgram')}</label>
                      <select id="f_pid">
                        ${activePrograms
                          .map(
                            (p) =>
                              `<option value="${p.id}" ${
                                Number(p.id) === Number(draft.pid) ? 'selected' : ''
                              }>${escHtml(p.namaProgram)}</option>`
                          )
                          .join('')}
                      </select>
                    </div>`
              }

              <div class="field-group">
                <label for="f_nom">${t('nominalLabel')}</label>
                <div class="nominal-grid" role="group" aria-label="Nominal pilihan">
                  ${PRESET_AMOUNTS.map(
                    (amount) => `
                      <button
                        type="button"
                        class="nominal-btn ${Number(draft.nom) === amount ? 'is-active' : ''}"
                        data-nominal="${amount}"
                      >
                        ${formatRupiah(amount)}
                      </button>
                    `
                  ).join('')}
                </div>
                <input
                  id="f_nom"
                  type="text"
                  inputmode="numeric"
                  placeholder="${t('customNominalPlaceholder')}"
                  value="${escHtml(draft.nom)}"
                />
                <div class="field-error" id="err_nom"></div>
              </div>

              <div class="two-col" style="gap:14px">
                <div class="field-group">
                  <label for="f_jenis">${t('donationType')}</label>
                  <select id="f_jenis">
                    ${['Donasi umum', 'Sedekah', 'Infak', 'Bantuan khusus']
                      .map((opt) => `<option ${draft.jenis === opt ? 'selected' : ''}>${opt}</option>`)
                      .join('')}
                  </select>
                </div>
                <div class="field-group">
                  <label for="f_met">${t('paymentMethod')}</label>
                  <select id="f_met">
                    ${['QRIS', 'Transfer bank', 'E-wallet']
                      .map((opt) => `<option ${draft.met === opt ? 'selected' : ''}>${opt}</option>`)
                      .join('')}
                  </select>
                </div>
              </div>

              <div class="field-group">
                <label for="f_nama">${t('donorName')}</label>
                <input id="f_nama" type="text" autocomplete="name" value="${escHtml(draft.nama)}" />
                <div class="field-error" id="err_nama"></div>
              </div>

              <div class="two-col" style="gap:14px">
                <div class="field-group">
                  <label for="f_email">${t('donorEmail')}</label>
                  <input id="f_email" type="email" autocomplete="email" value="${escHtml(draft.email)}" />
                  <div class="field-error" id="err_email"></div>
                </div>
                <div class="field-group">
                  <label for="f_wa">${t('donorWa')}</label>
                  <input id="f_wa" type="tel" inputmode="tel" placeholder="08xxxxxxxxxx" value="${escHtml(draft.wa)}" />
                  <div class="field-error" id="err_wa"></div>
                </div>
              </div>

              <label class="checkbox-label">
                <input type="checkbox" id="f_anon" ${draft.anon ? 'checked' : ''} />
                <span>${t('anonymousOption')}</span>
              </label>

              <div class="field-group">
                <label for="f_pesan">${t('donorPrayer')}</label>
                <textarea id="f_pesan" rows="2">${escHtml(draft.pesan)}</textarea>
              </div>

              <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:16px">
                <button type="submit" class="btn">${t('continueSummary')}</button>
                <button type="button" class="btn btn-outline" data-nav-back="#programs">${t('cancel')}</button>
              </div>
            </form>

            <div id="donate-review-slot" style="margin-top:20px"></div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function mountDonateView(navigate) {
  const form = document.getElementById('donate-form');
  const programSelect = document.getElementById('f_pid');
  const nominalInput = document.getElementById('f_nom');
  const reviewSlot = document.getElementById('donate-review-slot');
  const summaryBox = document.getElementById('donate-program-summary');

  if (programSelect && programSelect.tagName === 'SELECT') {
    programSelect.addEventListener('change', (e) => {
      const selected = getProgram(e.target.value);
      if (summaryBox) summaryBox.innerHTML = renderProgramSummary(selected);
    });
  }

  document.querySelectorAll('[data-nominal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const value = btn.getAttribute('data-nominal');
      if (nominalInput) nominalInput.value = value;
      document.querySelectorAll('[data-nominal]').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });

  nominalInput?.addEventListener('input', () => {
    const clean = nominalInput.value.replace(/[^\d]/g, '');
    document.querySelectorAll('[data-nominal]').forEach((b) => {
      b.classList.toggle('is-active', b.getAttribute('data-nominal') === clean);
    });
  });

  const setFieldError = (inputId, errId, message) => {
    const input = document.getElementById(inputId);
    const errEl = document.getElementById(errId);
    if (errEl) errEl.textContent = message;
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
    return !message;
  };

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const pid = document.getElementById('f_pid')?.value;
    const rawNom = (document.getElementById('f_nom')?.value || '').replace(/[^\d]/g, '');
    const nom = Number(rawNom);
    const jenis = document.getElementById('f_jenis')?.value || 'Donasi umum';
    const met = document.getElementById('f_met')?.value || 'QRIS';
    const nama = (document.getElementById('f_nama')?.value || '').trim();
    const email = (document.getElementById('f_email')?.value || '').trim();
    const wa = (document.getElementById('f_wa')?.value || '').trim();
    const anon = Boolean(document.getElementById('f_anon')?.checked);
    const pesan = (document.getElementById('f_pesan')?.value || '').trim();

    let isValid = true;
    isValid =
      setFieldError(
        'f_nom',
        'err_nom',
        !rawNom || !Number.isInteger(nom) || nom < 1000
          ? 'Masukkan nominal angka bulat minimal Rp1.000.'
          : ''
      ) && isValid;
    isValid =
      setFieldError(
        'f_nama',
        'err_nama',
        nama.length < 2 ? 'Nama donatur minimal 2 karakter.' : ''
      ) && isValid;
    isValid =
      setFieldError(
        'f_email',
        'err_email',
        /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? '' : 'Format email tidak valid.'
      ) && isValid;
    isValid =
      setFieldError(
        'f_wa',
        'err_wa',
        /^\+?\d{9,15}$/.test(wa.replace(/[\s-]/g, ''))
          ? ''
          : 'Masukkan nomor WhatsApp valid (9–15 digit angka).'
      ) && isValid;

    if (!isValid) return;

    const draft = { pid, nom, jenis, met, nama, email, wa: wa.replace(/[\s-]/g, ''), anon, pesan };
    setDonationDraft(draft);
    const program = getProgram(pid);

    if (!reviewSlot) return;
    reviewSlot.innerHTML = `
      <div class="receipt-card">
        <h3>${t('reviewTitle')}</h3>
        <div class="receipt-grid">
          <div class="receipt-row"><span>${t('programLabel')}</span><strong>${escHtml(program?.namaProgram)}</strong></div>
          <div class="receipt-row"><span>${t('amountLabel')}</span><strong class="tabular">${formatRupiah(nom)}</strong></div>
          <div class="receipt-row"><span>${t('donationType')}</span><strong>${escHtml(jenis)}</strong></div>
          <div class="receipt-row"><span>${t('methodLabel')}</span><strong>${escHtml(met)}</strong></div>
          <div class="receipt-row"><span>${t('donorLabel')}</span><strong>${anon ? 'Hamba Allah (Anonim)' : escHtml(nama)}</strong></div>
          <div class="receipt-row"><span>${t('donorEmail')}</span><strong>${escHtml(email)}</strong></div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:16px">
          <button type="button" class="btn btn-gold" id="confirm-create-tx">${t('confirmDonate')}</button>
          <button type="button" class="btn btn-outline" id="edit-donate-form">${t('editForm')}</button>
        </div>
      </div>
    `;

    reviewSlot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    document.getElementById('edit-donate-form')?.addEventListener('click', () => {
      reviewSlot.innerHTML = '';
    });

    document.getElementById('confirm-create-tx')?.addEventListener('click', () => {
      const tx = createDonationTransaction(draft);
      navigate(`#tx-${tx.id}`);
    });
  });
}
