/* Martins Realties — shared UI: navbar, footer, toasts, loader, guards */

const BIZ = {
  name: 'Martins Realties',
  legalName: "D'S Martins Nig Enterprise",
  phone: '+234 703 488 1125',
  phoneHref: '+2347034881125',
  emails: ['martinsds845@gmail.com', 'priscamartins15@gmail.com'],
  address: 'No. 4, Babatope Bejide Crescent, Off Fola Osibo, Lekki Phase 1, Lagos, Nigeria.',
  facebook: 'https://facebook.com/martins.realties',
  instagram: 'https://instagram.com/martins_realties',
  instagramHandle: '@martins_realties',
};

function money(n, currency = 'NGN') {
  const value = Number(n) || 0;
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `₦${value.toLocaleString()}`;
  }
}

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function toast(message, type = 'info') {
  let root = document.getElementById('toast-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'toast-root';
    document.body.appendChild(root);
  }
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s ease';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, 3400);
}

function apiErrorMessage(err) {
  if (err?.payload?.errors?.length) return err.payload.errors.map((e) => e.msg || e.message).join(' · ');
  return err?.message || 'Something went wrong. Please try again.';
}

/* ---------------- Loader ---------------- */
function injectLoader() {
  if (document.getElementById('brand-loader')) return;
  const div = document.createElement('div');
  div.id = 'brand-loader';
  div.innerHTML = `
    <div class="loader-inner">
      <img src="${assetPath('assets/logo.png')}" alt="Martins Realties" class="loader-logo" />
      <div class="loader-bar"></div>
      <span class="loader-word tracked-caps">MARTINS REALTIES</span>
    </div>`;
  document.body.prepend(div);
}
function hideLoader() {
  const l = document.getElementById('brand-loader');
  if (l) l.classList.add('loader-hidden');
}
function assetPath(p) {
  // works whether the page lives at root or /admin/
  return location.pathname.includes('/admin/') ? `../${p}` : p;
}
function pagePath(p) {
  return location.pathname.includes('/admin/') && !p.startsWith('http') && !p.startsWith('../') && !p.startsWith('admin/')
    ? `../${p}` : p;
}

/* ---------------- Navbar / Footer ---------------- */
function navLinks() {
  const inAdmin = location.pathname.includes('/admin/');
  const base = inAdmin ? '../' : '';
  return [
    { href: `${base}index.html`, label: 'Home' },
    { href: `${base}about.html`, label: 'About' },
    { href: `${base}properties.html`, label: 'Properties' },
    { href: `${base}blog.html`, label: 'Blog' },
    { href: `${base}contact.html`, label: 'Contact' },
  ];
}

function renderNavbar(active = '') {
  const mount = document.getElementById('site-header');
  if (!mount) return;
  const inAdmin = location.pathname.includes('/admin/');
  const base = inAdmin ? '../' : '';
  const user = Auth.getUser();
  const links = navLinks().map((l) =>
    `<a href="${l.href}" class="text-sm tracking-wide hover:text-[var(--brass)] transition-colors ${active === l.label ? 'text-[var(--brass)] font-semibold' : 'text-white/85'}">${l.label}</a>`
  ).join('');

  const authArea = Auth.isLoggedIn() ? `
    <a href="${base}cart.html" class="relative text-white/85 hover:text-[var(--brass)]" aria-label="Cart">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
      <span id="cart-count" class="hidden absolute -top-2 -right-2 bg-[var(--brass)] text-[10px] text-navy-900 font-bold rounded-full w-4 h-4 items-center justify-center"></span>
    </a>
    <div class="relative group">
      <button class="flex items-center gap-2 text-sm text-white/90">
        <span class="w-8 h-8 rounded-full bg-[var(--brass)]/20 border border-[var(--brass)]/50 flex items-center justify-center text-[var(--brass-light)] font-semibold">${(user?.name || 'U').charAt(0).toUpperCase()}</span>
      </button>
      <div class="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-xl border border-black/5 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <a href="${base}profile.html" class="block px-4 py-2 text-sm text-[var(--charcoal)] hover:bg-[var(--ivory)]">My Profile</a>
        ${user?.role === 'admin' ? `<a href="${base}admin/dashboard.html" class="block px-4 py-2 text-sm text-[var(--charcoal)] hover:bg-[var(--ivory)]">Admin Dashboard</a>` : ''}
        <button onclick="doLogout()" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Log out</button>
      </div>
    </div>
  ` : `
    <a href="${base}login.html" class="text-sm text-white/85 hover:text-[var(--brass)]">Log in</a>
    <a href="${base}register.html" class="text-sm font-semibold bg-[var(--brass)] text-white px-4 py-2 rounded-md hover:bg-[var(--brass-light)] transition-colors">Get Started</a>
  `;

  mount.innerHTML = `
  <header class="sticky top-0 z-40 bg-[var(--navy-dark)]/95 backdrop-blur border-b border-white/10">
    <div class="max-w-7xl mx-auto px-5 flex items-center justify-between h-16">
      <a href="${base}index.html" class="flex items-center gap-2.5">
        <img src="${base}assets/logo.png" alt="Martins Realties logo" class="h-9 w-9 object-contain" />
        <span class="font-display text-white text-base tracking-wide leading-tight">Martins <span class="text-[var(--brass-light)]">Realties</span></span>
      </a>
      <nav class="hidden lg:flex items-center gap-7">${links}</nav>
      <div class="hidden lg:flex items-center gap-5">${authArea}</div>
      <button id="mobile-toggle" class="lg:hidden text-white p-2" aria-label="Menu">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
    </div>
    <div id="mobile-menu" class="hidden lg:hidden bg-[var(--navy-dark)] border-t border-white/10 px-5 py-4 space-y-3">
      ${navLinks().map((l) => `<a href="${l.href}" class="block text-white/85 text-sm py-1">${l.label}</a>`).join('')}
      <div class="pt-3 border-t border-white/10 flex flex-col gap-3">
        ${Auth.isLoggedIn() ? `
          <a href="${base}profile.html" class="text-white/85 text-sm">My Profile</a>
          <a href="${base}cart.html" class="text-white/85 text-sm">Cart</a>
          ${user?.role === 'admin' ? `<a href="${base}admin/dashboard.html" class="text-white/85 text-sm">Admin Dashboard</a>` : ''}
          <button onclick="doLogout()" class="text-left text-red-400 text-sm">Log out</button>
        ` : `
          <a href="${base}login.html" class="text-white/85 text-sm">Log in</a>
          <a href="${base}register.html" class="text-[var(--brass-light)] text-sm font-semibold">Get Started</a>
        `}
      </div>
    </div>
  </header>`;

  document.getElementById('mobile-toggle')?.addEventListener('click', () => {
    document.getElementById('mobile-menu')?.classList.toggle('hidden');
  });

  refreshCartBadge();
}

function renderFooter() {
  const mount = document.getElementById('site-footer');
  if (!mount) return;
  const inAdmin = location.pathname.includes('/admin/');
  const base = inAdmin ? '../' : '';
  mount.innerHTML = `
  <footer class="bg-[var(--navy-dark)] text-white/70 mt-24">
    <div class="max-w-7xl mx-auto px-5 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
      <div>
        <a href="${base}index.html" class="flex items-center gap-2.5 mb-4">
          <img src="${base}assets/logo.png" class="h-9 w-9 object-contain" alt="Martins Realties" />
          <span class="font-display text-white text-base">Martins Realties</span>
        </a>
        <p class="text-sm leading-relaxed">${BIZ.legalName} — professional real estate, property consulting, equipment outsourcing, oil &amp; gas, and natural mineral solutions across Nigeria.</p>
        <div class="flex gap-4 mt-5">
          <a href="${BIZ.facebook}" target="_blank" rel="noopener" aria-label="Facebook" class="hover:text-[var(--brass-light)]">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z"/></svg>
          </a>
          <a href="${BIZ.instagram}" target="_blank" rel="noopener" aria-label="Instagram" class="hover:text-[var(--brass-light)]">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>
          </a>
        </div>
      </div>
      <div>
        <h4 class="text-white font-display text-sm tracking-wide mb-4">Explore</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="${base}properties.html" class="hover:text-[var(--brass-light)]">Properties</a></li>
          <li><a href="${base}about.html" class="hover:text-[var(--brass-light)]">About Us</a></li>
          <li><a href="${base}blog.html" class="hover:text-[var(--brass-light)]">Blog</a></li>
          <li><a href="${base}contact.html" class="hover:text-[var(--brass-light)]">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-white font-display text-sm tracking-wide mb-4">Services</h4>
        <ul class="space-y-2 text-sm">
          <li>Real Estate</li><li>Property Consulting</li><li>Equipment Outsourcing</li><li>Oil &amp; Gas</li><li>Natural Minerals</li>
        </ul>
      </div>
      <div>
        <h4 class="text-white font-display text-sm tracking-wide mb-4">Contact</h4>
        <ul class="space-y-3 text-sm">
          <li>${BIZ.address}</li>
          <li><a href="tel:${BIZ.phoneHref}" class="hover:text-[var(--brass-light)]">${BIZ.phone}</a></li>
          <li><a href="mailto:${BIZ.emails[0]}" class="hover:text-[var(--brass-light)]">${BIZ.emails[0]}</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-white/10 py-5 text-center text-xs text-white/50">
      &copy; ${new Date().getFullYear()} ${BIZ.legalName}. All rights reserved.
    </div>
  </footer>`;
}

async function doLogout() {
  try { await Api.logout(); } catch { /* ignore */ }
  Auth.logoutLocal();
  toast('Logged out successfully', 'success');
  setTimeout(() => (location.href = location.pathname.includes('/admin/') ? '../index.html' : 'index.html'), 500);
}

async function refreshCartBadge() {
  const badge = document.getElementById('cart-count');
  if (!badge || !Auth.isLoggedIn()) return;
  try {
    const res = await Api.getCart();
    const count = res?.data?.cart?.items?.length || res?.data?.items?.length || 0;
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove('hidden');
      badge.classList.add('flex');
    }
  } catch { /* silent */ }
}

/* ---------------- Admin sidebar layout ---------------- */
function renderAdminSidebar(active = '') {
  const mount = document.getElementById('admin-sidebar');
  if (!mount) return;
  const links = [
    { href: 'dashboard.html', label: 'Dashboard', icon: 'M3 12l2-2m0 0 7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11 2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6' },
    { href: 'properties.html', label: 'Properties', icon: 'M3 21h18M5 21V7l8-4 8 4v14M9 9h1m-1 4h1m4-4h1m-1 4h1m-5 8v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4' },
    { href: 'orders.html', label: 'Orders', icon: 'M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 11H4L5 9Z' },
    { href: 'inquiries.html', label: 'Inquiries', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z' },
    { href: 'reviews.html', label: 'Reviews', icon: 'M12 17.3 6.2 20l1.1-6.5L2.5 9l6.6-1L12 2l2.9 6 6.6 1-4.8 4.5 1.1 6.5z' },
    { href: 'users.html', label: 'Users', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2m8-9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6 9v-2a4 4 0 0 0-3-3.87m-3-8.13a4 4 0 0 1 0 7.75' },
  ];
  mount.innerHTML = `
    <div class="p-6 border-b border-white/10">
      <a href="../index.html" class="flex items-center gap-2.5">
        <img src="../assets/logo.png" class="h-8 w-8 object-contain" alt="Martins Realties" />
        <span class="font-display text-white text-sm">Admin Panel</span>
      </a>
    </div>
    <nav class="p-4 space-y-1">
      ${links.map((l) => `
        <a href="${l.href}" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active === l.label ? 'bg-brass/20 text-brass-light font-semibold' : 'text-white/70 hover:bg-white/5 hover:text-white'}">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="${l.icon}"/></svg>
          ${l.label}
        </a>`).join('')}
      <a href="../profile.html" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
        My Profile
      </a>
      <a href="../index.html" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12 12 4l9 8M5 10v10h14V10"/></svg>
        Back to Site
      </a>
      <button onclick="doLogout()" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9"/></svg>
        Log out
      </button>
    </nav>`;
}

function initAdminPage(active) {
  if (!requireAdmin()) return false;
  renderAdminSidebar(active);
  document.getElementById('mobile-admin-toggle')?.addEventListener('click', () => {
    document.getElementById('admin-sidebar')?.classList.toggle('hidden');
  });
  return true;
}

function renderAdminPagination(mountId, totalPages, page, loader) {
  const mount = document.getElementById(mountId);
  if (!mount || totalPages <= 1) { if (mount) mount.innerHTML = ''; return; }
  let html = '';
  const btn = (p, label = p, disabled = false, active = false) => `
    <button ${disabled ? 'disabled' : ''} data-page="${p}" class="pg-btn w-9 h-9 rounded-md text-sm font-medium ${active ? 'bg-navy text-white' : 'bg-white border border-black/10 hover:border-brass'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}">${label}</button>`;
  html += btn(page - 1, '←', page <= 1);
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) html += btn(i, i, false, i === page);
    else if (i === 2 || i === totalPages - 1) html += `<span class="text-slate">…</span>`;
  }
  html += btn(page + 1, '→', page >= totalPages);
  mount.innerHTML = html;
  mount.querySelectorAll('.pg-btn:not([disabled])').forEach((b) => b.addEventListener('click', () => loader(Number(b.dataset.page))));
}

/* ---------------- Route guards ---------------- */
function requireAuth() {
  if (!Auth.isLoggedIn()) {
    toast('Please log in to continue', 'info');
    setTimeout(() => (location.href = pagePath('login.html')), 600);
    return false;
  }
  return true;
}
function requireAdmin() {
  if (!Auth.isLoggedIn() || !Auth.isAdmin()) {
    toast('Admin access required', 'error');
    setTimeout(() => (location.href = pagePath('index.html')), 700);
    return false;
  }
  return true;
}
function redirectIfLoggedIn() {
  if (Auth.isLoggedIn()) location.href = pagePath('profile.html');
}

/* ---------------- Shared property card + skeleton ---------------- */
function propertyCard(p) {
  const img = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=800&auto=format&fit=crop';
  const statusColor = { available: 'bg-emerald-600', pending: 'bg-amber-500', sold: 'bg-slate-500', rented: 'bg-slate-500' }[p.status] || 'bg-slate-500';
  const base = location.pathname.includes('/admin/') ? '../' : '';
  return `
  <a href="${base}property-details.html?id=${p._id}" class="group reveal bg-white rounded-xl overflow-hidden border border-black/5 hover:shadow-xl transition-shadow block">
    <div class="relative h-52 overflow-hidden">
      <img src="${img}" alt="${escapeHtml(p.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      <span class="absolute top-3 left-3 ${statusColor} text-white text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize">${p.status}</span>
      <span class="absolute top-3 right-3 bg-navy-dark/80 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize">${p.listingType}</span>
    </div>
    <div class="p-5">
      <p class="font-display text-lg mb-1 line-clamp-2">${escapeHtml(p.title)}</p>
      <p class="text-slate text-sm mb-3">${escapeHtml(p.city)}, ${escapeHtml(p.state)}</p>
      <div class="flex items-center gap-4 text-xs text-slate mb-4">
        <span>🛏 ${p.bedrooms || 0}</span><span>🛁 ${p.bathrooms || 0}</span>${p.areaSqft ? `<span>${p.areaSqft} sqft</span>` : ''}
      </div>
      <p class="text-navy font-display text-xl">${money(p.price, p.currency)}</p>
    </div>
  </a>`;
}

function skeletonCards(n = 3) {
  return Array.from({ length: n }).map(() => `
    <div class="bg-white rounded-xl overflow-hidden border border-black/5">
      <div class="h-52 skeleton"></div>
      <div class="p-5 space-y-3">
        <div class="h-4 w-3/4 skeleton rounded"></div>
        <div class="h-3 w-1/2 skeleton rounded"></div>
        <div class="h-5 w-1/3 skeleton rounded"></div>
      </div>
    </div>`).join('');
}

/* ---------------- Reveal on scroll ---------------- */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach((e) => e.classList.add('in-view'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach((e) => io.observe(e));
}

/* ---------------- Boot ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  injectLoader();
  renderNavbar(document.body.dataset.page || '');
  renderFooter();
  initReveal();
});
window.addEventListener('load', () => {
  setTimeout(hideLoader, 350);
});
