const postsDiv = document.getElementById("posts");
const paginationUl = document.getElementById("pagination");

let currentPage = 1;
const limit = 9;

function slugify(text) {
    const trMap = {
        "ç": "c", "Ç": "C",
        "ğ": "g", "Ğ": "G",
        "ı": "i", "İ": "I",
        "ö": "o", "Ö": "O",
        "ş": "s", "Ş": "S",
        "ü": "u", "Ü": "U"
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

// PROGRESS BARS
function showProgressBar() {
    const bar = document.getElementById("progressBar");
    if (!bar) return;
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
    if (!bar) return;
    bar.style.width = "100%";
    setTimeout(() => {
        bar.style.display = "none";
        bar.style.width = "0%";
    }, 300);
}

// POSTS
async function loadPosts(page = 1, search = "", limitParam) {
    currentPage = page;
    showProgressBar();

    const usedLimit = limitParam || limit;

    try {
        const query = new URLSearchParams({ page, limit: usedLimit });
        if (search) query.append("search", search);

        const res = await fetch(`/api/posts?${query.toString()}`);
        if (!res.ok) throw new Error("Veriler alınamadı.");

        const posts = await res.json();

        if (posts.length === 0) {
            postsDiv.innerHTML = '<div class="alert alert-info">İçerik bulunamadı.</div>';
            paginationUl.innerHTML = "";
            return;
        }

        postsDiv.innerHTML = posts.map(post => {
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
            </div>`;
        }).join("");

        if (!search) {
            paginationUl.innerHTML = `
                <li class="page-item ${page === 1 ? "disabled" : ""}">
                    <a class="page-link" href="#" onclick="loadPosts(${page - 1});return false;">Önceki</a>
                </li>
                <li class="page-item ${posts.length < usedLimit ? "disabled" : ""}">
                    <a class="page-link" href="#" onclick="loadPosts(${page + 1});return false;">Sonraki</a>
                </li>`;
        } else {
            paginationUl.innerHTML = "";
        }

    } catch (error) {
        postsDiv.innerHTML = `<div class="alert alert-danger">Hata: ${error.message}</div>`;
    } finally {
        hideProgressBar();
    }
}

// SUGGESTIONS
async function loadSuggestions(query = "") {
    const suggestionList = document.getElementById("suggestionList");
    if (!suggestionList) return;

    const params = new URLSearchParams();
    params.append("page", 1);
    params.append("limit", 6);
    if (query) params.append("search", query);

    try {
        const res = await fetch(`/api/posts?${params.toString()}`);
        if (!res.ok) throw new Error("Öneriler alınamadı.");

        const posts = await res.json();

        if (posts.length === 0) {
            suggestionList.style.display = "none";
            suggestionList.innerHTML = "";
            return;
        }

        suggestionList.innerHTML = posts.map(post =>
            `<li class="list-group-item list-group-item-action" style="cursor:pointer;" data-title="${post.title}">${post.title}</li>`
        ).join("");

        suggestionList.style.display = "block";
    } catch (err) {
        suggestionList.style.display = "none";
        suggestionList.innerHTML = "";
        console.error(err);
    }
}

// SEARCH EVENTS
function initSearchEvents() {
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const suggestionList = document.getElementById("suggestionList");

    if (!searchForm || !searchInput || !suggestionList) return;

    searchInput.addEventListener("focus", () => {
        if (!searchInput.value.trim()) {
            loadSuggestions();
            loadPosts(1, "", 6);
        }
    });

    searchInput.addEventListener("input", () => {
        const val = searchInput.value.trim();
        if (val) {
            loadSuggestions(val);
        } else {
            loadSuggestions();
        }
    });

    suggestionList.addEventListener("click", e => {
        if (e.target && e.target.matches("li.list-group-item")) {
            const selectedTitle = e.target.getAttribute("data-title");
            searchInput.value = selectedTitle;
            suggestionList.style.display = "none";
            loadPosts(1, selectedTitle);
        }
    });

    searchForm.addEventListener("submit", e => {
        e.preventDefault();
        const query = searchInput.value.trim();
        loadPosts(1, query);
        suggestionList.style.display = "none";
    });

    document.addEventListener("click", (e) => {
        if (!searchForm.contains(e.target)) {
            suggestionList.style.display = "none";
        }
    });
}

// Başlangıç verileri
document.addEventListener("DOMContentLoaded", () => {
    loadPosts(currentPage);
});
