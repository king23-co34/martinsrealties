/* Admin orders */

let adminOrdersPage = 1;
let allOrders = [];

function orderStatusColor(status) {
  return { pending: 'bg-amber-500', reviewing: 'bg-sky-500', confirmed: 'bg-emerald-600', cancelled: 'bg-red-500', completed: 'bg-navy' }[status] || 'bg-slate-500';
}

function adminOrderCard(o) {
  return `
  <div class="bg-white rounded-xl border border-black/5 p-6">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div>
        <p class="font-medium">${escapeHtml(o.user?.name || 'Guest')} <span class="text-slate text-xs font-normal">${escapeHtml(o.user?.email || '')}</span></p>
        <p class="text-xs text-slate">Order #${o._id.slice(-8).toUpperCase()} · ${new Date(o.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      </div>
      <div class="flex gap-2 items-center">
        <span class="${orderStatusColor(o.status)} text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">${o.status}</span>
        <span class="bg-black/5 text-charcoal text-xs font-semibold px-3 py-1 rounded-full capitalize">${o.paymentStatus}</span>
        <button class="edit-order-btn text-navy hover:text-brass text-sm font-semibold" data-id="${o._id}">Manage</button>
      </div>
    </div>
    <ul class="space-y-1 mb-3 text-sm">
      ${o.items.map((i) => `<li class="flex justify-between"><span>${escapeHtml(i.title)}</span><span class="text-slate">${money(i.price)}</span></li>`).join('')}
    </ul>
    <p class="text-xs text-slate">📞 ${escapeHtml(o.contactPhone)} · 📍 ${escapeHtml(o.contactAddress)}</p>
    <div class="flex justify-between border-t border-black/10 mt-3 pt-3 font-semibold text-sm">
      <span>Total</span><span class="text-navy">${money(o.totalAmount)}</span>
    </div>
  </div>`;
}

async function loadAdminOrders(page = 1) {
  adminOrdersPage = page;
  const mount = document.getElementById('admin-orders-list');
  mount.innerHTML = `<div class="h-32 skeleton rounded-xl"></div><div class="h-32 skeleton rounded-xl"></div>`;
  try {
    const res = await Api.getAllOrders(`?page=${page}&limit=10&sort=-createdAt`);
    allOrders = res?.data?.orders || [];
    const total = res?.total ?? allOrders.length;
    if (!allOrders.length) { mount.innerHTML = `<div class="bg-white rounded-xl p-12 text-center text-slate">No orders yet.</div>`; document.getElementById('admin-pagination').innerHTML = ''; return; }
    mount.innerHTML = allOrders.map(adminOrderCard).join('');
    document.querySelectorAll('.edit-order-btn').forEach((b) => b.addEventListener('click', () => openOrderModal(allOrders.find((o) => o._id === b.dataset.id))));
    renderAdminPagination('admin-pagination', res?.pages || Math.ceil(total / 10) || 1, page, loadAdminOrders);
  } catch (err) {
    mount.innerHTML = `<div class="bg-white rounded-xl p-8 text-slate text-sm">Couldn't load orders: ${escapeHtml(apiErrorMessage(err))}</div>`;
  }
}

function openOrderModal(order) {
  const modal = document.getElementById('order-modal');
  const form = document.getElementById('order-form');
  form.elements._id.value = order._id;
  form.elements.status.value = order.status;
  form.elements.paymentStatus.value = order.paymentStatus;
  form.elements.adminNote.value = order.adminNote || '';
  modal.classList.remove('hidden');
}

document.getElementById('cancel-order-modal')?.addEventListener('click', () => document.getElementById('order-modal').classList.add('hidden'));

document.getElementById('order-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type=submit]');
  const label = btn.querySelector('.btn-label');
  btn.disabled = true; label.innerHTML = '<span class="btn-spinner"></span>';
  try {
    await Api.updateOrder(form.elements._id.value, {
      status: form.elements.status.value,
      paymentStatus: form.elements.paymentStatus.value,
      adminNote: form.elements.adminNote.value,
    });
    toast('Order updated', 'success');
    document.getElementById('order-modal').classList.add('hidden');
    loadAdminOrders(adminOrdersPage);
  } catch (err) {
    toast(apiErrorMessage(err), 'error');
  } finally {
    btn.disabled = false; label.textContent = 'Save';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (!initAdminPage('Orders')) return;
  loadAdminOrders(1);
});
