// Token kontrolü: giriş yapılmamışsa login.html'e yönlendir
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "login.html";
    } else {
      fetch("/api/verify", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (!data.valid) {
          localStorage.removeItem("token");
          window.location.href = "login.html";
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "login.html";
      });
    }

    // Çıkış yap butonu
    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "login.html";
    });

    // İçerik formu gönderimi (örnek olarak sadece mesaj gösteriyor)
    document.getElementById("contentForm").addEventListener("submit", (e) => {
      e.preventDefault();

      const title = document.getElementById("title").value.trim();
      const content = document.getElementById("content").value.trim();
      const message = document.getElementById("message");

      // Burada backend'e gönderme işlemi yapılabilir
      message.innerHTML = `<div class="alert alert-success">"${title}" başlıklı içerik eklendi.</div>`;

      // Formu sıfırla
      document.getElementById("contentForm").reset();
    });