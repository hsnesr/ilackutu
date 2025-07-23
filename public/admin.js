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

const contentEditor = document.getElementById("contentEditor");

// PARAGRAFI OTOMATİK P TAGINA AL
        function convertDivsToParagraphs(html) {
  const container = document.createElement("div");
  container.innerHTML = html;

  // <div> öğelerini <p> ile değiştir
  const newChildren = [];

  container.childNodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "DIV") {
      const p = document.createElement("p");
      p.innerHTML = node.innerHTML.trim();
      newChildren.push(p);
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
      const p = document.createElement("p");
      p.textContent = node.textContent.trim();
      newChildren.push(p);
    } else {
      newChildren.push(node);
    }
  });

  container.innerHTML = "";
  newChildren.forEach(child => container.appendChild(child));

  return container.innerHTML;
}

// İçerik formu gönderimi
document.getElementById("contentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const rawContent = contentEditor.innerHTML.trim();
  const content = convertDivsToParagraphs(rawContent);
  const tags = document.getElementById("tags").value.trim().split(",").map(t => t.trim()).filter(Boolean);
  const editId = document.getElementById("editId").value;
  const message = document.getElementById("message");

  if (!title || !content) {
    message.innerHTML = `<div class="alert alert-danger">Başlık ve içerik gerekli.</div>`;
    return;
  }

  try {
    const method = editId ? "PUT" : "POST";

      const formData = new FormData();
      formData.append("tags", JSON.stringify(tags)); // backend JSON olarak alacak
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
      // ⬇️ Eklemen gereken yeni satırlar:
      selectedFiles = [];
      mediaInput.value = ""; // input dosya seçimini sıfırla
      mediaPreview.innerHTML = ""; // önizlemeyi temizle
      contentEditor.innerHTML = ""; // içerik editörü temizle
    } else {
      message.innerHTML = `<div class="alert alert-danger">${data.error || 'Hata oluştu.'}</div>`;
    }
  } catch (err) {
    message.innerHTML = `<div class="alert alert-danger">Sunucu hatası.</div>`;
  }
});

const insertImageBtn = document.getElementById("insertImageBtn");
insertImageBtn.addEventListener("click", () => {
  const imageUrl = prompt("Resim URL'sini girin:");
  if (imageUrl) {
    document.execCommand("insertImage", false, imageUrl);
    contentEditor.focus();
  }
});

const toolbar = document.getElementById("toolbar");

toolbar.addEventListener("click", (e) => {
  const target = e.target.closest("button");
  if (!target) return;

  const command = target.getAttribute("data-command");
  const value = target.getAttribute("data-value") || null;

  if (command) {
    document.execCommand(command, false, value);
    contentEditor.focus();

    // Toggle active Classları Editör Butonları
    /*const toggleCommands = ["bold", "italic", "underline", "insertUnorderedList", "insertOrderedList"];
    if (toggleCommands.includes(command)) {
      target.classList.toggle("active");
    }*/
  }
});



// İptal Et Butonu click => clean form
document.getElementById("cancelEditBtn").addEventListener("click", () => {
  document.getElementById("contentForm").reset();
  document.getElementById("editId").value = "";
  document.getElementById("message").innerHTML = "";

  contentEditor.innerHTML = "";

  selectedFiles = [];
  mediaInput.value = "";
  mediaPreview.innerHTML = "";

  document.getElementById("cancelEditBtn").classList.add("d-none");

  new bootstrap.Tab(document.querySelector('#contents-tab')).show();
});


// BUTONA İÇERİĞİN TAŞMASINI ENGELLENME HTML KODLARINI ENGELLE
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


// İÇERİKLERİM SEKMESİ
async function loadContents() {
  try {
    const res = await fetch("/api/posts?admin=true", {
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

  const isDraft = post.taslak === true;

  row.innerHTML = `
    <td><input type="checkbox" class="secim-checkbox" data-id="${post.id}"></td>
    <td>${post.title} ${isDraft ? '<span class="badge bg-secondary">Taslak</span>' : ''}</td>
    <td>
      <div class="content-preview">${post.content}</div>
    </td>
    <td class="text-end">
      <button class="btn btn-sm btn-primary edit-btn" 
        data-id="${post.id}" 
        data-title="${escapeHtml(post.title)}" 
        data-content="${escapeHtml(post.content)}"
        data-tags="${post.tags}">
        İçeriği Düzenle
        
      </button>
      <button class="btn btn-sm btn-danger delete-btn" data-id="${post.id}">İçeriği Sil</button>
    </td>
  `;

  if (isDraft) {
    row.style.opacity = "0.5"; // satırı soluk yap
  }

  contentsTableBody.appendChild(row);
});


    // 🔥 Tüm düzenle butonlarına olayları EKLE
    document.querySelectorAll(".edit-btn").forEach(button => {
  button.addEventListener("click", () => {
    const id = button.getAttribute("data-id");
    const title = button.getAttribute("data-title");
    const content = button.getAttribute("data-content");
    const tagsStr = button.getAttribute("data-tags") || "";
    const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()) : [];


    contentEditor.innerHTML = content;
    document.getElementById("title").value = title;
    document.getElementById("editId").value = id;
    document.getElementById("tags").value = tags.join(", ");

    document.getElementById("cancelEditBtn").classList.remove("d-none");
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

// TASLAK YAP
document.getElementById("taslakYapBtn").addEventListener("click", async () => {
  const selectedCheckboxes = document.querySelectorAll(".secim-checkbox:checked");
  const ids = Array.from(selectedCheckboxes).map(cb => cb.getAttribute("data-id"));

  if (ids.length === 0) {
    alert("Lütfen en az bir içerik seçin.");
    return;
  }

  try {
    const res = await fetch("/api/posts/draft", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ids })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Seçilen içerikler taslak olarak işaretlendi.");
      loadContents(); // tabloyu yenile
    } else {
      alert("Hata: " + (data.error || "Bilinmeyen bir hata"));
    }
  } catch (err) {
    console.error("Taslak işlemi hatası:", err);
    alert("Sunucu hatası.");
  }
});

// TASLAKTAN ÇIKAR
document.getElementById("taslaktanCikarBtn").addEventListener("click", async () => {
  const selectedCheckboxes = document.querySelectorAll(".secim-checkbox:checked");
  const ids = Array.from(selectedCheckboxes).map(cb => cb.getAttribute("data-id"));

  if (ids.length === 0) {
    alert("Lütfen en az bir içerik seçin.");
    return;
  }

  try {
    const res = await fetch("/api/posts/undraft", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ids })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Seçilen içerikler taslaktan çıkarıldı.");
      loadContents(); // tabloyu yenile
    } else {
      alert("Hata: " + (data.error || "Bilinmeyen bir hata"));
    }
  } catch (err) {
    console.error("Taslaktan çıkarma hatası:", err);
    alert("Sunucu hatası.");
  }
});


// TOPLU SİLME
document.getElementById("topluSilBtn").addEventListener("click", async () => {
  const selectedCheckboxes = document.querySelectorAll(".secim-checkbox:checked");
  const ids = Array.from(selectedCheckboxes).map(cb => cb.getAttribute("data-id"));

  if (ids.length === 0) {
    alert("Lütfen en az bir içerik seçin.");
    return;
  }

  const confirmDelete = confirm("Seçilen içerikleri silmek istediğinize emin misiniz?");
  if (!confirmDelete) return;

  try {
    const res = await fetch("/api/posts/delete-multiple", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ids })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Seçilen içerikler silindi.");
      loadContents(); // tabloyu yenile
    } else {
      alert("Hata: " + (data.error || "Bilinmeyen hata"));
    }
  } catch (err) {
    console.error("Toplu silme hatası:", err);
    alert("Sunucu hatası.");
  }
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

function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}