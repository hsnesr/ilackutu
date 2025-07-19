function loadHTML(id, url, callback) {
  fetch(url)
    .then(response => response.text())
      .then(data => {
          const container = document.getElementById(id);
          if (container) {
              container.innerHTML = data;
              if (callback) setTimeout(callback, 0); // microtask kuyruğunda çağır, DOM güncellenmiş olur
          } else {
              console.warn(`Element with id '${id}' not found in the document.`);
          }
      })

    .catch(err => console.error(`Error loading ${url}:`, err));
}

document.addEventListener("DOMContentLoaded", () => {
    let loadedCount = 0;

    function checkAllLoaded() {
        loadedCount++;
        if (loadedCount === 4) {
            // Navbar, main ve footer yüklendi, şimdi yüklemeyi başlat
            if (typeof loadPosts === "function") {
                loadPosts(); // sadece burada çağır
            }
            if (typeof initSearch === "function") {
                initSearch();
            }
        }
    }

    loadHTML("navbar-placeholder", "/navbar.html", checkAllLoaded);
    loadHTML("header-placeholder", "/header.html", checkAllLoaded);
    loadHTML("footer-placeholder", "/footer.html", checkAllLoaded);
    // Sadece anasayfadaysa main.html yükle
    if (window.location.pathname === "/") {
        loadHTML("main-placeholder", "/main.html", checkAllLoaded);
    }
    
});

