import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  process.env.NEXT_PUBLIC_SUPABASE_URL

);

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Sadece DELETE istekleri destekleniyor" });
  }

  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Geçerli ID listesi gönderin" });
  }

  try {
    const { error } = await supabase
      .from("posts")
      .delete()
      .in("id", ids);

    if (error) {
      console.error("Supabase hatası:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: "İçerikler silindi" });
  } catch (err) {
    console.error("Sunucu hatası:", err);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
}
