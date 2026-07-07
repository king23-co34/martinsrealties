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

const BLOG_POSTS = [
  {
    id: 1,
    title: 'Guide to Investing in Victoria Island Real Estate',
    excerpt: 'Discover why Victoria Island remains one of Africa\'s most sought-after investment destinations, with insights on emerging neighborhoods and investment strategies.',
    category: 'Investment Guide',
    date: 'July 2, 2026',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop',
    slug: 'victoria-island-investment-guide'
  },
  {
    id: 2,
    title: 'Property Management Best Practices in Lagos',
    excerpt: 'Learn the essentials of managing rental properties effectively in Lagos, from tenant vetting to maintenance protocols and financial planning.',
    category: 'Management',
    date: 'June 28, 2026',
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=800&auto=format&fit=crop',
    slug: 'property-management-lagos'
  },
  {
    id: 3,
    title: 'The Rise of Shortlet Investments in Lagos',
    excerpt: 'Explore how shortlet properties are reshaping the Lagos rental market, with strategies for maximizing occupancy and returns.',
    category: 'Market Trends',
    date: 'June 20, 2026',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop',
    slug: 'shortlet-investments-lagos'
  }
];

function blogPreview() {
  const mount = document.getElementById('blog-preview');
  if (!mount) return;
  mount.innerHTML = `
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
      ${BLOG_POSTS.map(post => `
        <article class="reveal group rounded-xl overflow-hidden bg-white border border-black/5 hover:border-brass/30 hover:shadow-lg transition-all">
          <div class="overflow-hidden bg-gray-100 h-48 sm:h-56">
            <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div class="p-6">
            <div class="flex items-center gap-2 mb-2.5">
              <span class="text-brass text-xs tracked-caps font-semibold">${post.category}</span>
              <span class="text-slate text-xs">•</span>
              <span class="text-slate text-xs">${post.date}</span>
            </div>
            <h3 class="font-display text-lg mb-3 leading-tight group-hover:text-brass transition-colors">${post.title}</h3>
            <p class="text-slate text-sm leading-relaxed mb-4">${post.excerpt}</p>
            <a href="#" class="inline-flex items-center gap-2 text-navy font-semibold text-sm hover:text-brass transition-colors">
              Read more
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </article>
      `).join('')}
    </div>`;
  initReveal();
}

const FAQS = [
  { q: 'How do I schedule a property viewing?', a: 'Reach out via the contact form or call us directly at +234 703 488 1125, referencing the property title, and our team will arrange a viewing at a convenient time that works for you.' },
  { q: 'Do you handle both sales and rentals?', a: 'Yes — our listings include properties for sale, rent, and shortlet, clearly labelled on each listing. We serve clients across Victoria Island, Lekki, Ikoyi, Ajah, Abuja, and Lagos Mainland.' },
  { q: 'How does checkout / reservation work?', a: 'Add a property to your cart, then proceed to checkout with your contact details. Our admin team reviews and confirms every order within 24 hours, ensuring you\'re working with verified agents.' },
  { q: 'Can I request consulting outside real estate?', a: 'Absolutely. We also advise on equipment outsourcing, oil & gas logistics, and natural mineral solutions. Contact us with your specific requirements and we\'ll provide tailored guidance.' },
  { q: 'What areas do you primarily serve?', a: 'We operate across Lagos and Abuja, with primary focus on Victoria Island, Lekki Phase 1, Ikoyi, Ajah, and Lagos Mainland. However, we can assist with inquiries beyond these areas.' },
  { q: 'Are there any hidden fees?', a: 'No. All pricing is transparent and clearly displayed on property listings. Our team can discuss any applicable fees or commissions upfront before you proceed.' },
  { q: 'How long does property approval take?', a: 'Most properties are vetted and approved within 48-72 hours of submission. Complex commercial properties may require additional time for thorough verification.' },
  { q: 'Do you offer property management services?', a: 'Yes, we provide comprehensive property management services including tenant vetting, maintenance coordination, and financial reporting for landlords.' },
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
  initReveal();
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

document.getElementById('hero-contact-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type=submit]');
  const label = btn.querySelector('.btn-label');
  const original = label.textContent;
  btn.disabled = true; label.innerHTML = '<span class="btn-spinner"></span>';
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    await Api.submitInquiry(payload);
    toast('Message sent — we will get back to you shortly.', 'success');
    form.reset();
  } catch (err) {
    toast(apiErrorMessage(err), 'error');
  } finally {
    btn.disabled = false; label.textContent = original;
  }
});

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
