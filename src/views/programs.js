import { renderProgramCard } from '../components/ui.js';
import { t } from '../i18n.js';
import { getState, isFavorite } from '../store.js';
import { calcDaysLeft, escHtml } from '../utils.js';

const filterState = {
  search: '',
  category: '',
  sort: 'newest',
  favoritesOnly: false,
};

export function renderProgramsView(categoryArg) {
  if (categoryArg !== undefined && categoryArg !== '') {
    filterState.category = decodeURIComponent(categoryArg);
  }
  const state = getState();

  return `
    <section class="section">
      <div class="wrap">
        <div class="section-header">
          <div>
            <h1>${t('navPrograms')}</h1>
            <p class="section-subtitle">Pilih program sesuai kategori atau tujuan penyaluran yang ingin Anda dukung.</p>
          </div>
        </div>

        <div class="filter-toolbar">
          <div class="search-box">
            <label for="program-search" class="sr-only">${t('searchPlaceholder')}</label>
            <input
              id="program-search"
              type="search"
              placeholder="${t('searchPlaceholder')}"
              value="${escHtml(filterState.search)}"
            />
          </div>
          <label for="program-category" class="sr-only">${t('allCategories')}</label>
          <select id="program-category">
            <option value="">${t('allCategories')}</option>
            ${state.cats
              .map(
                (cat) =>
                  `<option value="${escHtml(cat.namaKategori)}" ${
                    filterState.category === cat.namaKategori ? 'selected' : ''
                  }>${escHtml(cat.namaKategori)}</option>`
              )
              .join('')}
          </select>
          <label for="program-sort" class="sr-only">Urutkan</label>
          <select id="program-sort">
            <option value="newest" ${filterState.sort === 'newest' ? 'selected' : ''}>${t('sortNewest')}</option>
            <option value="raised" ${filterState.sort === 'raised' ? 'selected' : ''}>${t('sortRaised')}</option>
            <option value="target" ${filterState.sort === 'target' ? 'selected' : ''}>${t('sortTarget')}</option>
            <option value="ending" ${filterState.sort === 'ending' ? 'selected' : ''}>${t('sortEnding')}</option>
          </select>
          <button
            type="button"
            id="program-fav-filter"
            class="filter-btn ${filterState.favoritesOnly ? 'is-active' : ''}"
            aria-pressed="${filterState.favoritesOnly}"
          >
            ${t('favoritesOnly')} (${state.favs.length})
          </button>
        </div>

        <div class="meta-line" style="margin-bottom:18px" id="program-count"></div>
        <div id="program-grid"></div>
      </div>
    </section>
  `;
}

export function mountProgramsView() {
  const searchInput = document.getElementById('program-search');
  const categorySelect = document.getElementById('program-category');
  const sortSelect = document.getElementById('program-sort');
  const favBtn = document.getElementById('program-fav-filter');

  const updateList = () => {
    const state = getState();
    const query = filterState.search.trim().toLowerCase();
    if (favBtn) {
      favBtn.textContent = `${t('favoritesOnly')} (${state.favs.length})`;
    }

    const filtered = state.programs.filter((program) => {
      const matchesText =
        !query ||
        program.namaProgram.toLowerCase().includes(query) ||
        program.lokasi.toLowerCase().includes(query) ||
        program.kategori.toLowerCase().includes(query);
      const matchesCategory = !filterState.category || program.kategori === filterState.category;
      const matchesFav = !filterState.favoritesOnly || isFavorite(program.id);
      return matchesText && matchesCategory && matchesFav;
    });

    filtered.sort((a, b) => {
      if (filterState.sort === 'raised') return Number(b.danaTerkumpul) - Number(a.danaTerkumpul);
      if (filterState.sort === 'target') return Number(b.targetDonasi) - Number(a.targetDonasi);
      if (filterState.sort === 'ending') return calcDaysLeft(a) - calcDaysLeft(b);
      return Number(b.id) - Number(a.id);
    });

    const countEl = document.getElementById('program-count');
    const gridEl = document.getElementById('program-grid');
    if (!countEl || !gridEl) return;

    countEl.textContent = `${filtered.length} ${t('navPrograms')}`;

    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div class="empty-state">
          <h3>Tidak ada program yang sesuai</h3>
          <p>Ubah kata kunci pencarian, kategori, atau nonaktifkan filter favorit untuk melihat semua program.</p>
          <button type="button" class="btn btn-outline" id="reset-program-filters">${t('resetFilter')}</button>
        </div>
      `;
      document.getElementById('reset-program-filters')?.addEventListener('click', () => {
        filterState.search = '';
        filterState.category = '';
        filterState.sort = 'newest';
        filterState.favoritesOnly = false;
        if (searchInput) searchInput.value = '';
        if (categorySelect) categorySelect.value = '';
        if (sortSelect) sortSelect.value = 'newest';
        favBtn?.classList.remove('is-active');
        favBtn?.setAttribute('aria-pressed', 'false');
        updateList();
      });
      return;
    }

    gridEl.innerHTML = `<div class="card-grid">${filtered.map(renderProgramCard).join('')}</div>`;
  };

  searchInput?.addEventListener('input', (e) => {
    filterState.search = e.target.value;
    updateList();
  });

  categorySelect?.addEventListener('change', (e) => {
    filterState.category = e.target.value;
    updateList();
  });

  sortSelect?.addEventListener('change', (e) => {
    filterState.sort = e.target.value;
    updateList();
  });

  favBtn?.addEventListener('click', () => {
    filterState.favoritesOnly = !filterState.favoritesOnly;
    favBtn.classList.toggle('is-active', filterState.favoritesOnly);
    favBtn.setAttribute('aria-pressed', String(filterState.favoritesOnly));
    updateList();
  });

  updateList();
}
