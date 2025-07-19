        // Türkçe karakterleri URL uyumlu hale getirir
        function slugify(text) {
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
                .replace(/\-+/g, "-");
        }

        async function loadPost() {
            const pathParts = window.location.pathname.split("/").filter(Boolean);
            const slug = pathParts[1]; // Örn: /yazi-slug

            const container = document.getElementById("postDetail");
            const mediaContainer = document.getElementById("media-container");
            
            if (!slug) {
                container.innerHTML = '<div class="alert alert-danger">İçerik bulunamadı.</div>';
                return;
            }
            
            try {
                const res = await fetch(`/api/posts?slug=${encodeURIComponent(slug)}`);
                if (!res.ok) throw new Error("Veri alınamadı");

                const post = await res.json();

                document.title = post.title + " | hsnesr";
                container.innerHTML = `
            <h2>${post.title}</h2>
            <p class="text-muted">${new Date(post.created_at).toLocaleDateString()}</p>
            ${post.media_urls && post.media_urls.length > 0 
    ? post.media_urls.map(url => `<img src="${url}" alt="Post image" style="max-width:100%;margin-top:1rem;border-radius:12px;" />`).join("")
    : ""}
            <div id="PostContentLyrics">${post.content}</div>
        `;

                // 🌟 MEDYA URL varsa resmi göster
                if (post.media_urls && post.media_urls.length > 0) {
    post.media_urls.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "Post image";
        img.style.maxWidth = "100%";
        img.style.marginTop = "1rem";
        img.style.borderRadius = "12px";
        mediaContainer.appendChild(img);
    });
}

            } catch (err) {
                container.innerHTML = '<div class="alert alert-danger">İçerik bulunamadı.</div>';
            }
        }
        loadPost();