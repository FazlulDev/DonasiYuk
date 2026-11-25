import { isoDayOffset, sha256Hex } from './utils.js';

const STORAGE_KEY = 'sy_db_v2';
const AUTH_KEY = 'sy_auth_v2';
const SESSION_KEY = 'sy_admin_session';

export const LOGO_URL = '/assets/aistudio/logo_mari_berdonasi.png';

export const ASSETS = {
  hero: '/src/assets/images/hero_community_mosque_1795590377996.jpg',
  education: '/src/assets/images/program_education_books_1795590378811.jpg',
  food: '/src/assets/images/program_food_packages_1795590378756.jpg',
  shelter: '/src/assets/images/program_orphanage_shelter_1795590379013.jpg',
  ramadan: '/src/assets/images/program_ramadan_iftar_1795590379212.jpg',
};

const CATEGORIES = [
  'Santunan Anak Yatim',
  'Pendidikan dan Beasiswa',
  'Kebutuhan Pokok',
  'Kesehatan dan Pengobatan',
  'Renovasi Panti Asuhan',
  'Bantuan Bencana',
  'Program Ramadan',
  'Sedekah dan Infak',
];

const SEED_PROGRAMS = [
  ['Santunan Bulanan Anak Yatim', 0, 50000000, 32000000, 120, ASSETS.hero],
  ['Beasiswa Sekolah Dasar', 1, 80000000, 41000000, 60, ASSETS.education],
  ['Paket Sembako Dhuafa', 2, 30000000, 27000000, 200, ASSETS.food],
  ['Pengobatan Anak Yatim Sakit', 3, 45000000, 12000000, 15, ASSETS.shelter],
  ['Renovasi Asrama & Perpustakaan Panti', 4, 150000000, 64000000, 45, ASSETS.shelter],
  ['Bantuan Tanggap Banjir', 5, 100000000, 88000000, 300, ASSETS.food],
  ['Takjil dan Iftar Ramadan', 6, 25000000, 25000000, 500, ASSETS.ramadan],
  ['Infak Jumat Berkah', 7, 10000000, 6000000, 80, ASSETS.ramadan],
  ['Seragam dan Perlengkapan Sekolah', 1, 35000000, 19000000, 90, ASSETS.education],
  ['Susu dan Gizi Balita Yatim', 2, 28000000, 9000000, 40, ASSETS.food],
  ['Pojok Baca Panti Asuhan', 4, 40000000, 22000000, 70, ASSETS.shelter],
  ['Sedekah Subuh Berkelanjutan', 7, 15000000, 11000000, 150, ASSETS.hero],
];

const SEED_ACTIVITIES = [
  [
    'Santunan Anak Yatim Muharram',
    'Penyaluran santunan pendidikan dan paket kebutuhan harian kepada 120 anak yatim binaan di Banda Aceh.',
    ASSETS.hero,
  ],
  [
    'Distribusi Paket Sembako Keluarga',
    'Pengemasan dan penyaluran paket beras, minyak goreng, dan nutrisi keluarga bagi warga dhuafa.',
    ASSETS.food,
  ],
  [
    'Penyerahan Perlengkapan Sekolah',
    'Pembagian tas sekolah, buku pelajaran, dan alat tulis untuk siswa SD dan SMP menjelang tahun ajaran baru.',
    ASSETS.education,
  ],
  [
    'Buka Puasa Bersama Panti',
    'Jamuan buka puasa dan doa bersama pengurus panti asuhan serta relawan komunitas.',
    ASSETS.ramadan,
  ],
];

function createSeedData() {
  return {
    version: 2,
    programs: SEED_PROGRAMS.map((item, idx) => {
      const target = item[2];
      const raised = item[3];
      const completed = raised >= target;
      return {
        id: idx + 1,
        namaProgram: item[0],
        kategori: CATEGORIES[item[1]],
        deskripsi:
          'Program ' +
          item[0].toLowerCase() +
          ' disalurkan secara bertahap kepada penerima manfaat terverifikasi dengan pelaporan berkala di halaman Transparansi.',
        targetDonasi: target,
        danaTerkumpul: raised,
        jumlahPenerimaManfaat: item[4],
        tanggalMulai: isoDayOffset(-60),
        tanggalSelesai: completed ? isoDayOffset(-1) : isoDayOffset(14 + idx * 7),
        status: completed ? 'Selesai' : 'Aktif',
        lokasi: 'Banda Aceh',
        rincianPenggunaanDana: '90% penyaluran bantuan langsung kepada penerima manfaat; 10% logistik & pelaporan lapangan.',
        unggulan: idx < 3,
        imageUrl: item[5],
      };
    }),
    cats: CATEGORIES.map((name, idx) => ({
      id: idx + 1,
      namaKategori: name,
      deskripsi: 'Kategori penghimpunan dan penyaluran untuk ' + name.toLowerCase() + '.',
    })),
    acts: SEED_ACTIVITIES.map((act, idx) => ({
      id: idx + 1,
      namaKegiatan: act[0],
      tanggal: isoDayOffset(-18 * (idx + 1)),
      lokasi: 'Banda Aceh & Sekitarnya',
      deskripsi: act[1],
      imageUrl: act[2],
    })),
    reps: [1, 2, 3, 6].map((programId, idx) => ({
      id: idx + 1,
      programId,
      tanggalPenyaluran: isoDayOffset(-12 * (idx + 1)),
      jumlahDana: [10000000, 15000000, 20000000, 40000000][idx],
      deskripsiPenyaluran: 'Penyaluran tahap ' + (idx + 1) + ' dan dokumentasi serah terima lapangan.',
      status: idx % 2 === 1 ? 'Dalam proses' : 'Tersalurkan',
    })),
    donors: [
      {
        id: 1,
        nama: 'Hamba Allah',
        email: 'donatur1@example.com',
        nomorWhatsApp: '081200000001',
        anonim: true,
      },
      {
        id: 2,
        nama: 'Rahmawati Putri',
        email: 'rahmawati@example.com',
        nomorWhatsApp: '081200000002',
        anonim: false,
      },
    ],
    tx: [
      {
        id: 1,
        donaturId: 2,
        programId: 1,
        jenisDonasi: 'Donasi umum',
        nominal: 250000,
        metodePembayaran: 'QRIS',
        tanggalTransaksi: isoDayOffset(-3),
        statusPembayaran: 'berhasil',
        pesanDonatur: 'Semoga membawa manfaat dan keberkahan bagi adik-adik.',
        kodeTransaksi: 'SY-2026-0001',
        mine: false,
      },
    ],
    favs: [],
    settings: {
      namaWebsite: 'Mari Berdonasi',
      tagline: 'Platform Donasi & Transparansi Anak Yatim',
      deskripsi:
        'Mari Berdonasi menghubungkan donatur dengan program santunan, beasiswa pendidikan, gizi, dan renovasi fasilitas anak yatim dengan catatan penyaluran terbuka.',
      heroJudul: '',
      heroTeks: '',
      heroImage: '',
      nomorWhatsApp: '6281200000000',
      email: 'halo@mariberdonasi.example',
      alamat: 'Jl. Teuku Nyak Arief No. 18, Banda Aceh',
      rekeningDonasi: 'Bank Syariah Contoh · 7120-0088-99 a.n. Yayasan Mari Berdonasi',
      bannerJudul: 'Kampanye Prioritas Bulan Ini',
      bannerTeks: 'Bantu pemenuhan santunan pendidikan dan gizi bagi 120 anak yatim binaan.',
    },
  };
}

let state = loadState();
let donationDraft = null;
let failedLoginCount = 0;
let lockUntilTimestamp = 0;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.programs) && parsed.settings) {
        if (parsed.settings.namaWebsite === 'Sahabat Yatim') {
          parsed.settings.namaWebsite = 'Mari Berdonasi';
          parsed.settings.deskripsi = String(parsed.settings.deskripsi || '').replace(
            /Sahabat Yatim/g,
            'Mari Berdonasi'
          );
          if (parsed.settings.email === 'halo@sahabatyatim.example') {
            parsed.settings.email = 'halo@mariberdonasi.example';
          }
          parsed.settings.rekeningDonasi = String(parsed.settings.rekeningDonasi || '').replace(
            /Sahabat Yatim/g,
            'Mari Berdonasi'
          );
          persistState(parsed);
        }
        return parsed;
      }
    }
  } catch {
    // Fallback to seed data
  }
  const initial = createSeedData();
  persistState(initial);
  return initial;
}

function persistState(targetState = state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(targetState));
    return true;
  } catch {
    return false;
  }
}

export function getState() {
  return state;
}

export function getSettings() {
  return state.settings;
}

export function getProgram(id) {
  return state.programs.find((p) => Number(p.id) === Number(id)) || null;
}

export function getActivity(id) {
  return state.acts.find((a) => Number(a.id) === Number(id)) || null;
}

export function getTransaction(id) {
  return state.tx.find((t) => Number(t.id) === Number(id)) || null;
}

export function getDonor(id) {
  return state.donors.find((d) => Number(d.id) === Number(id)) || null;
}

export function getTotalRaised() {
  return state.programs.reduce((sum, p) => sum + Number(p.danaTerkumpul || 0), 0);
}

export function getTotalDistributed() {
  return state.reps
    .filter((r) => r.status === 'Tersalurkan')
    .reduce((sum, r) => sum + Number(r.jumlahDana || 0), 0);
}

export function getTotalBeneficiaries() {
  return state.programs.reduce((sum, p) => sum + Number(p.jumlahPenerimaManfaat || 0), 0);
}

export function isFavorite(programId) {
  return state.favs.includes(Number(programId));
}

export function toggleFavorite(programId) {
  const id = Number(programId);
  const idx = state.favs.indexOf(id);
  if (idx === -1) {
    state.favs.push(id);
  } else {
    state.favs.splice(idx, 1);
  }
  persistState();
  return idx === -1;
}

export function getDonationDraft() {
  return donationDraft;
}

export function setDonationDraft(draft) {
  donationDraft = draft;
}

export function createDonationTransaction(payload) {
  const nextTxId = Math.max(0, ...state.tx.map((x) => Number(x.id))) + 1;
  const nextDonorId = Math.max(0, ...state.donors.map((x) => Number(x.id))) + 1;

  state.donors.push({
    id: nextDonorId,
    nama: payload.nama,
    email: payload.email,
    nomorWhatsApp: payload.wa,
    anonim: Boolean(payload.anon),
  });

  const txRecord = {
    id: nextTxId,
    donaturId: nextDonorId,
    programId: Number(payload.pid),
    jenisDonasi: payload.jenis,
    nominal: Number(payload.nom),
    metodePembayaran: payload.met,
    tanggalTransaksi: isoDayOffset(0),
    statusPembayaran: 'menunggu pembayaran',
    pesanDonatur: payload.pesan || '',
    kodeTransaksi: `SY-2026-${String(nextTxId).padStart(4, '0')}`,
    mine: true,
  };

  state.tx.push(txRecord);
  donationDraft = null;
  persistState();
  return txRecord;
}

export function updateTransactionStatus(txId, nextStatus) {
  const tx = getTransaction(txId);
  if (!tx) return null;
  const prevStatus = tx.statusPembayaran;
  const program = getProgram(tx.programId);

  if (nextStatus === 'berhasil' && prevStatus !== 'berhasil' && program) {
    program.danaTerkumpul = Number(program.danaTerkumpul) + Number(tx.nominal);
    if (program.danaTerkumpul >= program.targetDonasi) {
      program.status = 'Selesai';
    }
  } else if (prevStatus === 'berhasil' && nextStatus !== 'berhasil' && program) {
    program.danaTerkumpul = Math.max(0, Number(program.danaTerkumpul) - Number(tx.nominal));
  }

  tx.statusPembayaran = nextStatus;
  persistState();
  return tx;
}

export function saveCollectionRow(collectionKey, rowData) {
  const list = state[collectionKey];
  if (!Array.isArray(list)) return false;

  if (rowData.id) {
    const idx = list.findIndex((item) => Number(item.id) === Number(rowData.id));
    if (idx !== -1) {
      if (collectionKey === 'tx') {
        const oldStatus = list[idx].statusPembayaran;
        list[idx] = { ...list[idx], ...rowData };
        if (oldStatus !== rowData.statusPembayaran) {
          // Adjust program total safely if admin changes tx status
          const tempStatus = rowData.statusPembayaran;
          list[idx].statusPembayaran = oldStatus;
          updateTransactionStatus(list[idx].id, tempStatus);
        }
      } else {
        list[idx] = { ...list[idx], ...rowData };
      }
    }
  } else {
    const nextId = Math.max(0, ...list.map((x) => Number(x.id))) + 1;
    const newRecord = { ...rowData, id: nextId };
    if (collectionKey === 'programs' && !newRecord.tanggalMulai) {
      newRecord.tanggalMulai = isoDayOffset(0);
    }
    if (collectionKey === 'tx') {
      newRecord.kodeTransaksi = `SY-2026-${String(nextId).padStart(4, '0')}`;
      newRecord.tanggalTransaksi = isoDayOffset(0);
      newRecord.donaturId = newRecord.donaturId || 1;
      newRecord.jenisDonasi = newRecord.jenisDonasi || 'Donasi umum';
    }
    list.push(newRecord);
  }

  return persistState();
}

export function deleteCollectionRow(collectionKey, id) {
  if (!Array.isArray(state[collectionKey])) return false;
  state[collectionKey] = state[collectionKey].filter((item) => Number(item.id) !== Number(id));
  return persistState();
}

export function updateSettings(patch) {
  state.settings = { ...state.settings, ...patch };
  return persistState();
}

export function resetAllDemoData() {
  state = createSeedData();
  donationDraft = null;
  return persistState();
}

export function isAdminAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

export function logoutAdmin() {
  sessionStorage.removeItem(SESSION_KEY);
}

export async function loginAdmin(username, password) {
  if (Date.now() < lockUntilTimestamp) {
    const remaining = Math.ceil((lockUntilTimestamp - Date.now()) / 1000);
    return { ok: false, error: `Terlalu banyak percobaan. Coba lagi dalam ${remaining} detik.` };
  }

  let savedAuth = null;
  try {
    savedAuth = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
  } catch {
    savedAuth = null;
  }

  if (!savedAuth) {
    savedAuth = { u: 'admin', h: await sha256Hex('admin123') };
  }

  const candidateHash = await sha256Hex(password);
  if (username === savedAuth.u && candidateHash === savedAuth.h) {
    sessionStorage.setItem(SESSION_KEY, '1');
    failedLoginCount = 0;
    return { ok: true };
  }

  failedLoginCount += 1;
  if (failedLoginCount >= 5) {
    lockUntilTimestamp = Date.now() + 30000;
    failedLoginCount = 0;
  }
  return { ok: false, error: 'Username atau password tidak sesuai.' };
}

export async function changeAdminPassword(newPassword) {
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, error: 'Password minimal 6 karakter.' };
  }
  const hash = await sha256Hex(newPassword);
  localStorage.setItem(AUTH_KEY, JSON.stringify({ u: 'admin', h: hash }));
  return { ok: true };
}
