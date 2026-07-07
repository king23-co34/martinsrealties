/* Admin properties management */

let adminPropsPage = 1;
let editingImages = [];
let editingPropertyId = null;

function adminPropRow(p) {
  const img = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=200&auto=format&fit=crop';
  return `
  <tr class="border-b border-black/5 last:border-0">
    <td class="p-4"><img src="${img}" class="w-14 h-11 object-cover rounded-md" alt="${escapeHtml(p.title)}" /></td>
    <td class="p-4">
      <p class="font-medium line-clamp-1 max-w-[220px]">${escapeHtml(p.title)}</p>
      <p class="text-xs text-slate">${escapeHtml(p.city)}, ${escapeHtml(p.state)}</p>
    </td>
    <td class="p-4 text-sm capitalize">${p.type}</td>
    <td class="p-4 text-sm">${money(p.price, p.currency)}</td>
    <td class="p-4"><span class="text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${{available:'bg-emerald-100 text-emerald-700',pending:'bg-amber-100 text-amber-700',sold:'bg-slate-200 text-slate-700',rented:'bg-slate-200 text-slate-700'}[p.status]}">${p.status}</span></td>
    <td class="p-4 text-sm">${p.featured ? '⭐' : '—'}</td>
    <td class="p-4 text-right whitespace-nowrap">
      <button class="edit-prop-btn text-navy hover:text-brass text-sm font-semibold mr-3" data-id="${p._id}">Edit</button>
      <button class="delete-prop-btn text-red-600 hover:text-red-800 text-sm font-semibold" data-id="${p._id}">Delete</button>
    </td>
  </tr>`;
}

async function loadAdminProperties(page = 1) {
  adminPropsPage = page;
  const mount = document.getElementById('admin-properties-table');
  mount.innerHTML = `<div class="p-8"><div class="h-8 skeleton rounded mb-3"></div><div class="h-8 skeleton rounded mb-3"></div><div class="h-8 skeleton rounded"></div></div>`;
  try {
    const res = await Api.getProperties(`?page=${page}&limit=10&sort=-createdAt`);
    const list = res?.data?.properties || [];
    const total = res?.total ?? list.length;
    if (!list.length) {
      mount.innerHTML = `<div class="p-12 text-center text-slate">No properties yet. Click "New Property" to add your first listing.</div>`;
      document.getElementById('admin-pagination').innerHTML = '';
      return;
    }
    mount.innerHTML = `
      <table class="w-full text-left min-w-[760px]">
        <thead><tr class="bg-ivory text-xs text-slate tracked-caps"><th class="p-4 font-semibold">Image</th><th class="p-4 font-semibold">Title</th><th class="p-4 font-semibold">Type</th><th class="p-4 font-semibold">Price</th><th class="p-4 font-semibold">Status</th><th class="p-4 font-semibold">Featured</th><th class="p-4"></th></tr></thead>
        <tbody>${list.map(adminPropRow).join('')}</tbody>
      </table>`;
    bindPropertyRowActions(list);

    const pages = res?.pages || Math.ceil(total / 10) || 1;
    renderAdminPagination('admin-pagination', pages, page, loadAdminProperties);
  } catch (err) {
    mount.innerHTML = `<div class="p-8 text-slate text-sm">Couldn't load properties: ${escapeHtml(apiErrorMessage(err))}</div>`;
  }
}

function bindPropertyRowActions(list) {
  document.querySelectorAll('.edit-prop-btn').forEach((b) => {
    b.addEventListener('click', () => openPropertyModal(list.find((p) => p._id === b.dataset.id)));
  });
  document.querySelectorAll('.delete-prop-btn').forEach((b) => {
    b.addEventListener('click', async () => {
      if (!confirm('Delete this property? This cannot be undone.')) return;
      try {
        await Api.deleteProperty(b.dataset.id);
        toast('Property deleted', 'success');
        loadAdminProperties(adminPropsPage);
      } catch (err) { toast(apiErrorMessage(err), 'error'); }
    });
  });
}

function openPropertyModal(property = null) {
  const modal = document.getElementById('property-modal');
  const form = document.getElementById('property-form');
  form.reset();
  document.getElementById('existing-images').innerHTML = '';
  editingImages = property?.images || [];
  editingPropertyId = property?._id || null;
  document.getElementById('modal-title').textContent = property ? 'Edit Property' : 'New Property';

  if (property) {
    form.elements.title.value = property.title;
    form.elements.description.value = property.description;
    form.elements.type.value = property.type;
    form.elements.listingType.value = property.listingType;
    form.elements.price.value = property.price;
    form.elements.status.value = property.status;
    form.elements.bedrooms.value = property.bedrooms || 0;
    form.elements.bathrooms.value = property.bathrooms || 0;
    form.elements.areaSqft.value = property.areaSqft || '';
    form.elements.address.value = property.address;
    form.elements.city.value = property.city;
    form.elements.state.value = property.state;
    form.elements.amenities.value = (property.amenities || []).join(', ');
    form.elements.featured.checked = !!property.featured;
    renderExistingImages();
  }
  modal.classList.remove('hidden');
}

function renderExistingImages() {
  const mount = document.getElementById('existing-images');
  if (!editingImages.length) { mount.innerHTML = ''; return; }
  mount.innerHTML = editingImages.map((img) => `
    <div class="relative">
      <img src="${img.url}" class="w-16 h-14 object-cover rounded-md" alt="Property image" />
      <button type="button" class="remove-img-btn absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 text-xs leading-none" data-public-id="${img.publicId}">&times;</button>
    </div>`).join('');
  mount.querySelectorAll('.remove-img-btn').forEach((b) => {
    b.addEventListener('click', async () => {
      if (!editingPropertyId) return;
      try {
        await Api.deletePropertyImage(editingPropertyId, b.dataset.publicId);
        editingImages = editingImages.filter((i) => i.publicId !== b.dataset.publicId);
        renderExistingImages();
        toast('Image removed', 'success');
      } catch (err) { toast(apiErrorMessage(err), 'error'); }
    });
  });
}

document.getElementById('new-property-btn')?.addEventListener('click', () => openPropertyModal(null));
document.getElementById('close-modal-btn')?.addEventListener('click', () => document.getElementById('property-modal').classList.add('hidden'));
document.getElementById('property-modal')?.addEventListener('click', (e) => { if (e.target.id === 'property-modal') e.currentTarget.classList.add('hidden'); });

document.getElementById('property-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type=submit]');
  const label = btn.querySelector('.btn-label');
  btn.disabled = true; label.innerHTML = '<span class="btn-spinner"></span>';

  const fd = new FormData();
  ['title', 'description', 'type', 'listingType', 'price', 'status', 'bedrooms', 'bathrooms', 'areaSqft', 'address', 'city', 'state', 'amenities'].forEach((f) => {
    if (form.elements[f].value !== '') fd.append(f, form.elements[f].value);
  });
  fd.append('featured', form.elements.featured.checked);
  const files = form.elements.images.files;
  for (let i = 0; i < files.length; i++) fd.append('images', files[i]);

  try {
    if (editingPropertyId) {
      await Api.updateProperty(editingPropertyId, fd);
      toast('Property updated', 'success');
    } else {
      await Api.createProperty(fd);
      toast('Property created', 'success');
    }
    document.getElementById('property-modal').classList.add('hidden');
    loadAdminProperties(adminPropsPage);
  } catch (err) {
    toast(apiErrorMessage(err), 'error');
  } finally {
    btn.disabled = false; label.textContent = 'Save Property';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (!initAdminPage('Properties')) return;
  loadAdminProperties(1);
});
