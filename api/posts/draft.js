import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Sadece PUT istekleri kabul edilir" });
  }

  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Geçerli ID listesi gönderin" });
  }

  try {
    const { error } = await supabase
      .from("posts")
      .update({ taslak: true }) // 👈 sütun adı burada doğru olmalı
      .in("id", ids);

    if (error) {
      console.error("Supabase hatası:", error); // 🧪 Log
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: "Taslak olarak güncellendi" });
  } catch (err) {
    console.error("Sunucu hatası:", err); // 🧪 Log
    return res.status(500).json({ error: "Sunucu hatası" });
  }
}
