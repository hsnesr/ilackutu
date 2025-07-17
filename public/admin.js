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

let postToDeleteId = null; // 🌟 Silinecek postun id'si için global değişken

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

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (editId) formData.append("id", editId);
      selectedFiles.forEach(file => formData.append("media", file));

      const res = await fetch("/api/posts", {
          method,
          body: formData
      });


    const data = await res.json();

    if (res.ok) {
      message.innerHTML = `<div class="alert alert-success">${editId ? 'İçerik güncellendi.' : `"${data.post.title}" başlıklı içerik eklendi.`}</div>`;
      document.getElementById("contentForm").reset();
      document.getElementById("editId").value = ""; // Güncelleme bittiyse sıfırla
      document.getElementById("cancelEditBtn").classList.add("d-none"); // iptal butonunu gizle
      loadContents(); // Listeyi yenile
    } else {
      message.innerHTML = `<div class="alert alert-danger">${data.error || 'Hata oluştu.'}</div>`;
    }
  } catch (err) {
    message.innerHTML = `<div class="alert alert-danger">Sunucu hatası.</div>`;
  }
});

// İptal Et Butonu click => clean form
document.getElementById("cancelEditBtn").addEventListener("click", () => {
  document.getElementById("contentForm").reset();
  document.getElementById("editId").value = "";
  document.getElementById("message").innerHTML = "";

  // Butonu tekrar gizle
  document.getElementById("cancelEditBtn").classList.add("d-none");

  // "İçeriklerim" sekmesine geç
  new bootstrap.Tab(document.querySelector('#contents-tab')).show();
});

// İÇERİKLERİM SEKMESİ
async function loadContents() {
  try {
    const res = await fetch("/api/posts", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
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
  <td style="width: 300px;max-width: 300px;overflow: hidden;border-left: 1px solid #ddd;text-overflow: ellipsis;">
    <div class="content-preview" style="max-width: 500px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
      ${post.content}
    </div>
  </td>
  <td style="text-align:right;width: 300px;max-width: 300px;overflow: hidden;border-left: 1px solid #ddd;text-overflow: ellipsis;">
    <button class="btn btn-sm btn-secondary  edit-btn" data-id="${post.id}" data-title="${post.title}" data-content="${post.content}">
      Düzenle
    </button>
    <button class="btn btn-sm btn-danger delete-btn" data-id="${post.id}">
      Sil
    </button>
  </td>
`;

      contentsTableBody.appendChild(row);
    });

    // 🔥 Tüm düzenle butonlarına olayları EKLE
    document.querySelectorAll(".edit-btn").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-id");
        const title = button.getAttribute("data-title");
        const content = button.getAttribute("data-content");

        document.getElementById("title").value = title;
        document.getElementById("contentText").value = content;
        document.getElementById("editId").value = id;

        // İptal Et butonunu göster
        document.getElementById("cancelEditBtn").classList.remove("d-none");

        // "İçerik Ekle" sekmesine geç
        new bootstrap.Tab(document.querySelector('#content-tab')).show();
      });
    });

    // 🔥 Silme modalı ile
    document.querySelectorAll(".delete-btn").forEach(button => {
      button.addEventListener("click", () => {
        postToDeleteId = button.getAttribute("data-id");
        const deleteModal = new bootstrap.Modal(document.getElementById("deleteConfirmModal"));
        deleteModal.show();
      });
    });

  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadContents();
});

// Silme onayı modal butonu
document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {
  if (!postToDeleteId) return;

  try {
    const res = await fetch("/api/posts", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id: postToDeleteId })
    });

    const data = await res.json();

    if (res.ok) {
      const modalInstance = bootstrap.Modal.getInstance(document.getElementById("deleteConfirmModal"));
      modalInstance.hide();
      postToDeleteId = null;
      loadContents();
    } else {
      alert("Silme işlemi başarısız: " + (data.error || "Bilinmeyen hata"));
    }
  } catch (err) {
    console.error("Silme hatası:", err);
    alert("Sunucu hatası.");
  }
});

//MEDİA

const mediaBtn = document.getElementById("mediaBtn");
const mediaInput = document.getElementById("mediaInput");
const mediaPreview = document.getElementById("mediaPreview");
let selectedFiles = [];

mediaBtn.addEventListener("click", () => {
    mediaInput.click();
});


mediaInput.addEventListener("change", () => {
    selectedFiles = Array.from(mediaInput.files);
    mediaPreview.innerHTML = "";

    selectedFiles.forEach(file => {
        const url = URL.createObjectURL(file);
        const isImage = file.type.startsWith("image");
        const isVideo = file.type.startsWith("video");

        const wrapper = document.createElement("div");
        wrapper.style.width = "120px";

        if (isImage) {
            wrapper.innerHTML = `<img src="${url}" class="img-fluid rounded border" style="max-height: 100px;" />`;
        } else if (isVideo) {
            wrapper.innerHTML = `<video src="${url}" class="img-fluid rounded border" style="max-height: 100px;" muted></video>`;
        }

        mediaPreview.appendChild(wrapper);
    });
});