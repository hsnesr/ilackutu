import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

// Supabase istemcisi
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  // POST: Yeni içerik ekleme
  if (req.method === "POST") {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Başlık ve içerik gerekli." });
    }

    const { data, error } = await supabase
      .from("posts")
          .insert([{ title, content }])
      .select();

      if (error) {
          console.error("Supabase Hatası:", error);
          return res.status(500).json({ error: "Veri eklenemedi." });
      }
      const newPost = (data && data.length > 0) ? data[0] : { title, content };


      return res.status(201).json({ message: "İçerik kaydedildi.", post: newPost });
  }

  // GET: Tüm içerikleri listeleme
  else if (req.method === "GET") {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET Hatası:", error);
      return res.status(500).json({ error: "Veriler alınamadı." });
    }

    return res.status(200).json(data);
  }

  // Desteklenmeyen metod
  else {
    return res.status(405).json({ error: "Yalnızca GET ve POST isteklerine izin verilir." });
  }
}
