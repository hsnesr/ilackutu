import { createClient } from "@supabase/supabase-js";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import 'dotenv/config';

export const config = {
    api: {
        bodyParser: false, // FormData için kapalı olmalı
    },
};

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    // POST: Yeni içerik + medya
    if (req.method === "POST") {
        const form = new IncomingForm({ keepExtensions: true });

        form.parse(req, async (err, fields, files) => {
            if (err) return res.status(400).json({ error: "Form verisi ayrıştırılamadı." });

            const title = fields.title?.[0] || fields.title;
            const content = fields.content?.[0] || fields.content;
            const mediaFile = files.media?.[0] || files.media;

            if (!title || !content) {
                return res.status(400).json({ error: "Başlık ve içerik gerekli." });
            }

            let media_url = null;

            // Medya dosyası varsa yükle
            if (mediaFile) {
                const ext = path.extname(mediaFile.originalFilename);
                const fileName = `media_${Date.now()}${ext}`;

                const { data, error: uploadError } = await supabase.storage
                    .from("media")
                    .upload(fileName, fs.createReadStream(mediaFile.filepath), {
                        contentType: mediaFile.mimetype,
                    });

                if (uploadError) {
                    console.error("Dosya yükleme hatası:", uploadError);
                    return res.status(500).json({ error: "Medya yüklenemedi." });
                }

                const { data: publicURL } = supabase.storage.from("media").getPublicUrl(fileName);
                media_url = publicURL.publicUrl;
            }

            // Veritabanına içerik ekle
            const { data, error } = await supabase
                .from("posts")
                .insert([{ title, content, media_url }])
                .select();

            if (error) {
                console.error("Supabase Hatası:", error);
                return res.status(500).json({ error: "Veri eklenemedi." });
            }

            return res.status(201).json({ message: "İçerik kaydedildi.", post: data[0] });
        });
    }

    // Diğer metodlar (PUT, GET, DELETE) aynı kalabilir.
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

    else if (req.method === "DELETE") {
        const { id } = req.body;

        if (!id) return res.status(400).json({ error: "ID gerekli." });

        const { error } = await supabase.from("posts").delete().eq("id", id);

        if (error) {
            console.error("Silme hatası:", error);
            return res.status(500).json({ error: "İçerik silinemedi." });
        }

        return res.status(200).json({ message: "İçerik silindi." });
    }

    else {
        return res.status(405).json({ error: "Desteklenmeyen istek." });
    }
}
