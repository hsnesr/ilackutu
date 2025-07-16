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
  const content = document.getElementById("contentText").value.trim();
  const editId = document.getElementById("editId").value;
  const message = document.getElementById("message");

  if (!title || !content) {
    message.innerHTML = `<div class="alert alert-danger">Başlık ve içerik gerekli.</div>`;
    return;
  }

  try {
    const method = editId ? "PUT" : "POST";
    const bodyData = editId ? { id: editId, title, content } : { title, content };

    const res = await fetch("/api/posts", {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyData)
    });

    const data = await res.json();

    if (res.ok) {
      message.innerHTML = `<div class="alert alert-success">${editId ? 'İçerik güncellendi.' : `"${data.post.title}" başlıklı içerik eklendi.`}</div>`;
      document.getElementById("contentForm").reset();
      document.getElementById("editId").value = ""; // Güncelleme bittiyse sıfırla
      loadContents(); // Listeyi yenile
    } else {
      message.innerHTML = `<div class="alert alert-danger">${data.error || 'Hata oluştu.'}</div>`;
    }
  } catch (err) {
    message.innerHTML = `<div class="alert alert-danger">Sunucu hatası.</div>`;
  }
});


// İÇERİKLERİM SEKMESİ
async function loadContents() {
  try {
    const res = await fetch("/api/posts", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}` // Eğer token ile doğrulama yapılıyorsa
      }
    });

    if (!res.ok) throw new Error("Veri çekilemedi");

    const data = await res.json();

    const contentsTableBody = document.getElementById("contentsTableBody");
    contentsTableBody.innerHTML = "";

    data.forEach(post => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${post.title}</td>
    <td>
      <div class="content-preview" style="max-width: 500px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        ${post.content}
      </div>
    </td>
    <td>
      <button class="btn btn-sm btn-warning edit-btn" data-id="${post.id}" data-title="${post.title}" data-content="${post.content}">
        Düzenle
      </button>
    </td>
  `;
  contentsTableBody.appendChild(row);
});

document.querySelectorAll(".edit-btn").forEach(button => {
  button.addEventListener("click", () => {
    const id = button.getAttribute("data-id");
    const title = button.getAttribute("data-title");
    const content = button.getAttribute("data-content");

    // Form alanlarını doldur
    document.getElementById("title").value = title;
    document.getElementById("contentText").value = content;
    document.getElementById("editId").value = id;

    // "İçerik Ekle" sekmesine geç
    new bootstrap.Tab(document.querySelector('#content-tab')).show();
  });
});



  } catch (err) {
    console.error(err);
    // İstersen kullanıcıya da hata mesajı göster
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadContents();
});
