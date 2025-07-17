// Türkçe karakterleri URL uyumlu hale getirir
function slugify(text) {
    const trMap = {
        ç: "c", ð: "g", ý: "i", ö: "o", þ: "s", ü: "u",
        Ç: "C", Ð: "G", Ý: "I", Ö: "O", Þ: "S", Ü: "U"
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
    const pathParts = window.location.pathname.split("/");
    // /post/slug --> slug index 2'de
    const slug = pathParts[2];
    const container = document.getElementById("postDetail");



    if (!slug) {
        container.innerHTML = '<div class="alert alert-danger">Ýçerik bulunamadý.</div>';
        return;
    }

    try {
        const res = await fetch("/api/posts");
        if (!res.ok) throw new Error("Veriler alýnamadý.");

        const posts = await res.json();

        const matchedPost = posts.find(p => slugify(p.title) === slug);

        if (matchedPost) {
            document.title = matchedPost.title + " | hsnesr";
            container.innerHTML = `
                    <h2>${matchedPost.title}</h2>
                    <p class="text-muted">${new Date(matchedPost.created_at).toLocaleDateString()}</p>
                    <p>${matchedPost.content}</p>
                  `;
        } else {
            container.innerHTML = '<div class="alert alert-danger">Ýçerik bulunamadý.</div>';
        }
    } catch (err) {
        container.innerHTML = '<div class="alert alert-danger">Sunucu hatasý.</div>';
    }
}

loadPost();