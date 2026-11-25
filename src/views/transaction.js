import { openConfirmModal, renderStatusBadge, showToast } from '../components/ui.js';
import { icon } from '../icons.js';
import { t } from '../i18n.js';
import { getDonor, getProgram, getSettings, getTransaction, updateTransactionStatus } from '../store.js';
import { copyToClipboard, escHtml, formatRupiah } from '../utils.js';

function renderPaymentInstructions(tx) {
  const settings = getSettings();
  if (tx.statusPembayaran !== 'menunggu pembayaran') return '';

  return `
    <div class="panel no-print" style="margin-top:18px">
      <h3 style="margin-bottom:8px">Instruksi Penyelesaian (${escHtml(tx.metodePembayaran)})</h3>
      <p style="font-size:0.9rem;color:var(--color-ink-muted);margin-bottom:14px">
        ${
          tx.metodePembayaran === 'Transfer bank'
            ? `Silakan transfer sesuai nominal ke rekening berikut: <strong>${escHtml(settings.rekeningDonasi)}</strong>.`
            : tx.metodePembayaran === 'QRIS'
            ? 'Pindai kode simulasi QRIS di bawah ini atau tekan tombol konfirmasi pembayaran setelah menyelesaikan simulasi.'
            : 'Selesaikan otorisasi e-wallet pada perangkat Anda dengan mencantumkan kode transaksi.'
        }
      </p>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 14px;background:var(--color-canvas-alt);border:1px solid var(--color-border);border-radius:var(--radius-md)">
        <div>
          <div style="font-size:0.78rem;color:var(--color-ink-muted)">Kode Referensi</div>
          <strong class="mono" style="font-size:1rem">${escHtml(tx.kodeTransaksi)}</strong>
        </div>
        <button type="button" class="btn btn-outline btn-sm" id="copy-tx-code">
          ${icon('copy', 15)} Salin Kode
        </button>
      </div>
    </div>
  `;
}

export function renderTransactionView(id) {
  const tx = getTransaction(id);
  if (!tx) {
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

  const program = getProgram(tx.programId);
  const donor = getDonor(tx.donaturId) || {};
  const isPending = tx.statusPembayaran === 'menunggu pembayaran';

  return `
    <section class="section">
      <div class="wrap" style="max-width:700px">
        <p class="no-print" style="margin-bottom:18px">
          <a class="btn btn-outline btn-sm" href="#programs">
            ${icon('chevronLeft', 16)} ${t('navPrograms')}
          </a>
        </p>

        <div class="receipt-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:14px">
            <div>
              <h1 style="font-size:1.6rem;margin-bottom:4px">${t('receiptTitle')}</h1>
              <div style="font-size:0.85rem;color:var(--color-ink-muted)">${t('receiptNote')}</div>
            </div>
            ${renderStatusBadge(tx.statusPembayaran)}
          </div>

          <div class="receipt-grid">
            <div class="receipt-row">
              <span>${t('txCode')}</span>
              <strong class="mono">${escHtml(tx.kodeTransaksi)}</strong>
            </div>
            <div class="receipt-row">
              <span>${t('programLabel')}</span>
              <strong>${escHtml(program ? program.namaProgram : 'Program tidak tersedia')}</strong>
            </div>
            <div class="receipt-row">
              <span>${t('donorLabel')}</span>
              <strong>${donor.anonim ? 'Hamba Allah (Anonim)' : escHtml(donor.nama || '-')}</strong>
            </div>
            <div class="receipt-row">
              <span>${t('amountLabel')}</span>
              <strong class="tabular" style="font-size:1.0625rem">${formatRupiah(tx.nominal)}</strong>
            </div>
            <div class="receipt-row">
              <span>${t('donationType')}</span>
              <strong>${escHtml(tx.jenisDonasi)}</strong>
            </div>
            <div class="receipt-row">
              <span>${t('methodLabel')}</span>
              <strong>${escHtml(tx.metodePembayaran)}</strong>
            </div>
            <div class="receipt-row">
              <span>${t('dateLabel')}</span>
              <strong class="mono">${escHtml(tx.tanggalTransaksi)}</strong>
            </div>
            ${
              tx.pesanDonatur
                ? `<div class="receipt-row"><span>${t('messageLabel')}</span><strong>${escHtml(tx.pesanDonatur)}</strong></div>`
                : ''
            }
          </div>
        </div>

        ${renderPaymentInstructions(tx)}

        <div class="no-print" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:20px">
          ${
            isPending
              ? `<button type="button" class="btn" id="btn-confirm-payment">${icon('check', 16)} ${t('confirmPaymentBtn')}</button>
                 <button type="button" class="btn btn-danger" id="btn-cancel-payment">${t('cancelTxBtn')}</button>`
              : ''
          }
          <button type="button" class="btn btn-outline" id="btn-print-receipt">${icon('printer', 16)} ${t('printReceipt')}</button>
          <a class="btn btn-outline" href="#history">${t('viewHistory')}</a>
        </div>
      </div>
    </section>
  `;
}

export function mountTransactionView(id, rerender) {
  document.getElementById('copy-tx-code')?.addEventListener('click', async () => {
    const tx = getTransaction(id);
    if (!tx) return;
    try {
      await copyToClipboard(tx.kodeTransaksi);
      showToast('Kode transaksi disalin.');
    } catch {
      showToast('Gagal menyalin kode transaksi.');
    }
  });

  document.getElementById('btn-confirm-payment')?.addEventListener('click', () => {
    updateTransactionStatus(id, 'berhasil');
    showToast(t('txSuccessToast'));
    rerender();
  });

  document.getElementById('btn-cancel-payment')?.addEventListener('click', () => {
    openConfirmModal({
      title: 'Batalkan transaksi ini?',
      message: 'Transaksi akan ditandai sebagai dibatalkan dan tidak menambah saldo program.',
      confirmLabel: 'Ya, Batalkan',
      cancelLabel: 'Kembali',
      danger: true,
      onConfirm: () => {
        updateTransactionStatus(id, 'dibatalkan');
        showToast(t('txCancelToast'));
        rerender();
      },
    });
  });

  document.getElementById('btn-print-receipt')?.addEventListener('click', () => {
    window.print();
  });
}
