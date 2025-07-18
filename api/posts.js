import { createClient } from "@supabase/supabase-js";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import 'dotenv/config';

export const config = {
    api: {
        bodyParser: false, // Form verisi (FormData) için kapalı olmalı
    },
};

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function createSlug(text) {
    const trMap = {
        ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
        Ç: "C", Ğ: "G", İ: "I", Ö: "O", Ş: "S", Ü: "U"
    };
    return text.split("")
        .map(c => trMap[c] || c)
        .join("")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "")
        .replace(/\-+/g, "-")
        .replace(/^\-+|\-+$/g, "");
}

export default async function handler(req, res) {
    if (req.method === "POST") {
        const form = new IncomingForm({ keepExtensions: true, multiples: true });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error("Form parse hatası:", err);
                return res.status(400).json({ error: "Form verisi ayrıştırılamadı." });
            }

            const title = fields.title?.[0] || fields.title;
            const content = fields.content?.[0] || fields.content;

            if (!title || !content) {
                return res.status(400).json({ error: "Başlık ve içerik gerekli." });
            }

            let media_urls = [];

            if (files.media) {
                const mediaFiles = Array.isArray(files.media) ? files.media : [files.media];

                try {
                    for (const file of mediaFiles) {
                        const ext = path.extname(file.originalFilename);
                        const fileName = `media_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
                        const fileBuffer = fs.readFileSync(file.filepath);

                        const { data: uploadData, error: uploadError } = await supabase.storage
                            .from("media")
                            .upload(fileName, fileBuffer, {
                                contentType: file.mimetype,
                            });

                        if (uploadError) {
                            console.error("Dosya yükleme hatası:", uploadError);
                            return res.status(500).json({ error: "Medya yüklenemedi." });
                        }

                        const { data: publicURL } = supabase.storage.from("media").getPublicUrl(fileName);
                        media_urls.push(publicURL.publicUrl);
                    }
                } catch (uploadException) {
                    console.error("Dosya yükleme sırasında beklenmeyen hata:", uploadException);
                    return res.status(500).json({ error: "Medya yükleme hatası." });
                }
            }

            const media_url = media_urls.length > 0 ? media_urls[0] : null;

            try {
                const slug = createSlug(title);

                // Aynı slug varsa sonuna sayı ekle
                let finalSlug = slug;
                let exists = true;
                let counter = 1;

                while (exists) {
                    const { data, error } = await supabase
                        .from("posts")
                        .select("id")
                        .eq("slug", finalSlug)
                        .limit(1);

                    if (error) {
                        console.error("Slug kontrol hatası:", error);
                        break;
                    }

                    if (data.length === 0) {
                        exists = false;
                    } else {
                        finalSlug = slug + "-" + counter;
                        counter++;
                    }
                }

                const { data, error } = await supabase
                    .from("posts")
                    .insert([{ title, content, media_url, slug: finalSlug }])
                    .select();

                if (error) {
                    console.error("Supabase veri ekleme hatası:", error);
                    return res.status(500).json({ error: "Veri eklenemedi." });
                }

                return res.status(201).json({ message: "İçerik kaydedildi.", post: data[0] });
            } catch (dbException) {
                console.error("Veritabanı işlemi sırasında hata:", dbException);
                return res.status(500).json({ error: "Sunucu hatası oluştu." });
            }
        });
    }

    else if (req.method === "PUT") {
        const form = new IncomingForm({ keepExtensions: true });
        form.parse(req, async (err, fields, files) => {
            if (err) return res.status(400).json({ error: "Form verisi ayrıştırılamadı." });

            const id = fields.id?.[0] || fields.id;
            const title = fields.title?.[0] || fields.title;
            const content = fields.content?.[0] || fields.content;

            if (!id || !title || !content) {
                return res.status(400).json({ error: "ID, başlık ve içerik gerekli." });
            }

            try {
                const slug = createSlug(title);

                const { data, error } = await supabase
                    .from("posts")
                    .update({ title, content, slug })
                    .eq("id", id)
                    .select();

                if (error) return res.status(500).json({ error: "Güncelleme hatası." });

                return res.status(200).json({ message: "İçerik güncellendi.", post: data[0] });
            } catch (err) {
                return res.status(500).json({ error: "Sunucu hatası." });
            }
        });
    }

    else if (req.method === "GET") {
        try {
            const { slug, search, page = 1, limit = 9 } = req.query;

            if (slug) {
                const { data, error } = await supabase
                    .from("posts")
                    .select("*")
                    .eq("slug", slug)
                    .single();

                if (error || !data) {
                    return res.status(404).json({ error: "İçerik bulunamadı." });
                }

                return res.status(200).json(data);
            }

            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 9;

            let query = supabase.from("posts").select("*").order("created_at", { ascending: false });

            if (search) {
                query = query.ilike("title", `%${search}%`).or(`content.ilike.%${search}%`);
            }

            const offset = (pageNum - 1) * limitNum;
            query = query.range(offset, offset + limitNum - 1);

            const { data, error } = await query;

            if (error) {
                console.error("Supabase GET hatası:", error);
                return res.status(500).json({ error: "Veriler alınamadı." });
            }

            return res.status(200).json(data);
        } catch (err) {
            console.error("GET işlemi sırasında hata:", err);
            return res.status(500).json({ error: "Sunucu hatası oluştu." });
        }
    }

    else if (req.method === "DELETE") {
        try {
            const { id } = req.body;

            if (!id) return res.status(400).json({ error: "ID gerekli." });

            const { error } = await supabase.from("posts").delete().eq("id", id);

            if (error) {
                console.error("Supabase silme hatası:", error);
                return res.status(500).json({ error: "İçerik silinemedi." });
            }

            return res.status(200).json({ message: "İçerik silindi." });
        } catch (err) {
            console.error("DELETE işlemi sırasında hata:", err);
            return res.status(500).json({ error: "Sunucu hatası oluştu." });
        }
    }

    else {
        return res.status(405).json({ error: "Desteklenmeyen istek." });
    }
}
