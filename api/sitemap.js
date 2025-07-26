import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Site base URL (kendi domainini yaz)
const SITE_URL = "https://seninsite.com";

export default async function handler(req, res) {
  try {
    // Yayında olan yazıları al (is_draft = false)
    const { data: posts, error } = await supabase
      .from("posts")
      .select("slug, updated_at")
      .eq("is_draft", false);

    if (error) {
      console.error("Supabase hata:", error);
      return res.status(500).send("Veri alınamadı");
    }

    // XML formatlı sitemap oluştur
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>1.0</priority>
  </url>
  ${posts
    .map(post => {
      const lastmod = post.updated_at
        ? new Date(post.updated_at).toISOString()
        : new Date().toISOString();
      return `
  <url>
    <loc>${SITE_URL}/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>0.8</priority>
  </url>`;
    })
    .join("")}
</urlset>`;

    // Header ayarla ve XML döndür
    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(sitemap);
  } catch (err) {
    console.error("Sitemap oluşturulamadı:", err);
    res.status(500).send("Sunucu hatası");
  }
}
