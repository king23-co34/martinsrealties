/* Homepage logic */

const SERVICES = [
  { icon: 'M3 21h18M5 21V7l8-4 8 4v14M9 9h1m-1 4h1m4-4h1m-1 4h1m-5 8v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4', title: 'Real Estate', desc: 'Sale, rent and shortlet properties across Nigeria, vetted and ready to view.' },
  { icon: 'M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m5-4.13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 0a4 4 0 1 0 0-8m-13 8a4 4 0 1 1 0-8', title: 'Property Consulting', desc: 'Guidance on acquisitions, valuation and investment-grade property decisions.' },
  { icon: 'M3 17h1.5V9.5L9 6h4.5v3H18l3 4v4h-2m-13 0H4v-4M9 17h6m-6 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm6 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z', title: 'Equipment Outsourcing', desc: 'Reliable sourcing and outsourcing of industrial and construction equipment.' },
  { icon: 'M12 2c2 2.5 4 5.5 4 8.5A4 4 0 0 1 8 10.5C8 7.5 10 4.5 12 2Zm0 20a6 6 0 0 0 6-6c0-1.5-.6-2.7-1.4-3.8A6 6 0 0 1 12 16a6 6 0 0 1-4.6-3.8C6.6 13.3 6 14.5 6 16a6 6 0 0 0 6 6Z', title: 'Oil & Gas', desc: 'Business solutions and logistics support within the oil and gas sector.' },
  { icon: 'M12 2 3 7l9 5 9-5-9-5Zm-9 10 9 5 9-5M3 17l9 5 9-5', title: 'Natural Minerals', desc: 'Sourcing and trade facilitation for natural mineral resources.' },
];

function servicesGrid() {
  const grid = document.getElementById('services-grid');
  if (!grid) return;
  grid.innerHTML = SERVICES.map((s) => `
    <div class="reveal group bg-white border border-black/5 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 hover:border-brass/30 transition-all">
      <span class="w-12 h-12 rounded-lg bg-navy/5 group-hover:bg-brass/10 flex items-center justify-center transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-navy group-hover:text-brass transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="${s.icon}"/></svg>
      </span>
      <h3 class="font-display text-lg mt-4 mb-2">${s.title}</h3>
      <p class="text-slate text-sm leading-relaxed">${s.desc}</p>
    </div>`).join('');
  initReveal();
}

async function loadFeatured() {
  const mount = document.getElementById('featured-properties');
  if (!mount) return;
  mount.innerHTML = skeletonCards(3);
  try {
    const res = await Api.getFeatured();
    const list = res?.data?.properties || res?.data || [];
    if (!list.length) {
      mount.innerHTML = `<div class="col-span-full text-center py-14 text-slate">No featured properties yet — check back soon, or <a href="properties.html" class="text-brass font-semibold">browse all listings</a>.</div>`;
      return;
    }
    mount.innerHTML = list.slice(0, 6).map(propertyCard).join('');
    initReveal();
  } catch (err) {
    mount.innerHTML = `<div class="col-span-full text-center py-14 text-slate">Couldn't load featured properties right now. <a href="properties.html" class="text-brass font-semibold">Browse all properties →</a></div>`;
  }
}

function reviewCard(r) {
  const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
  return `
  <div class="reveal bg-white border border-black/5 rounded-xl p-6">
    <p class="text-brass text-sm mb-2">${stars}</p>
    <p class="text-charcoal text-sm leading-relaxed mb-3">${escapeHtml(r.comment)}</p>
    <p class="text-xs text-slate font-semibold">${escapeHtml(r.user?.name || 'Verified client')}</p>
  </div>`;
}

async function loadReviews() {
  const mount = document.getElementById('reviews-list');
  if (!mount) return;
  mount.innerHTML = `<div class="h-24 skeleton rounded-xl"></div><div class="h-24 skeleton rounded-xl"></div>`;
  try {
    const res = await Api.getReviews();
    const list = res?.data?.reviews || res?.data || [];
    if (!list.length) {
      mount.innerHTML = `<p class="text-slate text-sm">No reviews yet — be the first to share your experience.</p>`;
      return;
    }
    mount.innerHTML = list.slice(0, 4).map(reviewCard).join('');
    initReveal();
  } catch {
    mount.innerHTML = `<p class="text-slate text-sm">Reviews are temporarily unavailable.</p>`;
  }
}

function blogPreview() {
  const mount = document.getElementById('blog-preview');
  if (!mount) return;
  mount.innerHTML = `
    <div class="border border-dashed border-black/15 rounded-xl p-10 text-center reveal">
      <p class="font-display text-xl mb-2">Blog articles are coming soon</p>
      <p class="text-slate text-sm max-w-md mx-auto">We're preparing market insights and property guides. This section will populate automatically once articles are published.</p>
    </div>`;
}

const FAQS = [
  { q: 'How do I schedule a property viewing?', a: 'Reach out via the contact form or call us directly, referencing the property title, and our team will arrange a viewing at a convenient time.' },
  { q: 'Do you handle both sales and rentals?', a: 'Yes — our listings include properties for sale, rent, and shortlet, clearly labelled on each listing.' },
  { q: 'How does checkout / reservation work?', a: 'Add a property to your cart, then proceed to checkout with your contact details. Our admin team reviews and confirms every order.' },
  { q: 'Can I request consulting outside real estate?', a: 'Yes — we also advise on equipment outsourcing, oil & gas, and natural mineral solutions. Contact us with your requirements.' },
];

function faqList() {
  const mount = document.getElementById('faq-list');
  if (!mount) return;
  mount.innerHTML = FAQS.map((f, i) => `
    <div class="reveal py-5">
      <button class="faq-toggle w-full flex items-center justify-between text-left" data-idx="${i}">
        <span class="font-display text-base sm:text-lg pr-4">${f.q}</span>
        <span class="faq-icon text-brass text-xl leading-none transition-transform">+</span>
      </button>
      <div class="faq-answer hidden mt-3 text-slate text-sm leading-relaxed">${f.a}</div>
    </div>`).join('');
  mount.querySelectorAll('.faq-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const answer = btn.parentElement.querySelector('.faq-answer');
      const icon = btn.querySelector('.faq-icon');
      const open = !answer.classList.contains('hidden');
      answer.classList.toggle('hidden');
      icon.textContent = open ? '+' : '−';
    });
  });
}

document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type=submit]');
  const original = btn.textContent;
  btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span>';
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    await Api.submitInquiry(payload);
    toast('Message sent — we will get back to you shortly.', 'success');
    form.reset();
  } catch (err) {
    toast(apiErrorMessage(err), 'error');
  } finally {
    btn.disabled = false; btn.textContent = original;
  }
});

document.getElementById('review-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  if (!Auth.isLoggedIn()) {
    toast('Please log in to leave a review', 'info');
    setTimeout(() => (location.href = 'login.html'), 700);
    return;
  }
  const btn = form.querySelector('button[type=submit]');
  const label = btn.querySelector('.btn-label');
  btn.disabled = true; const orig = label.textContent; label.textContent = 'Submitting...';
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.rating = Number(payload.rating);
  try {
    await Api.submitReview(payload);
    toast('Thank you! Your review is pending approval.', 'success');
    form.reset();
  } catch (err) {
    toast(apiErrorMessage(err), 'error');
  } finally {
    btn.disabled = false; label.textContent = orig;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  servicesGrid();
  loadFeatured();
  loadReviews();
  blogPreview();
  faqList();
});
