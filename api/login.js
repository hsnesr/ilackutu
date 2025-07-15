import jwt from 'jsonwebtoken';

const SECRET_KEY = "gizli_anahtar";

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST isteği kabul edilir' });
  }

  const { username, password } = req.body;

  if (username === "admin" && password === "12345") {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    return res.status(200).json({ success: true, token });
  } else {
    return res.status(401).json({ success: false, message: "Geçersiz kullanıcı adı veya şifre." });
  }
}