/* Checkout page */

async function loadSummary() {
  const mount = document.getElementById('checkout-items');
  try {
    const res = await Api.getCart();
    const cart = res?.data?.cart;
    const items = cart?.items || [];
    const total = res?.data?.total ?? items.reduce((s, i) => s + i.priceAtAdd, 0);

    if (!items.length) {
      mount.innerHTML = `<p class="text-slate text-sm">Your cart is empty. <a href="properties.html" class="text-brass font-semibold">Browse properties →</a></p>`;
      document.getElementById('checkout-form').querySelector('button[type=submit]').disabled = true;
      return;
    }

    mount.innerHTML = items.map((i) => `
      <div class="flex justify-between text-sm">
        <span class="line-clamp-2 pr-2">${escapeHtml(i.property?.title || 'Property')}</span>
        <span class="text-slate flex-shrink-0">${money(i.priceAtAdd)}</span>
      </div>`).join('');
    document.getElementById('checkout-total').textContent = money(total);
  } catch (err) {
    mount.innerHTML = `<p class="text-slate text-sm">${escapeHtml(apiErrorMessage(err))}</p>`;
  }
}

document.getElementById('checkout-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type=submit]');
  const label = btn.querySelector('.btn-label');
  btn.disabled = true; label.innerHTML = '<span class="btn-spinner"></span>';
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    await Api.checkout(payload);
    toast('Order placed successfully!', 'success');
    refreshCartBadge();
    setTimeout(() => (location.href = 'profile.html'), 900);
  } catch (err) {
    toast(apiErrorMessage(err), 'error');
    btn.disabled = false; label.textContent = 'Place Order';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  loadSummary();
});
