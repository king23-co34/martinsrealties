/* Properties listing page: filters, search, pagination */

function buildQuery(params) {
  const usp = new URLSearchParams();
  if (params.q) usp.set('q', params.q);
  if (params.type) usp.set('type', params.type);
  if (params.listingType) usp.set('listingType', params.listingType);
  if (params.city) usp.set('city', params.city);
  if (params.bedrooms) usp.set('bedrooms', params.bedrooms);
  if (params.sort) usp.set('sort', params.sort);
  if (params.priceMin) usp.set('price[gte]', params.priceMin);
  if (params.priceMax) usp.set('price[lte]', params.priceMax);
  usp.set('page', params.page || 1);
  usp.set('limit', 12);
  return `?${usp.toString()}`;
}

function readFilters(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function paramsFromUrl() {
  const usp = new URLSearchParams(location.search);
  return Object.fromEntries(usp.entries());
}

function syncFormFromUrl(form) {
  const p = paramsFromUrl();
  Object.entries(p).forEach(([key, val]) => {
    const field = form.elements[key];
    if (field) field.value = val;
  });
}

let currentPage = 1;

async function loadProperties(page = 1) {
  const grid = document.getElementById('properties-grid');
  const meta = document.getElementById('results-meta');
  const pagination = document.getElementById('pagination');
  grid.innerHTML = skeletonCards(6);
  meta.textContent = '';
  pagination.innerHTML = '';

  const form = document.getElementById('filter-form');
  const filters = readFilters(form);
  filters.page = page;
  currentPage = page;

  const usp = new URLSearchParams(filters);
  history.replaceState(null, '', `?${usp.toString()}`);

  try {
    const res = await Api.getProperties(buildQuery(filters));
    const list = res?.data?.properties || [];
    const total = res?.total ?? list.length;

    if (!list.length) {
      grid.innerHTML = `<div class="col-span-full text-center py-20 text-slate">
        <p class="font-display text-xl mb-2">No properties match your search</p>
        <p class="text-sm">Try adjusting your filters or clearing them to see all listings.</p>
      </div>`;
      meta.textContent = '';
      return;
    }

    meta.textContent = `Showing ${list.length} of ${total} propert${total === 1 ? 'y' : 'ies'}`;
    grid.innerHTML = list.map(propertyCard).join('');
    initReveal();

    const totalPages = res?.pages || Math.ceil(total / 12) || 1;
    renderPagination(totalPages, page);
  } catch (err) {
    grid.innerHTML = `<div class="col-span-full text-center py-20 text-slate">Couldn't load properties: ${escapeHtml(apiErrorMessage(err))}</div>`;
  }
}

function renderPagination(totalPages, page) {
  const pagination = document.getElementById('pagination');
  if (totalPages <= 1) return;
  let html = '';
  const btn = (p, label = p, disabled = false, active = false) => `
    <button ${disabled ? 'disabled' : ''} data-page="${p}"
      class="pg-btn w-9 h-9 rounded-md text-sm font-medium transition-colors ${active ? 'bg-navy text-white' : 'bg-white border border-black/10 text-charcoal hover:border-brass'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}">
      ${label}
    </button>`;
  html += btn(page - 1, '←', page <= 1);
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) html += btn(i, i, false, i === page);
    else if (i === 2 || i === totalPages - 1) html += `<span class="text-slate">…</span>`;
  }
  html += btn(page + 1, '→', page >= totalPages);
  pagination.innerHTML = html;
  pagination.querySelectorAll('.pg-btn:not([disabled])').forEach((b) => {
    b.addEventListener('click', () => { loadProperties(Number(b.dataset.page)); window.scrollTo({ top: 300, behavior: 'smooth' }); });
  });
}

document.getElementById('filter-form')?.addEventListener('submit', (e) => { e.preventDefault(); loadProperties(1); });
document.getElementById('reset-filters')?.addEventListener('click', () => {
  document.getElementById('filter-form').reset();
  history.replaceState(null, '', location.pathname);
  loadProperties(1);
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('filter-form');
  syncFormFromUrl(form);
  loadProperties(Number(paramsFromUrl().page) || 1);
});
