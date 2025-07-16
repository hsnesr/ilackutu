async function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const error = document.getElementById("error");

  error.style.display = "none";

  if (!user || !pass) {
    error.textContent = "Lütfen kullanıcı adı ve şifre girin!";
    error.style.display = "block";
    return;
  }

  try {
    const res = await fetch("https://hsnesr.store/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass }),
    });

    const data = await res.json();

    if (res.ok) {
      // Token’ı localStorage’a kaydet
      localStorage.setItem("token", data.token);
      window.location.href = "admin.html";
    } else {
      error.textContent = data.error || "Giriş başarısız!";
      error.style.display = "block";
    }
  } catch (err) {
    error.textContent = "Sunucu hatası, tekrar deneyin.";
    error.style.display = "block";
  }
}
