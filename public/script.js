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

// POSTS
async function loadPosts(page = 1, search = "", limitParam) {
    const postsDiv = document.getElementById("posts");
    const paginationUl = document.getElementById("pagination");

    if (!postsDiv) {
        console.error("posts container bulunamadı!");
        return;
    }
    if (!paginationUl) {
        console.error("pagination container bulunamadı!");
        return;
    }

    currentPage = page;

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
            <div class="col-md-12 col-lg-12">
  <a href="/${post.slug}" class="text-decoration-none text-dark">
    <div class="card border card-hvr">
      <div class="row g-0 h-100">
        <!-- Sol: Resim -->
        <div class="col-4">
          <div class="h-100">
            <img src="${post.media_urls && post.media_urls.length > 0 ? post.media_urls[0] : '/placeholder.jpg'}" alt="${post.title}" class="img-fluid w-100 h-100 object-fit-cover rounded-start">

          </div>
        </div>

        <!-- Sağ: İçerik -->
        <div class="col-8">
          <div class="card-body h-100 d-flex flex-column justify-content-between p-1">
            <div>
              <h5 class="card-title mt-2 ms-2 me-2">${post.title}</h5>
              <h6 class="card-subtitle text-muted mt-2 ms-2 me-2">
                ${new Date(post.created_at).toLocaleDateString()}
              </h6>
              <div class="card-text small text-truncate" style="max-height: 1.4em; overflow: hidden;">
                <p class="mb-0">${post.content}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a>
</div>
`;
        }).join("");
        

        if (!search) {
            paginationUl.innerHTML = `
                <li class="page-item ${page === 1 ? "disabled" : ""}">
                    <a class="page-link bg-white text-dark" href="#" onclick="loadPosts(${page - 1});return false;">Önceki</a>
                </li>
                <li class="page-item ${posts.length < usedLimit ? "disabled" : ""}">
                    <a class="page-link bg-white text-dark" href="#" onclick="loadPosts(${page + 1});return false;">Sonraki</a>
                </li>`;
        } else {
            paginationUl.innerHTML = "";
        }

    } catch (error) {
        postsDiv.innerHTML = `<div class="alert alert-danger">Hata: ${error.message}</div>`;
    } 
}

// DETAY YAZISI İNDEX.HTML DE EDİTÖR İŞLEMEZ
function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

//const previewText = stripHtml(post.content).slice(0, 10) + "...";  // 150 karakter göster
