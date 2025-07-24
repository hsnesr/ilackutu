import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  const hostname = 'https://ilackutusu.com';

  // Blog yazılarını al (sadece taslak olmayanları)
  const { data: posts, error } = await supabase
    .from('posts')
    .select('slug, created_at')
    .eq('taslak', false);

  if (error) {
    console.error('Supabase Hatası:', error.message);
    return res.status(500).send('Supabase bağlantı hatası');
  }

  // Statik sayfalar + Ana sayfa
  const staticUrls = [
    {
      loc: `${hostname}`,
      changefreq: 'daily',
      priority: '1.0',
    },
    {
      loc: `${hostname}/gizlilik-politikasi.html`,
      changefreq: 'monthly',
      priority: '0.8',
    },
    {
      loc: `${hostname}/telif-hakki.html`,
      changefreq: 'monthly',
      priority: '0.8',
    },
    {
      loc: `${hostname}/iletisim.html`,
      changefreq: 'monthly',
      priority: '0.6',
    },
  ];

  // Blog postlarını sitemap formatına çevir
  const postUrls = posts.map(post => ({
    loc: `${hostname}/yazilar/${post.slug}`,
    lastmod: new Date(post.created_at).toISOString(),
    changefreq: 'weekly',
    priority: '0.7',
  }));

  const urls = [...staticUrls, ...postUrls];

  // XML formatını oluştur
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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

  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(xml);
}
