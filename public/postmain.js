// T�rk�e karakterleri URL uyumlu hale getirir
function slugify(text) {
    const trMap = {
        �: "c", �: "g", �: "i", �: "o", �: "s", �: "u",
        �: "C", �: "G", �: "I", �: "O", �: "S", �: "U"
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
        container.innerHTML = '<div class="alert alert-danger">��erik bulunamad�.</div>';
        return;
    }

    try {
        const res = await fetch("/api/posts");
        if (!res.ok) throw new Error("Veriler al�namad�.");

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
            container.innerHTML = '<div class="alert alert-danger">��erik bulunamad�.</div>';
        }
    } catch (err) {
        container.innerHTML = '<div class="alert alert-danger">Sunucu hatas�.</div>';
    }
}

loadPost();