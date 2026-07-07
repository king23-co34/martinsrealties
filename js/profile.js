/* Profile page */

function orderStatusColor(status) {
  return { pending: 'bg-amber-500', reviewing: 'bg-sky-500', confirmed: 'bg-emerald-600', cancelled: 'bg-red-500', completed: 'bg-navy' }[status] || 'bg-slate-500';
}

function orderCard(o) {
  return `
  <div class="bg-white rounded-xl border border-black/5 p-6">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div>
        <p class="text-xs text-slate">Order #${o._id.slice(-8).toUpperCase()}</p>
        <p class="text-xs text-slate">${new Date(o.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      </div>
      <div class="flex gap-2">
        <span class="${orderStatusColor(o.status)} text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">${o.status}</span>
        <span class="bg-black/5 text-charcoal text-xs font-semibold px-3 py-1 rounded-full capitalize">${o.paymentStatus}</span>
      </div>
    </div>
    <ul class="space-y-1 mb-4">
      ${o.items.map((i) => `<li class="flex justify-between text-sm"><span>${escapeHtml(i.title)}</span><span class="text-slate">${money(i.price)}</span></li>`).join('')}
    </ul>
    <div class="flex justify-between border-t border-black/10 pt-3 font-semibold">
      <span>Total</span><span class="text-navy">${money(o.totalAmount)}</span>
    </div>
  </div>`;
}

async function loadOrders() {
  const mount = document.getElementById('orders-list');
  mount.innerHTML = `<div class="h-24 skeleton rounded-xl"></div>`;
  try {
    const res = await Api.myOrders();
    const list = res?.data?.orders || res?.data || [];
    if (!list.length) { mount.innerHTML = `<p class="text-slate text-sm">You haven't placed any orders yet. <a href="properties.html" class="text-brass font-semibold">Browse properties →</a></p>`; return; }
    mount.innerHTML = list.map(orderCard).join('');
  } catch (err) {
    mount.innerHTML = `<p class="text-slate text-sm">Couldn't load your orders: ${escapeHtml(apiErrorMessage(err))}</p>`;
  }
}

async function loadProfile() {
  try {
    const res = await Api.me();
    const user = res?.data?.user || res?.data;
    Auth.setUser(user);
    const form = document.getElementById('profile-form');
    form.elements.name.value = user.name || '';
    form.elements.email.value = user.email || '';
    form.elements.phone.value = user.phone || '';
  } catch (err) {
    toast('Could not load profile', 'error');
  }
}

document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type=submit]');
  const label = btn.querySelector('.btn-label');
  btn.disabled = true; label.innerHTML = '<span class="btn-spinner"></span>';
  try {
    const res = await Api.updateMe({ name: form.elements.name.value, phone: form.elements.phone.value });
    Auth.setUser(res?.data?.user || res?.data);
    toast('Profile updated', 'success');
  } catch (err) {
    toast(apiErrorMessage(err), 'error');
  } finally {
    btn.disabled = false; label.textContent = 'Save Changes';
  }
});

document.getElementById('password-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type=submit]');
  const label = btn.querySelector('.btn-label');
  btn.disabled = true; label.innerHTML = '<span class="btn-spinner"></span>';
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    await Api.updatePassword(payload);
    toast('Password updated', 'success');
    form.reset();
  } catch (err) {
    toast(apiErrorMessage(err), 'error');
  } finally {
    btn.disabled = false; label.textContent = 'Update Password';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  loadProfile();
  loadOrders();
});
