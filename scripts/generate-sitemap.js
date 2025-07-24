// scripts/generate-sitemap.js

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function generateSitemap() {
  const hostname = 'https://ilackutusu.com';

  const { data: posts, error } = await supabase
    .from('posts')
    .select('slug, created_at')
    .eq('taslak', false);

  if (error) {
    console.error('Supabase Error:', error.message);
    return;
  }

  const staticUrls = [
    { loc: `${hostname}`, changefreq: 'daily', priority: '1.0' },
    { loc: `${hostname}/gizlilik-politikasi.html`, changefreq: 'monthly', priority: '0.8' },
    { loc: `${hostname}/telif-hakki.html`, changefreq: 'monthly', priority: '0.8' },
    { loc: `${hostname}/iletisim.html`, changefreq: 'monthly', priority: '0.6' },
  ];

  const postUrls = posts.map(post => ({
    loc: `${hostname}/yazilar/${post.slug}`,
    lastmod: new Date(post.created_at).toISOString(),
    changefreq: 'weekly',
    priority: '0.7',
  }));

  const urls = [...staticUrls, ...postUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    url => `<url>
  <loc>${url.loc}</loc>
  ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
  <changefreq>${url.changefreq}</changefreq>
  <priority>${url.priority}</priority>
</url>`
  )
  .join('\n')}
</urlset>`;

  const filePath = path.join('public', 'sitemap.xml');
  fs.writeFileSync(filePath, xml);
  console.log(`✅ sitemap.xml oluşturuldu: ${filePath}`);
}

generateSitemap();
