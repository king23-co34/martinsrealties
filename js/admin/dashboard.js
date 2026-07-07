/* Admin dashboard */

function statCard(label, value, icon) {
  return `
  <div class="bg-white rounded-2xl border border-black/5 p-6">
    <div class="flex items-center justify-between mb-3">
      <span class="text-slate text-xs tracked-caps font-semibold">${label}</span>
      <span class="text-xl">${icon}</span>
    </div>
    <p class="font-display text-3xl">${value}</p>
  </div>`;
}

async function loadStats() {
  const grid = document.getElementById('stats-grid');
  grid.innerHTML = Array.from({ length: 4 }).map(() => `<div class="h-28 skeleton rounded-2xl"></div>`).join('');
  try {
    const res = await Api.getStats();
    const d = res.data;
    grid.innerHTML = [
      statCard('Total Properties', d.properties.total, '🏠'),
      statCard('Available', d.properties.available, '✅'),
      statCard('Total Users', d.users.total, '👥'),
      statCard('Revenue (Paid)', money(d.orders.totalRevenue), '💰'),
      statCard('New Inquiries', d.inquiries.new, '📩'),
      statCard('Pending Reviews', d.reviews.pendingApproval, '⭐'),
      statCard('Pending Orders', d.orders.pending, '📦'),
      statCard('Total Orders', d.orders.total, '🧾'),
    ].join('');

    document.getElementById('recent-orders').innerHTML = d.recentOrders.length ? d.recentOrders.map((o) => `
      <div class="flex justify-between items-center border-b border-black/5 pb-3 text-sm">
        <div><p class="font-medium">${escapeHtml(o.user?.name || 'Guest')}</p><p class="text-slate text-xs">${new Date(o.createdAt).toLocaleDateString('en-NG')}</p></div>
        <div class="text-right"><p class="font-semibold text-navy">${money(o.totalAmount)}</p><p class="text-xs capitalize text-slate">${o.status}</p></div>
      </div>`).join('') : `<p class="text-slate text-sm">No orders yet.</p>`;

    document.getElementById('recent-inquiries').innerHTML = d.recentInquiries.length ? d.recentInquiries.map((i) => `
      <div class="border-b border-black/5 pb-3 text-sm">
        <div class="flex justify-between"><p class="font-medium">${escapeHtml(i.name)}</p><span class="text-xs capitalize text-slate">${i.status}</span></div>
        <p class="text-slate text-xs line-clamp-2">${escapeHtml(i.message)}</p>
      </div>`).join('') : `<p class="text-slate text-sm">No inquiries yet.</p>`;
  } catch (err) {
    grid.innerHTML = `<p class="col-span-full text-slate text-sm">Couldn't load stats: ${escapeHtml(apiErrorMessage(err))}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!initAdminPage('Dashboard')) return;
  loadStats();
});
