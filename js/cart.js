/* Cart page */

function cartItemRow(item) {
  const p = item.property || {};
  const img = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=400&auto=format&fit=crop';
  const unavailable = p.status && p.status !== 'available';
  return `
  <div class="bg-white rounded-xl border border-black/5 p-4 flex gap-4 items-center">
    <img src="${img}" class="w-24 h-20 object-cover rounded-lg flex-shrink-0" alt="${escapeHtml(p.title || 'Property')}" />
    <div class="flex-1 min-w-0">
      <a href="property-details.html?id=${p._id}" class="font-display text-base hover:text-brass line-clamp-2">${escapeHtml(p.title || 'Property')}</a>
      <p class="text-slate text-xs mt-1">${escapeHtml(p.city || '')}${p.city ? ', ' : ''}${escapeHtml(p.state || '')}</p>
      ${unavailable ? `<p class="text-red-600 text-xs mt-1 font-semibold">No longer available</p>` : ''}
      <p class="text-navy font-semibold mt-1">${money(item.priceAtAdd)}</p>
    </div>
    <button class="remove-item-btn text-slate hover:text-red-600 p-2" data-id="${p._id}" aria-label="Remove">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6h14Z"/></svg>
    </button>
  </div>`;
}

async function loadCart() {
  const mount = document.getElementById('cart-items');
  mount.innerHTML = `<div class="h-24 skeleton rounded-xl"></div><div class="h-24 skeleton rounded-xl"></div>`;
  try {
    const res = await Api.getCart();
    const cart = res?.data?.cart;
    const items = cart?.items || [];
    const total = res?.data?.total ?? items.reduce((s, i) => s + i.priceAtAdd, 0);

    document.getElementById('summary-count').textContent = items.length;
    document.getElementById('summary-total').textContent = money(total);
    const checkoutBtn = document.getElementById('checkout-btn');

    if (!items.length) {
      mount.innerHTML = `<div class="bg-white rounded-xl border border-black/5 p-12 text-center">
        <p class="font-display text-xl mb-2">Your cart is empty</p>
        <p class="text-slate text-sm mb-6">Browse our listings and add a property to get started.</p>
        <a href="properties.html" class="bg-brass hover:bg-brass-light text-white font-semibold px-6 py-2.5 rounded-md transition-colors">Browse Properties</a>
      </div>`;
      checkoutBtn.classList.add('pointer-events-none', 'opacity-40');
      return;
    }
    checkoutBtn.classList.remove('pointer-events-none', 'opacity-40');
    mount.innerHTML = items.map(cartItemRow).join('');

    mount.querySelectorAll('.remove-item-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
          await Api.removeFromCart(btn.dataset.id);
          toast('Item removed', 'success');
          loadCart();
          refreshCartBadge();
        } catch (err) {
          toast(apiErrorMessage(err), 'error');
          btn.disabled = false;
        }
      });
    });
  } catch (err) {
    mount.innerHTML = `<p class="text-slate text-sm">Couldn't load your cart: ${escapeHtml(apiErrorMessage(err))}</p>`;
  }
}

document.getElementById('clear-cart-btn')?.addEventListener('click', async () => {
  if (!confirm('Clear your entire cart?')) return;
  try {
    await Api.clearCart();
    toast('Cart cleared', 'success');
    loadCart();
    refreshCartBadge();
  } catch (err) {
    toast(apiErrorMessage(err), 'error');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  loadCart();
});
