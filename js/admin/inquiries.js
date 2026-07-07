/* Admin inquiries */

let adminInquiriesPage = 1;

function inquiryStatusColor(status) {
  return { new: 'bg-sky-500', in_progress: 'bg-amber-500', resolved: 'bg-emerald-600', closed: 'bg-slate-500' }[status] || 'bg-slate-500';
}

function adminInquiryCard(i) {
  return `
  <div class="bg-white rounded-xl border border-black/5 p-6">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
      <div>
        <p class="font-medium">${escapeHtml(i.name)} <span class="text-slate text-xs font-normal">${escapeHtml(i.email)}</span></p>
        <p class="text-xs text-slate">${escapeHtml(i.phone || '')} · ${new Date(i.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      </div>
      <span class="${inquiryStatusColor(i.status)} text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">${i.status.replace('_', ' ')}</span>
    </div>
    <p class="text-sm font-semibold mb-1">${escapeHtml(i.subject || 'General Inquiry')}</p>
    <p class="text-slate text-sm mb-4">${escapeHtml(i.message)}</p>
    ${i.property ? `<p class="text-xs text-slate mb-3">Regarding: <a href="../property-details.html?id=${i.property._id}" class="text-brass font-semibold" target="_blank">${escapeHtml(i.property.title)}</a></p>` : ''}
    <div class="flex flex-wrap items-center gap-3 border-t border-black/10 pt-4">
      <select class="status-select rounded-md border border-black/10 px-3 py-1.5 text-xs focus:border-brass" data-id="${i._id}">
        <option value="new" ${i.status === 'new' ? 'selected' : ''}>New</option>
        <option value="in_progress" ${i.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
        <option value="resolved" ${i.status === 'resolved' ? 'selected' : ''}>Resolved</option>
        <option value="closed" ${i.status === 'closed' ? 'selected' : ''}>Closed</option>
      </select>
      <button class="delete-inquiry-btn text-red-600 hover:text-red-800 text-xs font-semibold ml-auto" data-id="${i._id}">Delete</button>
    </div>
  </div>`;
}

async function loadAdminInquiries(page = 1) {
  adminInquiriesPage = page;
  const mount = document.getElementById('admin-inquiries-list');
  mount.innerHTML = `<div class="h-32 skeleton rounded-xl"></div><div class="h-32 skeleton rounded-xl"></div>`;
  try {
    const res = await Api.getInquiries(`?page=${page}&limit=10&sort=-createdAt`);
    const list = res?.data?.inquiries || [];
    const total = res?.total ?? list.length;
    if (!list.length) { mount.innerHTML = `<div class="bg-white rounded-xl p-12 text-center text-slate">No inquiries yet.</div>`; document.getElementById('admin-pagination').innerHTML = ''; return; }
    mount.innerHTML = list.map(adminInquiryCard).join('');

    mount.querySelectorAll('.status-select').forEach((sel) => {
      sel.addEventListener('change', async () => {
        try {
          await Api.updateInquiry(sel.dataset.id, { status: sel.value });
          toast('Status updated', 'success');
        } catch (err) { toast(apiErrorMessage(err), 'error'); }
      });
    });
    mount.querySelectorAll('.delete-inquiry-btn').forEach((b) => {
      b.addEventListener('click', async () => {
        if (!confirm('Delete this inquiry?')) return;
        try { await Api.deleteInquiry(b.dataset.id); toast('Inquiry deleted', 'success'); loadAdminInquiries(adminInquiriesPage); }
        catch (err) { toast(apiErrorMessage(err), 'error'); }
      });
    });

    renderAdminPagination('admin-pagination', res?.pages || Math.ceil(total / 10) || 1, page, loadAdminInquiries);
  } catch (err) {
    mount.innerHTML = `<div class="bg-white rounded-xl p-8 text-slate text-sm">Couldn't load inquiries: ${escapeHtml(apiErrorMessage(err))}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!initAdminPage('Inquiries')) return;
  loadAdminInquiries(1);
});
