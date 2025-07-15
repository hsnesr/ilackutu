const loginForm = document.getElementById('loginForm');
const errorDiv = document.getElementById('error');

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  errorDiv.style.display = 'none';

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      alert('Giriş başarılı!');
      // İstersen yönlendirme yapabilirsin
    } else {
      errorDiv.style.display = 'block';
    }
  } catch {
    errorDiv.style.display = 'block';
  }
});
