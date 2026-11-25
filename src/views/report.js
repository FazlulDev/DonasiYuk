import { renderStatusBadge, showToast } from '../components/ui.js';
import { icon } from '../icons.js';
import { t } from '../i18n.js';
import { getProgram, getState, getTotalDistributed, getTotalRaised } from '../store.js';
import { escHtml, exportToCsv, formatRupiah } from '../utils.js';

export function renderReportView() {
  const state = getState();
  const totalRaised = getTotalRaised();
  const totalDistributed = getTotalDistributed();
  const remaining = Math.max(0, totalRaised - totalDistributed);

  return `
    <section class="section">
      <div class="wrap">
        <div class="section-header">
          <div>
            <h1>${t('reportTitle')}</h1>
            <p class="section-subtitle">${t('reportSub')}</p>
          </div>
          <div class="no-print" style="display:flex;gap:8px;flex-wrap:wrap">
            <button type="button" class="btn btn-outline btn-sm" id="export-report-csv">
              ${icon('download', 16)} ${t('exportCsv')}
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="print-report-btn">
              ${icon('printer', 16)} ${t('printReport')}
            </button>
          </div>
        </div>

        <div class="report-kpi-grid">
          <div class="admin-kpi-card">
            <div class="admin-kpi-label">${t('statRaised')}</div>
            <div class="admin-kpi-value">${formatRupiah(totalRaised)}</div>
          </div>
          <div class="admin-kpi-card">
            <div class="admin-kpi-label">${t('statDistributed')}</div>
            <div class="admin-kpi-value">${formatRupiah(totalDistributed)}</div>
          </div>
          <div class="admin-kpi-card">
            <div class="admin-kpi-label">${t('remainingFunds')}</div>
            <div class="admin-kpi-value">${formatRupiah(remaining)}</div>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>${t('dateLabel')}</th>
                <th>${t('programLabel')}</th>
                <th>Keterangan Penyaluran</th>
                <th class="num">Jumlah Dana</th>
                <th>${t('statusLabel')}</th>
              </tr>
            </thead>
            <tbody>
              ${
                state.reps.length
                  ? state.reps
                      .map((rep) => {
                        const program = getProgram(rep.programId);
                        return `
                          <tr>
                            <td class="mono">${escHtml(rep.tanggalPenyaluran)}</td>
                            <td><strong>${escHtml(program ? program.namaProgram : '-')}</strong></td>
                            <td>${escHtml(rep.deskripsiPenyaluran)}</td>
                            <td class="num"><strong>${formatRupiah(rep.jumlahDana)}</strong></td>
                            <td>${renderStatusBadge(rep.status)}</td>
                          </tr>
                        `;
                      })
                      .join('')
                  : '<tr><td colspan="5">Belum ada catatan penyaluran.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

export function mountReportView() {
  document.getElementById('print-report-btn')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('export-report-csv')?.addEventListener('click', () => {
    const state = getState();
    exportToCsv(
      'laporan-transparansi-mari-berdonasi.csv',
      ['Tanggal Penyaluran', 'Program', 'Jumlah Dana', 'Keterangan', 'Status'],
      state.reps.map((rep) => [
        rep.tanggalPenyaluran,
        getProgram(rep.programId)?.namaProgram || '-',
        rep.jumlahDana,
        rep.deskripsiPenyaluran,
        rep.status,
      ])
    );
    showToast('Laporan transparansi CSV berhasil diunduh.');
  });
}
