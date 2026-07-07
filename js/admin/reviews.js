/* Admin reviews moderation */

let currentReviewFilter = '';

function adminReviewCard(r) {
  const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
  return `
  <div class="bg-white rounded-xl border border-black/5 p-6">
    <div class="flex items-center justify-between mb-2">
      <p class="text-brass text-sm">${stars}</p>
      <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${r.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">${r.isApproved ? 'Approved' : 'Pending'}</span>
    </div>
    <p class="text-sm leading-relaxed mb-3">${escapeHtml(r.comment)}</p>
    <p class="text-xs text-slate mb-4">${escapeHtml(r.user?.name || 'Unknown')} · ${escapeHtml(r.user?.email || '')}${r.property ? ` · re: ${escapeHtml(r.property.title)}` : ''}</p>
    <div class="flex gap-2">
      ${!r.isApproved ? `<button class="approve-review-btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-md" data-id="${r._id}">Approve</button>` : `<button class="unapprove-review-btn border border-black/10 text-xs font-semibold px-4 py-2 rounded-md hover:border-brass" data-id="${r._id}">Unapprove</button>`}
      <button class="delete-review-btn text-red-600 hover:text-red-800 text-xs font-semibold px-4 py-2 ml-auto" data-id="${r._id}">Delete</button>
    </div>
  </div>`;
}

async function loadAdminReviews() {
  const mount = document.getElementById('admin-reviews-list');
  mount.innerHTML = `<div class="h-40 skeleton rounded-xl"></div><div class="h-40 skeleton rounded-xl"></div>`;
  try {
    const query = currentReviewFilter ? `?status=${currentReviewFilter}` : '';
    const res = await Api.getAdminReviews(query);
    const list = res?.data?.reviews || [];
    if (!list.length) { mount.innerHTML = `<div class="col-span-full bg-white rounded-xl p-12 text-center text-slate">No reviews found.</div>`; return; }
    mount.innerHTML = list.map(adminReviewCard).join('');

    mount.querySelectorAll('.approve-review-btn').forEach((b) => b.addEventListener('click', () => moderate(b.dataset.id, true)));
    mount.querySelectorAll('.unapprove-review-btn').forEach((b) => b.addEventListener('click', () => moderate(b.dataset.id, false)));
    mount.querySelectorAll('.delete-review-btn').forEach((b) => b.addEventListener('click', async () => {
      if (!confirm('Delete this review?')) return;
      try { await Api.deleteReview(b.dataset.id); toast('Review deleted', 'success'); loadAdminReviews(); }
      catch (err) { toast(apiErrorMessage(err), 'error'); }
    }));
  } catch (err) {
    mount.innerHTML = `<div class="col-span-full bg-white rounded-xl p-8 text-slate text-sm">Couldn't load reviews: ${escapeHtml(apiErrorMessage(err))}</div>`;
  }
}

async function moderate(id, isApproved) {
  try { await Api.updateReview(id, { isApproved }); toast(isApproved ? 'Review approved' : 'Review unapproved', 'success'); loadAdminReviews(); }
  catch (err) { toast(apiErrorMessage(err), 'error'); }
}

document.querySelectorAll('#review-filter-tabs .tab-btn').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('#review-filter-tabs .tab-btn').forEach((t) => { t.classList.remove('bg-navy', 'text-white'); t.classList.add('bg-white', 'border', 'border-black/10'); });
    tab.classList.remove('bg-white', 'border', 'border-black/10'); tab.classList.add('bg-navy', 'text-white');
    currentReviewFilter = tab.dataset.status;
    loadAdminReviews();
  });
});

document.addEventListener('DOMContentLoaded', () => {
  if (!initAdminPage('Reviews')) return;
  loadAdminReviews();
});
