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

window.addEventListener("load", () => {showProgressBar();setTimeout(() => {hideProgressBar();}, 1500);});

// SAYFALARI TEK KODLA ÇAĞIR
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

// COOKİES
document.addEventListener("DOMContentLoaded", () => {
    const cookieBanner = document.getElementById("cookieBanner");
    if (!cookieBanner) return;  // Eğer yoksa devam etme

    // Daha önce kabul veya red edildiyse banner'ı gizle
    if (localStorage.getItem("cookieConsent")) {
      cookieBanner.style.display = "none";
    }

    // Kabul fonksiyonu
    window.acceptCookies = () => {
      localStorage.setItem("cookieConsent", "accepted");
      cookieBanner.style.display = "none";
    };

    // Reddet fonksiyonu
    window.declineCookies = () => {
      localStorage.setItem("cookieConsent", "declined");
      cookieBanner.style.display = "none";
    };
  });


  // ARAMA KUTUSU (global fonksiyon olarak tanımla)
window.initSearch = () => {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("searchInput");
  const results = document.getElementById("results");

  if (!form || !input || !results) return; // ❗ Elemanlar henüz yoksa çık

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const query = input.value.trim();
    if (!query) {
      results.innerHTML = '<p class="text-danger">Lütfen arama terimi girin.</p>';
      return;
    }

    results.innerHTML = `<div class="blue-loader"></div>`;

    try {
      const res = await fetch(`/api/posts?search=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!res.ok) {
        results.innerHTML = `<p class="alert alert-danger">Hata: ${data.error || "Bilinmeyen hata"}</p>`;
        return;
      }

      if (data.length === 0) {
        results.innerHTML = `<p class="alert alert-warning">Sonuç bulunamadı.</p>`;
        return;
      }

      results.innerHTML = data
        .map(
          (post) => `
              <a href="/${post.slug}" class="text-decoration-none">
                <div class="card mb-3">
                  <div class="card-body">
                    <p class="text-primary">${post.title}</p>
                    <p>${post.content?.slice(0, 150)}...</p>
                  </div>
                </div>
              </a>
        `
        )
        .join("");
    } catch (err) {
      results.innerHTML = `<p class="alert alert-danger">Sunucu hatası: ${err.message}</p>`;
    }
  });
};
