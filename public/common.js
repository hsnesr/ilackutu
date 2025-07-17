function loadHTML(id, url, callback) {
  fetch(url)
    .then(response => response.text())
    .then(data => {
      const container = document.getElementById(id);
      if (container) {
        container.innerHTML = data;
        if (callback) callback();
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
    if (loadedCount === 2) {
      // Navbar ve footer yüklendi, şimdi diğer işlemleri başlat
      if (typeof loadPosts === "function") {
        loadPosts(); // varsa gönderileri yükle
      }
      if (typeof initSearch === "function") {
        initSearch(); // varsa arama kutusu işlemleri
      }
    }
  }

  loadHTML("navbar-placeholder", "/navbar.html", checkAllLoaded);
  loadHTML("footer-placeholder", "/footer.html", checkAllLoaded);
});
