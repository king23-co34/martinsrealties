/* Admin users management */

let adminUsersPage = 1;

function adminUserRow(u) {
  const me = Auth.getUser();
  const isSelf = me?._id === u._id;
  return `
  <tr class="border-b border-black/5 last:border-0">
    <td class="p-4">
      <p class="font-medium">${escapeHtml(u.name)}</p>
      <p class="text-xs text-slate">${escapeHtml(u.email)}</p>
    </td>
    <td class="p-4 text-sm">${escapeHtml(u.phone || '—')}</td>
    <td class="p-4">
      <select class="role-select rounded-md border border-black/10 px-2.5 py-1.5 text-xs focus:border-brass" data-id="${u._id}" ${isSelf ? 'disabled' : ''}>
        <option value="user" ${u.role === 'user' ? 'selected' : ''}>User</option>
        <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
      </select>
    </td>
    <td class="p-4">
      <button class="active-toggle-btn text-xs font-semibold px-3 py-1.5 rounded-full ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}" data-id="${u._id}" data-active="${u.isActive}" ${isSelf ? 'disabled' : ''}>
        ${u.isActive ? 'Active' : 'Inactive'}
      </button>
    </td>
    <td class="p-4 text-xs text-slate">${new Date(u.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
    <td class="p-4 text-right">
      <button class="delete-user-btn text-red-600 hover:text-red-800 text-sm font-semibold" data-id="${u._id}" ${isSelf ? 'disabled style="opacity:.3;cursor:not-allowed"' : ''}>Delete</button>
    </td>
  </tr>`;
}

async function loadAdminUsers(page = 1) {
  adminUsersPage = page;
  const mount = document.getElementById('admin-users-table');
  mount.innerHTML = `<div class="p-8"><div class="h-8 skeleton rounded mb-3"></div><div class="h-8 skeleton rounded"></div></div>`;
  try {
    const res = await Api.getUsers(`?page=${page}&limit=15&sort=-createdAt`);
    const list = res?.data?.users || [];
    const total = res?.total ?? list.length;
    if (!list.length) { mount.innerHTML = `<div class="p-12 text-center text-slate">No users found.</div>`; document.getElementById('admin-pagination').innerHTML = ''; return; }

    mount.innerHTML = `
      <table class="w-full text-left min-w-[700px]">
        <thead><tr class="bg-ivory text-xs text-slate tracked-caps"><th class="p-4 font-semibold">User</th><th class="p-4 font-semibold">Phone</th><th class="p-4 font-semibold">Role</th><th class="p-4 font-semibold">Status</th><th class="p-4 font-semibold">Joined</th><th class="p-4"></th></tr></thead>
        <tbody>${list.map(adminUserRow).join('')}</tbody>
      </table>`;

    mount.querySelectorAll('.role-select').forEach((sel) => sel.addEventListener('change', async () => {
      try { await Api.updateUser(sel.dataset.id, { role: sel.value }); toast('Role updated', 'success'); }
      catch (err) { toast(apiErrorMessage(err), 'error'); loadAdminUsers(adminUsersPage); }
    }));
    mount.querySelectorAll('.active-toggle-btn:not([disabled])').forEach((b) => b.addEventListener('click', async () => {
      const newActive = b.dataset.active !== 'true';
      try { await Api.updateUser(b.dataset.id, { isActive: newActive }); toast('Status updated', 'success'); loadAdminUsers(adminUsersPage); }
      catch (err) { toast(apiErrorMessage(err), 'error'); }
    }));
    mount.querySelectorAll('.delete-user-btn:not([disabled])').forEach((b) => b.addEventListener('click', async () => {
      if (!confirm('Delete this user account? This cannot be undone.')) return;
      try { await Api.deleteUser(b.dataset.id); toast('User deleted', 'success'); loadAdminUsers(adminUsersPage); }
      catch (err) { toast(apiErrorMessage(err), 'error'); }
    }));

    renderAdminPagination('admin-pagination', res?.pages || Math.ceil(total / 15) || 1, page, loadAdminUsers);
  } catch (err) {
    mount.innerHTML = `<div class="p-8 text-slate text-sm">Couldn't load users: ${escapeHtml(apiErrorMessage(err))}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!initAdminPage('Users')) return;
  loadAdminUsers(1);
});
