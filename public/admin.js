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

// İçerik formu gönderimi
document.getElementById("contentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const message = document.getElementById("message");

  if (!title || !content) {
    message.innerHTML = `<div class="alert alert-danger">Başlık ve içerik gerekli.</div>`;
    return;
  }

  try {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title, content })
    });

    const data = await res.json();

    if (res.ok) {
      message.innerHTML = `<div class="alert alert-success">"${data.post.title}" başlıklı içerik eklendi.</div>`;
      document.getElementById("contentForm").reset();
    } else {
      message.innerHTML = `<div class="alert alert-danger">${data.error || 'Hata oluştu.'}</div>`;
    }
  } catch (err) {
    message.innerHTML = `<div class="alert alert-danger">Sunucu hatası.</div>`;
  }
});
