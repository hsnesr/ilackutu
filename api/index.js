import 'dotenv/config';  // veya require('dotenv').config();

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Sadece POST istekleri kabul edilir." });
    return;
  }

  const { username, password } = req.body;

  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;

  if (!username || !password) {
    res.status(400).json({ error: "Kullanıcı adı ve şifre gerekli." });
    return;
  }

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // Token üretme (JWT önerilir, base64 basit örnek)
    const token = Buffer.from(`${username}:${password}`).toString("base64");
    res.status(200).json({ token });
  } else {
    res.status(401).json({ error: "Geçersiz kullanıcı adı veya şifre." });
  }
}
