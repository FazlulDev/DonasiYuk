import { renderStatusBadge, showToast } from '../components/ui.js';
import { icon } from '../icons.js';
import { t } from '../i18n.js';
import { getProgram, getState } from '../store.js';
import { escHtml, exportToCsv, formatRupiah } from '../utils.js';

export function renderHistoryView() {
  const state = getState();
  const mine = state.tx.filter((x) => x.mine).slice().reverse();

  return `
    <section class="section">
      <div class="wrap">
        <div class="section-header">
          <div>
            <h1>${t('historyTitle')}</h1>
            <p class="section-subtitle">Catatan transaksi donasi Anda pada perangkat ini.</p>
          </div>
          ${
            mine.length
              ? `<button type="button" class="btn btn-outline btn-sm" id="export-history-csv">${icon('download', 16)} ${t('exportCsv')}</button>`
              : ''
          }
        </div>

        ${
          mine.length
            ? `
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>${t('txCode')}</th>
                      <th>${t('programLabel')}</th>
                      <th>${t('dateLabel')}</th>
                      <th>${t('methodLabel')}</th>
                      <th class="num">${t('amountLabel')}</th>
                      <th>${t('statusLabel')}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    ${mine
                      .map((tx) => {
                        const program = getProgram(tx.programId);
                        return `
                          <tr>
                            <td class="mono">${escHtml(tx.kodeTransaksi)}</td>
                            <td>${escHtml(program ? program.namaProgram : '-')}</td>
                            <td class="mono">${escHtml(tx.tanggalTransaksi)}</td>
                            <td>${escHtml(tx.metodePembayaran)}</td>
                            <td class="num"><strong>${formatRupiah(tx.nominal)}</strong></td>
                            <td>${renderStatusBadge(tx.statusPembayaran)}</td>
                            <td style="text-align:right">
                              <a class="btn btn-outline btn-sm" href="#tx-${tx.id}">${t('detail')}</a>
                            </td>
                          </tr>
                        `;
                      })
                      .join('')}
                  </tbody>
                </table>
              </div>
            `
            : `
              <div class="empty-state">
                <h3>${t('emptyHistoryTitle')}</h3>
                <p>${t('emptyHistoryDesc')}</p>
                <a class="btn" href="#programs">${t('browsePrograms')}</a>
              </div>
            `
        }
      </div>
    </section>
  `;
}

export function mountHistoryView() {
  document.getElementById('export-history-csv')?.addEventListener('click', () => {
    const state = getState();
    const mine = state.tx.filter((x) => x.mine).slice().reverse();
    exportToCsv(
      'riwayat-donasi-mari-berdonasi.csv',
      ['Kode Transaksi', 'Program', 'Tanggal', 'Metode', 'Jenis', 'Nominal', 'Status'],
      mine.map((tx) => [
        tx.kodeTransaksi,
        getProgram(tx.programId)?.namaProgram || '-',
        tx.tanggalTransaksi,
        tx.metodePembayaran,
        tx.jenisDonasi,
        tx.nominal,
        tx.statusPembayaran,
      ])
    );
    showToast('File CSV riwayat donasi berhasil diunduh.');
  });
}
