import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const SITE_URL = "https://ilackutusu.com";

export default async function handler(req, res) {
  try {
    // Statik sayfalar
    const staticPages = [
      "",
      "iletisim.html",
      "gizlilik-politikasi.html",
      "hakkimizda.html"
    ];

    const { data: posts, error } = await supabase
      .from("posts")
      .select("slug, created_at")
      .is("taslak", null); // Yayınlanmış yazılar

    if (error) {
      console.error("Supabase hata:", error);
      return res.status(500).send("Veri alınamadı");
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(page => `
  <url>
    <loc>${SITE_URL}/${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.6</priority>
  </url>`)
    .join("")}
  ${posts
    .map(post => `
  <url>
    <loc>${SITE_URL}/${post.slug}</loc>
    <lastmod>${post.created_at ? new Date(post.created_at).toISOString() : new Date().toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>`)
    .join("")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(sitemap);
  } catch (err) {
    console.error("Sitemap oluşturulamadı:", err);
    res.status(500).send("Sunucu hatası");
  }
}
