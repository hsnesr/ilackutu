// public/register.js

document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorEl = document.getElementById("registerError");

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.success) {
      window.location.href = "/login.html";
    } else {
      errorEl.classList.remove("d-none");
      errorEl.textContent = data.message || "Hata oluştu.";
    }
  } catch (err) {
    console.error("Kayıt hatası:", err);
    errorEl.classList.remove("d-none");
    errorEl.textContent = "Sunucu hatası.";
  }
});
