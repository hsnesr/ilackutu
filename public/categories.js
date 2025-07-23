async function fetchPostsByTag(tag) {
  const container = document.getElementById("postsContainer");
  if (!container) {
    console.warn("postsContainer bulunamadı.");
    return;
  }

  container.innerHTML = `<div class="blue-loader"></div>`; // yükleniyor animasyonu

  try {
    const res = await fetch(`/api/posts?tag=${encodeURIComponent(tag)}`);

    if (!res.ok) {
      container.innerHTML = `<p class="alert alert-danger mt-3">İçerikler alınamadı.</p>`;
      return;
    }

    const posts = await res.json();

    if (!posts.length) {
      container.innerHTML = `<p class="alert alert-warning m-5">${tag} konu başlığında içerik bulunamadı.</p>`;
      return;
    }

    container.innerHTML = "";

    posts.forEach(post => {
      const div = document.createElement("div");
      div.classList.add("card", "mb-3");

      div.innerHTML = `
        <div class="col-md-12 col-lg-12">
  <a href="/${post.slug}" class="text-decoration-none text-dark">
    <div class="card" style="min-height: 125px; max-height: 125px; height: 125px; overflow:hidden"> <!-- %25 daha kısa -->
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

      

      container.appendChild(div);
    });

  } catch (error) {
    console.error("Fetch hatası:", error);
    container.textContent = "Sunucu hatası oluştu.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Sayfada <body> veya başka bir elementte data-tag attribute’u ile tag belirtelim
  // Örnek: <body data-category-tag="egitim">
  const tag = document.body.getAttribute("data-category-tag");
  if (tag) {
    fetchPostsByTag(tag);
  } else {
    console.warn("Sayfa için kategori tag'i belirtilmemiş.");
  }
});
