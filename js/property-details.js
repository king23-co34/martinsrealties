/* Property details page */

function getIdFromUrl() {
  return new URLSearchParams(location.search).get('id');
}

let currentProperty = null;
let activeImageIdx = 0;

function renderGallery(images = []) {
  const main = document.getElementById('gallery-main');
  const thumbs = document.getElementById('gallery-thumbs');
  const list = images.length ? images : [{ url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200&auto=format&fit=crop' }];

  main.className = 'h-96 rounded-2xl overflow-hidden bg-black/5';
  main.innerHTML = `<img src="${list[activeImageIdx]?.url || list[0].url}" class="w-full h-full object-cover" alt="${escapeHtml(currentProperty?.title || 'Property image')}" />`;

  thumbs.innerHTML = list.map((img, i) => `
    <button class="thumb-btn w-20 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${i === activeImageIdx ? 'border-brass' : 'border-transparent'}" data-idx="${i}">
      <img src="${img.url}" class="w-full h-full object-cover" alt="Thumbnail ${i + 1}" />
    </button>`).join('');

  thumbs.querySelectorAll('.thumb-btn').forEach((b) => {
    b.addEventListener('click', () => { activeImageIdx = Number(b.dataset.idx); renderGallery(images); });
  });
}

function renderSidebar(p) {
  const sidebar = document.getElementById('detail-sidebar');
  const statusColor = { available: 'bg-emerald-600', pending: 'bg-amber-500', sold: 'bg-slate-500', rented: 'bg-slate-500' }[p.status] || 'bg-slate-500';
  const canAct = p.status === 'available';
  sidebar.innerHTML = `
    <div class="bg-white rounded-2xl border border-black/5 p-6 sticky top-24">
      <div class="flex items-center gap-2 mb-3">
        <span class="${statusColor} text-white text-xs font-semibold px-2.5 py-1 rounded-full capitalize">${p.status}</span>
        <span class="bg-navy-dark text-white text-xs font-semibold px-2.5 py-1 rounded-full capitalize">${p.listingType}</span>
      </div>
      <p class="font-display text-3xl text-navy mb-1">${money(p.price, p.currency)}</p>
      <p class="text-slate text-sm mb-6">${escapeHtml(p.city)}, ${escapeHtml(p.state)}</p>
      <div class="grid grid-cols-3 gap-3 text-center mb-6 text-sm">
        <div class="bg-ivory rounded-lg py-3"><p class="font-display text-lg">${p.bedrooms || 0}</p><p class="text-slate text-xs">Beds</p></div>
        <div class="bg-ivory rounded-lg py-3"><p class="font-display text-lg">${p.bathrooms || 0}</p><p class="text-slate text-xs">Baths</p></div>
        <div class="bg-ivory rounded-lg py-3"><p class="font-display text-lg">${p.areaSqft || '—'}</p><p class="text-slate text-xs">Sqft</p></div>
      </div>
      <button id="add-to-cart-btn" ${canAct ? '' : 'disabled'} class="w-full ${canAct ? 'bg-brass hover:bg-brass-light' : 'bg-slate-300 cursor-not-allowed'} text-white font-semibold py-3 rounded-md transition-colors flex items-center justify-center gap-2 mb-3">
        <span class="btn-label">${canAct ? 'Add to Cart' : 'Currently Unavailable'}</span>
      </button>
      <a href="contact.html" class="block text-center border border-navy/20 hover:border-brass text-navy font-semibold py-3 rounded-md transition-colors">Enquire About This Property</a>
      <p class="text-xs text-slate text-center mt-4">${p.views || 0} view${p.views === 1 ? '' : 's'}</p>
    </div>`;

  document.getElementById('add-to-cart-btn')?.addEventListener('click', async () => {
    if (!Auth.isLoggedIn()) { toast('Please log in to add properties to your cart', 'info'); setTimeout(() => (location.href = `login.html?next=property-details.html?id=${p._id}`), 700); return; }
    const btn = document.getElementById('add-to-cart-btn');
    const label = btn.querySelector('.btn-label');
    btn.disabled = true; label.innerHTML = '<span class="btn-spinner"></span>';
    try {
      await Api.addToCart(p._id);
      toast('Added to cart', 'success');
      refreshCartBadge();
    } catch (err) {
      toast(apiErrorMessage(err), 'error');
    } finally {
      btn.disabled = false; label.textContent = 'Add to Cart';
    }
  });
}

function renderDescription(p) {
  const mount = document.getElementById('detail-description');
  mount.innerHTML = `
    <h1 class="font-display text-3xl sm:text-4xl mb-4">${escapeHtml(p.title)}</h1>
    <p class="text-slate leading-relaxed max-w-3xl whitespace-pre-line">${escapeHtml(p.description || 'No description provided for this property yet.')}</p>
    ${p.amenities?.length ? `
      <h3 class="font-display text-xl mt-10 mb-4">Amenities</h3>
      <div class="flex flex-wrap gap-2">${p.amenities.map((a) => `<span class="bg-white border border-black/10 rounded-full px-4 py-1.5 text-sm">${escapeHtml(a)}</span>`).join('')}</div>
    ` : ''}
    <div class="mt-10">
      <a href="properties.html" class="text-navy font-semibold hover:text-brass">← Back to all properties</a>
    </div>`;
}

async function loadProperty() {
  const id = getIdFromUrl();
  if (!id) { document.getElementById('detail-root').innerHTML = `<p class="text-center py-24 text-slate">No property specified. <a href="properties.html" class="text-brass font-semibold">Browse listings</a></p>`; return; }
  try {
    const res = await Api.getProperty(id);
    currentProperty = res?.data?.property || res?.data;
    if (!currentProperty) throw new Error('Not found');
    document.title = `${currentProperty.title} — D'S Martins Nig Enterprise`;
    renderGallery(currentProperty.images);
    renderSidebar(currentProperty);
    renderDescription(currentProperty);
  } catch (err) {
    document.getElementById('detail-root').innerHTML = `<p class="text-center py-24 text-slate">This property could not be found. <a href="properties.html" class="text-brass font-semibold">Browse listings</a></p>`;
  }
}

document.addEventListener('DOMContentLoaded', loadProperty);
