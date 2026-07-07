# Getting Martins Realties on Google Search Console

This site now ships with the two files Google looks for automatically:

- **`robots.txt`** — tells search engines which pages to crawl (blocks `/admin/`, cart, checkout, login, register, profile — none of those should show up in Google).
- **`sitemap.xml`** — lists your real public pages: home, about, properties, blog, contact.

✅ `robots.txt`, `sitemap.xml`, and the canonical tags are already set to your live domain: `https://www.martinsrealties.com.ng`. If you ever change domains, update those in the same three places.

## Step 1 — Deploy the site first
Search Console needs a live URL to verify. Deploy this folder (Vercel, Netlify, cPanel, etc.) before doing the steps below.

## Step 2 — Add your property in Search Console
1. Go to https://search.google.com/search-console
2. Click **Add Property**.
3. Choose **URL prefix** (not "Domain") and enter your exact live URL, e.g. `https://www.martinsrealties.com.ng/`.

## Step 3 — Verify ownership (HTML tag method — easiest for a static site)
1. Google will show you a meta tag that looks like:
   ```html
   <meta name="google-site-verification" content="abc123XYZ..." />
   ```
2. Copy just the `content="..."` value.
3. Open `index.html` in this project, find this block near the top:
   ```html
   <!-- <meta name="google-site-verification" content="PASTE_YOUR_CODE_HERE" /> -->
   ```
4. Uncomment it and paste your real code in, then redeploy the site.
5. Back in Search Console, click **Verify**.

*(Alternative: Google also offers an "HTML file" method — it gives you a file like `google1234abcd.html` to upload to the root of your site. If you'd rather use that method, just drop the file Google gives you into this folder's root and redeploy — no code changes needed.)*

## Step 4 — Submit your sitemap
1. In Search Console, open **Sitemaps** in the left sidebar.
2. Enter `sitemap.xml` and click **Submit**.
3. Google will begin crawling your site over the next few days.

## Step 5 — Keep the sitemap current
Whenever you add a new page (or a blog post) that you want indexed, add a new `<url>` entry to `sitemap.xml` with its full URL.

## Notes
- Property detail pages (`property-details.html?id=...`) aren't in the sitemap since they're dynamic and generated from your database — Google can still discover them by following links from `properties.html`, but if you want them individually indexed later, that would need a dynamically-generated sitemap from your backend rather than a static file.
- Login, register, cart, checkout, profile, and all `/admin/` pages are intentionally excluded from indexing since they're account-specific, not content for search.
