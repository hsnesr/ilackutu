function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const error = document.getElementById("error");

  // Basit kontrol (gerçek sistemde sunucu doğrulaması olmalı)
  if (user === "admin" && pass === "1234") {
    window.location.href = "admin.html";
  } else {
    error.textContent = "Kullanıcı adı veya şifre yanlış!";
    error.style.display = "block";
  }
}
