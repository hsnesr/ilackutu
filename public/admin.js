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

const insertTableBtn = document.getElementById("insertTableBtn");
insertTableBtn?.addEventListener("click", () => {
  const tableHTML = `
    <table border="1" style="width:100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th>Başlık 1</th>
          <th>Başlık 2</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Veri 1</td>
          <td>Veri 2</td>
        </tr>
      </tbody>
    </table><br>`;
  
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  range.deleteContents();

  const temp = document.createElement("div");
  temp.innerHTML = tableHTML;
  const frag = document.createDocumentFragment();
  let node;
  while ((node = temp.firstChild)) {
    frag.appendChild(node);
  }

  range.insertNode(frag);
  contentEditor.focus();
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

/* HTMML GÖRÜNÜM */
document.addEventListener("DOMContentLoaded", () => {
  const htmlView = document.getElementById("htmlView");
  const toggleHTML = document.getElementById("toggleHTML");
  const toggleDesign = document.getElementById("toggleDesign");

  if (toggleHTML && toggleDesign && htmlView && contentEditor) {
    toggleHTML.addEventListener("click", () => {
      htmlView.value = contentEditor.innerHTML;
      contentEditor.style.display = "none";
      htmlView.style.display = "block";
    });

    toggleDesign.addEventListener("click", () => {
      contentEditor.innerHTML = htmlView.value;
      htmlView.style.display = "none";
      contentEditor.style.display = "block";
    });
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
  <td class="w-25"><span class="title-cell">${post.title}</span></td>
  <td>
    <div class="content-preview content-cell" style="display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;min-height: 100px; height: 100%;">${post.content}</div>
  </td>
  
  <td class="text-end w-25 align-middle">
  <div class="d-flex flex-wrap justify-content-end gap-2">
    ${isDraft ? '<span class="badge bg-secondary align-self-center">Taslak</span>' : ''}
    <button class="btn btn-sm btn-primary edit-btn"
      data-id="${post.id}" 
      data-title="${escapeHtml(post.title)}" 
      data-content="${escapeHtml(post.content)}"
      data-tags="${post.tags}">
      İçeriği Düzenle
    </button>
    <button class="btn btn-sm btn-danger delete-btn" data-id="${post.id}">
      İçeriği Sil
    </button>
  </div>
</td>

`;


  if (isDraft) {
  row.querySelector(".title-cell").style.opacity = "0.5";
  row.querySelector(".content-cell").style.opacity = "0.5";
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

const selectedIds = () =>
  Array.from(document.querySelectorAll(".secim-checkbox:checked")).map(cb =>
    cb.getAttribute("data-id")
  );

const showModal = (message, onConfirm) => {
  const modalElement = new bootstrap.Modal(document.getElementById("actionConfirmModal"));
  document.getElementById("actionConfirmModalBody").textContent = message;

  const confirmBtn = document.getElementById("modalConfirmBtn");
  const newConfirmHandler = () => {
    confirmBtn.removeEventListener("click", newConfirmHandler); // eski handler'ları temizle
    modalElement.hide();
    onConfirm();
  };

  confirmBtn.addEventListener("click", newConfirmHandler);
  modalElement.show();
};

// TASLAK YAP
document.getElementById("taslakYapBtn").addEventListener("click", () => {
  const ids = selectedIds();
  if (ids.length === 0) {
    showModal("Lütfen en az bir içerik seçin.", () => {});
    return;
  }

  showModal("Seçilen içerikleri taslak olarak işaretlemek istediğinize emin misiniz?", async () => {
    try {
      const res = await fetch("/api/posts/draft", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids })
      });
      const data = await res.json();

      
      if (res.ok) {
        showModal("Seçilen içerikler başarıyla taslak yapıldı.", loadContents);
      } else {
        showModal("Hata: " + (data.error || "Bilinmeyen bir hata"), () => {});
      }
    } catch (err) {
      console.error("Taslak yapma hatası:", err);
      showModal("Sunucu hatası oluştu.", () => {});
    }
  });
});

// TASLAKTAN ÇIKAR
document.getElementById("taslaktanCikarBtn").addEventListener("click", () => {
  const ids = selectedIds();
  if (ids.length === 0) {
    showModal("Lütfen en az bir içerik seçin.", () => {});
    return;
  }

  showModal("Seçilen içerikleri yayına almak istediğinize emin misiniz?", async () => {
    try {
      const res = await fetch("/api/posts/undraft", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids })
      });
      const data = await res.json();

      if (res.ok) {
        showModal("İçerikler yayına alındı.", loadContents);
      } else {
        showModal("Hata: " + (data.error || "Bilinmeyen bir hata"), () => {});
      }
    } catch (err) {
      console.error("Taslaktan çıkarma hatası:", err);
      showModal("Sunucu hatası oluştu.", () => {});
    }
  });
});

// TOPLU SİLME
document.getElementById("topluSilBtn").addEventListener("click", () => {
  const ids = selectedIds();
  if (ids.length === 0) {
    showModal("Lütfen en az bir içerik seçin.", () => {});
    return;
  }

  showModal("Seçilen içerikleri silmek istediğinize emin misiniz?", async () => {
    try {
      const res = await fetch("/api/posts/delete-multiple", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids })
      });
      const data = await res.json();

      if (res.ok) {
        showModal("Seçilen içerikler başarıyla silindi.", loadContents);
      } else {
        showModal("Hata: " + (data.error || "Bilinmeyen hata"), () => {});
      }
    } catch (err) {
      console.error("Toplu silme hatası:", err);
      showModal("Sunucu hatası oluştu.", () => {});
    }
  });
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