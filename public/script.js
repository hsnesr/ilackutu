
        let currentPage = 1;
        const limit = 9;

function slugify(text) {
    const trMap = {
        "ç": "c", "Ç": "C", "ð": "g", "Ð": "G",
        "ý": "i", "Ý": "I", "ö": "o", "Ö": "O",
        "þ": "s", "Þ": "S", "ü": "u", "Ü": "U"
    };
    return text
        .split("")
        .map(char => trMap[char] || char)
        .join("")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "")
        .replace(/\-+/g, "-")
        .replace(/^\-+|\-+$/g, "");
}

        //PROGRES BARS
        function showProgressBar() {
            const bar = document.getElementById("progressBar");
            bar.style.width = "0%";
            bar.style.display = "block";

            let width = 0;
            const interval = setInterval(() => {
                if (width >= 90) {
                    clearInterval(interval);
                } else {
                    width += Math.random() * 10;
                    bar.style.width = width + "%";
                }
            }, 100);
        }
        function hideProgressBar() {
            const bar = document.getElementById("progressBar");
            bar.style.width = "100%";
            setTimeout(() => {
                bar.style.display = "none";
                bar.style.width = "0%";
            }, 300);
        }




        // POSTS
        async function loadPosts(page = 1) {
            currentPage = page;
            const postsDiv = document.getElementById("posts");
            const paginationUl = document.getElementById("pagination");

            showProgressBar(); // Ekle 1

            try {
                const res = await fetch(`/api/posts?page=${page}&limit=${limit}`);
                if (!res.ok) throw new Error("Veriler alýnamadý.");

                const posts = await res.json();

                if (posts.length === 0) {
                    postsDiv.innerHTML = '<div class="alert alert-info">Henüz içerik yok.</div>';
                    paginationUl.innerHTML = "";
                    hideProgressBar(); // Ekle 2
                    return;
                }

                postsDiv.innerHTML = posts.map((post, index) => {
                    const slug = slugify(post.title);
                    return `
                            <div class="col-md-6 col-lg-4">
                                <a href="/post/${slug}" class="text-decoration-none text-dark">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <h5 class="card-title">${post.title}</h5>
                                            <h6 class="card-subtitle mb-2 text-muted">${new Date(post.created_at).toLocaleDateString()}</h6>
                                            <p class="card-text">${post.content}</p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        `;
                }).join("");

                // Basit sayfa kontrolü: Eðer çekilen post sayýsý limitten azsa son sayfa
                paginationUl.innerHTML = `
                        <li class="page-item ${page === 1 ? "disabled" : ""}">
                            <a class="page-link" href="#" onclick="loadPosts(${page - 1});return false;">Önceki</a>
                        </li>
                        <li class="page-item ${posts.length < limit ? "disabled" : ""}" >
    <a class="page-link" href="#" onclick="loadPosts(${page + 1});return false;">Sonraki</a>
                        </li >
    `;

            } catch (error) {
                postsDiv.innerHTML = `< div class="alert alert-danger" > Hata: ${ error.message }</div > `;
            } finally {
                hideProgressBar(); // Ekle 3
            }
        }

        loadPosts(currentPage);