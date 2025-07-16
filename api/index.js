export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Sadece POST istekleri kabul edilir." });
    return;
  }

  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Kullanıcı adı ve şifre gerekli." });
    return;
  }

  const ADMIN_USER = "admin";
  const ADMIN_PASS = "1234"; // Geliştirmede .env dosyasına taşınmalı

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // Basit token oluşturma (daha sonra JWT ile değiştirebilirsin)
    const token = Buffer.from(`${username}:${password}`).toString("base64");

    res.status(200).json({ token });
  } else {
    res.status(401).json({ error: "Geçersiz kullanıcı adı veya şifre." });
  }
}
