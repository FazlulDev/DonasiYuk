import { openConfirmModal, renderStatusBadge, showToast } from '../components/ui.js';
import { icon } from '../icons.js';
import {
  changeAdminPassword,
  deleteCollectionRow,
  getProgram,
  getSettings,
  getState,
  isAdminAuthenticated,
  LOGO_URL,
  loginAdmin,
  logoutAdmin,
  resetAllDemoData,
  saveCollectionRow,
  updateSettings,
} from '../store.js';
import {
  calcProgress,
  escHtml,
  exportToCsv,
  formatNumber,
  formatRupiah,
  resizeImageFile,
} from '../utils.js';

const CRUD_CONFIG = {
  programs: {
    label: 'Program',
    collection: 'programs',
    fields: [
      ['namaProgram', 'text', 'Nama Program'],
      ['imageUrl', 'image', 'Gambar Program'],
      ['kategori', 'category', 'Kategori'],
      ['deskripsi', 'textarea', 'Deskripsi'],
      ['targetDonasi', 'number', 'Target Donasi (Rp)'],
      ['danaTerkumpul', 'number', 'Dana Terkumpul (Rp)'],
      ['jumlahPenerimaManfaat', 'number', 'Penerima Manfaat'],
      ['tanggalSelesai', 'date', 'Tanggal Selesai'],
      ['status', 'select:Aktif,Selesai', 'Status'],
      ['lokasi', 'text', 'Lokasi'],
      ['rincianPenggunaanDana', 'textarea', 'Rincian Penggunaan Dana'],
      ['unggulan', 'checkbox', 'Tampilkan di Program Unggulan'],
    ],
    columns: [
      ['namaProgram', 'Program'],
      ['kategori', 'Kategori'],
      ['targetDonasi', 'Target'],
      ['danaTerkumpul', 'Terkumpul'],
      ['status', 'Status'],
    ],
  },
  cats: {
    label: 'Kategori',
    collection: 'cats',
    fields: [
      ['namaKategori', 'text', 'Nama Kategori'],
      ['deskripsi', 'textarea', 'Deskripsi'],
    ],
    columns: [
      ['namaKategori', 'Kategori'],
      ['deskripsi', 'Deskripsi'],
    ],
  },
  acts: {
    label: 'Kegiatan',
    collection: 'acts',
    fields: [
      ['namaKegiatan', 'text', 'Nama Kegiatan'],
      ['imageUrl', 'image', 'Foto Kegiatan'],
      ['tanggal', 'date', 'Tanggal'],
      ['lokasi', 'text', 'Lokasi'],
      ['deskripsi', 'textarea', 'Deskripsi'],
    ],
    columns: [
      ['namaKegiatan', 'Kegiatan'],
      ['tanggal', 'Tanggal'],
      ['lokasi', 'Lokasi'],
    ],
  },
  reps: {
    label: 'Laporan Penyaluran',
    collection: 'reps',
    fields: [
      ['programId', 'program', 'Program'],
      ['tanggalPenyaluran', 'date', 'Tanggal Penyaluran'],
      ['jumlahDana', 'number', 'Jumlah Dana (Rp)'],
      ['deskripsiPenyaluran', 'textarea', 'Keterangan Penyaluran'],
      ['status', 'select:Tersalurkan,Dalam proses', 'Status'],
    ],
    columns: [
      ['programId', 'Program'],
      ['tanggalPenyaluran', 'Tanggal'],
      ['jumlahDana', 'Jumlah Dana'],
      ['status', 'Status'],
    ],
  },
  donors: {
    label: 'Donatur',
    collection: 'donors',
    fields: [
      ['nama', 'text', 'Nama'],
      ['email', 'text', 'Email'],
      ['nomorWhatsApp', 'text', 'WhatsApp'],
      ['anonim', 'checkbox', 'Anonim'],
    ],
    columns: [
      ['nama', 'Nama'],
      ['email', 'Email'],
      ['nomorWhatsApp', 'WhatsApp'],
      ['anonim', 'Anonim'],
    ],
  },
  tx: {
    label: 'Transaksi',
    collection: 'tx',
    fields: [
      ['programId', 'program', 'Program'],
      ['nominal', 'number', 'Nominal (Rp)'],
      ['metodePembayaran', 'select:Transfer bank,E-wallet,QRIS', 'Metode Pembayaran'],
      ['statusPembayaran', 'select:menunggu pembayaran,berhasil,dibatalkan', 'Status Pembayaran'],
    ],
    columns: [
      ['kodeTransaksi', 'Kode'],
      ['programId', 'Program'],
      ['nominal', 'Nominal'],
      ['metodePembayaran', 'Metode'],
      ['statusPembayaran', 'Status'],
    ],
  },
};

const SETTINGS_FIELDS = [
  ['namaWebsite', 'Nama Website'],
  ['tagline', 'Tagline'],
  ['deskripsi', 'Deskripsi Singkat'],
  ['heroJudul', 'Judul Hero (opsional, kosongkan untuk default)'],
  ['heroTeks', 'Subjudul Hero (opsional)'],
  ['nomorWhatsApp', 'Nomor WhatsApp (628...)'],
  ['email', 'Email Kontak'],
  ['alamat', 'Alamat'],
  ['rekeningDonasi', 'Info Rekening Donasi'],
  ['bannerJudul', 'Judul Kampanye Prioritas'],
  ['bannerTeks', 'Teks Kampanye Prioritas'],
];

let activeTab = 'dash';
let editingRow = null;
let tableSearch = '';

function renderLoginView() {
  return `
    <section class="section" style="min-height:100vh;display:flex;align-items:center;background:var(--color-canvas-alt)">
      <div class="wrap" style="max-width:420px;width:100%">
        <form id="admin-login-form" class="panel" novalidate>
          <h1 style="font-size:1.65rem;margin-bottom:6px">Masuk Panel Admin</h1>
          <p style="font-size:0.875rem;color:var(--color-ink-muted);margin-bottom:18px">
            Kredensial demo: <span class="mono">admin</span> / <span class="mono">admin123</span>
          </p>
          <div class="field-group">
            <label for="admin-user">Username</label>
            <input id="admin-user" type="text" autocomplete="username" value="admin" required />
          </div>
          <div class="field-group">
            <label for="admin-pass">Password</label>
            <input id="admin-pass" type="password" autocomplete="current-password" required />
            <div class="field-error" id="admin-login-error"></div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">
            <button type="submit" class="btn">Masuk</button>
            <a class="btn btn-outline" href="#home">Kembali ke Situs</a>
          </div>
        </form>
      </div>
    </section>
  `;
}

function renderDashboardContent() {
  const state = getState();
  const okTx = state.tx.filter((x) => x.statusPembayaran === 'berhasil');
  const pendingCount = state.tx.filter((x) => x.statusPembayaran === 'menunggu pembayaran').length;
  const cancelCount = state.tx.filter((x) => x.statusPembayaran === 'dibatalkan').length;
  const totalTx = Math.max(1, okTx.length + pendingCount + cancelCount);

  const degOk = (okTx.length / totalTx) * 360;
  const degWait = degOk + (pendingCount / totalTx) * 360;

  const topPrograms = state.programs
    .slice()
    .sort((a, b) => calcProgress(b) - calcProgress(a))
    .slice(0, 6);
  const recentTx = state.tx.slice().reverse().slice(0, 5);

  const totalRaised = state.programs.reduce((sum, p) => sum + Number(p.danaTerkumpul || 0), 0);
  const activeCount = state.programs.filter((p) => p.status === 'Aktif').length;
  const okSum = okTx.reduce((sum, x) => sum + Number(x.nominal || 0), 0);

  return `
    <div class="admin-kpi-grid">
      <div class="admin-kpi-card">
        <div class="admin-kpi-label">Total Dana Terkumpul</div>
        <div class="admin-kpi-value">${formatRupiah(totalRaised)}</div>
        <div class="admin-kpi-sub">${state.programs.length} program tercatat</div>
      </div>
      <div class="admin-kpi-card">
        <div class="admin-kpi-label">Program Aktif</div>
        <div class="admin-kpi-value">${activeCount} / ${state.programs.length}</div>
        <div class="admin-kpi-sub">Siap menerima donasi</div>
      </div>
      <div class="admin-kpi-card">
        <div class="admin-kpi-label">Donasi Terkonfirmasi</div>
        <div class="admin-kpi-value">${formatRupiah(okSum)}</div>
        <div class="admin-kpi-sub">${okTx.length} transaksi berhasil</div>
      </div>
      <div class="admin-kpi-card">
        <div class="admin-kpi-label">Donatur Tercatat</div>
        <div class="admin-kpi-value">${formatNumber(state.donors.length)}</div>
        <div class="admin-kpi-sub">Dalam penyimpanan lokal</div>
      </div>
    </div>

    <div class="admin-charts-grid">
      <div class="panel">
        <h3 style="margin-bottom:14px">Capaian Penghimpunan Program</h3>
        ${topPrograms
          .map((p) => {
            const pct = calcProgress(p);
            return `
              <div class="bar-row">
                <span class="bar-row-label" title="${escHtml(p.namaProgram)}">${escHtml(p.namaProgram)}</span>
                <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
                <span class="bar-row-pct">${pct}%</span>
              </div>
            `;
          })
          .join('')}
      </div>

      <div class="panel">
        <h3 style="margin-bottom:8px">Distribusi Status Transaksi</h3>
        <div class="donut-wrap">
          <div
            class="donut-chart"
            style="background:conic-gradient(#16a34a 0 ${degOk}deg, #d97706 ${degOk}deg ${degWait}deg, #dc2626 ${degWait}deg 360deg)"
            aria-hidden="true"
          ></div>
          <div class="donut-legend">
            <div class="legend-item">
              <span class="legend-swatch" style="background:#16a34a"></span>
              <span>Berhasil: <strong>${okTx.length}</strong></span>
            </div>
            <div class="legend-item">
              <span class="legend-swatch" style="background:#d97706"></span>
              <span>Menunggu: <strong>${pendingCount}</strong></span>
            </div>
            <div class="legend-item">
              <span class="legend-swatch" style="background:#dc2626"></span>
              <span>Dibatalkan: <strong>${cancelCount}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel" style="padding:0;overflow:hidden">
      <div style="padding:18px 20px 12px">
        <h3 style="margin:0">Transaksi Terbaru</h3>
      </div>
      <div class="table-wrap" style="border:0;border-radius:0">
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Program</th>
              <th>Tanggal</th>
              <th class="num">Nominal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${
              recentTx.length
                ? recentTx
                    .map((tx) => {
                      const program = getProgram(tx.programId);
                      return `
                        <tr>
                          <td class="mono">${escHtml(tx.kodeTransaksi)}</td>
                          <td>${escHtml(program ? program.namaProgram : '-')}</td>
                          <td class="mono">${escHtml(tx.tanggalTransaksi)}</td>
                          <td class="num"><strong>${formatRupiah(tx.nominal)}</strong></td>
                          <td>${renderStatusBadge(tx.statusPembayaran)}</td>
                        </tr>
                      `;
                    })
                    .join('')
                : '<tr><td colspan="5">Belum ada transaksi.</td></tr>'
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderFormField(fieldDef, value) {
  const [key, type, label] = fieldDef;
  const inputId = `crud_${key}`;
  const state = getState();

  if (type === 'image') {
    const safeVal = escHtml(value || '');
    return `
      <div class="field-group">
        <label for="${inputId}_file">${escHtml(label)}</label>
        <input id="${inputId}_file" type="file" accept="image/*" data-image-target="${key}" />
        <input id="${inputId}" type="hidden" value="${safeVal}" />
        <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
          <img
            id="preview_${key}"
            src="${safeVal}"
            alt=""
            class="image-preview-thumb"
            style="display:${safeVal ? 'block' : 'none'}"
          />
          <button type="button" class="btn btn-outline btn-sm" data-clear-image="${key}">Hapus Gambar</button>
        </div>
      </div>
    `;
  }

  if (type === 'checkbox') {
    return `
      <label class="checkbox-label">
        <input id="${inputId}" type="checkbox" ${value ? 'checked' : ''} />
        <span>${escHtml(label)}</span>
      </label>
    `;
  }

  if (type === 'textarea') {
    return `
      <div class="field-group">
        <label for="${inputId}">${escHtml(label)}</label>
        <textarea id="${inputId}" rows="2">${escHtml(value ?? '')}</textarea>
      </div>
    `;
  }

  if (type === 'category') {
    return `
      <div class="field-group">
        <label for="${inputId}">${escHtml(label)}</label>
        <select id="${inputId}">
          ${state.cats
            .map(
              (c) =>
                `<option value="${escHtml(c.namaKategori)}" ${
                  value === c.namaKategori ? 'selected' : ''
                }>${escHtml(c.namaKategori)}</option>`
            )
            .join('')}
        </select>
      </div>
    `;
  }

  if (type === 'program') {
    return `
      <div class="field-group">
        <label for="${inputId}">${escHtml(label)}</label>
        <select id="${inputId}">
          ${state.programs
            .map(
              (p) =>
                `<option value="${p.id}" ${
                  Number(value) === Number(p.id) ? 'selected' : ''
                }>${escHtml(p.namaProgram)}</option>`
            )
            .join('')}
        </select>
      </div>
    `;
  }

  if (type.startsWith('select:')) {
    const options = type.slice(7).split(',');
    return `
      <div class="field-group">
        <label for="${inputId}">${escHtml(label)}</label>
        <select id="${inputId}">
          ${options
            .map((opt) => `<option value="${escHtml(opt)}" ${value === opt ? 'selected' : ''}>${escHtml(opt)}</option>`)
            .join('')}
        </select>
      </div>
    `;
  }

  return `
    <div class="field-group">
      <label for="${inputId}">${escHtml(label)}</label>
      <input
        id="${inputId}"
        type="${type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}"
        ${type === 'number' ? 'min="0"' : ''}
        value="${escHtml(value ?? '')}"
      />
    </div>
  `;
}

function formatCrudCell(key, rawValue) {
  if (key === 'programId') {
    return escHtml(getProgram(rawValue)?.namaProgram || '-');
  }
  if (/status/i.test(key)) {
    return renderStatusBadge(rawValue);
  }
  if (/nominal|Dana|Donasi|Terkumpul/i.test(key)) {
    return formatRupiah(rawValue);
  }
  if (typeof rawValue === 'boolean') {
    return rawValue ? 'Ya' : 'Tidak';
  }
  return escHtml(rawValue ?? '-');
}

function renderCrudContent() {
  const cfg = CRUD_CONFIG[activeTab];
  const state = getState();
  const rows = state[cfg.collection] || [];
  const query = tableSearch.trim().toLowerCase();

  const filteredRows = query
    ? rows.filter((row) =>
        cfg.columns.some(([key]) => String(formatCrudCell(key, row[key])).toLowerCase().includes(query))
      )
    : rows;

  return `
    <div class="admin-toolbar">
      <div class="admin-toolbar-left">
        <label for="admin-table-search" class="sr-only">Cari data</label>
        <input
          id="admin-table-search"
          type="search"
          placeholder="Cari di tabel ${escHtml(cfg.label)}…"
          value="${escHtml(tableSearch)}"
        />
      </div>
      <div class="admin-toolbar-actions">
        <button type="button" class="btn btn-outline btn-sm" id="admin-export-csv">
          ${icon('download', 15)} Ekspor CSV
        </button>
        <button type="button" class="btn btn-sm" id="admin-add-row">
          ${icon('plus', 15)} Tambah ${escHtml(cfg.label)}
        </button>
      </div>
    </div>

    ${
      editingRow
        ? `
          <form id="admin-crud-form" class="panel" style="margin-bottom:20px">
            <h3 style="margin-bottom:14px">${editingRow.id ? 'Ubah' : 'Tambah'} ${escHtml(cfg.label)}</h3>
            ${cfg.fields.map((f) => renderFormField(f, editingRow[f[0]])).join('')}
            <div style="display:flex;gap:10px;margin-top:16px">
              <button type="submit" class="btn">${icon('check', 16)} Simpan Data</button>
              <button type="button" class="btn btn-outline" id="admin-cancel-edit">Batal</button>
            </div>
          </form>
        `
        : ''
    }

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            ${cfg.columns
              .map(([key, label]) => {
                const isNum = /nominal|Dana|Donasi|Terkumpul/i.test(key);
                return `<th class="${isNum ? 'num' : ''}">${escHtml(label)}</th>`;
              })
              .join('')}
            <th style="text-align:right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${
            filteredRows.length
              ? filteredRows
                  .map(
                    (row) => `
                      <tr>
                        ${cfg.columns
                          .map(([key]) => {
                            const isNum = /nominal|Dana|Donasi|Terkumpul/i.test(key);
                            return `<td class="${isNum ? 'num' : ''}">${formatCrudCell(key, row[key])}</td>`;
                          })
                          .join('')}
                        <td style="text-align:right;white-space:nowrap">
                          <button type="button" class="btn btn-outline btn-sm" data-edit-id="${row.id}">
                            ${icon('edit', 14)} Ubah
                          </button>
                          <button type="button" class="btn btn-danger btn-sm" data-delete-id="${row.id}">
                            ${icon('trash', 14)} Hapus
                          </button>
                        </td>
                      </tr>
                    `
                  )
                  .join('')
              : `<tr><td colspan="${cfg.columns.length + 1}">Tidak ada data yang cocok.</td></tr>`
          }
        </tbody>
      </table>
    </div>
  `;
}

function renderSettingsContent() {
  const settings = getSettings();
  const heroVal = escHtml(settings.heroImage || '');

  return `
    <div class="two-col">
      <form id="admin-settings-form" class="panel">
        <h3 style="margin-bottom:14px">Identitas &amp; Pengaturan Situs</h3>
        <div class="field-group">
          <label for="set_heroImage_file">Gambar Latar Hero Kustom</label>
          <input id="set_heroImage_file" type="file" accept="image/*" data-image-target="heroImage" />
          <input id="crud_heroImage" type="hidden" value="${heroVal}" />
          <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
            <img
              id="preview_heroImage"
              src="${heroVal}"
              alt=""
              class="image-preview-thumb"
              style="display:${heroVal ? 'block' : 'none'}"
            />
            <button type="button" class="btn btn-outline btn-sm" data-clear-image="heroImage">Gunakan Gambar Bawaan</button>
          </div>
        </div>
        ${SETTINGS_FIELDS.map(
          ([key, label]) => `
            <div class="field-group">
              <label for="set_${key}">${escHtml(label)}</label>
              <input id="set_${key}" type="text" value="${escHtml(settings[key] || '')}" />
            </div>
          `
        ).join('')}
        <button type="submit" class="btn">${icon('check', 16)} Simpan Pengaturan</button>
      </form>

      <div>
        <form id="admin-password-form" class="panel" style="margin-bottom:20px">
          <h3 style="margin-bottom:12px">Keamanan Akun Admin</h3>
          <div class="field-group">
            <label for="new-admin-password">Password Baru (minimal 6 karakter)</label>
            <input id="new-admin-password" type="password" autocomplete="new-password" minlength="6" />
          </div>
          <button type="submit" class="btn btn-outline">Perbarui Password</button>
        </form>

        <div class="panel">
          <h3 style="margin-bottom:8px">Reset Data Penyimpanan Lokal</h3>
          <p style="font-size:0.9rem;color:var(--color-ink-muted);margin-bottom:16px">
            Mengembalikan seluruh program, transaksi, laporan, dan pengaturan ke kondisi awal.
          </p>
          <button type="button" class="btn btn-danger" id="admin-reset-demo">Reset Data Awal</button>
        </div>
      </div>
    </div>
  `;
}

export function renderAdminView() {
  if (!isAdminAuthenticated()) {
    return renderLoginView();
  }

  const settings = getSettings();
  const navItems = [
    ['dash', 'grid', 'Dashboard'],
    ...Object.keys(CRUD_CONFIG).map((key) => {
      const iconMap = {
        programs: 'layers',
        cats: 'tag',
        acts: 'calendar',
        reps: 'file',
        donors: 'users',
        tx: 'swap',
      };
      return [key, iconMap[key], CRUD_CONFIG[key].label];
    }),
    ['settings', 'sliders', 'Pengaturan'],
  ];

  const pageTitle =
    activeTab === 'dash'
      ? 'Dashboard'
      : activeTab === 'settings'
      ? 'Pengaturan'
      : CRUD_CONFIG[activeTab].label;

  return `
    <div class="admin-shell">
      <aside class="admin-sidebar" aria-label="Menu admin">
        <div class="admin-brand" style="display:flex;align-items:center;gap:10px">
          <span class="brand-logo-frame" style="width:34px;height:34px">
            <img src="${LOGO_URL}" alt="" aria-hidden="true" />
          </span>
          <span>${escHtml(settings.namaWebsite)}</span>
        </div>
        ${navItems
          .map(
            ([key, ic, label]) => `
              <button
                type="button"
                class="admin-nav-btn ${activeTab === key ? 'is-active' : ''}"
                data-admin-tab="${key}"
              >
                ${icon(ic, 17)} <span>${escHtml(label)}</span>
              </button>
            `
          )
          .join('')}
      </aside>

      <div class="admin-main-col">
        <header class="admin-topbar">
          <div class="admin-breadcrumb">${escHtml(pageTitle)}</div>
          <div style="display:flex;align-items:center;gap:8px">
            <a class="btn btn-outline btn-sm" href="#home">${icon('eye', 15)} Lihat Situs</a>
            <button type="button" class="btn btn-sm" id="admin-logout-btn">${icon('logout', 15)} Keluar</button>
          </div>
        </header>

        <div class="admin-content">
          <div class="notice-banner">
            Mode Demonstrasi: perubahan data disimpan pada localStorage browser Anda.
          </div>
          ${
            activeTab === 'dash'
              ? renderDashboardContent()
              : activeTab === 'settings'
              ? renderSettingsContent()
              : renderCrudContent()
          }
        </div>
      </div>
    </div>
  `;
}

function bindImageInputs(rerender) {
  document.querySelectorAll('[data-image-target]').forEach((input) => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const targetKey = input.getAttribute('data-image-target');
      try {
        const maxW = targetKey === 'heroImage' ? 1400 : 720;
        const dataUrl = await resizeImageFile(file, maxW);
        const hiddenInput = document.getElementById(`crud_${targetKey}`);
        const preview = document.getElementById(`preview_${targetKey}`);
        if (hiddenInput) hiddenInput.value = dataUrl;
        if (preview) {
          preview.src = dataUrl;
          preview.style.display = 'block';
        }
        showToast('Gambar siap disimpan.');
      } catch (err) {
        showToast(err.message || 'Gagal memproses gambar.');
      }
    });
  });

  document.querySelectorAll('[data-clear-image]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetKey = btn.getAttribute('data-clear-image');
      const hiddenInput = document.getElementById(`crud_${targetKey}`);
      const preview = document.getElementById(`preview_${targetKey}`);
      if (hiddenInput) hiddenInput.value = '';
      if (preview) {
        preview.src = '';
        preview.style.display = 'none';
      }
      if (editingRow && targetKey === 'imageUrl') {
        editingRow.imageUrl = '';
      }
    });
  });

  void rerender;
}

export function mountAdminView(rerender, navigate) {
  if (!isAdminAuthenticated()) {
    document.getElementById('admin-login-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = document.getElementById('admin-user')?.value.trim() || '';
      const pass = document.getElementById('admin-pass')?.value || '';
      const errEl = document.getElementById('admin-login-error');
      const res = await loginAdmin(user, pass);
      if (res.ok) {
        rerender();
      } else if (errEl) {
        errEl.textContent = res.error;
      }
    });
    return;
  }

  document.querySelectorAll('[data-admin-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTab = btn.getAttribute('data-admin-tab');
      editingRow = null;
      tableSearch = '';
      rerender();
    });
  });

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
    logoutAdmin();
    navigate('#home');
  });

  if (activeTab === 'settings') {
    bindImageInputs(rerender);

    document.getElementById('admin-settings-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const patch = {
        heroImage: document.getElementById('crud_heroImage')?.value || '',
      };
      SETTINGS_FIELDS.forEach(([key]) => {
        patch[key] = document.getElementById(`set_${key}`)?.value.trim() || '';
      });
      if (updateSettings(patch)) {
        showToast('Pengaturan situs berhasil disimpan.');
        rerender();
      } else {
        showToast('Penyimpanan penuh. Gunakan gambar dengan ukuran lebih kecil.');
      }
    });

    document.getElementById('admin-password-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('new-admin-password');
      const res = await changeAdminPassword(input?.value || '');
      if (res.ok) {
        if (input) input.value = '';
        showToast('Password admin diperbarui.');
      } else {
        showToast(res.error);
      }
    });

    document.getElementById('admin-reset-demo')?.addEventListener('click', () => {
      openConfirmModal({
        title: 'Reset seluruh data demo?',
        message: 'Semua perubahan program, transaksi baru, dan pengaturan akan kembali ke kondisi awal.',
        confirmLabel: 'Ya, Reset Data',
        cancelLabel: 'Batal',
        danger: true,
        onConfirm: () => {
          resetAllDemoData();
          showToast('Data demo dikembalikan ke kondisi awal.');
          rerender();
        },
      });
    });
    return;
  }

  if (activeTab !== 'dash') {
    const cfg = CRUD_CONFIG[activeTab];

    document.getElementById('admin-table-search')?.addEventListener('input', (e) => {
      tableSearch = e.target.value;
      rerender();
      const searchEl = document.getElementById('admin-table-search');
      if (searchEl) {
        searchEl.focus();
        searchEl.setSelectionRange(tableSearch.length, tableSearch.length);
      }
    });

    document.getElementById('admin-add-row')?.addEventListener('click', () => {
      editingRow = {};
      rerender();
    });

    document.getElementById('admin-export-csv')?.addEventListener('click', () => {
      const state = getState();
      const rows = state[cfg.collection] || [];
      exportToCsv(
        `admin-${cfg.collection}.csv`,
        cfg.columns.map(([, label]) => label),
        rows.map((r) =>
          cfg.columns.map(([key]) => {
            if (key === 'programId') return getProgram(r[key])?.namaProgram || '-';
            return r[key];
          })
        )
      );
      showToast(`Ekspor ${cfg.label} berhasil.`);
    });

    document.querySelectorAll('[data-edit-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-edit-id'));
        const rows = getState()[cfg.collection] || [];
        editingRow = { ...(rows.find((r) => Number(r.id) === id) || {}) };
        rerender();
      });
    });

    document.querySelectorAll('[data-delete-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-delete-id'));
        openConfirmModal({
          title: `Hapus data ${cfg.label}?`,
          message: 'Tindakan ini akan menghapus baris data terpilih dari penyimpanan lokal.',
          confirmLabel: 'Hapus',
          cancelLabel: 'Batal',
          danger: true,
          onConfirm: () => {
            deleteCollectionRow(cfg.collection, id);
            showToast(`Data ${cfg.label} dihapus.`);
            rerender();
          },
        });
      });
    });

    if (editingRow) {
      bindImageInputs(rerender);
      document.getElementById('admin-cancel-edit')?.addEventListener('click', () => {
        editingRow = null;
        rerender();
      });

      document.getElementById('admin-crud-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const payload = editingRow.id ? { id: editingRow.id } : {};
        for (const [key, type] of cfg.fields) {
          const el = document.getElementById(`crud_${key}`);
          if (!el) continue;
          if (type === 'checkbox') {
            payload[key] = Boolean(el.checked);
          } else if (type === 'number' || type === 'program') {
            payload[key] = Number(el.value || 0);
          } else {
            payload[key] = String(el.value || '').trim();
          }
        }

        const primaryName =
          payload.namaProgram ?? payload.namaKategori ?? payload.namaKegiatan ?? payload.nama;
        if (primaryName !== undefined && !primaryName) {
          showToast('Nama wajib diisi.');
          return;
        }

        if (saveCollectionRow(cfg.collection, payload)) {
          editingRow = null;
          showToast(`Data ${cfg.label} berhasil disimpan.`);
          rerender();
        } else {
          showToast('Gagal menyimpan data. Penyimpanan lokal penuh.');
        }
      });
    }
  }
}
